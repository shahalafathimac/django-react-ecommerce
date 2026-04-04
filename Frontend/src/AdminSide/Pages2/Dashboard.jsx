import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiShoppingCart,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "../../api/apiError";
import { getAllOrders } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import { getUsers } from "../../api/userApi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [orderStatus, setOrderStatus] = useState({
    placed: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState({
    dailyData: [],
    categoryData: [],
    statusData: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        getUsers(),
        getProducts({ page: 1, page_size: 50 }),
        getAllOrders(),
      ]);

      const users = usersRes.data;
      const products = productsRes.data.results || [];
      const allOrders = ordersRes.data;
      const totalOrders = allOrders.length;

      const totalRevenue = allOrders.reduce(
        (sum, order) =>
          order.status?.toLowerCase() !== "cancelled"
            ? sum + Number(order.totalAmount || 0)
            : sum,
        0
      );

      const statusCounts = {
        placed: 0,
        pending: 0,
        delivered: 0,
        cancelled: 0,
      };

      allOrders.forEach((order) => {
        const status = (order.status || "").toLowerCase();
        if (statusCounts.hasOwnProperty(status)) statusCounts[status] += 1;
      });

      const sortedOrders = [...allOrders]
        .sort(
          (a, b) =>
            new Date(b.orderDate || b.created_at) - new Date(a.orderDate || a.created_at)
        )
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders,
        totalRevenue,
      });

      setOrderStatus(statusCounts);
      setRecentOrders(sortedOrders);
      generateChartData(products, allOrders);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error fetching dashboard data."));
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (products, allOrders) => {
    const dailyData = generateDailyData(allOrders);
    const categoryData = generateCategoryData(products);
    const statusData = generateStatusData(allOrders);
    setChartData({ dailyData, categoryData, statusData });
  };

  const generateDailyData = (allOrders) => {
    const dailyDataMap = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const isoDateKey = date.toISOString().split("T")[0];
      last7Days.push({ dateKey, isoDateKey });
      dailyDataMap[isoDateKey] = { name: dateKey, revenue: 0, orders: 0 };
    }

    allOrders.forEach((order) => {
      if (order.orderDate || order.created_at) {
        const isoDate = new Date(order.orderDate || order.created_at).toISOString().split("T")[0];
        if (dailyDataMap[isoDate]) {
          dailyDataMap[isoDate].revenue += Number(order.totalAmount || 0);
          dailyDataMap[isoDate].orders += 1;
        }
      }
    });

    return last7Days.map((day) => dailyDataMap[day.isoDateKey]);
  };

  const generateCategoryData = (products) => {
    const categoryCount = {};

    products.forEach((product) => {
      const categoryName =
        typeof product.category === "string"
          ? product.category
          : product.category?.name || "Others";
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
    return Object.keys(categoryCount).map((categoryName, index) => ({
      name: categoryName,
      value: categoryCount[categoryName],
      color: colors[index % colors.length],
    }));
  };

  const generateStatusData = (allOrders) => {
    const statusCount = {
      Placed: 0,
      Pending: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    allOrders.forEach((order) => {
      const status = order.status || "Placed";
      if (statusCount.hasOwnProperty(status)) statusCount[status] += 1;
    });

    const statusColors = {
      Placed: "#3B82F6",
      Pending: "#F59E0B",
      Delivered: "#10B981",
      Cancelled: "#EF4444",
    };

    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name],
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      Placed: "bg-blue-100 text-blue-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => {
    const icons = {
      users: <FiUsers className="text-2xl" />,
      products: <FiShoppingBag className="text-2xl" />,
      orders: <FiPackage className="text-2xl" />,
      revenue: <FiDollarSign className="text-2xl" />,
      trending: <FiTrendingUp className="text-2xl" />,
      clock: <FiClock className="text-2xl" />,
      check: <FiCheckCircle className="text-2xl" />,
      cancel: <FiXCircle className="text-2xl" />,
    };

    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      yellow: "bg-yellow-100 text-yellow-600",
      purple: "bg-purple-100 text-purple-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
    };

    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {subtitle && <p className="text-green-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icons[icon]}</div>
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
      {children}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) =>
    active && payload?.length ? (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === "revenue" ? `Rs. ${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    ) : null;

  const statusCards = [
    { title: "Placed Orders", value: orderStatus.placed, icon: "clock", color: "blue" },
    { title: "Pending Orders", value: orderStatus.pending, icon: "trending", color: "yellow" },
    { title: "Delivered Orders", value: orderStatus.delivered, icon: "check", color: "green" },
    { title: "Cancelled Orders", value: orderStatus.cancelled, icon: "cancel", color: "red" },
  ];

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: "users", color: "blue" },
    { title: "Total Products", value: stats.totalProducts, icon: "products", color: "green" },
    { title: "Total Orders", value: stats.totalOrders, icon: "orders", color: "yellow" },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: "revenue",
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Daily Sales & Revenue (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
                name="Revenue (Rs.)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product Categories">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} products`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Order Status Distribution" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recent Orders" className="lg:col-span-2">
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div
                  key={order.id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-white transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiShoppingCart className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.id ? order.id.toString().slice(-6) : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} items - Rs. {Number(order.totalAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(order.orderDate || order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium inline-flex ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status || "Placed"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items?.[0]?.name || "No items"}
                      {order.items && order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FiShoppingCart className="mx-auto text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500">No recent orders found</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
