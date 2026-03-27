import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLoader, FiArrowRight } from "react-icons/fi";

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
        setOrnaments(response.data.results ||[]);
      } catch (error) {
        console.error("Error loading ornaments:", error);
      }
    };

    fetchOrnaments();
  }, []);

  return (
    <div className="bg-[#110804] min-h-screen text-[#f4ece4] font-sans">
      
      {/* HERO SECTION */}
      <div className="relative pt-40 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#1b0e08] via-[#2a140b] to-[#0f0703] overflow-hidden">
        {/* Subtle glow behind text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4a2414] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c49b76]">
            Exquisite Craftsmanship
          </p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#f4ece4] leading-[1.1]">
            Unleash <span className="italic text-[#d9c3b0]">the</span> <br />
            shining beauty
          </h2>
          
          <div className="flex items-center gap-4 mt-12">
            <button
              onClick={() => navigate("/productList")}
              className="px-8 py-3 rounded-full border border-[#c49b76]/50 text-[#c49b76] text-xs uppercase tracking-widest hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300"
            >
              Shop Now
            </button>
            <button 
              onClick={() => navigate("/productList")}
              className="w-12 h-12 rounded-full border border-[#c49b76]/50 flex items-center justify-center text-[#c49b76] hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300"
            >
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* NEW COLLECTIONS GRID */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-[#f4ece4]">New jewellery collections</h2>
          <Link to="/productList" className="hidden md:flex items-center gap-2 text-[#c49b76] text-[10px] uppercase tracking-[0.2em] hover:text-white transition">
            View Collection <span className="p-2 border border-[#c49b76]/40 rounded-full"><FiArrowRight size={12}/></span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {ornaments.length > 0 ? (
            ornaments.map((item) => (
              <Link
                to={`/product/${item.id}`}
                key={item.id}
                className="group block rounded-sm p-4 transition-transform duration-500 hover:-translate-y-2"
              >
                {/* Wrapping the standard ProductCard to match the white/cream box style in the dark theme reference */}
                <div className="text-[#110804]">
                  <ProductCard item={item} />
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-[#c49b76] col-span-full text-sm tracking-widest uppercase mt-10 flex items-center justify-center gap-3">
              <FiLoader className="animate-spin text-xl" />
              Loading pieces...
            </p>
          )}
        </div>
      </div>

      {/* PROMO SECTION (Inspired by "Dare to dazzle differently") */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-32 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-2xl">
          {/* Image Side */}
          <div className="bg-[#1c0f0a] h-[400px] md:h-auto relative">
             <img
              src="https://intl.repossi.com/cdn/shop/files/2024.11.26_Repossi337069copy_1500x.jpg?v=1753971855"
              alt="Jewelry Model"
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#110804] to-transparent opacity-60"></div>
          </div>
          
          {/* Text/Content Side */}
          <div className="bg-[#8c3c2a] flex flex-col justify-center p-12 md:p-20 text-[#f4ece4]">
            <p className="text-[10px] uppercase tracking-[0.3em] mb-4 text-[#eebda0]">Unleash Your Own Hidden Flare</p>
            <h3 className="text-5xl font-serif mb-6 leading-tight">
              Dare to <span className="italic">dazzle</span><br/>differently
            </h3>
            <p className="text-sm font-light text-[#f4ece4]/80 max-w-sm mb-10 leading-relaxed">
              Excellent quality gold jewelry that is hand-crafted to perfection. Our collection blends elegance with modern design.
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/productList")} className="w-10 h-10 rounded-full border border-[#f4ece4]/40 flex items-center justify-center hover:bg-[#f4ece4] hover:text-[#8c3c2a] transition">
                 <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;