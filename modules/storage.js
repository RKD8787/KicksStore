// ============== STORAGE MODULE ==============

export function loadFromStorage() {
    const stored = localStorage.getItem('kicksStoreData');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to load from storage', e);
        }
    }
    return { users: {}, currentUser: null, cart: {} };
}

export function saveToStorage(data) {
    localStorage.setItem('kicksStoreData', JSON.stringify(data));
}

export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}