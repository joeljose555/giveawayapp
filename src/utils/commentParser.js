export function countMentions(commentText) {
  if (!commentText) return 0;
  const re = /@[a-zA-Z0-9._]+/g;
  const matches = commentText.match(re);
  return matches ? matches.length : 0;
}

export function normalizeComments(rawComments) {
  if (!Array.isArray(rawComments)) return [];

  const seen = new Set();
  const result = [];

  for (const item of rawComments) {
    const username = (item.username || '').trim();
    const comment = (item.comment || item.text || '').trim();
    if (!username || !comment) continue;
    if (seen.has(username)) continue;
    seen.add(username);
    result.push({
      username,
      comment,
      mentionCount: countMentions(comment),
    });
  }

  return result;
}

export function filterByMinMentions(comments, minMentions) {
  const threshold = Number.isFinite(minMentions) ? minMentions : 0;
  return (comments || []).filter((c) => (c.mentionCount || 0) >= threshold);
}

export function pickRandomWinners(comments, numWinners) {
  const pool = [...(comments || [])];
  const n = Math.min(numWinners || 0, pool.length);
  if (n <= 0) return [];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, n).map((c, index) => ({
    ...c,
    rank: index + 1,
  }));
}

