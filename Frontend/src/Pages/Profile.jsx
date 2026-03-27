import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCheck, FiPackage, FiLogOut, FiShoppingBag, FiLoader, FiX } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { getMyOrders, updateOrderStatus } from "../api/orderApi";
import { UserContext } from "../UserContext";
import { updateUser } from "../api/userApi";

function Profile() {
  const { user, setUser, logout, loading: sessionLoading } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const[orders, setOrders] = useState([]);
  const [address, setAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        if (!sessionLoading) {
          navigate("/login");
        }
        return;
      }

      try {
        const ordersRes = await getMyOrders();
        setOrders(ordersRes.data ||[]);
        setAddress({
          name: user.address?.name || user.name || "",
          address: user.address?.address || user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || user.address?.zip_code || "",
          phone: user.address?.phone || "",
        });
      } catch (error) {
        toast.error(
          <div className="flex items-center gap-2 text-sm font-sans">
            <FiX className="text-[#8c3c2a]" /> {getApiErrorMessage(error, "Unable to load profile.")}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, sessionLoading, user]);

  // Professional price formatter
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Luxury-themed status colors
  const getStatusColor = (status) => {
    const colors = {
      Placed: "border-[#c49b76] text-[#c49b76] bg-[#c49b76]/10",
      Pending: "border-[#d9c3b0] text-[#d9c3b0] bg-[#d9c3b0]/10",
      Delivered: "border-[#8fa382] text-[#8fa382] bg-[#8fa382]/10", // Muted sage green
      Shipped: "border-[#a89688] text-[#a89688] bg-[#a89688]/10",
      Cancelled: "border-[#8c3c2a] text-[#8c3c2a] bg-[#8c3c2a]/10", // Terracotta
      Processing: "border-[#e4d4c8] text-[#110804] bg-[#e4d4c8]",
    };
    return colors[status] || "border-[#2a170e] text-[#a89688] bg-[#130905]";
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async () => {
    try {
      const response = await updateUser(user.id, { address });
      setUser(response.data);
      toast.success(
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiCheck className="text-[#c49b76]" /> Address updated securely.
        </div>
      );
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiX className="text-[#8c3c2a]" /> {getApiErrorMessage(error, "Unable to save address.")}
        </div>
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await updateOrderStatus(orderId, "Cancelled");
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? response.data : order))
      );
      toast.success(
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiCheck className="text-[#c49b76]" /> Order cancelled.
        </div>
      );
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2 text-sm font-sans">
          <FiX className="text-[#8c3c2a]" /> {getApiErrorMessage(error, "Failed to cancel order.")}
        </div>
      );
    }
  };

  // Reusable Input Style
  const inputStyle = "w-full bg-[#130905] text-[#e4d4c8] placeholder-[#a89688]/50 border border-[#2a170e] rounded-sm py-3 px-5 text-sm focus:outline-none focus:border-[#c49b76] transition-colors duration-300";

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-[#110804] pt-32 flex flex-col items-center">
        <p className="text-[#c49b76] text-[10px] uppercase tracking-widest mt-20 flex items-center justify-center gap-3">
          <FiLoader className="animate-spin text-xl" /> Accessing your profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#110804] pt-32 pb-20 px-6 font-sans text-[#f4ece4] flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-serif mb-6">User Not Found</h2>
        <button
          onClick={() => navigate("/login")}
          className="border border-[#c49b76] text-[#c49b76] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-[#110804] min-h-screen font-sans text-[#f4ece4] px-4 sm:px-6 md:px-12">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c49b76] mb-3">
            Account Details
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#f4ece4] mb-2">
            Welcome, <span className="italic text-[#d9c3b0]">{user.name?.split(" ")[0]}</span>
          </h1>
        </div>

        {/* Elegant Responsive Tabs */}
        <div className="flex justify-start sm:justify-center overflow-x-auto hide-scrollbar mb-12 border-b border-[#2a170e]">
          <div className="flex space-x-8 px-2">
            {[
              { id: "profile", label: "Profile Info" },
              { id: "orders", label: "Order History" },
              { id: "address", label: "Saved Address" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-300 relative ${
                  activeTab === tab.id
                    ? "text-[#c49b76]"
                    : "text-[#a89688] hover:text-[#e4d4c8]"
                }`}
              >
                {tab.label}
                {/* Active Underline */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#c49b76]"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="bg-[#130905] border border-[#2a170e] p-6 sm:p-10 md:p-12 rounded-sm relative overflow-hidden">
          
          {/* Subtle Background Accent */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c49b76] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

          {/* === PROFILE TAB === */}
          {activeTab === "profile" && (
            <div className="relative z-10 animate-fade-in">
              <h2 className="text-2xl font-serif mb-8 text-[#f4ece4]">Personal Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Full Name</label>
                  <p className="text-[#e4d4c8] text-lg font-light border-b border-[#2a170e] pb-2">{user.name}</p>
                </div>

                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Email Address</label>
                  <p className="text-[#e4d4c8] text-lg font-light border-b border-[#2a170e] pb-2">{user.email}</p>
                </div>

                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Member Since</label>
                  <p className="text-[#e4d4c8] text-lg font-light border-b border-[#2a170e] pb-2">
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Joined"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#2a170e]">
                <button
                  onClick={() => navigate("/productList")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#c49b76] text-[#110804] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#b58c66] transition-colors"
                >
                  <FiShoppingBag size={14} /> Continue Shopping
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-[#2a170e] text-[#a89688] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] hover:border-[#8c3c2a] hover:text-[#8c3c2a] transition-colors"
                >
                  <FiLogOut size={14} /> Secure Logout
                </button>
              </div>
            </div>
          )}

          {/* === ORDERS TAB === */}
          {activeTab === "orders" && (
            <div className="relative z-10 animate-fade-in">
              <h2 className="text-2xl font-serif mb-8 text-[#f4ece4]">Order History</h2>

              {orders.length === 0 ? (
                <div className="text-center py-16 border border-[#2a170e] bg-[#110804]/50 rounded-sm">
                  <FiPackage className="text-4xl text-[#c49b76] mx-auto mb-6 opacity-50" />
                  <p className="font-serif text-xl text-[#f4ece4] mb-2">No orders placed yet</p>
                  <p className="text-[#a89688] font-light text-sm">When you make a purchase, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-[#2a170e] bg-[#110804] p-6 sm:p-8 rounded-sm transition-colors hover:border-[#c49b76]/30">
                      
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#2a170e] pb-6">
                        <div>
                          <h3 className="text-[#f4ece4] font-serif text-lg mb-1">Order #{order.id}</h3>
                          <p className="text-[#a89688] text-[10px] uppercase tracking-widest">
                            {new Date(order.orderDate || order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4 mb-8">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                            <p className="text-[#e4d4c8] font-light flex-1">
                              {item.name} <span className="text-[#a89688] ml-2 text-[10px]">x {item.quantity || 1}</span>
                            </p>
                            <p className="text-[#c49b76] tracking-wider whitespace-nowrap">
                              <span className="text-[9px] text-[#a89688] mr-1">Rs.</span>
                              {formatPrice(Number(item.price) * (item.quantity || 1))}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-6 border-t border-[#2a170e]">
                        <div>
                          <p className="text-[#a89688] text-[10px] uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-xl text-[#f4ece4] font-light tracking-wide">
                            <span className="text-[10px] text-[#a89688] mr-2">Rs.</span>
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>

                        {!["Cancelled", "Delivered"].includes(order.status) && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="w-full sm:w-auto text-center border border-[#8c3c2a] text-[#8c3c2a] px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-[#8c3c2a] hover:text-[#f4ece4] transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === ADDRESS TAB === */}
          {activeTab === "address" && (
            <div className="relative z-10 animate-fade-in">
              <h2 className="text-2xl font-serif mb-8 text-[#f4ece4]">Shipping Destination</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="sm:col-span-2">
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Full Name</label>
                  <input type="text" name="name" value={address.name || ""} onChange={handleAddressChange} className={inputStyle} placeholder="Jane Doe" />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Street Address</label>
                  <input type="text" name="address" value={address.address || ""} onChange={handleAddressChange} className={inputStyle} placeholder="123 Luxury Avenue" />
                </div>

                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">City</label>
                  <input type="text" name="city" value={address.city || ""} onChange={handleAddressChange} className={inputStyle} placeholder="Metropolis" />
                </div>

                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">State / Province</label>
                  <input type="text" name="state" value={address.state || ""} onChange={handleAddressChange} className={inputStyle} placeholder="State" />
                </div>

                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Zip / Postal Code</label>
                  <input type="text" name="zip" value={address.zip || ""} onChange={handleAddressChange} className={inputStyle} placeholder="000000" />
                </div>

                <div>
                  <label className="block text-[#a89688] text-[10px] uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="text" name="phone" value={address.phone || ""} onChange={handleAddressChange} className={inputStyle} placeholder="+1 234 567 890" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#2a170e]">
                <button
                  onClick={saveAddress}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#c49b76] text-[#110804] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#b58c66] transition-colors"
                >
                  <FiCheck size={14} /> Update Address
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;