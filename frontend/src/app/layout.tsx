import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '../components/StoreProvider';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import ServerWarmupBanner from '../components/ServerWarmupBanner';

export const metadata: Metadata = {
    title: 'GoalsTracker - Track Your Daily Progress',
    description: 'A clean, full-stack app for tracking daily goals. Use it without an account; sign up only when you want your progress saved.'
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
                <StoreProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <ServerWarmupBanner />
                        <main className="flex-1">
                            {children}
                        </main>
                        <AuthModal />
                    </div>
                </StoreProvider>
            </body>
        </html>
    );
}
