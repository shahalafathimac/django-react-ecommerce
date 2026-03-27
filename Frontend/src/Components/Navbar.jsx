import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { UserContext } from "../UserContext";

function Navbar() {
  const { user, cartItems } = useContext(UserContext);

  // Reusable style function for navigation links to maintain the luxurious theme
  const getNavLinkClass = (isActive) =>
    `text-[10px] uppercase tracking-[0.25em] font-medium transition-colors duration-300 ${
      isActive
        ? "text-[#c49b76]" // Active color (Copper/Gold)
        : "text-[#e4d4c8] hover:text-[#c49b76]" // Default color (Muted Cream)
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-[#110804]/95 backdrop-blur-md px-10 py-6 border-b border-[#2a170e]">
      
      {/* Brand Logo styled with Serif font */}
      <h1 className="text-2xl font-serif text-[#f4ece4] tracking-wider">
        Orovia<span className="text-[12px] align-super text-[#c49b76]">+</span>
      </h1>

      {/* Navigation Links */}
      <div className="flex space-x-10 items-center">
        <NavLink
          to="/"
          className={({ isActive }) => getNavLinkClass(isActive)}
        >
          Home
        </NavLink>

        <NavLink
          to="/productList"
          className={({ isActive }) => getNavLinkClass(isActive)}
        >
          Products
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) => `relative ${getNavLinkClass(isActive)}`}
        >
          Cart
          {/* Elegant Cart Badge */}
          {user && cartItems.length > 0 && (
            <span className="absolute -top-3 -right-4 bg-[#c49b76] text-[#110804] text-[9px] font-bold rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center shadow-lg">
              {cartItems.length}
            </span>
          )}
        </NavLink>

        {user ? (
          <NavLink
            to="/profile"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            Profile
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;