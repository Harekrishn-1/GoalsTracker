import { Trophy, X, Star, Quote, Sparkles } from 'lucide-react';

// Submit pe — left side, motivational quote
export function QuoteToasts({ items, onHide }) {
    return (
        <div className="fixed z-50 space-y-2 top-4 left-4">
            {items.map((q) => (
                <div key={q.id}
                    className="max-w-md p-6 text-white shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl motivational-notification">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="p-2 mt-1 rounded-full bg-white/20">
                                <Quote className="w-6 h-6 text-yellow-200" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2 text-lg font-bold">Goals Submitted! 🎯</h3>
                                <blockquote className="mb-3 text-sm italic leading-relaxed">"{q.quote}"</blockquote>
                                <p className="text-xs font-medium text-indigo-200">— {q.author}</p>
                            </div>
                        </div>
                        <button onClick={() => onHide(q.id)}
                            className="p-1 transition-colors rounded-full text-white/80 hover:text-white hover:bg-white/20">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center mt-4 space-x-2">
                        <Sparkles className="w-4 h-4 text-yellow-200" />
                        <span className="text-sm font-medium">Keep pushing forward! 💪</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// 80%+ nudge — right side
export function NudgeToasts({ items, onHide }) {
    return (
        <div className="fixed z-50 space-y-2 top-4 right-4">
            {items.map((n) => (
                <div key={n.id}
                    className="max-w-sm p-6 text-white shadow-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl celebration-notification">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white/20">
                                <Star className="w-6 h-6 text-yellow-200" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Almost there! 🔥</h3>
                                <p className="text-sm opacity-90">{n.text}</p>
                            </div>
                        </div>
                        <button onClick={() => onHide(n.id)}
                            className="p-1 transition-colors rounded-full text-white/80 hover:text-white hover:bg-white/20">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
