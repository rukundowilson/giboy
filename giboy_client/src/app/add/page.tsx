"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import API from '../utils/axios';

// Define product type
interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  size: string;
  category: string;
  image_url: string;
  inStock: boolean;
}

const AdminProductsPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    size: '',
    category: '',
    image_url: '',
    inStock: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);


  const fetchProducts = async () => {  
    try {
      const response = await API.get<Product[]>("/api/items");
      const dataReceived = response.data;
      
      setProducts(dataReceived); // no need for mockProducts variable
      console.log(dataReceived);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
  
      const response = await API.post('/api/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
  
      if (!response.data) {
        throw new Error('No data returned');
      }
  
      // Only after successful POST ➔ now fetch products
      await fetchProducts();
  
      // After fetching products ➔ reset the form
      resetForm();
    } catch (err) {
      console.error('Error submitting product:', err);
      setError('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      size: '',
      category: '',
      image_url: '',
      inStock: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setEditId(null);
  };
  
  
  
  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      size: product.size,
      category: product.category,
      image_url: product.image_url,
      inStock: product.inStock
    });
    setImagePreview(product.image_url);
    setIsEditing(true);
    setEditId(product?.id || null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setProducts(prev => prev.filter(product => product.id !== id));
      } catch (err) {
        setError('Failed to delete product');
        console.error(err);
      }
    }
  };

  // Fetch products on component mount

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Head>
        <title>GiBoy Admin - Product Management</title>
        <meta name="description" content="Admin dashboard for GiBoy baby clothing store" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span style={{ color: '#e53e3e' }}>GiBoy</span>
              <span className="ml-2">Admin</span>
            </h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <button 
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    onClick={() => router.push('/')}
                  >
                    View Store
                  </button>
                </li>
                <li>
                  <button 
                    className="px-4 py-2 rounded-md text-white"
                    style={{ backgroundColor: '#e53e3e' }}
                    onClick={() => {/* Handle logout */}}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Form */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          min="0"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                          Size
                        </label>
                        <select
                          id="size"
                          name="size"
                          required
                          value={formData.size}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select a size</option>
                          <option value="Preemie">Preemie</option>
                          <option value="Newborn">Newborn</option>
                          <option value="0-3 months">0-3 months</option>
                          <option value="3-6 months">3-6 months</option>
                          <option value="6-9 months">6-9 months</option>
                          <option value="9-12 months">9-12 months</option>
                          <option value="12-18 months">12-18 months</option>
                          <option value="18-24 months">18-24 months</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select a category</option>
                        <option value="Rompers">Rompers</option>
                        <option value="Onesies">Onesies</option>
                        <option value="Sleep">Sleep</option>
                        <option value="Tops">Tops</option>
                        <option value="Bottoms">Bottoms</option>
                        <option value="Sets">Sets</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Product Image
                      </label>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-white file:bg-[#e53e3e] hover:file:bg-red-700"
                        style={{ 
                          backgroundColor: 'transparent'
                        }}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <div className="relative h-40 w-40">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="h-full w-full object-cover rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inStock"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                        In Stock
                      </label>
                    </div>
                    
                    <div className="flex justify-end">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              name: '',
                              description: '',
                              price: 0,
                              size: '',
                              category: '',
                              image_url: '',
                              inStock: true
                            });
                            setImageFile(null);
                            setImagePreview(null);
                            setIsEditing(false);
                            setEditId(null);
                          }}
                          className="mr-3 bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        // disabled={isSubmitting}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        style={{ backgroundColor: '#e53e3e' }}
                      >
                        {/* {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'} */} add
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Product List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                
                {loading ? (
                  <div className="text-center py-10">
                    <p>Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>No products found. Add your first product!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                                  {/* In a real app, use Next.js Image component */}
                                  <img
                                    src={`http://localhost:8000/uploads/${product.image_url}`}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">${product.price}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{product.category}</div>
                              <div className="text-sm text-gray-500">{product.description}</div>
                              <div className="text-sm text-gray-500">{product.size}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminProductsPage;