import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user & cart from localStorage + JSON Server
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (storedUser) {
          setUser(storedUser);
          const res = await axios.get(`http://localhost:3000/users/${storedUser.id}`);
          const cartData = res.data.cart || [];
          setCartItems(cartData);
          localStorage.setItem("userCart", JSON.stringify(cartData));
        }
      } catch (err) {
        console.error("Error loading user/cart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndCart();
  }, []);

  // 🔹 Sync cart updates to both localStorage and JSON Server
  const updateCart = async (newCart) => {
    if (!user) return;
    setCartItems(newCart);
    localStorage.setItem("userCart", JSON.stringify(newCart));

    try {
      await axios.patch(`http://localhost:3000/users/${user.id}`, { cart: newCart });
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        cartItems,
        setCartItems: updateCart,
        loading,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
