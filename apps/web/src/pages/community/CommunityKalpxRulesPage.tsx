import { CommunityKalpxRulesContent } from "../../components/community/CommunityKalpxRulesContent";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";

export function CommunityKalpxRulesPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      <CommunityTopBar activeLabel="Explore" />
      <CommunityKalpxRulesContent />
    </div>
  );
}
