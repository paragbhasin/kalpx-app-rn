
export const getConsistentRandomStats = (postId: string | number) => {
    // Generate a pseudo-random seed based on the postId
    const idStr = postId.toString();
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = (hash << 5) - hash + idStr.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    const seed = Math.abs(hash);
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const ratio = pseudoRandom / 233280;

    return {
        upvotes: Math.floor(ratio * 900) + 100, // 100 to 1000
        shares: Math.floor(ratio * 30) + 5,      // 5 to 35
        comments: 0   // 2 to 42
    };
};

export const getConsistentCommunityStats = (communityIdOrSlug: string | number) => {
    const idStr = communityIdOrSlug.toString();
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = (hash << 5) - hash + idStr.charCodeAt(i);
        hash |= 0;
    }

    const seed = Math.abs(hash);
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const ratio = pseudoRandom / 233280;

    return {
        weeklyVisitors: (Math.floor(ratio * 200) + 50) + "k",
        weeklyContribution: (Math.floor(ratio * 2000) + 500)
    };
};
