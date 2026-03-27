import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLoader, FiShoppingBag, FiArrowRight, FiMinus, FiPlus, FiArrowLeft } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { removeCartItem, updateCartItem } from "../api/cartApi";
import { UserContext } from "../UserContext";

function Cart() {
  const[loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, cartItems, setCartItems, refreshCart } = useContext(UserContext);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setLoading(false);
        navigate("/login");
        return;
      }
      await refreshCart();
      setLoading(false);
    };

    loadCart();
  }, [navigate, refreshCart, user]);

  const handleRemove = async (itemId) => {
    try {
      const response = await removeCartItem(itemId);
      setCartItems(response.data.items ||[]);
      toast.success("Item removed from bag.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error removing item."));
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await updateCartItem(itemId, newQuantity);
      setCartItems(response.data.items ||[]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error updating quantity."));
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * (item.quantity || 1), 0);
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  // Professional price formatter
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110804] pt-32 flex flex-col items-center">
        <p className="text-[#c49b76] text-[10px] uppercase tracking-widest mt-20 flex items-center justify-center gap-3">
          <FiLoader className="animate-spin text-xl" /> Loading your bag...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-[#110804] min-h-screen font-sans text-[#f4ece4] px-6 md:px-12">
      
      {/* Page Header */}
      <div className="max-w-[1200px] mx-auto mb-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c49b76] mb-3">
          Review Your Selections
        </p>
        <h1 className="text-4xl md:text-5xl font-serif text-[#f4ece4]">
          Your <span className="italic text-[#d9c3b0]">Shopping</span> Bag
        </h1>
      </div>

      {cartItems.length === 0 ? (
        // Empty State
        <div className="max-w-[600px] mx-auto text-center border border-[#2a170e] bg-[#130905]/50 py-20 px-6 rounded-sm">
          <FiShoppingBag className="mx-auto text-4xl text-[#c49b76] mb-6 opacity-50" />
          <p className="font-serif text-2xl text-[#f4ece4] mb-4">Your bag is elegantly empty</p>
          <p className="text-[#a89688] font-light text-sm mb-10">
            Discover our collection of exquisite pieces to find your next treasure.
          </p>
          <button
            onClick={() => navigate("/productList")}
            className="inline-flex items-center gap-3 border border-[#c49b76] text-[#c49b76] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300"
          >
            Continue Shopping <FiArrowRight size={14} />
          </button>
        </div>
      ) : (
        // Cart Layout
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16">
          
          {/* Left Side: Cart Items */}
          <div className="flex-1">
            <div className="border-b border-[#2a170e] pb-4 mb-6 flex justify-between items-center">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#a89688]">Item Details</h2>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#a89688] hidden sm:block">Action</h2>
            </div>

            <div className="flex flex-col gap-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
                  
                  {/* Image & Info */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f9f6f0] p-2 flex-shrink-0 flex items-center justify-center rounded-sm">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1599643478524-fb66f70a0066?auto=format&fit=crop&w=200&q=80"}
                        alt={item.name}
                        className="object-contain max-h-full mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <h3 className="font-serif text-xl sm:text-2xl text-[#f4ece4] mb-2">{item.name}</h3>
                      <p className="text-[#c49b76] text-sm tracking-widest mb-4">
                        <span className="text-[9px] uppercase tracking-[0.1em] text-[#a89688] mr-1">Rs.</span>
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Quantity Control (Elegant Pill Style) */}
                      <div className="flex items-center w-fit border border-[#2a170e] rounded-full px-4 py-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                          className="text-[#a89688] hover:text-[#c49b76] transition-colors p-1"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="font-light text-[#e4d4c8] text-sm w-8 text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                          className="text-[#a89688] hover:text-[#c49b76] transition-colors p-1"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Action */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[#8c3c2a] text-[10px] uppercase tracking-[0.2em] hover:text-[#e86a4d] transition-colors duration-300 self-start sm:self-auto mt-4 sm:mt-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            {/* Back to Shopping */}
            <button
              onClick={() => navigate("/productList")}
              className="mt-12 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#a89688] hover:text-[#c49b76] transition-colors duration-300"
            >
              <FiArrowLeft size={14} /> Back to Collection
            </button>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-[#130905] border border-[#2a170e] p-8 rounded-sm sticky top-32">
              <h2 className="font-serif text-2xl text-[#f4ece4] mb-8">Order Summary</h2>

              <div className="space-y-4 text-sm font-light text-[#a89688]">
                <div className="flex justify-between items-center">
                  <p>Subtotal</p>
                  <p className="text-[#e4d4c8] tracking-wider">Rs. {formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Secured Shipping</p>
                  <p className="text-[#e4d4c8] tracking-wider">Rs. {formatPrice(shipping)}</p>
                </div>
              </div>

              <div className="border-t border-[#2a170e] mt-6 pt-6 mb-8 flex justify-between items-end">
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#f4ece4]">Total</p>
                <p className="text-2xl text-[#c49b76] font-light tracking-wide">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#a89688] mr-2">Rs.</span>
                  {formatPrice(total)}
                </p>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-[#c49b76] text-[#110804] py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#b58c66] transition-colors duration-300 flex justify-center items-center gap-2"
              >
                Proceed to Checkout <FiArrowRight size={14} />
              </button>

              <p className="text-center text-[#a89688] text-[9px] uppercase tracking-[0.15em] mt-6 leading-relaxed">
                Taxes calculated at checkout. <br/> Complimentary gift packaging included.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;