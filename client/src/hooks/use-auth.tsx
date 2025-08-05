import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

// Simple User type
type User = {
  id: number;
  username: string;
  companyName: string | null;
  profileLogo: string | null;
};

// Define Auth Context
type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

// Provider component to wrap app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, navigate] = useLocation();
  
  // Load user from localStorage on mount and verify session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Verify the session is still valid with the server
      fetch('/api/user', { credentials: 'include' })
        .then(response => {
          if (!response.ok) {
            // Session expired, clear local storage
            localStorage.removeItem('user');
            setUser(null);
          }
        })
        .catch(() => {
          // Network error or server issue, clear session
          localStorage.removeItem('user');
          setUser(null);
        });
    }
  }, []);
  
  // Login function that authenticates with the server
  const login = async (username: string, password: string) => {
    try {
      // Send auth request to backend for proper session
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important for cookies
      });
      
      if (response.ok) {
        // Use the user data from response
        const serverUser = await response.json();
        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
        navigate('/');
      } else {
        console.error('Authentication failed:', response.status);
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      // Clear server session
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      console.log('Logout response:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Always clean up local state regardless of server response
    setUser(null);
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // Update user function
  const updateUser = (updatedUserData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedUserData };
      console.log("Auth context updateUser called with:", updatedUserData);
      console.log("Updated user object:", updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}