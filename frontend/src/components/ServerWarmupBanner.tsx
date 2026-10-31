'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { Server, Zap, CheckCircle2, Clock } from 'lucide-react';

export default function ServerWarmupBanner() {
    const { loading } = useAppSelector((s) => s.auth);
    const [seconds, setSeconds] = useState(0);
    const [showBanner, setShowBanner] = useState(false);
    const [justConnected, setJustConnected] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        let delayTimer: NodeJS.Timeout | null = null;

        if (loading) {
            // Agar 1.5s se zyada lagta hai, tabhi spinner/timer dikhao (taaki fast reload pe flicker na ho)
            delayTimer = setTimeout(() => {
                setShowBanner(true);
            }, 1500);

            timer = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            // Loading khatam ho gayi
            if (showBanner) {
                setJustConnected(true);
                const dismiss = setTimeout(() => {
                    setShowBanner(false);
                    setJustConnected(false);
                    setSeconds(0);
                }, 1500);
                return () => clearTimeout(dismiss);
            } else {
                setSeconds(0);
            }
        }

        return () => {
            if (timer) clearInterval(timer);
            if (delayTimer) clearTimeout(delayTimer);
        };
    }, [loading, showBanner]);

    if (!showBanner) return null;

    // Approximate progress estimate for Render free-tier cold start (~25 seconds)
    const estimatedPercent = Math.min(95, Math.round((seconds / 25) * 100));

    return (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 transition-all duration-300">
            <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-colors ${
                justConnected
                    ? 'bg-green-500/95 border-green-600 text-white'
                    : 'bg-white/95 border-blue-200 text-gray-800'
            }`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {justConnected ? (
                            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                        ) : (
                            <Server className="w-5 h-5 text-blue-600 animate-pulse" />
                        )}
                        <span className="font-semibold text-sm">
                            {justConnected ? 'Server connected successfully!' : 'Waking up cloud server...'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono font-medium opacity-80">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{seconds}s</span>
                    </div>
                </div>

                {!justConnected && (
                    <>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            Render free instance is spinning up from sleep. Usually takes ~15–25s on first visit.
                        </p>

                        {/* Animated scrolling progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
                            <div
                                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${Math.max(15, estimatedPercent)}%` }}
                            />
                            {/* Scrolling shimmer light */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                        </div>

                        <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                {seconds < 8 ? 'Connecting Redis & MongoDB...' : seconds < 18 ? 'Verifying authentication...' : 'Almost ready...'}
                            </span>
                            <span>{estimatedPercent}%</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
