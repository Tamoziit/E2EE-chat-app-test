/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
    const user = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return;
        const s = io('http://localhost:5000');
        s.emit('register', user);
        setSocket(s);
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}
