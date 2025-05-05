"use client"
// pages/dashboard.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { isUserLoggedIn } from '../utils/session';
import API from '../utils/axios';
import CheckoutModal from '../components/checkout';


// Types
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  category: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string
}
interface User{
  email : string,
  id: number
}

// Mock data
const mockProducts: Product[] = [];

const mockCartItems: CartItem[] = [];  

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [user,setUser] = useState<User>({ email: '', id: 0 })
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [activeTab, setActiveTab] = useState<string>('inStock');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error,setError] = useState<string>("")
  const [loading,setLoading] = useState<boolean>(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentCode, setPaymentCode] = useState("")
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "" })


  // Check if user is authenticated and set user data
  console.log(user)
  useEffect(() => {
    if (!isUserLoggedIn){
      router.push('/login')
    }
    const userData = localStorage?.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : { email: '' };
    setUser(userData);
    fetchProducts();
    if (userData.id) {
      fetchUserCartItems(userData.id);
    }
  }, []);

  const handleLogout = () => {
    // Remove both token and user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  
    // Optionally, you can clear everything if you want:
    // localStorage.clear();
  
    // Redirect to login page
    router.push('/login');
  };
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
  
  // Filter products based on active filter and search query
  const filteredProducts = products.filter(product => {
    const matchesFilter = activeFilter === 'All' || product.category === activeFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isInStock = activeTab === 'inStock' ? product.stockStatus !== 'OUT_OF_STOCK' : true;
    return matchesFilter && matchesSearch && isInStock;
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `cart${cartItems.length + 1}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const saveCartItem = async (item: CartItem) => {
    try {
      const userId = user?.id;
  
      await API.post('/api/cart-items', {
        user_id: userId,
        item_id: item.productId,
        quantity: item.quantity,
      });
  
      console.log('Cart item saved to database');
      fetchUserCartItems(userId);

    } catch (err) {
      console.error('Failed to save cart item:', err);
    }
  };

  const fetchUserCartItems = async (userId: number | string) => {
    try {
      console.log(userId)
      const response = await API.get(`/api/get-cart-items/${userId}`);
      if (response?.data){
        setCartItems(response.data)
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      throw error;
    }
  };
  
  
  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);


  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Dashboard | giboy store </title>
        <meta name="description" content="User dashboard for giboy" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold cursor-pointer">Giboy store</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:block">Welcome back, {user.email || 'User'}!</span>
            <div className="relative">
              <button className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="#000" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="bg-red-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs absolute -top-1 -right-1">
                  {cartItems.length}
                </span>
              </button>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <button 
              className="px-4 py-2 rounded-md text-white"
              style={{ backgroundColor: '#e53e3e' }}
              onClick={() => {handleLogout()}}
            >
              Logout
            </button>
          </div>
          
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome banner */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.email || 'User'}!</h1>
          <p>You have {cartItems.length} items in your cart ready for checkout. Continue shopping or proceed to checkout.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main product section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Tabs */}
              <div className="flex border-b mb-6">
                <button 
                  className={`px-6 py-3 font-medium ${activeTab === 'inStock' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('inStock')}
                >
                  In Stock
                </button>
                <button 
                  className={`px-6 py-3 font-medium ${activeTab === 'recommended' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('recommended')}
                >
                  Recommended
                </button>
                <button 
                  className={`px-6 py-3 font-medium ${activeTab === 'recentlyViewed' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('recentlyViewed')}
                >
                  Recently Viewed
                </button>
              </div>

              {/* Title and product count */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Available Products</h2>
                <span className="text-gray-500">{filteredProducts.length} Products</span>
              </div>

              {/* Search bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-10 py-3 border border-gray-300 rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Quick filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Sports'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      activeFilter === filter
                        ? 'bg-red-400 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="h-40 bg-gray-100 relative">
                      {/* In a real app, you would use proper image loading */}
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <img
                        src={`http://localhost:8000/uploads/${product.image_url}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1">{product.name}</h3>
                      <p className="text-gray-800 font-bold mb-2">${product?.price}</p>
                      <div className={`inline-block px-2 py-1 rounded text-xs mb-2 ${
                        product.stockStatus === 'IN_STOCK' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Low Stock'}
                      </div>
                      <button 
                        className="w-full bg-red-400 hover:bg-red-600 text-white py-2 rounded mt-2 transition-colors duration-300"
                        onClick={() => {
                          addToCart(product);
                          const cartItem = {
                            id: `cart${cartItems.length + 1}`,
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            image_url: product.image_url
                          };
                          saveCartItem(cartItem);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cart summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-lg mb-4 flex justify-between items-center">
                Your Cart
                <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartItems.length}
                </span>
              </h2>

              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={item.id || `cart-${index}`} className="flex items-center border-b pb-4">
                      <div className="w-12 h-12 bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                      <img
                      src={`http://localhost:8000/uploads/${item.image_url}`}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-600 text-sm">${item.price} x {item.quantity}</span>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id || `cart-${index}`)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m6-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        </div>
                      </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${cartTotal}</span>
                    </div>
                    <button
                    onClick={()=>setIsCheckoutOpen(true)}
                     className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded mt-4 transition-colors duration-300">
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Recently viewed */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-lg mb-4">waiting for review cart</h2>
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <div key={`recent-${product.id}`} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                      [IMG]
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{product.name}</h3>
                      <p className="text-xs text-gray-500">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={()=>setIsCheckoutOpen(false)}
        totalAmount={cartTotal}
        paymentCode={468161}
        // contactInfo={contactInfo}
      />
       
    </div>
  );
};

export default Dashboard;