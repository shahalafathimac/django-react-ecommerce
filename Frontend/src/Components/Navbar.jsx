import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { UserContext } from "../UserContext";

function Navbar() {
  const { user, cartItems } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const getNavLinkClass = (isActive) =>
    `text-[10px] uppercase tracking-[0.25em] font-medium transition-colors duration-300 ${
      isActive ? "text-[#c49b76]" : "text-[#e4d4c8] hover:text-[#c49b76]"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#110804]/95 backdrop-blur-md border-b border-[#2a170e]">
      <div className="flex items-center justify-between px-6 md:px-10 py-5">
        
        {/* Brand Logo */}
        <h1 className="text-2xl font-serif text-[#f4ece4] tracking-wider">
          Orovia<span className="text-[12px] align-super text-[#c49b76]">+</span>
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-10 items-center">
          <NavLink to="/" className={({ isActive }) => getNavLinkClass(isActive)}>Home</NavLink>
          <NavLink to="/productList" className={({ isActive }) => getNavLinkClass(isActive)}>Products</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `relative ${getNavLinkClass(isActive)}`}>
            Cart
            {user && cartItems.length > 0 && (
              <span className="absolute -top-3 -right-4 bg-[#c49b76] text-[#110804] text-[9px] font-bold rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center shadow-lg">
                {cartItems.length}
              </span>
            )}
          </NavLink>
          {user ? (
            <NavLink to="/profile" className={({ isActive }) => getNavLinkClass(isActive)}>Profile</NavLink>
          ) : (
            <NavLink to="/login" className={({ isActive }) => getNavLinkClass(isActive)}>Login</NavLink>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-6 h-0.5 bg-[#e4d4c8] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-[#e4d4c8] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-[#e4d4c8] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-6 px-6 pb-6 bg-[#110804]/95 border-t border-[#2a170e]">
          <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => getNavLinkClass(isActive)}>Home</NavLink>
          <NavLink to="/productList" onClick={() => setMenuOpen(false)} className={({ isActive }) => getNavLinkClass(isActive)}>Products</NavLink>
          <NavLink to="/cart" onClick={() => setMenuOpen(false)} className={({ isActive }) => `relative ${getNavLinkClass(isActive)}`}>
            Cart
            {user && cartItems.length > 0 && (
              <span className="ml-2 bg-[#c49b76] text-[#110804] text-[9px] font-bold rounded-full h-4 min-w-[1rem] px-1 inline-flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </NavLink>
          {user ? (
            <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => getNavLinkClass(isActive)}>Profile</NavLink>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)} className={({ isActive }) => getNavLinkClass(isActive)}>Login</NavLink>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;