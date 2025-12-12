// D:\visual studio program\spice-garden-full-stack-project\frontend\app\utils\AuthContext.tsx
"use client";

import { 
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect
} from "react";
import { api } from "./api";

//user interface
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

// auth context type
interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

//ceeate context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

//auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    //chck authencation on mount and periodically
    const checkAuth = async () => {
        if (!isClient) return;
        // setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            //verify token with backend
            const response = await api.get("/users/me");
            const userData = response.data;

            //store user data
            const userObj: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                role: userData.role || "user",
            };
            setUser(userObj);
        
            //update local storage with complete user data
            localStorage.setItem("userId", userData.id);
            localStorage.setItem("userName", userData.name); 
            localStorage.setItem("userEmail", userData.email);
            localStorage.setItem("userPhone", userData.phone || "");
            localStorage.setItem("userRole", userData.role || "user");

        } catch (error) {
            console.error("Auth check failed:", error);
            //token invalid or expired
            logout();
        }finally {
            setLoading(false);
        }
    };

    //login function
    const login = (token: string, userData: User) => {
        //store token and user data in local storage
        localStorage.setItem("token", token);

        //store user data
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userPhone", userData.phone || "");
        localStorage.setItem("userRole", userData.role || "user");

        setUser(userData);

        // Dispatch event for CartContext to fetch
        window.dispatchEvent(new CustomEvent('userLoggedIn'));

    }

    //logout function
    const logout = () => {
        //clear local storage
        localStorage.removeItem("token");
        // localStorage.removeItem("userId");
        // Keep userId in localStorage for cart reference?

        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        //clear user state
        setUser(null);

        // move ot login page
        window.location.href = "/";

        
        //not clear cart , CartContext will handle that
        //when user log out cartContext will automatically clear cart
        // Cart will be cleared automatically when token is removed
  };

  //check auth on initial load
    useEffect(() => {
        if (isClient) {
            checkAuth();
        }
    }, [isClient]);

    return (
    <AuthContext.Provider
        value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
        }}
    >
        {children}
    </AuthContext.Provider>
  );
}
            