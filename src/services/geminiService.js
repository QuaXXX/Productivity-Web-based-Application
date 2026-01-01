import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API client
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Gemini Integration: Missing VITE_GEMINI_API_KEY environment variable. AI features will be simulated or disabled.");
}

/**
 * Analyzes a journal entry using Gemini Flash to detect actionable goals or habits.
 * 
 * @param {string} text - The journal entry content.
 * @returns {Promise<Object|null>} - JSON object { found: boolean, suggestions: Array<{title, category, dueDate, subSteps}> }
 */
export async function analyzeEntry(text) {
    if (!API_KEY || !genAI) {
        // Fallback / Mock behavior
        console.log("Mocking AI Analysis for:", text);
        return new Promise(resolve => setTimeout(() => {
            const lower = text.toLowerCase();
            const suggestions = [];
            const now = new Date();

            // Mock Goal 1: Spaceship
            if (lower.includes("spaceship")) {
                let dueDate = null;
                if (lower.includes("next year")) dueDate = `${now.getFullYear() + 1}-01-01`;

                let subSteps = [];
                if (lower.includes("hull")) subSteps.push("Design the hull");
                if (lower.includes("fuel")) subSteps.push("Buy rocket fuel");

                suggestions.push({
                    title: "Build A Spaceship",
                    description: "",
                    category: "Big Goal",
                    dueDate: dueDate,
                    subSteps: subSteps
                });
            }

            // Mock Goal 2: Guitar
            if (lower.includes("guitar")) {
                suggestions.push({
                    title: "Learn Guitar",
                    description: "",
                    category: "Habit",
                    dueDate: null,
                    subSteps: []
                });
            }

            // Mock Goal 3: Marathon (Relative Date Logic)
            if (lower.includes("marathon")) {
                let dueDate = null;
                const monthMatch = text.match(/in\s+(\d+)\s+months?/i);
                if (monthMatch && monthMatch[1]) {
                    const months = parseInt(monthMatch[1]);
                    const future = new Date(now.setMonth(now.getMonth() + months));
                    dueDate = future.toISOString().split('T')[0];
                }

                suggestions.push({
                    title: "Run A Marathon",
                    description: "",
                    category: "Big Goal",
                    dueDate: dueDate,
                    subSteps: ["Train 5k", "Train 10k", "Half Marathon"]
                });
            }

            // Mock Goal 4: Dunk (Next Friday Logic)
            if (lower.includes("dunk")) {
                let dueDate = null;
                // Simple mock logic for "next friday" - in a real app, date-fns or similar would be better,
                // but for this mock, let's just say "Next Friday" is roughly 7-12 days away.
                // Let's just set it to Today + 7 days for the demo verification.
                const nextFri = new Date(now);
                nextFri.setDate(now.getDate() + 7); // Rough approximation for demo
                dueDate = nextFri.toISOString().split('T')[0];

                suggestions.push({
                    title: "Dunk A Basketball",
                    description: "",
                    category: "Big Goal",
                    dueDate: dueDate,
                    subSteps: ["Increase vertical jump", "Practice approach"]
                });
            }

            // Mock Goal 5: Skydiving (Soft intent "hoping to", "sometime this year")
            if (lower.includes("skydiving")) {
                // "This year" -> Last day of current year
                const endOfYear = `${now.getFullYear()}-12-31`;

                suggestions.push({
                    title: "Go Skydiving",
                    description: "", // Keep blank as requested
                    category: "Big Goal",
                    dueDate: endOfYear,
                    subSteps: []
                });
            }

            // Generic Fallback with Smart Title Extraction
            if (suggestions.length === 0 && (lower.includes("want to") || lower.includes("goal") || lower.includes("wish") || lower.includes("hoping to"))) {
                let title = "New Goal";
                // Regex to stop before "in", "by", "before" to keep title clean
                const match = text.match(/(?:want to|goal is|wish to|hoping to)\s+(.+?)(?=\s+(?:in|by|before|on)|$)/i);
                if (match && match[1]) {
                    title = match[1].trim();
                    title = title.charAt(0).toUpperCase() + title.slice(1);
                    if (title.split(' ').length > 6) title = title.split(' ').slice(0, 6).join(' ') + "...";
                }

                suggestions.push({
                    title: title,
                    description: "",
                    category: (lower.includes("daily")) ? "Habit" : "Big Goal",
                    dueDate: null,
                    subSteps: []
                });
            }

            if (suggestions.length > 0) {
                resolve({ found: true, suggestions: suggestions });
            } else {
                resolve({ found: false });
            }
        }, 1500));
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const prompt = `
        Context: Today is ${todayStr}.
        Analyze this journal entry.
        
        CRITICAL INSTRUCTIONS:
        1. **Detect Subtle Intents**: Identify goals even if phrased softly, like:
           - "I'm hoping to..."
           - "I've always wanted to..."
           - "Thinking about..."
        2. **Title**: Extract a CLEAN, IMPERATIVE title. REMOVE any timeframes.
           - "I want to dunk by next Friday" -> **"Dunk A Basketball"**
           - "Hoping to go skydiving sometime this year" -> **"Go Skydiving"**
        3. **DueDate**: CALCULATE specific YYYY-MM-DD dates based on "Today" (${todayStr}).
           - "by next Friday" -> Calculate the specific date.
           - "sometime this year" -> Defaults to Dec 31st of this year.
        4. **Category**: "Habit" or "Big Goal".
        5. **Empty Fields**: Keep Description and SubSteps BLANK unless explicitly detailed.

        Return JSON:
        {
            "found": true/false,
            "suggestions": [
                { "title": "...", "description": "...", "category": "...", "dueDate": "YYYY-MM-DD", "subSteps": [] }
            ]
        }
        
        Journal Entry: "${text}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean potentially malformed JSON (basic markdown cleanup)
        const jsonString = textResponse.replace(/^```json/g, '').replace(/```$/g, '').trim();

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return { found: false, error: "Analysis Failed" };
    }
}

