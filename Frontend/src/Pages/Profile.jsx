import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCheck, FiPackage, FiSmile, FiXCircle } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { getMyOrders, updateOrderStatus } from "../api/orderApi";
import { UserContext } from "../UserContext";
import { updateUser } from "../api/userApi";

function Profile() {
  const { user, setUser, logout, loading: sessionLoading } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
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
        setOrders(ordersRes.data);
        setAddress({
          name: user.address?.name || user.name || "",
          address: user.address?.address || user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || user.address?.zip_code || "",
          phone: user.address?.phone || "",
        });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to load profile."));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, sessionLoading, user]);

  const getStatusColor = (status) => {
    const colors = {
      Placed: "bg-blue-100 text-blue-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Delivered: "bg-green-100 text-green-800",
      Shipped: "bg-purple-100 text-purple-800",
      Cancelled: "bg-red-100 text-red-800",
      Processing: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async () => {
    try {
      const response = await updateUser(user.id, { address });
      setUser(response.data);
      toast.success("Address updated successfully!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save address."));
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
      toast.success("Order cancelled successfully!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to cancel order."));
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="pt-28 min-h-screen flex justify-center items-center text-xl text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-28 min-h-screen text-center">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-600 text-white px-6 py-2 rounded-full mt-4"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-gray-600 flex items-center justify-center gap-2 text-lg">
            Welcome back, {user.name}! <FiSmile className="text-yellow-600" />
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white shadow-lg rounded-full p-1">
            {["profile", "orders", "address"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeTab === tab
                    ? "bg-yellow-600 text-white"
                    : "text-gray-600 hover:text-yellow-600"
                }`}
              >
                {tab === "profile" ? "Profile Info" : tab === "orders" ? "My Orders" : "Address"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 shadow-lg rounded-2xl">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Personal Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-semibold text-gray-700 text-sm">Full Name</label>
                  <div className="border p-3 rounded bg-gray-50">{user.name}</div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 text-sm">Email</label>
                  <div className="border p-3 rounded bg-gray-50">{user.email}</div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 text-sm">User ID</label>
                  <div className="border p-3 rounded bg-gray-50">{user.id}</div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 text-sm">Member Since</label>
                  <div className="border p-3 rounded bg-gray-50">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-5">
                <button
                  onClick={() => navigate("/productList")}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-full"
                >
                  Continue Shopping
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-6 py-2 rounded-full"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <FiPackage className="text-6xl text-gray-500 mx-auto mb-3" />
                  <p>No orders placed yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border p-6 rounded-xl shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(order.orderDate || order.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: {order.paymentMethod} - {order.paymentStatus}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <p>
                            {item.name} x {item.quantity || 1}
                          </p>
                          <p>Rs. {Number(item.price) * (item.quantity || 1)}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-yellow-600 font-bold text-lg">Total: Rs. {order.totalAmount}</p>

                    {!["Cancelled", "Delivered"].includes(order.status) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "address" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Saved Address</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {["name", "address", "city", "state", "zip", "phone"].map((field) => (
                  <div key={field}>
                    <label className="text-sm font-semibold capitalize">
                      {field === "zip" ? "Zip Code" : field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={address[field] || ""}
                      onChange={handleAddressChange}
                      className="w-full mt-1 p-2 border rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={saveAddress}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
                >
                  <FiCheck /> Save Address
                </button>

                <button
                  onClick={() => navigate("/productList")}
                  className="bg-gray-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
                >
                  <FiXCircle /> Back to Shopping
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
