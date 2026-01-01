import React, { useState, useRef, useCallback } from 'react';
import { Sun, Moon, Mic, Send, Square } from 'lucide-react';
import { polishText } from '../utils/textPolisher';
import haptic from '../utils/haptic';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function JournalComposer({ onAddEntry, playSound }) {
    const [type, setType] = useState('daily');
    const [text, setText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const recognitionRef = useRef(null);
    const textRef = useRef(text);
    const isActiveRef = useRef(false); // TRUE = user wants recording on

    // Track text that existed BEFORE this recording session started
    const baseTextRef = useRef('');
    // Track all text finalized during THIS recording session (across restarts)
    const sessionTextRef = useRef('');

    // Keep textRef in sync
    React.useEffect(() => {
        textRef.current = text;
    }, [text]);

    // Create and start a fresh recognition instance
    const startRecognitionInstance = useCallback(() => {
        if (!SpeechRecognition || !isActiveRef.current) return;

        // Clean up any existing instance
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.abort();
            } catch (e) { /* ignore */ }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Disable Native Continuity for Mobile
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Voice recognition started');
            setIsRecording(true);
        };

        recognition.onend = () => {
            console.log('Voice recognition ended, isActive:', isActiveRef.current);
            setInterimText('');

            if (isActiveRef.current) {
                // User did NOT stop - auto-restart after brief delay
                console.log('Auto-restarting recognition...');
                setTimeout(() => {
                    if (isActiveRef.current) {
                        startRecognitionInstance();
                    }
                }, 100);
            } else {
                // User explicitly stopped
                setIsRecording(false);
                // Polish the final text
                const currentText = textRef.current;
                if (currentText && currentText.trim()) {
                    const polished = polishText(currentText);
                    setText(polished);
                }
            }
        };

        recognition.onresult = (event) => {
            let newFinalTextChunk = '';
            let currentInterim = '';

            // Use event.resultIndex (native) instead of custom ref
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                const transcript = result[0].transcript.trim();

                if (result.isFinal) {
                    // Filter by Confidence > 0 to avoid Android ghost duplicates
                    if (result[0].confidence > 0) {
                        newFinalTextChunk += (newFinalTextChunk ? ' ' : '') + transcript;
                    }
                } else {
                    currentInterim = transcript;
                }
            }

            setInterimText(currentInterim);

            if (newFinalTextChunk) {
                // Append to session text
                sessionTextRef.current = sessionTextRef.current
                    ? sessionTextRef.current + ' ' + newFinalTextChunk
                    : newFinalTextChunk;

                // Functional state update to avoid race conditions
                setText(() => {
                    const base = baseTextRef.current || '';
                    const session = sessionTextRef.current || '';
                    return base + (base && session ? ' ' : '') + session;
                });
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            // Don't stop on 'no-speech' or 'aborted' - let onend handle restart
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                isActiveRef.current = false;
                setIsRecording(false);
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (e) {
            console.error('Start error:', e);
            // If start fails, try again after a delay
            setTimeout(() => {
                if (isActiveRef.current) {
                    startRecognitionInstance();
                }
            }, 200);
        }
    }, []);

    // Start recording - called when user clicks mic button
    const startRecording = useCallback(() => {
        if (!SpeechRecognition) {
            alert("Voice recognition not supported in this browser.");
            return;
        }
        // Save current text as base, reset session text
        baseTextRef.current = textRef.current;
        sessionTextRef.current = '';
        isActiveRef.current = true;
        startRecognitionInstance();
    }, [startRecognitionInstance]);

    // Stop recording - called when user clicks mic button or sends
    const stopRecording = useCallback(() => {
        isActiveRef.current = false;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Stop error:", e);
            }
        }
        setIsRecording(false);
        setInterimText('');
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
        if (isRecording || isActiveRef.current) {
            isActiveRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { /* ignore */ }
            }
            setIsRecording(false);
            setInterimText('');
        }

        const finalText = polishText(text);

        if (!finalText.trim()) return;
        if (playSound) playSound('success');
        haptic.success();

        const newEntry = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
            timestamp: new Date().toISOString(),
            type,
            content: finalText,
            mood: null,
            audioUrl: null,
            tags: [],
            enableAI: true
        };

        if (onAddEntry) onAddEntry(newEntry);
        setText('');
        baseTextRef.current = '';
        sessionTextRef.current = '';
    };

    return (
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-[var(--shadow-card)] border border-[var(--color-border-light)]">
            {/* Type Toggle - Centered */}
            <div className="flex justify-center gap-2 mb-3">
                <button
                    onClick={() => setType('daily')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${type === 'daily'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
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

                    {/* Recording Indicator */}
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
