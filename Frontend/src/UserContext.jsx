import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { getCart } from "./api/cartApi";
import { getProfile, loginUser, logoutUser, registerUser } from "./api/userApi";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      if (!user) {
        setCartItems([]);
        return [];
      }
      const cartResponse = await getCart();
      const items = cartResponse.data.items || [];
      setCartItems(items);
      return items;
    } catch {
      setCartItems([]);
      return [];
    }
  }, [user]);

  const refreshSession = useCallback(async () => {
    try {
      const profileResponse = await getProfile();
      setUser(profileResponse.data);
      return profileResponse.data;
    } catch {
      setUser(null);
      setCartItems([]);
      return null;
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const currentUser = await refreshSession();
      if (currentUser) {
        await refreshCart();
      }
      setLoading(false);
    };

    bootstrap();
  }, [refreshCart, refreshSession]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setUser(response.data.user);
    try {
      const cartResponse = await getCart();
      setCartItems(cartResponse.data.items || []);
    } catch {
      setCartItems([]);
    }
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    setUser(response.data.user);
    setCartItems([]);
    return response.data.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network issues during logout and clear local state.
    } finally {
      setUser(null);
      setCartItems([]);
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      cartItems,
      setCartItems,
      loading,
      refreshCart,
      refreshSession,
      login,
      register,
      logout,
    }),
    [user, cartItems, loading, refreshCart, refreshSession]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
