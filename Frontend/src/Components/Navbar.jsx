import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { UserContext } from "../UserContext";

function Navbar() {
  const { user, cartItems } = useContext(UserContext);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-gradient-to-r from-yellow-200 to-yellow-500 px-8 py-4 shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 tracking-wide">Orovia Ornaments</h1>

      <div className="flex space-x-6 items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-gray-800 font-medium hover:text-yellow-900 transition ${
              isActive ? "border-b-2 border-yellow-800 pb-1" : ""
            }`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/productList"
          className={({ isActive }) =>
            `text-gray-800 font-medium hover:text-yellow-900 transition ${
              isActive ? "border-b-2 border-yellow-800 pb-1" : ""
            }`
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `text-gray-800 font-medium hover:text-yellow-900 transition relative ${
              isActive ? "border-b-2 border-yellow-800 pb-1" : ""
            }`
          }
        >
          Cart
          {user && cartItems.length > 0 && (
            <span className="absolute -top-2 -right-4 bg-gray-800 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </NavLink>

        {user ? (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `text-gray-800 font-medium hover:text-yellow-900 transition ${
                isActive ? "border-b-2 border-yellow-800 pb-1" : ""
              }`
            }
          >
            Profile
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `text-gray-800 font-medium hover:text-yellow-900 transition ${
                isActive ? "border-b-2 border-yellow-800 pb-1" : ""
              }`
            }
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
