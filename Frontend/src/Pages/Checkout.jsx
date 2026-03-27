import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiCheckCircle, FiFrown, FiXCircle } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { createOrder } from "../api/orderApi";
import { UserContext } from "../UserContext";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentReference, setPaymentReference] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, refreshCart } = useContext(UserContext);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      const singleItem = location.state?.singleItem || [];
      const items = singleItem.length > 0 ? singleItem : await refreshCart();
      setCartItems(items);

      if (user.address) {
        setShippingInfo({
          name: user.address.name || user.name || "",
          address: user.address.address || user.address.street || "",
          city: user.address.city || "",
          state: user.address.state || "",
          zip: user.address.zip || user.address.zip_code || "",
          phone: user.address.phone || "",
        });
      } else {
        setShippingInfo((prev) => ({ ...prev, name: user.name || "" }));
      }

      setLoading(false);
    };

    fetchCheckoutData();
  }, [location.state, navigate, refreshCart, user]);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + Number(item.price) * (item.quantity || 1), 0),
    [cartItems]
  );
  const shippingCost = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shippingCost;
  const isSingleBuy = Boolean(location.state?.singleItem?.length);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (Object.values(shippingInfo).some((value) => !String(value).trim())) {
      toast.error(
        <>
          <FiAlertTriangle className="inline-block mr-2" /> Please fill all shipping details.
        </>
      );
      return;
    }

    try {
      const payload = {
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
        payment_reference: paymentMethod === "cod" ? "" : paymentReference.trim(),
        save_address: saveAddress,
      };

      if (isSingleBuy) {
        payload.items = cartItems.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1,
        }));
      }

      await createOrder(payload);

      if (!isSingleBuy) {
        await refreshCart();
      }

      if (saveAddress) {
        setUser((prevUser) => ({
          ...prevUser,
          address: shippingInfo,
        }));
      }

      toast.success(
        <>
          <FiCheckCircle className="inline-block mr-2" /> Order placed successfully!
        </>
      );

      setTimeout(() => {
        navigate("/OrderSuccess");
      }, 1200);
    } catch (error) {
      toast.error(
        <>
          <FiXCircle className="inline-block mr-2" /> {getApiErrorMessage(error)}
        </>
      );
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600 text-xl">Loading checkout...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600 text-xl flex flex-col items-center gap-4">
        <FiFrown className="text-4xl text-gray-500" />
        Your cart is empty
        <div className="mt-6">
          <button
            onClick={() => navigate("/productList")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 bg-gradient-to-br from-yellow-50 to-pink-50 min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Checkout</h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>

          <div className="space-y-4">
            {["name", "address", "city", "state", "zip", "phone"].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={shippingInfo[field]}
                onChange={handleChange}
                placeholder={field.toUpperCase()}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            ))}

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>

            {paymentMethod !== "cod" && (
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={paymentMethod === "upi" ? "Enter UPI transaction ID" : "Enter payment reference"}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            )}

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded"
              />
              <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
                Save this address for future orders
              </label>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-full font-semibold transition"
            >
              Place Order
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3 text-gray-700">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <p>
                  {item.name} x {item.quantity || 1}
                </p>
                <p>Rs. {Number(item.price) * (item.quantity || 1)}</p>
              </div>
            ))}

            <div className="flex justify-between font-semibold border-t pt-3">
              <p>Subtotal</p>
              <p>Rs. {subtotal}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping</p>
              <p>Rs. {shippingCost}</p>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <p>Total</p>
              <p>Rs. {total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
