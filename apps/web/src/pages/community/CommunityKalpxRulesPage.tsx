import { CommunityKalpxRulesContent } from "../../components/community/CommunityKalpxRulesContent";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";

export function CommunityKalpxRulesPage() {
  return (
    <CommunityWebLayout activeLabel="KalpX Rules" centerWidth={920}>
      <CommunityKalpxRulesContent />
    </CommunityWebLayout>
  );
}
