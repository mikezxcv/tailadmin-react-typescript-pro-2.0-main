import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import appService from "../services/app.service";

interface IJwtTokenPayload {
    id: number;
    name: string;
    email: string;
    password: string;
    active: boolean;
    address: string | null;
    masterPassword: string | null;
    profiles: string[];
    permissions: string[];
    iat: number;
    exp: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean; // Nuevo estado
    login: (accessToken: string, refreshToken: string, expiresIn: number) => void;
    logout: () => void;
    decodedJwtToken: (token?: string) => IJwtTokenPayload;
    userLoggued: IJwtTokenPayload | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Inicialmente true
    const [userLoggued, setUserLoggued] = useState<IJwtTokenPayload | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");
            const expiresIn = Number(localStorage.getItem("expiresIn"));

            if (accessToken && refreshToken && expiresIn > 0) {
                try {
                    const user = decodedJwtToken(accessToken);
                    setUserLoggued(user);
                    setIsAuthenticated(true);
                    scheduleTokenRefresh(expiresIn);
                } catch (error) {
                    console.error("Error decoding token:", error);
                    logout();
                }
            }
            setIsLoading(false); // Finaliza la verificación
        };

        checkAuth();
    }, []);

    const login = (accessToken: string, refreshToken: string, expiresIn: number) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("expiresIn", expiresIn.toString());

        setIsAuthenticated(true);
        const userLoggued = decodedJwtToken(accessToken);
        setUserLoggued(userLoggued);
        scheduleTokenRefresh(expiresIn);

        setTimeout(() => {
            navigate("/");
        }, 100);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("expiresIn");
        setIsAuthenticated(false);
        setUserLoggued(null);
        navigate("/signin");
    };

    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) throw new Error("No refresh token available");
            const userLoggued = decodedJwtToken(refreshToken);
            setUserLoggued(userLoggued);
            const response = await appService.post("/authentication/refresh-token", {
                email: userLoggued.email,
                refreshToken: refreshToken,
            });
            const { access_token, refresh_token, expires_in } = response.data;

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("expiresIn", expires_in.toString());
            scheduleTokenRefresh(expires_in);
        } catch (error) {
            console.error("Error refreshing token:", error);
            logout();
        }
    };

    const scheduleTokenRefresh = (expiresIn: number) => {
        const refreshTime = (expiresIn - 60) * 1000;
        if (refreshTime > 0) {
            setTimeout(() => {
                refreshToken();
            }, refreshTime);
        } else {
            refreshToken();
        }
    };

    const decodedJwtToken = (token?: string): IJwtTokenPayload => {
        if (!token) token = localStorage.getItem("access_token") || "";
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join("")
        );
        const data = JSON.parse(jsonPayload);
        return data;
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, isLoading, login, logout, decodedJwtToken, userLoggued }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};