import Foundation
import WatchKit
import WidgetKit

// Swift mirror of useJapaEngine.ts — same architecture, same sync contract.
// Owned at app root as @StateObject so it survives view transitions.

class WatchJapaEngine: NSObject, ObservableObject {

    // MARK: - Published state
    @Published var sessionCount:        Int    = 0
    @Published var malaRoundsCompleted: Int    = 0
    @Published var canUndo:             Bool   = false
    @Published var isActive:            Bool   = false
    @Published var isGoalReached:       Bool   = false
    @Published var currentMantraRef:    String  = ""
    @Published var currentAudioUrl:    String? = nil

    // MARK: - Private state
    private var session      = WatchLocalSession.fresh(mantraRef: "om-namah-shivaya", goalType: "unlimited", goalValue: nil)
    private var unsyncedDelta = 0
    private var undoStack     = [Int]()
    private var syncTimer:         Timer?
    private var goalTimer:         Timer?
    private var syncBatchSequence  = 0
    private var extSession:   WKExtendedRuntimeSession?

    private let connectivity = WatchConnectivityManager.shared
    private let storage      = WatchAppGroupStorage.shared

    private let syncCountThreshold = 50
    private let syncIntervalSecs: TimeInterval = 30
    private let undoMax = 10
    private let milestones = Set([27, 54, 108])

    override init() {
        super.init()
        loadPersistedSession()
        wireConnectivity()
    }

    private func loadPersistedSession() {
        guard let saved = storage.loadCurrentSession(), saved.sessionCount > 0 else { return }
        session              = saved
        sessionCount         = saved.sessionCount
        malaRoundsCompleted  = saved.malaRoundsCompleted
        unsyncedDelta        = saved.unsyncedDelta
        canUndo              = saved.sessionCount > 0
        currentMantraRef     = saved.mantraRef
        isActive             = true
        startSyncTimer()
    }

    // MARK: - Start

    func startSession(mantra: CuratedMantra, goalType: String, goalValue: Int?) {
        stopSyncTimer()
        stopGoalTimer()
        extSession?.invalidate()

        session              = WatchLocalSession.fresh(mantraRef: mantra.ref, goalType: goalType, goalValue: goalValue)
        sessionCount         = 0
        malaRoundsCompleted  = 0
        unsyncedDelta        = 0
        syncBatchSequence    = 0
        undoStack            = []
        canUndo              = false
        isGoalReached        = false
        currentMantraRef     = mantra.ref
        currentAudioUrl      = mantra.audioUrl
        isActive             = true

        storage.saveCurrentSession(session)
        startExtendedSession()
        if goalType == "time", let seconds = goalValue {
            startGoalTimer(duration: TimeInterval(seconds))
        }
        requestServerSession(mantra: mantra)
    }

    // MARK: - Increment

    func increment() {
        sessionCount  += 1
        unsyncedDelta += 1
        session.sessionCount  = sessionCount
        session.unsyncedDelta = unsyncedDelta

        undoStack.append(sessionCount)
        if undoStack.count > undoMax { undoStack.removeFirst() }
        canUndo = true

        // Mala round completion: every 108 beads
        if sessionCount > 0 && sessionCount % 108 == 0 {
            malaRoundsCompleted += 1
            session.malaRoundsCompleted = malaRoundsCompleted
            DispatchQueue.main.async {
                WKInterfaceDevice.current().play(.success)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    WKInterfaceDevice.current().play(.notification)
                }
            }
        } else {
            fireHaptic()
        }
        storage.saveCurrentSession(session)

        if unsyncedDelta >= syncCountThreshold {
            syncToPhone()
        }

