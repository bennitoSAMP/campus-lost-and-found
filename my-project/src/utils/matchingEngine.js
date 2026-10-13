/**
 * Compares a single item against candidate items
 * with enhanced disambiguation for identical specs/models.
 */
export function findMatches(currentItem, allItems) {
  if (!currentItem) return [];

  const targetType = currentItem.type === 'LOST' ? 'FOUND' : 'LOST';
  const candidates = allItems.filter((i) => i.type === targetType);

  const matchedResults = candidates.map((candidate) => {
    let score = 0;

    // Rule 1: Category Match (+30 points)
    if (currentItem.category?.toLowerCase() === candidate.category?.toLowerCase()) {
      score += 30;
    }

    // Rule 2: Serial Number / Unique ID Match (Hard Disqualifier / High Weight)
    if (currentItem.serial_number && candidate.serial_number) {
      if (currentItem.serial_number.toLowerCase() === candidate.serial_number.toLowerCase()) {
        score += 40; // High confidence match
      } else {
        return { item: candidate, score: 0 }; // Serial numbers differ = NOT the same item
      }
    }

    // Rule 3: Title & Detail Word Overlap (+25 points)
    const currentWords = extractWords(`${currentItem.title} ${currentItem.description || ''}`);
    const candidateWords = extractWords(`${candidate.title} ${candidate.description || ''}`);
    
    const sharedWords = currentWords.filter((w) => candidateWords.includes(w));
    if (sharedWords.length > 0) {
      score += Math.min(25, sharedWords.length * 5); // Scale score by overlapping keywords
    }

    // Rule 4: Location Match (+25 points)
    const currentLoc = currentItem.location?.toLowerCase() || '';
    const candidateLoc = candidate.location?.toLowerCase() || '';
    if (currentLoc.includes(candidateLoc) || candidateLoc.includes(currentLoc)) {
      score += 25;
    }

    // Rule 5: Date Penalty (Deduct points if dates are far apart)
    if (currentItem.date && candidate.date) {
      const daysDifference = Math.abs(
        (new Date(currentItem.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24)
      );
      if (daysDifference > 14) {
        score -= 20; // Penalize matches reported more than 2 weeks apart
      }
    }

    return {
      item: candidate,
      score: Math.max(0, Math.min(100, score)), // Clamp score between 0 and 100
    };
  });

  return matchedResults
    .filter((res) => res.score >= 40)
    .sort((a, b) => b.score - a.score);
}

// Helper utility to sanitize and tokenize descriptive text
function extractWords(text) {
  const stopWords = new Set(['the', 'and', 'a', 'in', 'on', 'with', 'at', 'this', 'that']);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
}