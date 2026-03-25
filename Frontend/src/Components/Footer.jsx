import React from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi"; 

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-yellow-200 to-yellow-500 text-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* --- Brand --- */}
        <div>
          <h2 className="text-2xl font-bold mb-3">Orovia Ornaments</h2>
          <p className="text-sm text-gray-700">
            Elegant jewelry for every occasion. Discover timeless beauty in our
            collections of bangles, chains, earrings, and rings.
          </p>
        </div>

        {/* --- Quick Links --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="hover:text-yellow-900 transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/productList"
                className="hover:text-yellow-900 transition-colors duration-300"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="hover:text-yellow-900 transition-colors duration-300"
              >
                Cart
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-yellow-900 transition-colors duration-300"
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Contact Info --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>

          <p className="text-sm flex items-center gap-2">
            <FiMapPin className="text-gray-800" /> 123 Calicut, Kerala, India
          </p>

          <p className="text-sm flex items-center gap-2 mt-2">
            <FiPhone className="text-gray-800" /> +91 98765 43210
          </p>

          <p className="text-sm flex items-center gap-2 mt-2">
            <FiMail className="text-gray-800" /> info@orovia.com
          </p>
        </div>
      </div>

      {/* --- Bottom Line --- */}
      <div className="border-t border-yellow-400 text-center py-4 text-sm text-gray-700">
        © {new Date().getFullYear()} Orovia Ornaments — All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;

