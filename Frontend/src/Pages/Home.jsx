import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

import Footer from "../Components/Footer";
import { getProducts } from "../api/productApi";
import ProductCard from "./ProductCard";

function Home() {
  const [ornaments, setOrnaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrnaments = async () => {
      try {
        const response = await getProducts({ page: 1, page_size: 8 });
        setOrnaments(response.data.results || []);
      } catch (error) {
        console.error("Error loading ornaments:", error);
      }
    };

    fetchOrnaments();
  }, []);

  return (
    <div className="pt-28 bg-gray-50 min-h-screen">
      <div
        className="relative bg-cover bg-center h-[500px] flex items-center justify-center text-center"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1681276170683-706111cf496e?auto=format&fit=crop&w=800&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-opacity-50"></div>
        <div className="relative text-white space-y-6 px-4 md:px-0">
          <h2 className="text-4xl md:text-5xl font-bold">Explore Our Collection</h2>
          <p className="text-lg md:text-xl max-w-xl mx-auto">
            Browse through our exclusive chains, bangles, earrings and rings.
          </p>
          <button
            onClick={() => navigate("/productList")}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-full font-semibold transition"
          >
            Shop Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Featured Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {ornaments.length > 0 ? (
            ornaments.map((item) => (
              <Link
                to={`/product/${item.id}`}
                key={item.id}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white rounded-2xl overflow-hidden block"
              >
                <ProductCard item={item} />
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full text-lg font-semibold mt-10 flex items-center justify-center gap-2">
              <FiLoader className="animate-spin text-2xl" />
              Loading products...
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 flex flex-col md:flex-row items-center gap-12 rounded-3xl shadow-lg p-10">
        <img
          src="https://plus.unsplash.com/premium_photo-1681276170035-ce91100dfb04?auto=format&fit=crop&w=800&q=80"
          alt="About Ornaments"
          className="w-full md:w-1/2 rounded-2xl shadow-md"
        />
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
            Why Choose Our Ornaments?
          </h3>
          <p className="text-gray-600 text-lg">
            Each piece is handcrafted to perfection. Our collection blends elegance with
            modern design and works beautifully for gifting or everyday style.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
