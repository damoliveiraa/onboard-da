import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import "@/types/datalayer";

interface User {
  name: string;
  email: string;
  guild: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, guild: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function for email
const hashEmail = (email: string): string => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const fireUserDataEvent = (user: User) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'user_data',
    user_id: hashEmail(user.email),
    user_name: user.name,
    user_guild: user.guild,
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fireUserDataEvent(userData);
    }
  }, []);

  const register = (name: string, email: string, guild: string, password: string): boolean => {
    // Get existing users
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : {};

    // Check if user already exists
    if (users[email]) {
      return false;
    }

    // Store new user
    users[email] = { name, email, guild, password };
    localStorage.setItem('users', JSON.stringify(users));

    // Log in the user
    const newUser = { name, email, guild };
    setUser(newUser);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    
    // Fire user_data event
    fireUserDataEvent(newUser);
    
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : {};

    const userData = users[email];
    if (!userData || userData.password !== password) {
      return false;
    }

    const loggedInUser = { name: userData.name, email: userData.email, guild: userData.guild };
    setUser(loggedInUser);
    localStorage.setItem('current_user', JSON.stringify(loggedInUser));
    
    // Fire user_data event
    fireUserDataEvent(loggedInUser);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
