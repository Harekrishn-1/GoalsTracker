import { useDispatch, useSelector } from 'react-redux';
import { CloudOff } from 'lucide-react';
import { openAuthModal } from '../slices/authSlice';

export default function GuestBanner() {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const goals = useSelector((s) => s.goals.allItems);

    if (isAuthenticated) return null;
    const count = goals?.length || 0;
    if (count === 0) return null;

    return (
        <div className="flex items-center gap-3 p-4 border border-yellow-300 bg-yellow-50 rounded-xl">
            <CloudOff className="w-5 h-5 text-yellow-600 shrink-0" />
            <span className="flex-1 text-sm text-yellow-800">
                You have {count} goal{count === 1 ? '' : 's'} saved only on this device.
            </span>
            <button onClick={() => dispatch(openAuthModal('signup'))}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-yellow-600 rounded-lg hover:bg-yellow-700 shrink-0">
                Save my goals
            </button>
        </div>
    );
}
