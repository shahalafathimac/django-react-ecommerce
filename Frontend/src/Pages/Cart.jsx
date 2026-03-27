import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiFrown, FiShoppingCart, FiX } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { removeCartItem, updateCartItem } from "../api/cartApi";
import { UserContext } from "../UserContext";

function Cart() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, cartItems, setCartItems, refreshCart } = useContext(UserContext);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setLoading(false);
        navigate("/login");
        return;
      }
      await refreshCart();
      setLoading(false);
    };

    loadCart();
  }, [navigate, refreshCart, user]);

  const handleRemove = async (itemId) => {
    try {
      const response = await removeCartItem(itemId);
      setCartItems(response.data.items || []);
      toast.success("Item removed from cart.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error removing item."));
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await updateCartItem(itemId, newQuantity);
      setCartItems(response.data.items || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error updating quantity."));
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * (item.quantity || 1), 0);
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="text-center py-20 text-gray-600 text-xl">Loading your cart...</div>;
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
          <div className="flex-1 bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cart Items</h2>

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
                      <p className="text-gray-600">Rs. {item.price}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          -
                        </button>

                        <span className="font-semibold text-gray-700">{item.quantity || 1}</span>

                        <button
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                  >
                    <FiX />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3 bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>Rs. {subtotal}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>Rs. {shipping}</p>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-3">
                <p>Total</p>
                <p>Rs. {total}</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
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
