import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Mic, Send, Square, Sparkles } from 'lucide-react';
import { polishTranscript } from '../services/geminiService';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function JournalComposer({ onAddEntry, playSound }) {
    const [type, setType] = useState('daily');
    const [text, setText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [mood, setMood] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);

    const recognitionRef = useRef(null);
    const shouldStopRef = useRef(false);
    const textRef = useRef(text);

    // Keep textRef in sync
    useEffect(() => {
        textRef.current = text;
    }, [text]);

    useEffect(() => {
        if (typeof window !== 'undefined' && SpeechRecognition) {
            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
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
                    if (shouldStopRef.current) {
                        setIsRecording(false);
                    } else {
                        console.log('Restarting voice recognition...');
                        try {
                            recognition.start();
                        } catch (e) {
                            console.error("Restart error:", e);
                            setIsRecording(false);
                        }
                    }
                };

                recognition.onresult = (event) => {
                    // ONLY process the CURRENT result, not all historical ones
                    const result = event.results[event.results.length - 1];
                    const transcript = result[0].transcript;

                    if (result.isFinal) {
                        // Final result - append to text and clear interim
                        setText(prev => prev + (prev ? ' ' : '') + transcript.trim());
                        setInterimText('');
                    } else {
                        // Interim result - just show preview
                        setInterimText(transcript);
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

    const toggleRecording = async () => {
        if (playSound) playSound('click');

        if (!recognitionRef.current) {
            if (SpeechRecognition) {
                alert("Voice recognition not initialized. Please refresh.");
            } else {
                alert("Voice recognition not supported in this browser.");
            }
            return;
        }

        try {
            if (isRecording) {
                // STOP recording
                shouldStopRef.current = true;
                recognitionRef.current.stop();
                setInterimText('');

                // Wait a moment for final results to process, then polish
                setTimeout(async () => {
                    const currentText = textRef.current;
                    console.log("Attempting to polish:", currentText);
                    if (currentText && currentText.trim()) {
                        setIsPolishing(true);
                        try {
                            const polished = await polishTranscript(currentText);
                            console.log("Polished result:", polished);
                            if (polished && polished.trim() && polished !== currentText) {
                                setText(polished);
                            }
                        } catch (e) {
                            console.error("Polish error:", e);
                        } finally {
                            setIsPolishing(false);
                        }
                    }
                }, 500);
            } else {
                // START recording
                shouldStopRef.current = false;
                setText(''); // Clear previous text when starting new recording
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
            enableAI: true
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

            {/* Input Area */}
            <div className={`relative rounded-2xl p-3 min-h-[120px] transition-colors ${type === 'dream' ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-neutral-800'}`}>
                <textarea
                    value={text + (interimText ? (text ? ' ' : '') + interimText : '')}
                    onChange={(e) => {
                        if (!isRecording) {
                            setText(e.target.value);
                        }
                    }}
                    placeholder={type === 'dream' ? "What did you dream about?..." : "What's on your mind today?..."}
                    className="w-full h-full bg-transparent resize-none outline-none text-gray-700 dark:text-gray-200 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[100px]"
                    readOnly={isRecording}
                />

                {/* Voice Recording Waveform - RESTORED */}
                {isRecording && (
                    <div className="absolute bottom-2 left-3 right-3 h-8 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="flex items-center gap-0.5 h-full">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-red-500 rounded-full animate-pulse"
                                    style={{
                                        height: `${20 + (i % 3) * 15}px`,
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-2">Recording...</span>
                    </div>
                )}

                {/* Polishing Indicator */}
                {isPolishing && (
                    <div className="absolute bottom-2 left-3 right-3 h-8 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3">
                        <Sparkles size={14} className="text-purple-500 animate-pulse" />
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Polishing with AI...</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end mt-3 px-1 gap-2">
                <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-full transition-all ${isRecording
                        ? 'bg-red-500 dark:bg-red-600 text-white'
                        : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
                        }`}
                >
                    {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                </button>

                <button
                    onClick={handleSend}
                    disabled={!text.trim() || isPolishing}
                    className={`p-3 rounded-full transition-all flex items-center space-x-2 ${text.trim() && !isPolishing
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
