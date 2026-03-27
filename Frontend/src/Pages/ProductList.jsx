import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiXCircle, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { getProducts } from "../api/productApi";
import ProductCard from "./ProductCard";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [productType, setProductType] = useState("All");
  const[searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ categories: [], types: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts({
          page,
          page_size: 12,
          search: searchTerm || undefined,
          category: category === "All" ? undefined : category,
          type: productType === "All" ? undefined : productType,
        });
        setProducts(response.data.results ||[]);
        setTotalPages(response.data.total_pages || 1);
        setFilters(response.data.filters || { categories:[], types:[] });
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Unable to load ornaments right now."));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  },[category, page, productType, searchTerm]);

  // Reusable style for inputs and dropdowns
  const inputStyle = "w-full bg-[#130905] text-[#e4d4c8] placeholder-[#a89688] border border-[#2a170e] rounded-full py-3 px-5 text-sm focus:outline-none focus:border-[#c49b76] transition-colors duration-300";

  return (
    <div className="pt-32 px-6 md:px-12 pb-20 bg-[#110804] min-h-screen font-sans">
      
      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c49b76] mb-3">
          Exquisite Craftsmanship
        </p>
        <h2 className="text-4xl md:text-5xl font-serif text-[#f4ece4]">
          Explore <span className="italic text-[#d9c3b0]">our</span> Collections
        </h2>
      </div>

      {/* Filters & Search */}
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-center items-center gap-5 mb-16">
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute left-5 top-3.5 text-[#a89688] text-lg pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, price, or type..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className={`${inputStyle} pl-12`}
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className={`${inputStyle} md:w-1/4 appearance-none cursor-pointer`}
        >
          <option value="All">All Categories</option>
          {filters.categories.map((item) => (
            <option key={item} value={item} className="bg-[#130905]">
              {item}
            </option>
          ))}
        </select>

        <select
          value={productType}
          onChange={(e) => {
            setPage(1);
            setProductType(e.target.value);
          }}
          className={`${inputStyle} md:w-1/4 appearance-none cursor-pointer`}
        >
          <option value="All">All Types</option>
          {filters.types.map((item) => (
            <option key={item} value={item} className="bg-[#130905]">
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Content Area */}
      <div className="max-w-[1400px] mx-auto">
        {loading ? (
          <p className="text-center text-[#c49b76] text-sm uppercase tracking-widest mt-16 flex items-center justify-center gap-3">
            <FiLoader className="animate-spin text-xl" /> Loading pieces...
          </p>
        ) : errorMessage ? (
          <p className="text-center text-red-400/80 text-sm tracking-wide mt-10 flex items-center justify-center gap-2">
            <FiXCircle className="text-xl" />
            {errorMessage}
          </p>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="group block rounded-sm p-4 transition-transform duration-500 hover:-translate-y-2"
                  >
                    {/* Wrap to ensure internal text uses dark colors on the light card background */}
                    <div className="text-[#110804]">
                      <ProductCard item={item} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-[#2a170e] rounded-sm bg-[#130905]/50">
                  <p className="text-[#a89688] text-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
                    <FiSearch className="text-[#c49b76] text-xl" />
                    No pieces found
                  </p>
                  <p className="text-[#f4ece4] font-serif text-xl italic">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-20">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="w-10 h-10 rounded-full border border-[#c49b76]/50 flex items-center justify-center text-[#c49b76] hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#c49b76]"
                >
                  <FiChevronLeft size={18} />
                </button>
                
                <span className="text-[#a89688] text-[10px] uppercase tracking-[0.2em] font-medium">
                  Page <span className="text-[#f4ece4]">{page}</span> of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="w-10 h-10 rounded-full border border-[#c49b76]/50 flex items-center justify-center text-[#c49b76] hover:bg-[#c49b76] hover:text-[#110804] transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#c49b76]"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductList;