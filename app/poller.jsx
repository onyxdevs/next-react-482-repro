'use client';

import { useEffect, useState } from 'react';
import { poll } from './actions';

function Broken() {
    throw new Error('a render error');
}

export function Poller() {
    const [calls, setCalls] = useState(0);
    const [broken, setBroken] = useState(false);

    // Fire a server action every 100ms. Each takes ~200ms, so the router's action queue never drains:
    // there is always an action in flight, i.e. the router state is always a pending promise.
    useEffect(() => {
        const id = setInterval(() => {
            poll().then(() => setCalls((n) => n + 1));
        }, 100);
        return () => clearInterval(id);
    }, []);

    return (
        <main>
            <p id="calls">server actions settled: {calls}</p>
            <button id="break" onClick={() => setBroken(true)}>
                Throw during render
            </button>
            {broken ? <Broken /> : null}
        </main>
    );
}
