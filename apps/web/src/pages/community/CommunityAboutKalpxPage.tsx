import { CommunityAboutKalpxContent } from "../../components/community/CommunityAboutKalpxContent";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";

export function CommunityAboutKalpxPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      <CommunityTopBar activeLabel="Explore" />
      <CommunityAboutKalpxContent />
    </div>
  );
}