        // Count-based goal check
        if session.goalType == "count", let gv = session.goalValue, sessionCount >= gv {
            isGoalReached = true
        }
    }

    // MARK: - Undo

    func undo() {
        guard sessionCount > 0, !undoStack.isEmpty else { return }
        undoStack.removeLast()
        sessionCount  -= 1
        unsyncedDelta  = max(0, unsyncedDelta - 1)
        session.sessionCount  = sessionCount
        session.unsyncedDelta = unsyncedDelta
        canUndo = !undoStack.isEmpty
        DispatchQueue.main.async { WKInterfaceDevice.current().play(.directionUp) }
        storage.saveCurrentSession(session)
    }

    // MARK: - Discard (no sync — only for count-0 abandonments)

    func discardSession() {
        stopSyncTimer()
        stopGoalTimer()
        extSession?.invalidate()
        storage.clearCurrentSession()
        isActive      = false
        isGoalReached = false
        sessionCount  = 0
        unsyncedDelta = 0
    }

    // MARK: - Complete

    func completeSession() {
        stopSyncTimer()
        stopGoalTimer()
        syncToPhone(isCritical: true)

        let msg: [String: Any] = [
            "type":            "japa_session_complete",
            "localSessionId":  session.localSessionId,
            "serverSessionId": session.serverSessionId as Any,
            "finalCount":      sessionCount,
            "durationMs":      Int(Date().timeIntervalSince(session.startedAt) * 1000),
            "mantraRef":       session.mantraRef,
            "sourceSurface":   "watch"
        ]
        connectivity.sendToPhone(msg, isCritical: true)

        DispatchQueue.main.async {
            WKInterfaceDevice.current().play(.success)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                WKInterfaceDevice.current().play(.notification)
            }
        }

        storage.clearCurrentSession()
        storage.addTodayJapaCount(sessionCount)
        extSession?.invalidate()
        isGoalReached = false
        isActive      = false
        malaRoundsCompleted = 0

        // Reload Watch face complications so today's count updates immediately
        WidgetCenter.shared.reloadAllTimelines()
    }

    // MARK: - Sync

    func syncToPhone(isCritical: Bool = false) {
        guard unsyncedDelta > 0 else { return }

        syncBatchSequence += 1
        let batch: [String: Any] = [
            "type":             "japa_sync_batch",
            "localSessionId":   session.localSessionId,
            "serverSessionId":  session.serverSessionId as Any,
            "deltaCount":       unsyncedDelta,
            "cumulativeCount":  sessionCount,
            "idempotencyKey":   "\(session.localSessionId)_\(syncBatchSequence)",
            "clientCreatedAt":  ISO8601DateFormatter().string(from: Date()),
            "todayLocalDate":   todayLocalDate(),
            "timezone":         TimeZone.current.identifier,
            "mantraRef":        session.mantraRef,
            "sourceSurface":    "watch",
            "elapsedSeconds":   Int(Date().timeIntervalSince(session.startedAt))
        ]
        connectivity.sendToPhone(batch, isCritical: isCritical)

        session.unsyncedDelta   = 0
        session.lastSyncedCount = sessionCount
        unsyncedDelta = 0
        storage.saveCurrentSession(session)
    }

    // MARK: - Computed

    var goalValue: Int   { session.goalValue ?? 108 }
    var completedMalas: Int { sessionCount / 108 }
    var beadInRound:    Int { sessionCount % 108 }

    var goalProgress: Double {
        guard session.goalType == "count", let gv = session.goalValue, gv > 0 else { return 0 }
        return min(1.0, Double(sessionCount) / Double(gv))
    }

    // MARK: - Private

    private func fireHaptic() {
        DispatchQueue.main.async {
            WKInterfaceDevice.current().play(
                self.milestones.contains(self.sessionCount) ? .success : .click
            )
        }
    }

    private func requestServerSession(mantra: CuratedMantra) {
        let msg: [String: Any] = [
            "type":           "japa_session_start",
            "localSessionId": session.localSessionId,
            "mantraRef":      session.mantraRef,
            "mantraName":     mantra.name,
            "devanagari":     mantra.devanagari,
            "sourceSurface":  "watch",
            "goalType":       session.goalType,
            "goalValue":      session.goalValue as Any,
            "todayLocalDate": todayLocalDate(),
            "timezone":       TimeZone.current.identifier
        ]
        connectivity.sendToPhone(msg)
    }

    private func wireConnectivity() {
        connectivity.onMessageReceived = { [weak self] msg in
            guard let self else { return }
            if let type = msg["type"] as? String,
               type == "japa_session_started",
               let sid = msg["serverSessionId"] as? Int {
                self.session.serverSessionId = sid
                self.storage.saveCurrentSession(self.session)
            }
        }
    }

    private func startExtendedSession() {
        let s = WKExtendedRuntimeSession()
        s.delegate = self
        s.start()
        extSession = s
    }

    private func startSyncTimer() {
        syncTimer?.invalidate()
        syncTimer = Timer.scheduledTimer(withTimeInterval: syncIntervalSecs, repeats: true) { [weak self] _ in
            self?.syncToPhone()
        }
    }

    private func stopSyncTimer() {
        syncTimer?.invalidate()
        syncTimer = nil
    }

    private func startGoalTimer(duration: TimeInterval) {
        goalTimer?.invalidate()
        goalTimer = Timer.scheduledTimer(withTimeInterval: duration, repeats: false) { [weak self] _ in
            DispatchQueue.main.async { self?.isGoalReached = true }
        }
    }

    private func stopGoalTimer() {
        goalTimer?.invalidate()
        goalTimer = nil
    }

    private func todayLocalDate() -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }
}

// MARK: - WKExtendedRuntimeSessionDelegate

extension WatchJapaEngine: WKExtendedRuntimeSessionDelegate {

    func extendedRuntimeSessionDidStart(_ s: WKExtendedRuntimeSession) {
        startSyncTimer()
    }

    // Critical: fired ~2 seconds before session expires — final sync
    func extendedRuntimeSessionWillExpire(_ s: WKExtendedRuntimeSession) {
        storage.saveCurrentSession(session)
        syncToPhone(isCritical: true)
    }

    func extendedRuntimeSession(_ s: WKExtendedRuntimeSession,
                                didInvalidateWith reason: WKExtendedRuntimeSessionInvalidationReason,
                                error: Error?) {
        stopSyncTimer()
        stopGoalTimer()
    }
}
