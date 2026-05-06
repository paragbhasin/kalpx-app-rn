import { CommunityKalpxRulesContent } from "../../components/community/CommunityKalpxRulesContent";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";

export function CommunityKalpxRulesPage() {
  return (
    <CommunityWebLayout
      activeLabel="KalpX Rules"
      centerWidth={1400}
      hideRightRail
      hideDesktopTopBar
    >
      <CommunityKalpxRulesContent />
    </CommunityWebLayout>
  );
}
