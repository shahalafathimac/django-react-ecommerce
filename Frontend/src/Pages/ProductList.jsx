import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiXCircle } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { getProducts } from "../api/productApi";
import ProductCard from "./ProductCard";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [productType, setProductType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
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
        setProducts(response.data.results || []);
        setTotalPages(response.data.total_pages || 1);
        setFilters(response.data.filters || { categories: [], types: [] });
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Unable to load ornaments right now."));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, page, productType, searchTerm]);

  return (
    <div className="pt-28 px-6 pb-10 bg-gradient-to-br from-yellow-50 to-pink-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-center items-center gap-5 mb-10">
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute left-4 top-3 text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search by name, price, or type..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-12 pr-5 py-2 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
        >
          <option value="All">All Categories</option>
          {filters.categories.map((item) => (
            <option key={item} value={item}>
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
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
        >
          <option value="All">All Types</option>
          {filters.types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 text-lg font-semibold mt-16">Loading ornaments...</p>
      ) : errorMessage ? (
        <p className="text-center text-red-600 text-lg font-semibold mt-10 flex items-center justify-center gap-2">
          <FiXCircle className="text-red-600 text-2xl" />
          {errorMessage}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map((item) => (
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="px-4 py-2 rounded-full border border-yellow-600 text-yellow-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="px-4 py-2 rounded-full bg-yellow-600 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductList;
