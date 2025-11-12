export const parseSourceToTags = (
  source: string = "",
  id: string = ""
): { tags: string[]; searchQuery: string } => {
  if (!source?.trim()) return { tags: [id], searchQuery: id };

  // Remove punctuation and numbers, normalize
  const cleaned = source
    .replace(/[.,;:()\-–—]/g, " ")
    .replace(/[0-9]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const words = cleaned.split(" ").filter(Boolean);

  const skipWords = new Set([
    "of", "the", "and", "for", "with", "from", "into", "that",
    "this", "those", "these", "are", "was", "will", "on", "in",
    "to", "by", "as", "is", "at", "or", "an", "a", "be", "it",
    "its", "he", "she", "they", "them", "his", "her", "their",
    "than", "then", "there", "here", "which", "who"
  ]);

  const meaningful = words.filter(w => !skipWords.has(w) && w.length > 2);
  const unique = [...new Set(meaningful)].map(
    w => w.charAt(0).toUpperCase() + w.slice(1)
  );

  const tags = [id, ...unique].slice(0, 10);
  const searchQuery = unique.join(" ");

  return { tags, searchQuery };
};
