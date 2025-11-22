import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";


import {
  FiCheckCircle,
  FiXCircle,
  FiShoppingBag,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch logged-in user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!storedUser) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/ornaments/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  // Add to Cart
  const handleAddToCart = async () => {
    if (!product || !user || product.stock === 0) return;

    try {
      const userRes = await axios.get(`http://localhost:3000/users/${user.id}`);
      const userData = userRes.data;
      const cart = userData.cart || [];

      const exists = cart.find((item) => item.id === product.id);
      if (exists) {
        toast.success("This item is already in your cart!");
        setIsAdded(true);
        return;
      }

      const updatedCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];

      await axios.patch(`http://localhost:3000/users/${user.id}`, {
        cart: updatedCart,
      });

      setIsAdded(true);
      toast.success("Added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Something went wrong!");
    }
  };

  // Buy Now
  const handleBuyNow = () => {
    if (!product || !user || product.stock === 0) return;

    const singleProductOrder = [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      },
    ];

    localStorage.setItem("singleBuyItem", JSON.stringify(singleProductOrder));
    navigate("/checkout?single=true");
  };

  if (!product) {
    return (
      <div className="text-center text-gray-600 py-20 text-xl">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 py-20 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8">
        
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 rounded-2xl object-cover"
        />

        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h2>
          <p className="text-gray-600 mb-3">{product.description}</p>

          {/* Stock Status */}
          <p className="mb-3 font-semibold flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="text-green-600 flex items-center gap-2">
                <FiCheckCircle /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-2">
                <FiXCircle /> Out of Stock
              </span>
            )}
          </p>

          <p className="text-xl font-semibold text-yellow-700 mb-5">
            ₹{product.price}
          </p>

          <div className="flex flex-wrap gap-4">
            
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-6 py-2 font-semibold rounded-full transition-all flex items-center gap-2
                ${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : isAdded
                    ? "bg-green-500 text-white"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
            >
              {product.stock === 0
                ? "Out of Stock"
                : isAdded
                ? (
                    <>
                      <FiCheck /> Added to Cart
                    </>
                  )
                : "Add to Cart"}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className={`px-6 py-2 font-semibold rounded-full text-white shadow-md transition-all flex items-center gap-2
              ${
                product.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800"
              }`}
            >
              <FiShoppingBag /> Buy Now
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="text-yellow-600 font-semibold hover:underline flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Products
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetails;

