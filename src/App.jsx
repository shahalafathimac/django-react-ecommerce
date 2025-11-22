import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import ProductList from "./Pages/ProductList";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
import Profile from "./Pages/Profile";
import Footer from "./Components/Footer";

// Admin Layout
import AdminLayout from "./AdminSide/Components2/AdminLayout"; 
import Dashboard from "./AdminSide/Pages2/Dashboard";
import Orders from "./AdminSide/Pages2/Orders";
import Products from "./AdminSide/Pages2/Products";
import Users from "./AdminSide/Pages2/Users";

// ✅ Toast Import Added
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>

      {/* ✅ Toast Renderer Added (This makes toast work) */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>

        {/* ---------------- USER SIDE ROUTES (No Changes Made) ---------------- */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ProductList" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/OrderSuccess" element={<OrderSuccess />} />
              </Routes>

              {/* <Footer /> */}
            </>
          }
        />

        {/* ---------------- ADMIN SIDE USING ADMINLAYOUT ---------------- */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
