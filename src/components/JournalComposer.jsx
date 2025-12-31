import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Mic, Send, X } from 'lucide-react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function JournalComposer({ onAddEntry, playSound }) {
    const [enableAI, setEnableAI] = useState(true); // Always On
    const [type, setType] = useState('daily'); // 'daily' | 'dream'
    const [text, setText] = useState('');
    const [mood, setMood] = useState(null); // 'great' | 'good' | 'neutral' | 'meh' | 'sad' | null
    const [isRecording, setIsRecording] = useState(false);

    // Voice Recognition Refs
    const recognitionRef = useRef(null);

    // ... [UseEffect for Speech skipped for brevity in replacement, assuming partial update logic]
    // Wait, I need to match the StartLine/EndLine or replace the whole file. 
    // I will use replace_file_content carefully.

    // I need to see the line numbers again. 
    // The previous view_file output showed Lines 6 to 191.
    // I will replace from Line 6.

    // ... Keeping Speech Init ...
    useEffect(() => {
        if (typeof window !== 'undefined' && SpeechRecognition) {
            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    console.log('Voice recognition started');
                    setIsRecording(true);
                };

                recognition.onend = () => {
                    console.log('Voice recognition ended');
                    setIsRecording(false);
                };

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Voice recognition error', event.error);
                    setIsRecording(false);
                };

                recognitionRef.current = recognition;
            } catch (e) {
                console.error("SpeechRecognition init failed:", e);
            }
        }
    }, []);

    const toggleRecording = () => {
        if (playSound) playSound('click');

        if (!recognitionRef.current) {
            if (SpeechRecognition) {
                alert("Voice recognition not initialized. Please refresh or check browser compatibility.");
            } else {
                alert("Voice recognition not supported in this browser.");
            }
            return;
        }

        try {
            if (isRecording) {
                recognitionRef.current.stop();
            } else {
                recognitionRef.current.start();
            }
        } catch (e) {
            console.error("Toggle error:", e);
            setIsRecording(false);
        }
    };

    const handleSend = () => {
        if (!text.trim()) return;
        if (playSound) playSound('success');

        const newEntry = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
            timestamp: new Date().toISOString(),
            type,
            content: text,
            mood,
            audioUrl: null,
            tags: [],
            enableAI: true // Always On
        };

        if (onAddEntry) onAddEntry(newEntry);
        setText('');
        setMood(null);
    };

    const handleTypeChange = (newType) => {
        if (playSound) playSound('click');
        setType(newType);
    }

    return (
        <div className="bg-[var(--color-surface)] rounded-3xl p-4 shadow-[var(--shadow-card)] border border-[var(--color-border-light)] transition-colors duration-500">
            {/* Toggle Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--color-bg-secondary)] p-1 rounded-full flex mx-auto">
                    <button
                        onClick={() => handleTypeChange('daily')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${type === 'daily'
                            ? 'bg-[var(--color-surface)] text-[var(--color-warning)] shadow-sm'
                            : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                            }`}
                    >
                        <Sun size={16} />
                        <span>Daily Log</span>
                    </button>
                    <button
                        onClick={() => handleTypeChange('dream')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${type === 'dream'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Moon size={16} />
                        <span>Dream Journal</span>
                    </button>
                </div>
            </div>

            {/* Mood Selector (Hidden for later) */}
            {false && (
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-xs font-medium text-[var(--color-text-tertiary)] mr-2">Mood:</span>
                    {[
                        { id: 'sad', emoji: '😢' },
                        { id: 'meh', emoji: '😕' },
                        { id: 'neutral', emoji: '😐' },
                        { id: 'good', emoji: '🙂' },
                        { id: 'great', emoji: '😁' },
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setMood(mood === m.id ? null : m.id); if (playSound) playSound('click'); }}
                            className={`text-2xl p-1.5 rounded-full transition-all ${mood === m.id
                                ? 'scale-125 bg-[var(--color-primary)]/20 ring-2 ring-[var(--color-primary)]'
                                : 'hover:scale-110 opacity-60 hover:opacity-100'
                                }`}
                        >
                            {m.emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className={`relative rounded-2xl p-3 min-h-[120px] transition-colors ${type === 'dream' ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-neutral-800'}`}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={type === 'dream' ? "What did you dream about?..." : "What's on your mind today?..."}
                    className="w-full h-full bg-transparent resize-none outline-none text-gray-700 dark:text-gray-200 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[100px]"
                />

                {/* Voice Recording Waveform */}
                {isRecording && (
                    <div className="absolute bottom-2 left-4 right-14 h-8 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="flex items-center gap-0.5 h-full">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-red-500 rounded-full animate-waveform"
                                    style={{
                                        height: `${Math.random() * 60 + 40}%`,
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-2">Recording...</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end mt-3 px-1 gap-2">

                <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-full transition-all ${isRecording
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse'
                        : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
                        }`}
                >
                    <Mic size={20} />
                </button>

                <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className={`p-3 rounded-full transition-all flex items-center space-x-2 ${text.trim()
                        ? (type === 'dream' ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600' : 'bg-orange-500 dark:bg-orange-600 text-white shadow-md hover:bg-orange-600 dark:hover:bg-orange-500')
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
