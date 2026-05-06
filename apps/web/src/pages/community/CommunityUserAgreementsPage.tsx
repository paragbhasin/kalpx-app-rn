import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";

const agreementImage = new URL(
  "../../../../mobile/assets/user-agreement.png",
  import.meta.url,
).href;

const sections = [
  {
    title: "1. Acceptance of Terms",
    text: "By accessing and using KalpX, you agree to abide by our specific Terms of Service and Community Rules. Participation in this platform implies a commitment to the Dharmic values we uphold.",
  },
  {
    title: "2. Content Ownership & License",
    text: "You retain ownership of the content you post on KalpX. However, by posting, you grant KalpX a non-exclusive, royalty-free license to display, distribute, and promote your content within the platform and its related services.",
  },
  {
    title: "3. Moderation & Adharmic Content",
    text: "KalpX reserves the right to review and remove any content that violates our Community Rules or is deemed Adharmic (against the principles of righteousness and truth). We strive to maintain a pure and positive environment.",
  },
  {
    title: "4. Termination",
    text: "We reserve the right to suspend or terminate accounts that repeatedly violate these agreements or engage in harmful behavior. This is to protect the sanctity of the community.",
  },
  {
    title: "5. Changes to Agreements",
    text: "These agreements may be updated to reflect the evolving needs of our growing spiritual community. Continued use of the platform after changes implies acceptance of the new terms.",
  },
];

export function CommunityUserAgreementsPage() {
  return (
    <CommunityWebLayout activeLabel="User Agreements" centerWidth={920}>
      <div style={{ padding: "10px 20px 40px" }}>
        <div>
          <h1
            style={{
              margin: "0 0 24px",
              fontSize: 32,
              fontWeight: 700,
              color: "#1a1a1b",
              fontFamily: "Georgia, serif",
            }}
          >
            User Agreements
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

          <div style={{ marginTop: 40, textAlign: "center" }}>
            <img
              src={agreementImage}
              alt="User agreements illustration"
              style={{
                width: "100%",
                maxWidth: 420,
                height: "auto",
                objectFit: "contain",
                marginBottom: 30,
              }}
            />
          </div>
        </div>
      </div>
    </CommunityWebLayout>
  );
}
