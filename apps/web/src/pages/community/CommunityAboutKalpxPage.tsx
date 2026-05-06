import { CommunityAboutKalpxContent } from "../../components/community/CommunityAboutKalpxContent";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";

export function CommunityAboutKalpxPage() {
  return (
    <CommunityWebLayout
      activeLabel="About KalpX"
      centerWidth={1400}
      hideRightRail
      hideDesktopTopBar
    >
      <CommunityAboutKalpxContent />
    </CommunityWebLayout>
  );
}
