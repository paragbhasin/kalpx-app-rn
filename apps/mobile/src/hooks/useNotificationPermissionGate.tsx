import React, { useRef, useState } from 'react';
import NotificationPermissionModal from '../components/NotificationPermissionModal';
import { mitraTrackEvent } from '../engine/mitraApi';
import {
  checkNotificationPermission,
  openNotificationSettings,
  type NotifPermissionStatus,
} from '../service/notificationPermission';
import { requestPushPermission } from '../service/pushNotifications';
import { registerDeviceToBackend } from '../utils/registerDevice';

/**
 * Drop this hook into any screen that has reminder toggles or save-with-reminders.
 *
 * Usage:
 *   const { withPermissionCheck, renderPermissionModal } = useNotificationPermissionGate();
 *
 *   // Gate a toggle:
 *   onToggle={() => withPermissionCheck(() => doSave())}
 *
 *   // Render modal somewhere in JSX (e.g. just before closing tag):
 *   {renderPermissionModal()}
 */
export function useNotificationPermissionGate() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStatus, setModalStatus] = useState<Extract<NotifPermissionStatus, 'undetermined' | 'denied'>>('undetermined');
  const pendingAction = useRef<(() => Promise<void> | void) | null>(null);

  async function withPermissionCheck(action: () => Promise<void> | void) {
    const status = await checkNotificationPermission();

    if (status === 'granted' || status === 'provisional') {
      await action();
      return;
    }

    if (status === 'denied') {
      mitraTrackEvent('notification_pre_prompt_view', {
        meta: { trigger: 'reminder_toggle', permission_status: 'denied' },
      });
      setModalStatus('denied');
      setModalVisible(true);
      pendingAction.current = action;
      return;
    }

    // undetermined — fire native dialog directly (app launch already showed it once)
    const token = await requestPushPermission();
    if (token) {
      mitraTrackEvent('notification_permission_granted', { meta: { source: 'reminder_toggle' } });
      registerDeviceToBackend();
      await action();
    } else {
      mitraTrackEvent('notification_permission_denied', { meta: { source: 'reminder_toggle' } });
    }
  }

  async function handleAllow() {
    setModalVisible(false);
    if (modalStatus === 'denied') {
      mitraTrackEvent('notification_settings_open', { meta: {} });
      pendingAction.current = null;
      openNotificationSettings();
      return;
    }
    const token = await requestPushPermission();
    if (token) {
      mitraTrackEvent('notification_permission_granted', { meta: { source: 'reminder_toggle' } });
      registerDeviceToBackend();
      if (pendingAction.current) await pendingAction.current();
    } else {
      mitraTrackEvent('notification_permission_denied', { meta: { source: 'reminder_toggle' } });
    }
    pendingAction.current = null;
  }

  function handleDismiss() {
    setModalVisible(false);
    pendingAction.current = null;
  }

  function renderPermissionModal() {
    return (
      <NotificationPermissionModal
        visible={modalVisible}
        permissionStatus={modalStatus}
        onAllow={handleAllow}
        onDismiss={handleDismiss}
      />
    );
  }

  return { withPermissionCheck, renderPermissionModal };
}
