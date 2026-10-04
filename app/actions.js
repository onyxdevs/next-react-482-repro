'use server';

// Stands in for any server action a page calls on a timer (a status poll, an autosave).
export async function poll() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Date.now();
}
