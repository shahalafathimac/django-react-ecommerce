import React from "react";
import { FiPlus } from "react-icons/fi";

function ProductCard({ item }) {
  // Format the price professionally with commas (e.g., 25,000)
  // Fallback to 0 if item.price is missing to prevent errors
  const formattedPrice = Number(item.price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col h-full bg-[#f9f6f0] group">
      {/* Image Container with subtle overflow hidden for smooth hover zoom */}
      <div className="relative w-full aspect-square mb-6 overflow-hidden bg-[#f4ece4] flex items-center justify-center rounded-t-sm">
        <img
          src={item.image_url || item.image || "https://images.unsplash.com/photo-1599643478524-fb66f70a0066?auto=format&fit=crop&w=500&q=80"} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        
        {/* Optional: Elegant floating badge for new or premium items */}
        {item.is_new && (
          <span className="absolute top-3 left-3 bg-[#110804] text-[#c49b76] text-[8px] uppercase tracking-[0.2em] px-2 py-1">
            New
          </span>
        )}
      </div>

      {/* Product Details Area */}
      <div className="flex flex-col flex-grow px-4 pb-4">
        
        {/* Category / Collection (Dynamic) */}
        <p className="text-[#8c3c2a] text-[9px] uppercase tracking-[0.25em] mb-2 font-medium">
          {item.category || "Fine Jewellery"}
        </p>

        {/* Product Name (Elegant Serif Font) */}
        <h3 className="text-[#110804] font-serif text-lg leading-snug mb-6 line-clamp-2">
          {item.name}
        </h3>

        {/* Price & Action Area - Separated by a thin elegant line */}
        <div className="mt-auto flex items-center justify-between border-t border-[#e4d4c8] pt-4">
          
          {/* Professional Pricing Display */}
          <span className="text-[#110804] font-medium text-sm tracking-wider flex items-baseline gap-1">
            <span className="text-[9px] uppercase tracking-[0.1em] text-[#a89688]">Rs.</span>
            {formattedPrice}
          </span>

          {/* Elegant '+' button mimicking the reference design */}
          {/* <button 
            className="w-8 h-8 flex items-center justify-center border border-[#d9c3b0] rounded-full text-[#110804] hover:bg-[#110804] hover:text-[#c49b76] transition-colors duration-300"
            aria-label="View Details"
          >
            <FiPlus size={14} strokeWidth={1.5} />
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;