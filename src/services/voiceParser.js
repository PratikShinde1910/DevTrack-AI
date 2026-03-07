/**
 * Voice Parser — Extracts structured data from natural language text.
 *
 * Example input: "I coded for 2 hours and solved 5 problems using React"
 * Output: { hours: 2, problemsSolved: 5, techLearned: "React" }
 */

const TECH_KEYWORDS = [
    'React', 'React Native', 'JavaScript', 'TypeScript', 'Node.js', 'Node',
    'Express', 'MongoDB', 'Python', 'Java', 'Kotlin', 'Swift', 'Flutter',
    'Dart', 'Go', 'Golang', 'Rust', 'C++', 'C#', 'PHP', 'Ruby', 'Rails',
    'Django', 'Flask', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'Next.js',
    'Nuxt', 'GraphQL', 'REST', 'API', 'SQL', 'PostgreSQL', 'MySQL',
    'Redis', 'Docker', 'Kubernetes', 'AWS', 'Firebase', 'Supabase',
    'TailwindCSS', 'Tailwind', 'CSS', 'HTML', 'Git', 'Linux',
    'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch',
];

const WORD_TO_NUM = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20',
    'half': '0.5'
};

function preprocessText(text) {
    // Convert to lowercase and remove punctuation
    let processed = text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    // Convert number words to digits
    const words = processed.split(' ');
    const normalizedWords = words.map(word => WORD_TO_NUM[word] !== undefined ? WORD_TO_NUM[word] : word);

    return normalizedWords.join(' ');
}

export function parseVoiceInput(text) {
    if (!text || typeof text !== 'string') {
        return { hours: 0, problemsSolved: 0, techLearned: null };
    }

    const normalizedText = preprocessText(text);

    const result = {
        hours: 0,
        problemsSolved: 0,
        techLearned: null,
    };

    // Extract hours
    const hoursPatterns = [
        /(?:coded?|worked?|spent|learning|studied)?\s*(?:for\s*)?(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/i,
        /(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)\s*(?:of\s*)?(?:cod(?:ing|ed)|work|learning)?/i,
    ];

    for (const pattern of hoursPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
            result.hours = parseFloat(match[1]);
            break;
        }
    }

    // Extract problems solved
    const problemsPatterns = [
        /(?:solved|completed|fixed|did|finished)?\s*(\d+)\s*(?:problems?|tasks?|bugs?|issues?|questions?|challenges?)/i,
        /(\d+)\s*(?:problems?|tasks?|bugs?|issues?|questions?|challenges?)\s*(?:solved|completed|fixed|done|finished)/i,
    ];

    for (const pattern of problemsPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
            result.problemsSolved = parseInt(match[1], 10);
            break;
        }
    }

    // Extract technology
    // We check using case-insensitive matching against the original text
    // to preserve accurate tech matching without punctuation being removed (e.g. Node.js).
    const foundTechs = [];

    for (const tech of TECH_KEYWORDS) {
        // Escape regex characters
        const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedTech}\\b`, 'i');

        if (regex.test(text) && !foundTechs.includes(tech)) {
            foundTechs.push(tech);
        }
    }

    // Also check for contextual tech usages: "using React" or "with Python"
    const techContextPatterns = [
        /(?:using|with|in|learning|learned|studying|practiced)\s+([a-zA-Z.#+]+(?:\s+[a-zA-Z.#+]+)*)/gi,
    ];

    for (const pattern of techContextPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const candidateList = match[1].trim().split(/\s+and\s+|\s*,\s*/);
            for (const candidate of candidateList) {
                const trimmed = candidate.trim();
                const firstWord = trimmed.split(' ')[0];
                if (firstWord) {
                    const known = TECH_KEYWORDS.find(
                        (t) => t.toLowerCase() === firstWord.toLowerCase() || t.toLowerCase() === trimmed.toLowerCase()
                    );
                    if (known && !foundTechs.includes(known)) {
                        foundTechs.push(known);
                    }
                }
            }
        }
    }

    result.techLearned = foundTechs.length > 0 ? foundTechs.join(', ') : null;

    return result;
}
