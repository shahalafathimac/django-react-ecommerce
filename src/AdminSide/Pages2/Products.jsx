import React, { useState, useEffect } from 'react';
import { FiPlus, FiShoppingBag } from 'react-icons/fi';
import axios from "axios"; 

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // GET PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ornaments'); 
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE PRODUCT 
  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:3000/ornaments/${id}`); 
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // ADD / UPDATE PRODUCT 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      description: formData.get('description'),
      image: formData.get('image'),
    };

    try {
      if (editingProduct) {
        await axios.put(
          `http://localhost:3000/ornaments/${editingProduct.id}`,
          { ...editingProduct, ...productData } 
        );
      } else {
        await axios.post(
          'http://localhost:3000/ornaments',
          productData 
        );
      }

      setShowAddForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // FILTER PRODUCTS (same)
  const filteredProducts = products
    .filter((p) => {
      const term = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.price.toString().includes(term) ||
        p.stock.toString().includes(term)
      );
    })
    .reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header + Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2 text-xl" />
          Add Product
        </button>
      </div>

      {/* Add / Edit Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input type="text" name="name" placeholder="Product Name"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full p-3 border rounded-lg" required />

                <input type="text" name="category" placeholder="Category"
                  defaultValue={editingProduct?.category || ''}
                  className="w-full p-3 border rounded-lg" required />

                <input type="number" name="price" placeholder="Price" step="0.01"
                  defaultValue={editingProduct?.price || ''}
                  className="w-full p-3 border rounded-lg" required />

                <input type="number" name="stock" placeholder="Stock Quantity"
                  defaultValue={editingProduct?.stock || ''}
                  className="w-full p-3 border rounded-lg" required />

                <input
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  defaultValue={editingProduct?.image || ''}
                  className="w-full p-3 border rounded-lg"
                  required
                />

                <textarea name="description" placeholder="Description"
                  defaultValue={editingProduct?.description || ''}
                  className="w-full p-3 border rounded-lg" rows="3"></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button"
                  onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancel
                </button>

                <button type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover border mr-3"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-gray-500 text-sm">{product.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">{product.category}</td>

                  <td className="px-6 py-4">₹ {product.price}</td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.stock > 10 ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>

                    <button onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900">Delete</button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Products */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium">No products found</h3>
        </div>
      )}
    </div>
  );
};

export default Products;
