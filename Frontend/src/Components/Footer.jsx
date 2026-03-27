import React from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi"; 

function Footer() {
  return (
    <footer className="bg-[#0c0603] text-[#e4d4c8] border-t border-[#2a170e] pt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-12 text-sm font-light">
        
        {/* --- Brand --- */}
        <div className="md:col-span-2 pr-10">
          <h2 className="text-3xl font-serif mb-6 text-[#f4ece4]">
            Orovia<span className="text-sm align-super text-[#c49b76]">+</span>
          </h2>
          <p className="text-[#a89688] leading-relaxed max-w-sm">
            Elegant jewelry for every occasion. Discover timeless beauty in our collections of bangles, chains, earrings, and rings. We focus in offering the finest quality jewelry.
          </p>
        </div>

        {/* --- Quick Links --- */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-6 text-[#c49b76]">Navigation</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="hover:text-[#c49b76] transition-colors duration-300">Home</Link>
            </li>
            <li>
              <Link to="/productList" className="hover:text-[#c49b76] transition-colors duration-300">Products</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-[#c49b76] transition-colors duration-300">Cart</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-[#c49b76] transition-colors duration-300">Profile</Link>
            </li>
          </ul>
        </div>

        {/* --- Contact Info --- */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-6 text-[#c49b76]">Contact</h3>
          <div className="space-y-4 text-[#a89688]">
            <p className="flex items-center gap-3">
              <FiMapPin className="text-[#c49b76]" /> 123 Calicut, Kerala
            </p>
            <p className="flex items-center gap-3">
              <FiPhone className="text-[#c49b76]" /> +91 98765 43210
            </p>
            <p className="flex items-center gap-3">
              <FiMail className="text-[#c49b76]" /> info@orovia.com
            </p>
          </div>
        </div>
      </div>

      {/* --- Bottom Line --- */}
      <div className="mt-20 border-t border-[#2a170e] flex flex-col md:flex-row justify-between items-center py-6 px-6 md:px-12 text-[10px] uppercase tracking-[0.2em] text-[#a89688]">
        <p>© {new Date().getFullYear()} Orovia Ornaments.</p>
        <p className="mt-2 md:mt-0">All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;