import React, { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';

const SmartAppBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || window.matchMedia('(display-mode: fullscreen)').matches
            || window.navigator.standalone === true;

        // Check if already dismissed
        const wasDismissed = localStorage.getItem('appBannerDismissed');

        if (isStandalone || wasDismissed) {
            return;
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Show iOS banner after short delay
            setTimeout(() => setShowBanner(true), 2000);
        } else {
            // Android/Chrome: Listen for beforeinstallprompt
            const handler = (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setTimeout(() => setShowBanner(true), 2000);
            };

            window.addEventListener('beforeinstallprompt', handler);
            return () => window.removeEventListener('beforeinstallprompt', handler);
        }
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
            localStorage.setItem('appBannerDismissed', 'true');
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setDismissed(true);
        localStorage.setItem('appBannerDismissed', 'true');
    };

    if (!showBanner || dismissed) return null;

    return (
        <div
            className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up"
            style={{ animation: 'slideUp 0.3s ease-out forwards' }}
        >
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border-light)] p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                    {/* App Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-white text-2xl">✨</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">
                            Install Productivity
                        </h3>

                        {isIOS ? (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                                Tap <Share size={12} className="inline mx-0.5 -mt-0.5" /> then
                                <span className="font-semibold"> "Add to Home Screen"</span>
                                <Plus size={10} className="inline mx-0.5 -mt-0.5" />
                            </p>
                        ) : (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                Get the full app experience
                            </p>
                        )}

                        {/* Android Install Button */}
                        {!isIOS && deferredPrompt && (
                            <button
                                onClick={handleInstall}
                                className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg active:scale-95 transition-transform"
                            >
                                <Download size={14} />
                                Install App
                            </button>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 -mt-1 -mr-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default SmartAppBanner;
