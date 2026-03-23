import React, { useEffect, useState } from "react";
import { getUserById, updateUser } from "../api/userApi.js";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiFrown } from "react-icons/fi";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [saveAddress, setSaveAddress] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const urlParams = new URLSearchParams(window.location.search);
        const isSingleBuy = urlParams.get("single");

        if (!storedUser) {
          toast.error("Please login first!");
          navigate("/login");
          return;
        }

        const res = await getUserById(storedUser.id);
        const userData = res.data;
        setUserData(userData);

        if (isSingleBuy) {
          const singleItem = JSON.parse(localStorage.getItem("singleBuyItem")) || [];
          setCartItems(singleItem);
        } else {
          setCartItems(userData.cart || []);
          localStorage.setItem("userCart", JSON.stringify(userData.cart || []));
        }

        if (userData.address) {
          setShippingInfo({
            name: userData.address.name || storedUser.name,
            address: userData.address.address,
            city: userData.address.city,
            state: userData.address.state,
            zip: userData.address.zip,
            phone: userData.address.phone,
          });
        } else {
          setShippingInfo((prev) => ({ ...prev, name: storedUser.name || "" }));
        }
      } catch {
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const shippingCost = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (
      !shippingInfo.name ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.zip ||
      !shippingInfo.phone
    ) {
      toast.error(
        <>
          <FiAlertTriangle className="inline-block mr-2" /> Please fill all shipping details.
        </>
      );
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!storedUser) {
        toast.error("Please login first!");
        navigate("/login");
        return;
      }

      const orderData = {
        id: Date.now(),
        userId: storedUser.id,
        items: cartItems,
        totalAmount: total,
        shippingInfo,
        paymentMethod,
        orderDate: new Date().toLocaleString(),
        status: "Placed",
      };

      let currentUser = userData;
      if (!currentUser) {
        const res = await getUserById(storedUser.id);
        currentUser = res.data;
      }

      if (saveAddress) {
        await updateUser(storedUser.id, { address: shippingInfo });
      }

      let existingOrders = currentUser.order || currentUser.orders || [];
      const updatedOrders = [...existingOrders, orderData];

      const updatePayload = { cart: [] };
      currentUser.order !== undefined
        ? (updatePayload.order = updatedOrders)
        : (updatePayload.orders = updatedOrders);

      await updateUser(storedUser.id, updatePayload);

      localStorage.removeItem("userCart");
      localStorage.removeItem("singleBuyItem");

      // toast for place order
      toast.success(
        <>
          <FiCheckCircle className="inline-block mr-2" /> Order placed successfully!
        </>
      );

      
      setTimeout(() => {
        navigate("/OrderSuccess");
      }, 1500);

    } catch {
      toast.error(
        <>
          <FiXCircle className="inline-block mr-2" /> Something went wrong!
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600 text-xl">
        Loading checkout...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600 text-xl flex flex-col items-center gap-4">
        <Toaster position="top-right" />
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
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
        Checkout
      </h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Shipping Section */}
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

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-full font-semibold transition"
            >
              Place Order
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3 text-gray-700">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <p>
                  {item.name} x {item.quantity || 1}
                </p>
                <p>₹{item.price * (item.quantity || 1)}</p>
              </div>
            ))}

            <div className="flex justify-between font-semibold border-t pt-3">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping</p>
              <p>₹{shippingCost}</p>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <p>Total</p>
              <p>₹{total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
