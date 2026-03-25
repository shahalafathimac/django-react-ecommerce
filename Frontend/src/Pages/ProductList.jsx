import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import axios from "axios";


import { FiSearch, FiXCircle } from "react-icons/fi";

function ProductList() {
  const [ornaments, setOrnaments] = useState([]);
  const [filteredOrnaments, setFilteredOrnaments] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  //  Fetch data from JSON server using Axios
  useEffect(() => {
    const fetchOrnaments = async () => {
      try {
        const response = await axios.get("http://localhost:3000/ornaments");
        setOrnaments(response.data);
        setFilteredOrnaments(response.data);
      } catch (error) {
        console.error("Error loading ornaments:", error);
      }
    };

    fetchOrnaments();
  }, []);

  // Category filter
  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  // Search bar filter
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Combine category + search filter
  useEffect(() => {
    let filtered = ornaments;

    if (category !== "All") {
      filtered = filtered.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.name.toLowerCase().includes(search) ||
          item.type.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.price.toString().includes(search)
        );
      });
    }

    setFilteredOrnaments(filtered);
  }, [category, searchTerm, ornaments]);

  return (
    <div className="pt-28 px-6 pb-10 bg-gradient-to-br from-yellow-50 to-pink-50 min-h-screen">

      
      <div className="flex flex-col md:flex-row justify-center items-center gap-5 mb-10">

        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute left-4 top-3 text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search by name, price, or type..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-5 py-2 border border-gray-300 rounded-full shadow-md 
                       focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-full shadow-md 
                     focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
        >
          <option value="All">All Categories</option>
          <option value="Chain">Chains</option>
          <option value="Bangle">Bangles</option>
          <option value="Earring">Earrings</option>
          <option value="Ring">Rings</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredOrnaments.length > 0 ? (
          filteredOrnaments.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className="block transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white rounded-2xl overflow-hidden"
            >
              <ProductCard item={item} />
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full text-lg font-semibold mt-10 flex items-center justify-center gap-2">
            <FiXCircle className="text-red-600 text-2xl" />
            No ornaments found. Try another search!
          </p>
        )}
      </div>

    </div>
  );
}

export default ProductList;
