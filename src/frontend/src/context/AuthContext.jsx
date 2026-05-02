import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext(null);

const initialState = {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    isAuthenticated: !!localStorage.getItem("token"),
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

    const login = (token, role) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        dispatch({ type: "LOGIN", payload: { token, role } });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        dispatch({ type: "LOGOUT" });
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