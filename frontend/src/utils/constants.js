// Submit ke baad — Indian icons, English mein
export const motivationalQuotesData = [
    { quote: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", author: "A.P.J. Abdul Kalam" },
    { quote: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
    { quote: "You have the right to work, but never to the fruit of the work.", author: "Bhagavad Gita" },
    { quote: "A person should not be too honest. Straight trees are cut first.", author: "Chanakya" },
    { quote: "If you want to shine like a sun, first burn like a sun.", author: "A.P.J. Abdul Kalam" },
    { quote: "Take up one idea. Make that one idea your life.", author: "Swami Vivekananda" },
    { quote: "Set your goals high, and don't stop till you get there.", author: "Bo Jackson" },
    { quote: "I don't believe in results. I believe in the process.", author: "M.S. Dhoni" },
    { quote: "Failure will never overtake me if my determination to succeed is strong enough.", author: "A.P.J. Abdul Kalam" },
    { quote: "The whole secret of existence is to have no fear.", author: "Swami Vivekananda" },
    { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { quote: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
    { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" }
];

// 80%+ (100% se kam) — "thoda aur, kar lo"
export const almostThereQuotes = [
    "So close! Just a little more to finish this one.",
    "You're almost there — don't stop at 90%.",
    "The last stretch separates done from almost. Push through!",
    "One final effort and this goal is yours.",
    "You've done the hard part. Close it out to 100%.",
    "Nearly there — finish strong! 🔥"
];

export const categories = ['Personal', 'Study', 'Work', 'Health'];

// Original category colors
export const getCategoryColor = (category) => {
    switch (category) {
        case 'Personal': return 'text-purple-600 bg-purple-100';
        case 'Study':    return 'text-blue-600 bg-blue-100';
        case 'Work':     return 'text-green-600 bg-green-100';
        case 'Health':   return 'text-red-600 bg-red-100';
        default:         return 'text-gray-600 bg-gray-100';
    }
};

export const formatDisplayDate = (date) =>
    date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'
    });

export const calculateTotalProgress = (goals) => {
    if (goals.length === 0) return 0;
    return Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length);
};
