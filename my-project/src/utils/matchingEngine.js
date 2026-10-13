/**
 * Compares a single item against a list of candidate items
 * and returns matched candidates with a match score (0 - 100%).
 */
export function findMatches(currentItem, allItems) {
  if (!currentItem) return [];

  // 1. Only compare against items of the OPPOSITE type
  // (Compare LOST items to FOUND items, and vice versa)
  const targetType = currentItem.type === 'LOST' ? 'FOUND' : 'LOST';
  const candidates = allItems.filter((i) => i.type === targetType);

  const matchedResults = candidates.map((candidate) => {
    let score = 0;

    // Rule 1: Category Match (+40 points)
    if (currentItem.category.toLowerCase() === candidate.category.toLowerCase()) {
      score += 40;
    }

    // Rule 2: Title Word Overlap (+30 points)
    const currentTitleWords = currentItem.title.toLowerCase().split(' ');
    const candidateTitleWords = candidate.title.toLowerCase().split(' ');
    
    const hasWordOverlap = currentTitleWords.some(
      (word) => word.length > 3 && candidateTitleWords.includes(word)
    );
    if (hasWordOverlap) {
      score += 30;
    }

    // Rule 3: Location Similarity (+30 points)
    const currentLoc = currentItem.location.toLowerCase();
    const candidateLoc = candidate.location.toLowerCase();
    if (currentLoc.includes(candidateLoc) || candidateLoc.includes(currentLoc)) {
      score += 30;
    }

    return {
      item: candidate,
      score, // Total score out of 100
    };
  });

  // Filter out weak matches (keep scores >= 40) and sort by highest score first
  return matchedResults
    .filter((res) => res.score >= 40)
    .sort((a, b) => b.score - a.score);
}