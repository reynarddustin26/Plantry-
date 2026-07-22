// Shared by every nutrition-enrichment provider (Open Food Facts, USDA):
// neither source can be looked up by barcode (none of the 62 curated rows
// carry one — see curatedRetailProvider.ts), so both fall back to a name
// search, which carries real mismatch risk against a global/generic food
// database. A match is only accepted when every significant word of our
// product name appears in the candidate's name/description after
// normalization — attaching a confidently-WRONG product's nutrition would
// be worse than the honest `null` shown otherwise.
const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'in', 'per', 'each', 'pk', 'pack']);

export function normalizeWords(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

export function isConfidentMatch(ourName: string, candidateName: string): boolean {
  const ourWords = normalizeWords(ourName);
  if (ourWords.length === 0) return false;
  const candidateWords = new Set(normalizeWords(candidateName));
  return ourWords.every((w) => candidateWords.has(w));
}
