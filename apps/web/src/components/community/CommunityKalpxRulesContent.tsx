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
    <div style={pageWrapStyle}>
      <div style={contentGridStyle}>
        <section>
          <h1 style={titleStyle}>KalpX Community Rules</h1>

          <div style={rulesListStyle}>
            {rules.map((rule) => (
              <section key={rule.title} style={ruleSectionStyle}>
                <h2 style={ruleTitleStyle}>{rule.title}</h2>
                <p style={ruleTextStyle}>{rule.text}</p>
              </section>
            ))}
          </div>
        </section>

        <aside style={quoteCardStyle}>
          <img
            src={quoteImage}
            alt="KalpX rules illustration"
            style={quoteImageStyle}
          />
          <p style={quoteStyle}>"Dharmo Rakshati Rakshitah"</p>
          <p style={quoteSubtextStyle}>Dharma protects those who protect it.</p>
        </aside>
      </div>
    </div>
  );
}

const pageWrapStyle = {
  padding: "26px 22px 40px",
} as const;

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 490px",
  columnGap: 56,
  alignItems: "start",
} as const;

const titleStyle = {
  margin: "0 0 36px",
  color: "#1f1f23",
  fontSize: 25,
  lineHeight: 1.02,
  fontWeight: 700,
  fontFamily: "Georgia, Times New Roman, serif",
  letterSpacing: "-0.03em",
} as const;

const rulesListStyle = {
  display: "grid",
  gap: 50,
  paddingRight: 12,
} as const;

const ruleSectionStyle = {
  display: "grid",
  gap: 10,
} as const;

const ruleTitleStyle = {
  margin: 0,
  color: "#303238",
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 700,
  fontFamily: "Georgia, Times New Roman, serif",
} as const;

const ruleTextStyle = {
  margin: 0,
  color: "#4e5157",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 400,
} as const;

const quoteCardStyle = {
  marginTop: 120,
  borderRadius: 28,
  background: "#fbf6ea",
  padding: "42px 34px 40px",
  textAlign: "center",
} as const;

const quoteImageStyle = {
  width: "100%",
  maxWidth: 340,
  height: "auto",
  objectFit: "contain",
  margin: "0 auto 26px",
  display: "block",
} as const;

const quoteStyle = {
  margin: "0 0 10px",
  color: "#384056",
  fontSize: 26,
  lineHeight: 1.3,
  fontStyle: "italic",
  fontFamily: "Georgia, Times New Roman, serif",
} as const;

const quoteSubtextStyle = {
  margin: 0,
  color: "#687186",
  fontSize: 18,
  lineHeight: 1.5,
  fontFamily: "Georgia, Times New Roman, serif",
} as const;
