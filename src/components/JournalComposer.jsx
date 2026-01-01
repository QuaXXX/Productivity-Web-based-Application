import React, { useState, useRef, useCallback } from 'react';
import { Sun, Moon, Mic, Send, Square } from 'lucide-react';
import { polishText } from '../utils/textPolisher';
import haptic from '../utils/haptic';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function JournalComposer({ onAddEntry, playSound }) {
    const [type, setType] = useState('daily');
    const [text, setText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [mood, setMood] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    const recognitionRef = useRef(null);
    const textRef = useRef(text);
    const lastTranscriptRef = useRef(''); // Track last transcript to prevent duplicates

    // Keep textRef in sync
    React.useEffect(() => {
        textRef.current = text;
    }, [text]);

    // Create a fresh recognition instance
    const createRecognition = useCallback(() => {
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // SINGLE SHOT - no continuous mode
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Voice recognition started');
            setIsRecording(true);
        };

        recognition.onend = () => {
            console.log('Voice recognition ended');
            setInterimText('');
            setIsRecording(false);

            // Auto-polish on stop
            const currentText = textRef.current;
            if (currentText && currentText.trim()) {
                const polished = polishText(currentText);
                setText(polished);
            }
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                const cleanTranscript = finalTranscript.trim();
                const lastClean = lastTranscriptRef.current.toLowerCase();
                const newClean = cleanTranscript.toLowerCase();

                // Only add if not a duplicate
                if (cleanTranscript && newClean !== lastClean && !lastClean.endsWith(newClean)) {
                    lastTranscriptRef.current = cleanTranscript;
                    setText(prev => {
                        // Extra check: don't append if already ends with this
                        if (prev.toLowerCase().endsWith(newClean)) return prev;
                        return prev + (prev ? ' ' : '') + cleanTranscript;
                    });
                }
                setInterimText('');
            } else if (interimTranscript) {
                setInterimText(interimTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error', event.error);
            setIsRecording(false);
        };

        return recognition;
    }, []);

    const startRecording = useCallback(() => {
        // Kill any existing instance
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            } catch (e) { /* ignore */ }
        }

        // Create fresh instance
        const recognition = createRecognition();
        if (!recognition) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        recognitionRef.current = recognition;
        lastTranscriptRef.current = ''; // Reset last transcript

        try {
            recognition.start();
        } catch (e) {
            console.error("Start error:", e);
        }
    }, [createRecognition]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Stop error:", e);
            }
        }
        haptic.success();
    }, []);

    const toggleRecording = () => {
        if (playSound) playSound('click');
        haptic.light();

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleSend = () => {
        // Stop recording if active
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setInterimText('');
        }

        // Polish one last time
        const finalText = polishText(text);

        if (!finalText.trim()) return;
        if (playSound) playSound('success');
        haptic.success();

        const newEntry = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
            timestamp: new Date().toISOString(),
            type,
            content: finalText,
            mood,
            audioUrl: null,
            tags: [],
            enableAI: true
        };

        if (onAddEntry) onAddEntry(newEntry);
        setText('');
        setMood(null);
        lastTranscriptRef.current = ''; // Reset
    };

    const moods = ['😊', '😔', '😤', '😴', '🤔', '🎉'];

    return (
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-[var(--shadow-card)] border border-[var(--color-border-light)]">
            {/* Type Toggle */}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => setType('daily')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${type === 'daily'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]'
                        }`}
                >
                    <Sun size={14} /> Daily Log
                </button>
                <button
                    onClick={() => setType('dream')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${type === 'dream'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]'
                        }`}
                >
                    <Moon size={14} /> Dream
                </button>
            </div>

            {/* Input Area */}
            <div className="relative">
                <textarea
                    value={text + (interimText ? (text ? ' ' : '') + interimText : '')}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={type === 'dream' ? "Describe your dream..." : "What's on your mind?"}
                    rows={3}
                    className="w-full bg-[var(--color-bg-secondary)] rounded-xl p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all border border-transparent focus:border-[var(--color-primary-light)]"
                />
            </div>

            {/* Mood Selector */}
            <div className="flex gap-2 mt-3 mb-3">
                {moods.map(m => (
                    <button
                        key={m}
                        onClick={() => setMood(mood === m ? null : m)}
                        className={`text-xl p-1 rounded-lg transition-transform hover:scale-110 ${mood === m ? 'bg-[var(--color-primary-light)] scale-110' : ''
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Record Button */}
                    <button
                        onClick={toggleRecording}
                        disabled={!SpeechRecognition}
                        className={`p-2.5 rounded-full transition-all active:scale-95 ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
                            }`}
                    >
                        {isRecording ? <Square size={18} fill="white" /> : <Mic size={18} />}
                    </button>

                    {/* Recording Indicator - Inline */}
                    {isRecording && (
                        <div className="flex items-center gap-1.5 text-red-500">
                            <div className="flex gap-0.5">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-red-500 rounded-full animate-pulse"
                                        style={{
                                            height: `${8 + Math.random() * 8}px`,
                                            animationDelay: `${i * 0.15}s`
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium">Listening...</span>
                        </div>
                    )}
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!text.trim() && !interimText.trim()}
                    className="p-2.5 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
