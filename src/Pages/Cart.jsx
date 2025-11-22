import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiFrown, FiX } from "react-icons/fi";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Fetch cart items of the current logged-in user
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!storedUser) {
          alert("Please login to view your cart");
          navigate("/login");
          return;
        }

        const res = await axios.get(`http://localhost:3000/users/${storedUser.id}`);
        const userCart = res.data.cart || [];
        setCartItems(userCart);
      } catch (err) {
        console.error("Error fetching user cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // Remove item from cart
  const handleRemove = async (id) => {
    try {
      const updatedCart = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedCart);

      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      await axios.patch(`http://localhost:3000/users/${storedUser.id}`, {
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Update quantity
  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const updatedCart = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);

      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      await axios.patch(`http://localhost:3000/users/${storedUser.id}`, {
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Subtotal & total
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600 text-xl">Loading your cart...</div>
    );
  }

  return (
    <div className="pt-28 bg-gradient-to-br from-yellow-50 to-pink-50 min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center gap-3">
        <FiShoppingCart className="text-yellow-700" />
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-600 text-lg">
          <div className="flex justify-center items-center gap-2 text-2xl mb-3">
            <FiFrown className="text-gray-500" />
            Your cart is empty
          </div>

          <button
            onClick={() => navigate("/productList")}
            className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          {/* Cart Items */}
          <div className="flex-1 bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Cart Items
            </h2>

            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl shadow"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                      <p className="text-gray-600">₹{item.price}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, (item.quantity || 1) - 1)
                          }
                          className="bg-gray-200 px-2 rounded"
                        >
                          -
                        </button>

                        <span className="font-semibold text-gray-700">
                          {item.quantity || 1}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, (item.quantity || 1) + 1)
                          }
                          className="bg-gray-200 px-2 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                  >
                    <FiX /> {/* ✖ replaced */}
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{subtotal}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>₹{shipping}</p>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-3">
                <p>Total</p>
                <p>₹{total}</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/Checkout")}
              className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-full text-lg font-semibold transition"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/productList")}
              className="w-full mt-3 border-2 border-yellow-600 text-yellow-700 py-3 rounded-full text-lg font-semibold hover:bg-yellow-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
