import { createContext, useEffect, useState, useCallback } from "react";
import { login as loginRequest } from "../api/auth";
import { setAuthToken, setUnauthorizedHandler } from "../api/client";
import { getToken, saveToken, clearToken, getUser, saveUser, clearUser } from "../api/tokenStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const logout = useCallback(async () => {
    await Promise.all([clearToken(), clearUser()]);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Restore session on app start so an already-logged-in user isn't sent
  // back to the login screen every time the app is reopened. Both the token
  // and the user object must be present — there's no "get current user"
  // endpoint to re-fetch the latter, so an inconsistent/partial state (e.g.
  // a token saved before this field existed) is treated as logged out
  // rather than routing with an incomplete user.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());

    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([getToken(), getUser()]);
        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        } else if (storedToken || storedUser) {
          await Promise.all([clearToken(), clearUser()]);
        }
      } finally {
        setIsRestoring(false);
      }
    })();
  }, [logout]);

  async function login(username, password) {
    // LoginResponse: { accessToken, user: AppUserResponse }
    const data = await loginRequest(username, password);
    if (!data?.accessToken) {
      throw new Error("Login response did not include an access token.");
    }
    if (!data?.user) {
      throw new Error("Login response did not include user information.");
    }

    await Promise.all([saveToken(data.accessToken), saveUser(data.user)]);
    setAuthToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isRestoring, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
