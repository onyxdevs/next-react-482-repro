'use client';

export default function Error({ error }) {
    return <p id="caught">Caught by error.jsx: {error.message}</p>;
}
