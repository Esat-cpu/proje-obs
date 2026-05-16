import { createContext, useContext, useReducer } from "react";
import authService from "../shared/api/authServices";
const AuthContext = createContext(null);

const initialState = {
    token: localStorage.getItem("access_token") || null,
    role: localStorage.getItem("role") || null,
    isAuthenticated: !!localStorage.getItem("access_token"),
};

function authReducer(state, action) {
    switch (action.type) {
        case "LOGIN":
            return {
                token: action.payload.token,
                role: action.payload.role,
                isAuthenticated: true,
            };
        case "LOGOUT":
            return {
                token: null,
                role: null,
                isAuthenticated: false,
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = (token, role, refreshToken = null) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("role", role);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        dispatch({ type: "LOGIN", payload: { token, role } });
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.warn("Logout request failed:", error);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("role");
            dispatch({ type: "LOGOUT" });
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
    }
    return context;
}