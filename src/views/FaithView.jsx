import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, BookOpen, Sparkles, Wifi, WifiOff } from 'lucide-react';
import haptic from '../utils/haptic';

// Popular Bible verses to randomly fetch (Book Chapter:Verse format for API)
const VERSE_REFERENCES = [
    // Psalms (Popular)
    "Psalm 23:1-6", "Psalm 27:1", "Psalm 27:14", "Psalm 28:7", "Psalm 34:18",
    "Psalm 37:4", "Psalm 46:1", "Psalm 46:10", "Psalm 91:1-2", "Psalm 91:11-12",
    "Psalm 103:1-5", "Psalm 119:105", "Psalm 121:1-2", "Psalm 139:14", "Psalm 145:18",
    // Proverbs
    "Proverbs 3:5-6", "Proverbs 4:23", "Proverbs 16:3", "Proverbs 18:10", "Proverbs 22:6",
    "Proverbs 31:25", "Proverbs 11:25", "Proverbs 12:25", "Proverbs 15:1", "Proverbs 17:22",
    // Isaiah
    "Isaiah 40:31", "Isaiah 40:29", "Isaiah 41:10", "Isaiah 43:2", "Isaiah 54:17",
    "Isaiah 55:8-9", "Isaiah 58:11", "Isaiah 26:3", "Isaiah 30:21", "Isaiah 53:5",
    // Jeremiah
    "Jeremiah 29:11", "Jeremiah 33:3", "Jeremiah 17:7-8", "Jeremiah 31:3",
    // Matthew
    "Matthew 5:14", "Matthew 6:33", "Matthew 11:28-30", "Matthew 19:26", "Matthew 28:20",
    "Matthew 5:16", "Matthew 7:7", "Matthew 6:34", "Matthew 5:9", "Matthew 22:37-39",
    // John
    "John 3:16", "John 14:6", "John 14:27", "John 15:5", "John 16:33",
    "John 8:32", "John 10:10", "John 11:25", "John 13:34-35", "John 1:12",
    // Romans
    "Romans 8:28", "Romans 8:31", "Romans 8:38-39", "Romans 12:2", "Romans 15:13",
    "Romans 5:8", "Romans 6:23", "Romans 10:9", "Romans 12:12", "Romans 8:1",
    // Corinthians
    "1 Corinthians 13:4-7", "1 Corinthians 10:13", "1 Corinthians 16:14", "2 Corinthians 5:7",
    "2 Corinthians 12:9", "2 Corinthians 5:17", "1 Corinthians 13:13", "2 Corinthians 4:18",
    // Galatians & Ephesians
    "Galatians 5:22-23", "Ephesians 2:8-9", "Ephesians 3:20", "Ephesians 6:10",
    "Galatians 2:20", "Ephesians 4:32", "Ephesians 6:11", "Galatians 6:9",
    // Philippians
    "Philippians 4:6-7", "Philippians 4:13", "Philippians 4:19", "Philippians 1:6",
    "Philippians 2:3-4", "Philippians 3:14", "Philippians 4:8",
    // Colossians & Thessalonians
    "Colossians 3:2", "Colossians 3:23", "1 Thessalonians 5:16-18",
    // Timothy
    "2 Timothy 1:7", "1 Timothy 6:12", "2 Timothy 3:16-17",
    // Hebrews
    "Hebrews 11:1", "Hebrews 12:1-2", "Hebrews 13:5-6", "Hebrews 4:16",
    // James
    "James 1:2-4", "James 1:5", "James 4:7-8", "James 1:17", "James 5:16",
    // Peter
    "1 Peter 5:7", "1 Peter 2:9", "1 Peter 3:15", "2 Peter 1:3",
    // John (Epistles)
    "1 John 1:9", "1 John 4:4", "1 John 4:18", "1 John 5:14",
    // Old Testament Favorites
    "Joshua 1:9", "Deuteronomy 31:6", "Lamentations 3:22-23", "Zephaniah 3:17",
    "Micah 6:8", "Habakkuk 3:19", "Nahum 1:7", "Zechariah 4:6",
    // Genesis & Exodus
    "Genesis 1:27", "Genesis 28:15", "Exodus 14:14", "Exodus 15:2",
    // Revelation
    "Revelation 21:4", "Revelation 3:20"
];

