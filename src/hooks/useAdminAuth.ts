import { useState } from 'react';

export function useAdminAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    return {
        isAuthenticated,
        login,
        logout
    };
}
