import React from "react";

function ProductCard({ item }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
      />

      <div className="p-4 text-center">
        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>

        <div className="mt-3 flex justify-center items-center gap-2">
          <span className="text-yellow-600 font-semibold text-lg">Rs. {item.price}</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