// Fallback verses for offline mode (curated subset)
const FALLBACK_VERSES = [
    { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
    { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" },
    { text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28" },
    { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
    { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16" },
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
    { text: "God is our refuge and strength, an ever-present help in trouble.", reference: "Psalm 46:1" },
    { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
    { text: "With man this is impossible, but with God all things are possible.", reference: "Matthew 19:26" },
    { text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", reference: "1 Corinthians 13:4" },
    { text: "For we walk by faith, not by sight.", reference: "2 Corinthians 5:7" },
];

const FaithView = () => {
    const [currentVerse, setCurrentVerse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('faithFavorites');
        return saved ? JSON.parse(saved) : [];
    });

    // Fetch verse from API
    const fetchVerseFromAPI = useCallback(async (reference) => {
        try {
            const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            return {
                text: data.text.trim().replace(/\n/g, ' '),
                reference: data.reference
            };
        } catch (error) {
            console.warn('Bible API fetch failed:', error);
            return null;
        }
    }, []);

    // Get a random verse (API with fallback)
    const getRandomVerse = useCallback(async () => {
        setIsLoading(true);

        // Pick a random reference
        const randomRef = VERSE_REFERENCES[Math.floor(Math.random() * VERSE_REFERENCES.length)];

        // Try API first
        const apiVerse = await fetchVerseFromAPI(randomRef);

        if (apiVerse) {
            setIsOnline(true);
            setIsLoading(false);
            return apiVerse;
        }

        // Fallback to offline verses
        setIsOnline(false);
        setIsLoading(false);
        const randomIndex = Math.floor(Math.random() * FALLBACK_VERSES.length);
        return FALLBACK_VERSES[randomIndex];
    }, [fetchVerseFromAPI]);

    // Initialize with a random verse
    useEffect(() => {
        getRandomVerse().then(setCurrentVerse);
    }, []);

    // Refresh verse with animation
    const handleRefresh = async () => {
        haptic.medium();
        setIsLoading(true);

        const verse = await getRandomVerse();
        setCurrentVerse(verse);
    };

    // Toggle favorite
    const toggleFavorite = () => {
        haptic.light();
        if (!currentVerse) return;

        setFavorites(prev => {
            const isFavorite = prev.some(v => v.reference === currentVerse.reference);
            let newFavorites;

            if (isFavorite) {
                newFavorites = prev.filter(v => v.reference !== currentVerse.reference);
            } else {
                newFavorites = [...prev, currentVerse];
            }

            localStorage.setItem('faithFavorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const isFavorite = currentVerse && favorites.some(v => v.reference === currentVerse.reference);

    return (
        <div className="flex flex-col h-full w-full px-2 py-4 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="text-[var(--color-accent)]" size={24} />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                        Daily Inspiration
                    </h2>
                    <Sparkles className="text-[var(--color-accent)]" size={24} />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                    {isOnline ? (
                        <>
                            <Wifi size={14} className="text-[var(--color-success)]" />
                            <span>100+ verses available</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={14} className="text-[var(--color-warning)]" />
                            <span>Offline mode</span>
                        </>
                    )}
                </div>
            </div>

            {/* Main Verse Card */}
            <motion.div
                className="flex-1 flex items-center justify-center px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-12 h-12 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                            <span className="text-sm text-[var(--color-text-tertiary)]">Finding your verse...</span>
                        </motion.div>
                    ) : currentVerse && (
                        <motion.div
                            key={currentVerse.reference}
                            initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-md"
                        >
                            <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 rounded-3xl p-8 shadow-xl border border-blue-200/50 dark:border-blue-800/30">
                                {/* Decorative icon */}
                                <div className="absolute top-4 right-4 text-blue-300 dark:text-blue-700 opacity-40">
                                    <BookOpen size={32} />
                                </div>

                                {/* Quote marks */}
                                <div className="text-6xl text-blue-300 dark:text-blue-600 opacity-50 leading-none mb-2">"</div>

                                {/* Verse text */}
                                <p className="text-lg md:text-xl font-serif text-[var(--color-text-primary)] leading-relaxed mb-6 italic">
                                    {currentVerse.text}
                                </p>

                                {/* Reference */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-[var(--color-primary)] tracking-wide">
                                        — {currentVerse.reference}
                                    </span>

                                    {/* Favorite button */}
                                    <button
                                        onClick={toggleFavorite}
                                        className={`p-2 rounded-full transition-all active:scale-90 ${isFavorite
                                            ? 'text-red-500 bg-red-100 dark:bg-red-900/30'
                                            : 'text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                            }`}
                                    >
                                        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Refresh Button */}
            <div className="flex justify-center pb-4">
                <motion.button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-70"
                >
                    <RefreshCw
                        size={22}
                        className={isLoading ? 'animate-spin' : ''}
                    />
                    <span>New Verse</span>
                </motion.button>
            </div>

            {/* Favorites count */}
            {favorites.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-[var(--color-text-tertiary)]"
                >
                    <Heart size={14} className="inline mr-1 text-red-400" fill="currentColor" />
                    {favorites.length} saved verse{favorites.length !== 1 ? 's' : ''}
                </motion.div>
            )}
        </div>
    );
};

export default FaithView;
