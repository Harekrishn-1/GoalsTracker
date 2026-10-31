'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { checkAuth } from '../slices/authSlice';

export default function StoreProvider({ children }: { children: ReactNode }) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            store.dispatch(checkAuth());
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
