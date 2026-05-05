const quoteImage = new URL(
  "../../../../mobile/assets/about-kalpx3.png",
  import.meta.url,
).href;

const rules = [
  {
    title: "1. Respect for Dharma (Righteousness)",
    text: "We uphold truth, compassion, and non-violence (Ahimsa) in all our interactions. Speak with kindness and integrity. Adhere to the principles of Dharma in your conduct within the community.",
  },
  {
    title: "2. Authenticity of Scripture",
    text: "When discussing Shastras, Vedas, Puranas, or other sacred texts, please cite your sources respectfully and accurately. Misleading interpretations or fabricating information is discouraged.",
  },
  {
    title: "3. No Hate Speech or Adharmic Conduct",
    text: "We have zero tolerance for malice, blasphemy, discrimination, or intent to harm others. Any speech that spreads hatred or division is considered Adharmic and will be removed.",
  },
  {
    title: "4. Constructive Debate (Shastrartha)",
    text: "Debates should be grounded in the spirit of Jigyasa (seeking truth), not Ahankara (ego). Engage in discussions to learn and share knowledge, not to prove superiority.",
  },
  {
    title: "5. Respect for Deities and Gurus",
    text: "Maintain reverence when speaking of Deities, Gurus, and spiritual teachers. Constructive discussion is welcome, but disrespect is not tolerated.",
  },
];

export function CommunityKalpxRulesContent() {
  return (
    <div
      style={{
        maxWidth: 620,
        margin: "0 auto",
        padding: "10px 20px 40px",
        display: "grid",
        gap: 28,
      }}
    >
      <div>
        <h1
          style={{
            margin: "0 0 24px",
            fontSize: 20,
            fontWeight: 700,
            color: "#1a1a1b",
            fontFamily: "Georgia, serif",
          }}
        >
          KalpX Community Rules
        </h1>

        {rules.map((rule) => (
          <section key={rule.title} style={{ marginBottom: 28 }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1b",
                fontFamily: "Georgia, serif",
              }}
            >
              {rule.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: "24px",
                color: "#4a4a4a",
              }}
            >
              {rule.text}
            </p>
          </section>
        ))}
      </div>

      <div
        style={{
          border: "1px solid #ece5d8",
          borderRadius: 20,
          background: "#fdfaf2",
          padding: 24,
          textAlign: "center",
        }}
      >
        <img
          src={quoteImage}
          alt="KalpX rules illustration"
          style={{
            width: "100%",
            maxWidth: 340,
            height: "auto",
            objectFit: "contain",
            marginBottom: 18,
          }}
        />
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            fontWeight: 700,
            color: "#1a1a1b",
            fontFamily: "Georgia, serif",
          }}
        >
          "Dharmo Rakshati Rakshitah"
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: "24px",
            color: "#6b6257",
          }}
        >
          Dharma protects those who protect it.
        </p>
      </div>
    </div>
  );
}
