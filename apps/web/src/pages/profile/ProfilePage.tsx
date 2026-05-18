import {
  Bell,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  KeyRound,
  LogOut,
  Trash2,
  UserRound
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  ANALYTICS_CONSENT_KEY,
  MARKETING_CONSENT_KEY,
  CONSENT_VERSION_KEY,
  CONSENT_UPDATED_AT_KEY,
} from "../../lib/webAnalytics";
import { useNavigate } from "react-router-dom";
import { AppShell, KalpXButton, ModalSheet } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import {
  deleteSavedReflection,
  getSavedReflections,
  getUserProfile,
  getUserProfileOptions,
  updateUserProfile,
  deleteUserAccount,
  type ProfileOptionItem,
  type SavedReflection,
  type UserProfileOptions,
} from "../../lib/userApi";
import type { UserProfile } from "../../types/auth";

type ViewKey = "root" | "profile" | "language" | "saved";

type ProfileFormState = {
  profileName: string;
  ageGroup: string;
  language: string;
};


const PAGE_BG = "#fffaf5";
const BORDER = "1px solid rgba(184, 134, 75, 0.26)";
const BORDER_SOFT = "1px solid rgba(184, 134, 75, 0.14)";
const CTA = "#b8864b";

const ROOM_LABELS: Record<string, string> = {
  room_joy: "Joy",
  room_connection: "Connection",
  room_release: "Release",
  room_clarity: "Clarity",
  room_growth: "Growth",
  room_stillness: "Stillness",
};

const ROOM_BADGE_COLOR: Record<string, string> = {
  room_joy: "#D4A017",
  room_connection: "#9B7FA8",
  room_release: "#888888",
  room_clarity: "#5B8FA8",
  room_growth: "#7A9E6F",
  room_stillness: "#9EABBA",
};

const EVENT_LABELS: Record<string, string> = {
  joy_named: "What felt good",
  joy_carry: "Held joy",
  connection_named: "Named connection",
  connection_reach_out: "Message drafted",
  growth_journal: "Growth note",
  clarity_journal: "Honest question",
  release_named: "Set down",
  stillness_named: "What became still",
};

const CONTEXT_LABELS: Record<string, string> = {
  work_career: "Work",
  relationships: "Relationships",
  self: "Self",
  health_energy: "Health & energy",
  money_security: "Money & security",
  purpose_direction: "Purpose",
  daily_life: "Daily life",
};

function itemRowStyle(): React.CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "20px 16px",
    background: PAGE_BG,
    borderBottom: BORDER_SOFT,
    cursor: "pointer",
  };
}

function sectionShellStyle(): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: 640,
    margin: "0 auto",
    background: PAGE_BG,
  };
}

