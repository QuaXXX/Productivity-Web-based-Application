/**
 * Centralized localStorage keys to prevent typos and enable easy refactoring.
 * All localStorage interactions should use these constants.
 */

export const STORAGE_KEYS = {
    // Core Data
    HABITS: 'productivity_habits',
    BIG_GOALS: 'productivity_big_goals',
    HISTORY: 'productivity_history',
    JOURNAL_ENTRIES: 'productivity_journal_entries',

    // UI State
    ACTIVE_TAB: 'productivity_active_tab',
    AUTO_HIDE: 'productivity_auto_hide',
    CHART_STYLE: 'productivity_chart_style',

    // Settings
    STATS_SETTINGS: 'productivity_stats_settings',
    HIDDEN_GOALS: 'productivity_hidden_goals',
    FUTURE_SPECIFICS: 'productivity_future_specifics',
    DISMISSED_SUGGESTIONS: 'productivity_dismissed_suggestions',
};

export default STORAGE_KEYS;
