import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiCheckCircle, FiFrown, FiXCircle, FiLoader, FiShoppingBag, FiArrowRight, FiLock } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { createOrder } from "../api/orderApi";
import { UserContext } from "../UserContext";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const[loading, setLoading] = useState(true);
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

      const singleItem = location.state?.singleItem ||[];
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

  // Professional price formatter
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (Object.values(shippingInfo).some((value) => !String(value).trim())) {
      toast.error(
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiAlertTriangle className="text-[#8c3c2a]" /> Please fill all shipping details.
        </div>
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
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiCheckCircle className="text-[#c49b76]" /> Order placed successfully!
        </div>
      );

      setTimeout(() => {
        navigate("/OrderSuccess");
      }, 1200);
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiXCircle className="text-[#8c3c2a]" /> {getApiErrorMessage(error)}
        </div>
      );
    }
  };

  // Reusable input style
  const inputStyle = "w-full bg-[#130905] text-[#e4d4c8] placeholder-[#a89688]/50 border border-[#2a170e] rounded-sm py-3 px-5 text-sm focus:outline-none focus:border-[#c49b76] transition-colors duration-300";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110804] pt-32 flex flex-col items-center">
        <p className="text-[#c49b76] text-[10px] uppercase tracking-widest mt-20 flex items-center justify-center gap-3">
          <FiLoader className="animate-spin text-xl" /> Preparing checkout...
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#110804] pt-32 pb-20 px-6 font-sans text-[#f4ece4] flex items-center justify-center">
        <div className="max-w-[600px] text-center border border-[#2a170e] bg-[#130905]/50 py-20 px-6 rounded-sm w-full">
          <FiFrown className="mx-auto text-4xl text-[#c49b76] mb-6 opacity-50" />
          <p className="font-serif text-2xl text-[#f4ece4] mb-4">Nothing to checkout</p>
          <p className="text-[#a89688] font-light text-sm mb-10">Your selection is currently empty.</p>
          <button
            onClick={() => navigate("/productList")}
            className="inline-flex items-center gap-3 border border-[#c49b76] text-[#c49b76] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300"
          >
            Return to Collection <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-[#110804] min-h-screen font-sans text-[#f4ece4] px-6 md:px-12">
      
      {/* Page Header */}
      <div className="max-w-[1200px] mx-auto mb-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c49b76] mb-3 flex items-center justify-center gap-2">
          <FiLock size={12} /> Secure Checkout
        </p>
        <h1 className="text-4xl md:text-5xl font-serif text-[#f4ece4]">
          Finalize <span className="italic text-[#d9c3b0]">your</span> order
        </h1>
      </div>

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-7">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#a89688] border-b border-[#2a170e] pb-4 mb-8">
            1. Shipping Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" name="name" value={shippingInfo.name} onChange={handleChange} placeholder="Jane Doe" className={inputStyle} />
            </div>
            
            <div>
              <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">Street Address</label>
              <input type="text" name="address" value={shippingInfo.address} onChange={handleChange} placeholder="123 Luxury Avenue" className={inputStyle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">City</label>
                <input type="text" name="city" value={shippingInfo.city} onChange={handleChange} placeholder="Metropolis" className={inputStyle} />
              </div>
              <div>
                <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">State / Province</label>
                <input type="text" name="state" value={shippingInfo.state} onChange={handleChange} placeholder="State" className={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">ZIP / Postal Code</label>
                <input type="text" name="zip" value={shippingInfo.zip} onChange={handleChange} placeholder="000000" className={inputStyle} />
              </div>
              <div>
                <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">Phone Number</label>
                <input type="text" name="phone" value={shippingInfo.phone} onChange={handleChange} placeholder="+1 234 567 890" className={inputStyle} />
              </div>
            </div>

            <div className="pt-2 flex items-center">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="w-4 h-4 bg-[#130905] border-[#2a170e] rounded-sm accent-[#c49b76] cursor-pointer"
              />
              <label htmlFor="saveAddress" className="ml-3 text-[11px] uppercase tracking-[0.1em] text-[#a89688] cursor-pointer hover:text-[#c49b76] transition-colors">
                Save this address for future orders
              </label>
            </div>
          </div>

          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#a89688] border-b border-[#2a170e] pb-4 mt-16 mb-8">
            2. Payment Method
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">Select Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`${inputStyle} appearance-none cursor-pointer`}
              >
                <option value="card" className="bg-[#130905]">Credit / Debit Card</option>
                <option value="upi" className="bg-[#130905]">UPI Transfer</option>
                <option value="cod" className="bg-[#130905]">Cash on Delivery</option>
              </select>
            </div>

            {paymentMethod !== "cod" && (
              <div className="animate-fade-in">
                <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
                  {paymentMethod === "upi" ? "UPI Transaction ID" : "Payment Reference"}
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={paymentMethod === "upi" ? "Enter UPI transaction ID" : "Enter card / payment reference"}
                  className={inputStyle}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#130905] border border-[#2a170e] p-8 rounded-sm sticky top-32">
            <h2 className="font-serif text-2xl text-[#f4ece4] mb-8">Order Summary</h2>

            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-[#f9f6f0] flex-shrink-0 flex items-center justify-center p-1 rounded-sm">
                     <img
                        src={item.image || "https://images.unsplash.com/photo-1599643478524-fb66f70a0066?auto=format&fit=crop&w=100&q=80"}
                        alt={item.name}
                        className="object-contain max-h-full mix-blend-multiply"
                      />
                  </div>
                  {/* Item Details */}
                  <div className="flex-1">
                    <p className="text-[#f4ece4] text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-[#a89688] text-[10px] uppercase tracking-[0.15em] mt-1">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="text-[#e4d4c8] text-sm tracking-wider flex-shrink-0">
                    <span className="text-[9px] uppercase tracking-[0.1em] text-[#a89688] mr-1">Rs.</span>
                    {formatPrice(Number(item.price) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm font-light text-[#a89688] border-t border-[#2a170e] pt-6">
              <div className="flex justify-between items-center">
                <p>Subtotal</p>
                <p className="text-[#e4d4c8] tracking-wider">Rs. {formatPrice(subtotal)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Secured Shipping</p>
                <p className="text-[#e4d4c8] tracking-wider">Rs. {formatPrice(shippingCost)}</p>
              </div>
            </div>

            <div className="border-t border-[#2a170e] mt-6 pt-6 mb-8 flex justify-between items-end">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#f4ece4]">Total</p>
              <p className="text-2xl text-[#c49b76] font-light tracking-wide">
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#a89688] mr-2">Rs.</span>
                {formatPrice(total)}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#c49b76] text-[#110804] py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#b58c66] transition-colors duration-300 flex justify-center items-center gap-2"
            >
              <FiShoppingBag size={14} /> Place Order
            </button>
            
            <p className="text-center text-[#a89688] text-[9px] uppercase tracking-[0.15em] mt-6 leading-relaxed">
              Payments are secure and encrypted. <br/> Your information is kept private.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;