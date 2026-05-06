import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";

const sections = [
  {
    title: "1. Sanctity of Your Data",
    text: "We consider your personal sadhana data, journal entries, and spiritual progress as sacred and private. We treat your information with the highest level of confidentiality and respect.",
  },
  {
    title: "2. Data Collection",
    text: "We collect minimal data necessary to provide you with a personalized spiritual experience. This includes your username, email (for account recovery), and your interactions within the community to improve content recommendations.",
  },
  {
    title: "3. Usage of Information",
    text: "Your data is used solely to enhance your journey on KalpX. We do not sell your personal information to third-party advertisers. We believe your spiritual growth is not a product.",
  },
  {
    title: "4. Third-Party Services",
    text: "We may use trusted third-party services for hosting, analytics, and communication. These partners are bound by strict confidentiality agreements and are only provided with data necessary to perform their functions.",
  },
  {
    title: "5. Security",
    text: "We employ industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.",
  },
];

export function CommunityPrivacyPolicyPage() {
  return (
    <CommunityWebLayout activeLabel="Privacy Policy" centerWidth={920}>
      <div style={{ padding: "10px 20px 40px" }}>
        <h1
          style={{
            margin: "0 0 24px",
            fontSize: 32,
            fontWeight: 700,
            color: "#1a1a1b",
            fontFamily: "Georgia, serif",
          }}
        >
          Privacy Policy
        </h1>

        {sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 28 }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a1b",
                fontFamily: "Georgia, serif",
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: "24px",
                color: "#4a4a4a",
              }}
            >
              {section.text}
            </p>
          </section>
        ))}
      </div>
    </CommunityWebLayout>
  );
}