function getInitialForm(profile: UserProfile | null): ProfileFormState {
  return {
    profileName: String(
      profile?.profile_name ?? profile?.first_name ?? "",
    ).trim(),
    ageGroup: String(
      (profile?.age_group as { id?: number } | undefined)?.id ?? "",
    ),
    language: String(
      (profile?.languages as Array<{ id?: number }> | undefined)?.[0]?.id ?? "",
    ),
  };
}

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>("root");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [options, setOptions] = useState<UserProfileOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savedReflections, setSavedReflections] = useState<SavedReflection[]>(
    [],
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(getInitialForm(null));
  const [analyticsConsent, setAnalyticsConsent] = useState<'granted' | 'denied'>(
    () => (localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted' ? 'granted' : 'denied'),
  );
  const [marketingConsent, setMarketingConsent] = useState<'granted' | 'denied'>(
    () => (localStorage.getItem(MARKETING_CONSENT_KEY) === 'granted' ? 'granted' : 'denied'),
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [profileResult, optionsResult] = await Promise.all([
        getUserProfile(),
        getUserProfileOptions(),
      ]);
      setProfile(profileResult);
      setOptions(optionsResult);
      setForm(getInitialForm(profileResult));
      setLoading(false);
    }

    void load();
  }, []);

  async function handleLogout() {
    await logout();
  }

  async function handleDeleteAccount() {
    const res = await deleteUserAccount();
    if (res.success) {
      await logout();
      alert("Account deleted successfully!");
    } else {
      alert(res.error || "Failed to delete account.");
    }
  }

  async function loadSavedReflections() {
    setSavedLoading(true);
    setSavedError(null);
    try {
      const memories = await getSavedReflections();
      setSavedReflections(memories);
    } catch {
      setSavedError("Couldn't load your reflections. Please try again.");
    } finally {
      setSavedLoading(false);
    }
  }

  async function handleSaveProfile() {
    const profileName = form.profileName.trim();
    if (!profileName || !form.language) return;

    setSavingProfile(true);
    const payload = {
      profile_name: profileName,
      age_group_id: form.ageGroup ? Number(form.ageGroup) : null,
      language_ids: [Number(form.language)],
    };

    const updated = await updateUserProfile(payload as Partial<UserProfile>);
    if (updated) {
      const nextProfile = {
        ...(profile ?? {}),
        ...updated,
        profile_name: payload.profile_name,
        age_group: findOptionById(options?.age_groups, payload.age_group_id),
        languages: [
          findOptionById(options?.languages, Number(form.language)),
        ].filter(Boolean),
      } as UserProfile;

      setProfile(nextProfile);
      setForm(getInitialForm(nextProfile));
      setView("root");
    }
    setSavingProfile(false);
  }

  async function handleDeleteReflection(memoryId: string) {
    const previous = savedReflections;
    setSavedReflections((prev) =>
      prev.filter((item) => item.memory_id !== memoryId),
    );
    try {
      await deleteSavedReflection(memoryId);
    } catch {
      setSavedReflections(previous);
    }
  }

  function renderTopBar(title: string) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "26px 20px 18px",
          background: PAGE_BG,
          borderBottom: BORDER_SOFT,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (view === "root") {
              navigate("/en/mitra/dashboard");
              return;
            }
            setView("root");
          }}
          style={{
            width: 32,
            height: 32,
            border: "none",
            background: "none",
            color: "#000",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: 0,
          }}
          aria-label="Back"
        >
          <ChevronLeft size={28} strokeWidth={2.2} />
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#000",
            fontFamily: "var(--kalpx-font-sans)",
          }}
        >
          {title}
        </h1>
        <div style={{ width: 32 }} />
      </div>
    );
  }

  function renderRoot() {
    const menuItems = [
      {
        key: "my-profile",
        label: "My Profile",
        icon: UserRound,
        onClick: () => setView("profile"),
      },
      {
        key: "saved-reflections",
        label: "Saved reflections",
        icon: Bookmark,
        onClick: () => {
          setView("saved");
          void loadSavedReflections();
        },
      },
      // {
      //   key: "language",
      //   label: "Language",
      //   icon: Globe,
      //   onClick: () => setView("language"),
      // },
      {
        key: "notification-preferences",
        label: "Notification Preferences",
        icon: Bell,
        onClick: () => navigate("/en/settings/notifications"),
      },
      {
        key: "reminders",
        label: "Reminders",
        icon: Clock,
        onClick: () => navigate("/en/settings/reminders"),
      },
      {
        key: "privacy",
        label: "Privacy Policy",
        icon: KeyRound,
        onClick: () => navigate("/en/privacy"),
      },
      {
        key: "terms",
        label: "Terms of Service",
        icon: FileText,
        onClick: () => navigate("/en/terms"),
      },
      {
        key: "data-deletion",
        label: "Data Deletion",
        icon: Trash2,
        onClick: () => navigate("/en/data-deletion"),
      },
      {
        key: "delete-account",
        label: "Delete Account",
        icon: Trash2,
        onClick: () => setDeleteOpen(true),
      },
      {
        key: "logout",
        label: "LogOut",
        icon: LogOut,
        onClick: () => setLogoutOpen(true),
      },
    ];

    const updateConsent = (key: string, value: 'granted' | 'denied') => {
      localStorage.setItem(key, value);
      localStorage.setItem(CONSENT_UPDATED_AT_KEY, new Date().toISOString());
      window.dispatchEvent(new CustomEvent('consent_updated'));
      if (key === ANALYTICS_CONSENT_KEY) setAnalyticsConsent(value);
      if (key === MARKETING_CONSENT_KEY) setMarketingConsent(value);
    };

    return (
      <>
        {renderTopBar("Profile")}
        <div style={sectionShellStyle()}>
          {menuItems.map(({ key, label, icon: Icon, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              style={itemRowStyle()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Icon size={24} strokeWidth={1.9} color={CTA} />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#373737",
                    fontFamily: "var(--kalpx-font-sans)",
                  }}
                >
                  {label}
                </span>
              </div>
              <ChevronRight size={24} strokeWidth={2.1} color="#9c9c9c" />
            </button>
          ))}

          {/* Privacy preferences — consent toggles */}
          <div
            style={{
              borderTop: BORDER_SOFT,
              padding: "18px 20px 12px",
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#373737", fontFamily: "var(--kalpx-font-sans)" }}>
              Privacy preferences
            </p>
            {(
              [
                {
                  key: ANALYTICS_CONSENT_KEY,
                  label: "Product analytics",
                  description: "Help us understand how people use Mitra.",
                  value: analyticsConsent,
                },
                {
                  key: MARKETING_CONSENT_KEY,
                  label: "Marketing & advertising",
                  description: "Allow personalized ads on platforms like Meta.",
                  value: marketingConsent,
                },
              ] as const
            ).map(({ key: consentKey, label, description, value }) => (
              <div
                key={consentKey}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}
              >
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#373737", fontFamily: "var(--kalpx-font-sans)" }}>
                    {label}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888", fontFamily: "var(--kalpx-font-sans)" }}>
                    {description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`${value === 'granted' ? 'Disable' : 'Enable'} ${label}`}
                  onClick={() => updateConsent(consentKey, value === 'granted' ? 'denied' : 'granted')}
                  style={{
                    background: value === 'granted' ? '#b8864b' : '#e0d6c8',
                    color: value === 'granted' ? '#fff' : '#888',
                    border: 'none',
                    borderRadius: 14,
                    padding: '5px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--kalpx-font-sans)',
                    minWidth: 44,
                  }}
                >
                  {value === 'granted' ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function renderProfileDetails() {
    const ageGroups = options?.age_groups ?? [];
    const languages = options?.languages ?? [];

    return (
      <>
        {renderTopBar("My Profile")}
        <div style={{ ...sectionShellStyle(), paddingBottom: 120 }}>
          <div style={{ padding: "20px 20px 0" }}>
            <FieldLabel required>Profile Name</FieldLabel>
            <TextField
              value={form.profileName}
              placeholder="Enter your profile name"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, profileName: value }))
              }
            />

            <FieldLabel>Age Group</FieldLabel>
            <SelectField
              value={form.ageGroup}
              placeholder="Select Your Age Group"
              options={ageGroups}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, ageGroup: value }))
              }
            />

            <FieldLabel required>Notification Language</FieldLabel>
            <SelectField
              value={form.language}
              placeholder="Select Language"
              options={languages}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, language: value }))
              }
            />

            <p
              style={{
                margin: "12px 0 0",
                fontSize: 15,
                lineHeight: 1.45,
                color: "#111",
                fontWeight: 600,
              }}
            >
              All notifications will be sent in chosen language
            </p>
          </div>

          <div
            style={{
              marginTop: 34,
              borderTop: BORDER_SOFT,
              padding: "22px 20px 0",
            }}
          >
            <KalpXButton
              fullWidth
              onClick={() => void handleSaveProfile()}
              loading={savingProfile}
              loadingText="Updating..."
              disabled={
                !form.profileName.trim() || !form.language
              }
              data-testid="profile-save-btn"
            >
              UPDATE PROFILE
            </KalpXButton>
          </div>
        </div>
      </>
    );
  }

  function renderLanguageScreen() {
    const languages = options?.languages ?? [];

    return (
      <>
        {renderTopBar("Language")}
        <div style={sectionShellStyle()}>
          {languages.map((language) => {
            const isSelected = form.language === String(language.id);
            return (
              <button
                key={language.id}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    language: String(language.id),
                  }))
                }
                style={itemRowStyle()}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: isSelected ? CTA : "#373737",
                    fontFamily: "var(--kalpx-font-sans)",
                  }}
                >
                  {language.name}
                </span>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? CTA : "#9c9c9c"}`,
                    background: isSelected ? CTA : "transparent",
                    boxShadow: isSelected ? "inset 0 0 0 5px #fffaf5" : "none",
                    boxSizing: "border-box",
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          })}
        </div>
      </>
    );
  }

  function renderSavedReflections() {
    const sections = groupMemoriesByRoom(savedReflections);

    return (
      <>
        {renderTopBar("Saved reflections")}
        <div style={{ ...sectionShellStyle(), padding: "16px 16px 120px" }}>
          {savedLoading ? (
            <CenteredState text="Loading saved reflections..." />
          ) : savedError ? (
            <CenteredState
              text={savedError}
              actionLabel="Try again"
              onAction={() => void loadSavedReflections()}
            />
          ) : savedReflections.length === 0 ? (
            <CenteredState
              text="Nothing saved yet."
              subtext="When you name something, write it down, or set it down in a room, it will appear here."
            />
          ) : (
            sections.map((section) => (
              <div key={section.room_id} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    padding: "0 4px",
                    margin: "12px 0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: CTA,
                  }}
                >
                  {ROOM_LABELS[section.room_id] ??
                    section.room_id.replace("room_", "")}
                </div>
                {section.items.map((entry) => (
                  <SavedReflectionCard
                    key={entry.memory_id}
                    entry={entry}
                    onDelete={() =>
                      void handleDeleteReflection(entry.memory_id)
                    }
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <AppShell bg="cream">
        <div
          style={{
            minHeight: "70dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--kalpx-text-muted)",
            fontSize: 14,
          }}
        >
          Loading profile...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell bg="cream">
      <div
        style={{
          minHeight: "100dvh",
          background: PAGE_BG,
          paddingBottom: "calc(90px + env(safe-area-inset-bottom))",
        }}
      >
        {view === "root" && renderRoot()}
        {view === "profile" && renderProfileDetails()}
        {view === "language" && renderLanguageScreen()}
        {view === "saved" && renderSavedReflections()}
      </div>

      <ModalSheet
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="LogOut"
        height="auto"
      >
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--kalpx-text-soft)",
          }}
        >
          Are you sure you want to log out of your account?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <KalpXButton
            variant="secondary"
            fullWidth
            onClick={() => setLogoutOpen(false)}
          >
            Cancel
          </KalpXButton>
          <KalpXButton
            variant="destructive"
            fullWidth
            onClick={() => void handleLogout()}
          >
            Yes
          </KalpXButton>
        </div>
      </ModalSheet>

      <ModalSheet
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account"
        height="auto"
      >
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--kalpx-text-soft)",
          }}
        >
          This action is permanent. Do you really want to delete your account?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <KalpXButton
            variant="secondary"
            fullWidth
            onClick={() => setDeleteOpen(false)}
          >
            Cancel
          </KalpXButton>
          <KalpXButton
            variant="destructive"
            fullWidth
            onClick={() => void handleDeleteAccount()}
          >
            Delete
          </KalpXButton>
        </div>
      </ModalSheet>
    </AppShell>
  );
}

function groupMemoriesByRoom(memories: SavedReflection[]) {
  const order: string[] = [];
  const grouped: Record<string, SavedReflection[]> = {};

  for (const memory of memories) {
    if (!grouped[memory.room_id]) {
      grouped[memory.room_id] = [];
      order.push(memory.room_id);
    }
    grouped[memory.room_id].push(memory);
  }

  return order.map((room_id) => ({ room_id, items: grouped[room_id] }));
}

function findOptionById(
  options: ProfileOptionItem[] | undefined,
  id: number | null,
) {
  if (!id) return null;
  return options?.find((option) => option.id === id) ?? null;
}

function formatSavedReflectionDate(iso: string | null) {
  if (!iso) return "";
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FieldLabel({
  children,
  required = false,
  style,
}: {
  children: React.ReactNode;
  required?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <label
      style={{
        display: "block",
        marginTop: 22,
        marginBottom: 10,
        color: "#111",
        fontSize: 15,
        fontWeight: 700,
        ...style,
      }}
    >
      {children}
      {required ? " *" : ""}
    </label>
  );
}

function TextField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: "100%",
        height: 58,
        borderRadius: 18,
        border: BORDER,
        background: "#fff",
        padding: "0 18px",
        fontSize: 16,
        color: "#111",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function SelectField({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: Array<{ label?: string; value?: string } | ProfileOptionItem>;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          height: 58,
          borderRadius: 18,
          border: BORDER,
          background: "#fff",
          padding: "0 46px 0 18px",
          fontSize: 16,
          color: value ? "#111" : "#666",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          boxSizing: "border-box",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const normalized =
            "id" in option
              ? { value: String(option.id), label: option.name }
              : {
                  value: String(option.value ?? ""),
                  label: String(option.label ?? ""),
                };
          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={22}
        strokeWidth={2.1}
        color="#8a8a8a"
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function CenteredState({
  text,
  subtext,
  actionLabel,
  onAction,
}: {
  text: string;
  subtext?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "42dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#4b3421",
          fontSize: 17,
          fontWeight: 600,
        }}
      >
        {text}
      </p>
      {subtext ? (
        <p
          style={{
            margin: "10px 0 0",
            maxWidth: 360,
            color: "#7d6b5d",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {subtext}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 16,
            padding: "10px 22px",
            borderRadius: 999,
            border: `1px solid ${CTA}`,
            background: "#fff",
            color: "#4b3421",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SavedReflectionCard({
  entry,
  onDelete,
}: {
  entry: SavedReflection;
  onDelete: () => void;
}) {
  const badgeColor = ROOM_BADGE_COLOR[entry.room_id] ?? CTA;
  const eventLabel = EVENT_LABELS[entry.event_type] ?? entry.event_type;
  const contextLabel = entry.life_context
    ? (CONTEXT_LABELS[entry.life_context] ?? entry.life_context)
    : null;
  const dateLabel = formatSavedReflectionDate(entry.captured_at);

  return (
    <div
      style={{
        background: "#fffdf8",
        borderRadius: 18,
        padding: 18,
        border: BORDER_SOFT,
        boxShadow: "0 6px 16px rgba(67,33,4,0.06)",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: badgeColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: "#7d756d",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {eventLabel}
          </span>
        </div>
        {entry.user_deletable ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Remove reflection"
            style={{
              border: "none",
              background: "none",
              padding: 0,
              color: "#9d9d9d",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Trash2 size={18} strokeWidth={1.8} />
          </button>
        ) : null}
      </div>

      <div
        style={{
          color: "#4b3421",
          fontSize: 18,
          lineHeight: 1.45,
          marginBottom: 14,
          whiteSpace: "pre-wrap",
        }}
      >
        {entry.text}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {dateLabel ? (
          <span
            style={{
              color: "#9b958d",
              fontSize: 13,
            }}
          >
            {dateLabel}
          </span>
        ) : null}
        {contextLabel ? (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(212,160,23,0.12)",
              color: "#4b3421",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {contextLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
