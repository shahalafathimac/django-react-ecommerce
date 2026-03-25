import React from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiHeart } from "react-icons/fi";

function OrderSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 text-center">
      
      <h1 className="text-4xl font-bold text-green-600 mb-4 flex items-center gap-2">
        <FiCheckCircle className="text-5xl" />
        Order Placed Successfully!
      </h1>

      <p className="text-gray-700 mb-8 flex items-center gap-2 justify-center">
        Thank you for shopping with Orovia Ornaments 
        <FiHeart className="text-yellow-600" />
      </p>

      <Link
        to="/productList"
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-full font-semibold transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderSuccess;

