/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { generateKeyPair } from '../crypto/nacl';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function initUser() {
    let keys = JSON.parse(localStorage.getItem('keys'));

    if (!keys) {
        keys = generateKeyPair();
        localStorage.setItem('keys', JSON.stringify(keys));
    }

    return {
        username: 'alice',
        ...keys,
    };
}

export function AuthProvider({ children }) {
    const [user] = useState(initUser); // ✅ lazy init, runs once

    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}