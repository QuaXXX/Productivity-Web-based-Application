/**
 * Locally polishes text without using an external API.
 * Rules:
 * 1. Fix common spelling mistakes
 * 2. Capitalize first letter of sentences
 * 3. Remove filler words (um, uh, like, you know)
 * 4. Fix spacing around punctuation
 * 5. Ensure ending punctuation
 * 6. Fix common contractions
 */

// Common spelling mistakes and their corrections
const SPELLING_FIXES = {
    'teh': 'the',
    'thier': 'their',
    'recieve': 'receive',
    'beleive': 'believe',
    'occured': 'occurred',
    'definately': 'definitely',
    'seperate': 'separate',
    'untill': 'until',
    'tommorow': 'tomorrow',
    'tommorrow': 'tomorrow',
    'tomarrow': 'tomorrow',
    'becuase': 'because',
    'beacuse': 'because',
    'accomodate': 'accommodate',
    'occassion': 'occasion',
    'possesion': 'possession',
    'refered': 'referred',
    'wierd': 'weird',
    'acheive': 'achieve',
    'accross': 'across',
    'adress': 'address',
    'begining': 'beginning',
    'comming': 'coming',
    'dissapear': 'disappear',
    'enviroment': 'environment',
    'existance': 'existence',
    'familar': 'familiar',
    'finaly': 'finally',
    'goverment': 'government',
    'gaurd': 'guard',
    'happend': 'happened',
    'immediatly': 'immediately',
    'knowlege': 'knowledge',
    'liason': 'liaison',
    'mispell': 'misspell',
    'neccessary': 'necessary',
    'noticable': 'noticeable',
    'occurance': 'occurrence',
    'paralel': 'parallel',
    'persistant': 'persistent',
    'priviledge': 'privilege',
    'realy': 'really',
    'relize': 'realize',
    'succesful': 'successful',
    'suprise': 'surprise',
    'truely': 'truly',
    'wether': 'whether',
    'writting': 'writing',
    'youre': "you're",
    'dont': "don't",
    'didnt': "didn't",
    'doesnt': "doesn't",
    'cant': "can't",
    'wont': "won't",
    'shouldnt': "shouldn't",
    'couldnt': "couldn't",
    'wouldnt': "wouldn't",
    'isnt': "isn't",
    'arent': "aren't",
    'wasnt': "wasn't",
    'werent': "weren't",
    'hasnt': "hasn't",
    'havent': "haven't",
    'hadnt': "hadn't",
    'thats': "that's",
    'whats': "what's",
    'heres': "here's",
    'theres': "there's",
    'wheres': "where's",
    'hows': "how's",
    'lets': "let's",
    'im': "I'm",
    'ive': "I've",
    'id': "I'd",
    'ill': "I'll",
    'gonna': 'going to',
    'wanna': 'want to',
    'gotta': 'got to',
    'kinda': 'kind of',
    'sorta': 'sort of',
    'alot': 'a lot',
    'prolly': 'probably',
    'prob': 'probably',
    'cuz': 'because',
    'cos': 'because',
    'ur': 'your',
    'u': 'you',
    'r': 'are',
    'n': 'and',
    'w': 'with',
    'b4': 'before',
    '2day': 'today',
    '2morrow': 'tomorrow',
    '2nite': 'tonight',
    'nite': 'night',
    'luv': 'love',
    'ppl': 'people',
    'msg': 'message',
    'thx': 'thanks',
    'pls': 'please',
    'plz': 'please',
};

export function polishText(text) {
    if (!text) return "";

    let polished = text;

    // 1. Fix common spelling mistakes (case insensitive, preserve case of first letter)
    for (const [wrong, correct] of Object.entries(SPELLING_FIXES)) {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        polished = polished.replace(regex, (match) => {
            // Preserve capitalization of first letter
            if (match[0] === match[0].toUpperCase()) {
                return correct.charAt(0).toUpperCase() + correct.slice(1);
            }
            return correct;
        });
    }

    // 2. Remove filler words (case insensitive, whole words)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so yeah', 'yeah so', 'i mean'];
    const fillerRegex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    polished = polished.replace(fillerRegex, '');

    // 3. Remove multiple spaces and trim
    polished = polished.replace(/\s+/g, ' ').trim();

    // 4. Capitalize first letter of the entire text
    if (polished.length > 0) {
        polished = polished.charAt(0).toUpperCase() + polished.slice(1);
    }

    // 5. Capitalize first letter after punctuation (. ? !)
    polished = polished.replace(/([.?!]\s*)([a-z])/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
    });

    // 6. Fix spacing before punctuation (e.g. "word ." -> "word.")
    polished = polished.replace(/\s+([.?!,;:])/g, '$1');

    // 7. Ensure space after punctuation (e.g. "word.Word" -> "word. Word")
    polished = polished.replace(/([.?!,;:])([a-zA-Z])/g, '$1 $2');

    // 8. Ensure 'I' is capitalized in all contexts
    polished = polished.replace(/\bi\b/g, 'I');
    polished = polished.replace(/\bi'm\b/gi, "I'm");
    polished = polished.replace(/\bi'll\b/gi, "I'll");
    polished = polished.replace(/\bi've\b/gi, "I've");
    polished = polished.replace(/\bi'd\b/gi, "I'd");

    // 9. Fix double punctuation
    polished = polished.replace(/([.?!]){2,}/g, '$1');
    polished = polished.replace(/,{2,}/g, ',');

    // 10. Fix common run-on patterns (add comma before certain conjunctions if missing)
    polished = polished.replace(/(\w)\s+(but|and|so|yet)\s+/gi, (match, before, conj) => {
        // Only add comma if the word before isn't already punctuated
        if (!/[,;:]$/.test(before)) {
            return `${before}, ${conj.toLowerCase()} `;
        }
        return match;
    });

    // 11. Ensure text ends with proper punctuation if it's a complete thought
    if (polished.length > 10 && !/[.?!]$/.test(polished)) {
        // Check if it ends with a question word pattern
        if (/\b(what|where|when|why|how|who|which|is it|are you|do you|can you|will you|would you|could you)\b/i.test(polished)) {
            polished += '?';
        } else {
            polished += '.';
        }
    }

    // 12. Final cleanup - remove any double spaces created
    polished = polished.replace(/\s+/g, ' ').trim();

    return polished;
}
