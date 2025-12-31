/**
 * Locally polishes text without using an external API.
 * Rules:
 * 1. Capitalize first letter of sentences.
 * 2. Remove filler words (um, uh, like, you know).
 * 3. Fix spacing around punctuation.
 * 4. Ensure ending punctuation.
 */
export function polishText(text) {
    if (!text) return "";

    let polished = text;

    // 1. Remove filler words (case insensitive, whole words)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
    const fillerRegex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    polished = polished.replace(fillerRegex, '');

    // 2. Remove multiple spaces and trim
    polished = polished.replace(/\s+/g, ' ').trim();

    // 3. Capitalize first letter of the entire text
    polished = polished.charAt(0).toUpperCase() + polished.slice(1);

    // 4. Capitalize first letter after punctuation (. ? !)
    polished = polished.replace(/([.?!]\s*)([a-z])/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
    });

    // 5. Fix spacing before punctuation (e.g. "word ." -> "word.")
    polished = polished.replace(/\s+([.?!,])/g, '$1');

    // 6. Ensure space after punctuation (e.g. "word.Word" -> "word. Word")
    polished = polished.replace(/([.?!,])([a-zA-Z])/g, '$1 $2');

    // 7. Ensure usage of 'i' is capitalized
    polished = polished.replace(/\b(i)\b/g, 'I');
    polished = polished.replace(/\b(i'm)\b/g, "I'm");
    polished = polished.replace(/\b(i'll)\b/g, "I'll");
    polished = polished.replace(/\b(i've)\b/g, "I've");
    polished = polished.replace(/\b(i'd)\b/g, "I'd");

    // 8. Ensure text ends with a period if it doesn't have one (and isn't just a few words)
    if (polished.length > 5 && !/[.?!]$/.test(polished)) {
        polished += '.';
    }

    return polished;
}
