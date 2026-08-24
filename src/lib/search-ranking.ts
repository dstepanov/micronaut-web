/**
 * Query normalization and scoring shared by both search modes.
 *
 * Site mode used to rely on cmdk's built-in fuzzy filter over candidate lists
 * that were truncated *before* the query ran, so a term could rank unrelated
 * pages above an exact match while the real match sat outside the slice.
 */
export type ScorableItem = {
  title: string;
  description: string;
  terms?: string;
  weight?: number;
};

/**
 * Java identifiers arrive with syntax attached — `@Controller`, `run()`,
 * `HttpRequest#getUri`. Searching for the punctuation itself never matched
 * anything, so a query like "@Controller" returned nothing at all.
 */
export function searchTokens(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[@#()<>,;:"'`]/g, " ")
    .split(/[\s./\\_-]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

/**
 * Every token must appear somewhere in the item, so "kafka" can no longer
 * fuzzy-match "Kotlin". Title hits outrank description and keyword hits, and a
 * whole-phrase title match outranks scattered token hits.
 */
export function scoreSearchItem(
  item: ScorableItem,
  tokens: string[],
  phrase: string,
): number {
  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();
  const terms = (item.terms || "").toLowerCase();
  let score = 0;
  for (const token of tokens) {
    const inTitle = title.includes(token);
    const inDescription = description.includes(token);
    const inTerms = terms.includes(token);
    if (!inTitle && !inDescription && !inTerms) {
      return -1;
    }
    if (inTitle) {
      score += title === token ? 24 : title.startsWith(token) ? 12 : 8;
    } else if (inDescription) {
      score += 2;
    } else {
      score += 1;
    }
  }
  if (phrase && title.includes(phrase)) {
    score += title.startsWith(phrase) ? 20 : 10;
  }
  return score + Math.min(item.weight || 0, 4);
}

export function rankSearchItems<Item extends ScorableItem>(
  items: Item[],
  query: string,
): Item[] {
  const tokens = searchTokens(query);
  if (!tokens.length) {
    return items;
  }
  const phrase = tokens.join(" ");
  const scored: Array<{ item: Item; score: number }> = [];
  for (const item of items) {
    const score = scoreSearchItem(item, tokens, phrase);
    if (score >= 0) {
      scored.push({ item, score });
    }
  }
  scored.sort(
    (left, right) =>
      right.score - left.score ||
      left.item.title.length - right.item.title.length ||
      left.item.title.localeCompare(right.item.title),
  );
  return scored.map((entry) => entry.item);
}

/** Best score in a group, so the most relevant group can lead the results. */
export function bestScore(items: ScorableItem[], query: string): number {
  const tokens = searchTokens(query);
  if (!tokens.length) {
    return 0;
  }
  const phrase = tokens.join(" ");
  let best = -1;
  for (const item of items) {
    best = Math.max(best, scoreSearchItem(item, tokens, phrase));
  }
  return best;
}
