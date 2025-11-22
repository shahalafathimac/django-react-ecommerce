import React, { useState, useEffect } from "react";
import { FiPackage } from "react-icons/fi";
import axios from "axios"; 

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRealOrders();
  }, []);

 
  const fetchRealOrders = async () => {
    try {
      const usersRes = await axios.get("http://localhost:3000/users"); 
      const users = usersRes.data;

      const realOrders = users
        .filter((u) => u.order && u.order.length > 0)
        .flatMap((user) =>
          user.order.map((ord) => ({
            id: ord.id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            items: ord.items,
            total: ord.totalAmount,
            status: ord.status || "Placed",
            orderDate: ord.orderDate,
          }))
        );

      setOrders(realOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update UI + DB (axios version)
  const updateOrderStatus = async (orderId, newStatus) => {
    // update UI immediately before DB request
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      const usersRes = await axios.get("http://localhost:3000/users"); 
      const users = usersRes.data;

      const user = users.find((u) =>
        u.order?.some((ord) => ord.id === orderId)
      );

      if (!user) return;

      const updatedOrders = user.order.map((ord) =>
        ord.id === orderId ? { ...ord, status: newStatus } : ord
      );

      await axios.patch(`http://localhost:3000/users/${user.id}`, { 
        order: updatedOrders,
      });

      console.log("Status updated in DB");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Status badge colors
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

  // Filter orders
  const filteredOrders = orders
    .filter((order) => {
      const term = search.toLowerCase();
      return (
        order.id.toString().includes(term) ||
        order.userName.toLowerCase().includes(term) ||
        order.userEmail.toLowerCase().includes(term) ||
        order.items.some((item) => item.name.toLowerCase().includes(term)) ||
        order.status.toLowerCase().includes(term) ||
        order.orderDate.toLowerCase().includes(term)
      );
    })
    .reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header + Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>

        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-yellow-400 focus:outline-none"
        />
      </div>

      {/* Orders Count */}
      <div className="text-sm text-gray-600 mb-3">
        Total Orders: <span className="font-bold">{filteredOrders.length}</span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    #ORD{order.id.toString().slice(-4)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold">{order.userName}</div>
                    <div className="text-gray-500 text-sm">{order.userEmail}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.length} items
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items[0]?.name}{" "}
                      {order.items.length > 1
                        ? `+${order.items.length - 1} more`
                        : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">
                    ₹{order.total}
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <option value="Placed">Placed</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {order.orderDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Orders Found */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-10">
          <FiPackage className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-medium">No Orders Found</h3>
          <p className="text-gray-500">Try a different search keyword.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
