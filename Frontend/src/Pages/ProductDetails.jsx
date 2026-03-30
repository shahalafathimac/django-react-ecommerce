import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiChevronLeft,
  FiCheck,
  FiShoppingBag,
  FiLoader,
} from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { addToCart } from "../api/cartApi";
import { getProductById } from "../api/productApi";
import { UserContext } from "../UserContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const { user, refreshCart } = useContext(UserContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Error fetching product."));
      }
    };
    fetchProduct();
  }, [id]);

  const requireAuth = () => {
    if (user) return true;
    toast.error("Please login first.");
    navigate("/login");
    return false;
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || !requireAuth()) return;

    try {
      await addToCart(product.id, 1);
      await refreshCart();
      setIsAdded(true);
      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0 || !requireAuth()) return;

    navigate("/checkout", {
      state: {
        singleItem:[
          {
            id: product.id,
            product_id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
          },
        ],
      },
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#110804] pt-32 flex flex-col items-center">
        <p className="text-[#c49b76] text-sm uppercase tracking-widest mt-20 flex items-center justify-center gap-3">
          <FiLoader className="animate-spin text-xl" /> Loading details...
        </p>
      </div>
    );
  }

  // Format the price professionally with commas
  const formattedPrice = Number(product.price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#110804] pt-32 pb-20 px-6 md:px-12 font-sans text-[#f4ece4]">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Breadcrumb / Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#a89688] hover:text-[#c49b76] transition-colors duration-300 mb-10"
        >
          <FiChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Product Image Showcase */}
          <div className="p-10 md:p-16 rounded-xl relative flex items-center justify-center group">
            {product.is_new && (
              <span className="absolute top-6 left-6 bg-[#110804] text-[#c49b76] text-[10px] uppercase tracking-[0.2em] px-3 py-1 z-10">
                New Arrival
              </span>
            )}
            <img
              src={product.image || "https://images.unsplash.com/photo-1599643478524-fb66f70a0066?auto=format&fit=crop&w=800&q=80"}
              alt={product.name}
              className="w-full max-w-md object-contain mix-blend-screen transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Right Side: Product Details */}
          <div className="flex flex-col">
            
            {/* Category */}
            <p className="text-[#c49b76] text-[10px] uppercase tracking-[0.3em] mb-4">
              {product.category || "Fine Jewellery"}
            </p>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-6 text-[#f4ece4]">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl font-light tracking-wide text-[#e4d4c8] mb-8 border-b border-[#2a170e] pb-8">
              <span className="text-[12px] uppercase tracking-[0.1em] text-[#a89688] mr-2">Rs.</span>
              {formattedPrice}
            </p>

            {/* Description */}
            <p className="text-[#a89688] font-light leading-relaxed mb-8 text-sm md:text-base">
              {product.description || "Exquisite quality gold jewelry that is hand-crafted to perfection. Our collection blends elegance with modern design, strongly recommended for you."}
            </p>

            {/* Stock Status */}
            <div className="mb-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.15em]">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#c49b76]"></span>
                  <span className="text-[#c49b76]">In Stock ({product.stock} Available)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#8c3c2a]"></span>
                  <span className="text-[#8c3c2a]">Currently Unavailable</span>
                </>
              )}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Add to Cart Button (Outlined) */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 px-6 uppercase tracking-[0.2em] text-[11px] font-medium border rounded-full transition-all duration-300 flex items-center justify-center gap-3
                  ${product.stock === 0
                    ? "border-[#2a170e] text-[#2a170e] cursor-not-allowed"
                    : isAdded
                      ? "border-[#c49b76] bg-[#c49b76]/10 text-[#c49b76]"
                      : "border-[#c49b76] text-[#c49b76] hover:bg-[#c49b76] hover:text-[#110804]"
                  }`}
              >
                {product.stock === 0 ? "Out of Stock" : isAdded ? <><FiCheck size={16}/> Added to Cart</> : "Add to Cart"}
              </button>

              {/* Buy Now Button (Solid) */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`flex-1 py-4 px-6 uppercase tracking-[0.2em] text-[11px] font-medium rounded-full transition-all duration-300 flex items-center justify-center gap-3
                  ${product.stock === 0
                    ? "bg-[#2a170e] text-[#110804] cursor-not-allowed"
                    : "bg-[#c49b76] text-[#110804] hover:bg-[#b58c66]"
                  }`}
              >
                <FiShoppingBag size={16} /> Buy Now
              </button>
            </div>

            {/* Extra Editorial Info */}
            <div className="mt-12 pt-8 border-t border-[#2a170e] grid grid-cols-2 gap-6 text-[#a89688]">
              <div>
                <p className="text-[#e4d4c8] text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold">Shipping</p>
                <p className="text-xs font-light">Rs. 50 for secure shipping nationwide.</p>
              </div>
              <div>
                <p className="text-[#e4d4c8] text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold">Authenticity</p>
                <p className="text-xs font-light">100% certified genuine materials.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;