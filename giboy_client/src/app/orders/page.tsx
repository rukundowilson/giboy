"use client"
import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import router from "next/navigation";


// Define TypeScript interfaces
interface CartItem {
  cart_item_id: number;
  quantity: number;
  status: string;
  added_at: string;
  user_id: number;
  username: string;
  email: string;
  item_id: number;
  item_name: string;
  price: string;
  image_url: string;
}

interface SortConfig {
  key: keyof CartItem | "";
  direction: "asc" | "desc";
}

interface FilterState {
  username: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const AdminOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<CartItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" });
  const [filters, setFilters] = useState<FilterState>({
    username: "",
    status: "",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  

    // For demo purposes, let's use the mock data
    let mockData: CartItem[] = [
      
    ];

    // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get("api/ordered-items")
        
        setOrders(response.data);
        setFilteredOrders(response.data);
        setLoading(false);
        mockData = response.data
      } catch (err) {
        setError("Failed to fetch orders data");
        setLoading(false);
        console.error(err);
      }
    };

    setOrders(mockData);
    setFilteredOrders(mockData);
    setLoading(false);

    fetchOrders();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      applyFilters(orders);
      return;
    }

    const filtered = orders.filter((order) =>
      order.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cart_item_id.toString().includes(searchTerm)
    );
    
    applyFilters(filtered);
  }, [searchTerm, orders]);

  // Apply all filters
  const applyFilters = (data: CartItem[]) => {
    let filtered = [...data];

    if (filters.username) {
      filtered = filtered.filter(order => 
        order.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(order => 
        new Date(order.added_at) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(order => 
        new Date(order.added_at) <= new Date(filters.dateRange.end)
      );
    }

    // // Apply sorting if we have a sort config
    // if (sortConfig.key) {
    //   filtered.sort((a, b) => {
    //     if (a[sortConfig.key] < b[sortConfig.key]) {
    //       return sortConfig.direction === 'asc' ? -1 : 1;
    //     }
    //     if (a[sortConfig.key] > b[sortConfig.key]) {
    //       return sortConfig.direction === 'asc' ? 1 : -1;
    //     }
    //     return 0;
    //   });
    // }

    setFilteredOrders(filtered);
  };

  // Handle sorting
  const requestSort = (key: keyof CartItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Re-apply filters with new sort config
    const newSortConfig = { key, direction };
    const sorted = [...filteredOrders].sort((a, b) => {
      if (a[key] < b[key]) {
        return newSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return newSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredOrders(sorted);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      username: "",
      status: "",
      dateRange: {
        start: "",
        end: "",
      },
    });
    setSearchTerm("");
    setSortConfig({ key: "", direction: "asc" });
    setFilteredOrders(orders);
  };

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = ["Order ID", "User", "Email", "Item", "Price", "Quantity", "Total", "Status", "Date"];
    const csvData = filteredOrders.map(order => [
      order.cart_item_id,
      order.username,
      order.email,
      order.item_name,
      order.price,
      order.quantity,
      (parseFloat(order.price) * order.quantity).toFixed(2),
      order.status,
      new Date(order.added_at).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate total amount for each order
  const calculateTotal = (price: string, quantity: number) => {
    return (parseFloat(price) * quantity).toFixed(2);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  // Group orders by user
  const ordersByUser = filteredOrders.reduce((acc, order) => {
    const userId = order.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        username: order.username,
        email: order.email,
        orders: []
      };
    }
    acc[userId].orders.push(order);
    return acc;
  }, {} as Record<number, { user_id: number, username: string, email: string, orders: CartItem[] }>);

  return (
    <div>
    <header className="bg-white shadow mb-4">
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
              onClick={() => router.push('/add')}
            >
              back
            </button>
          </li>
          <li>
          </li>
        </ul>
      </nav>
    </div>
  </header>
    <div className="container mx-auto p-4 bg-white rounded-lg shadow">      
      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by order ID, username, email or item..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filters
            {showFilters ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </button>
          
          <button 
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Reset
          </button>
          
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 mb-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.username}
              onChange={(e) => setFilters({...filters, username: e.target.value})}
              placeholder="Filter by username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateRange.start}
                onChange={(e) => setFilters({
                  ...filters, 
                  dateRange: {...filters.dateRange, start: e.target.value}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateRange.end}
                onChange={(e) => setFilters({
                  ...filters, 
                  dateRange: {...filters.dateRange, end: e.target.value}
                })}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('cart_item_id')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortConfig.key === 'cart_item_id' && (
                        sortConfig.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('username')}
                  >
                    <div className="flex items-center">
                      User
                      {sortConfig.key === 'username' && (
                        sortConfig.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {sortConfig.key === 'price' && (
                        sortConfig.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('quantity')}
                  >
                    <div className="flex items-center">
                      Qty
                      {sortConfig.key === 'quantity' && (
                        sortConfig.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('added_at')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === 'added_at' && (
                        sortConfig.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.cart_item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{order.cart_item_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.username}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            
                            <img className="h-10 w-10 rounded-full object-cover" src={`http://localhost:8000/uploads/${order.image_url}`} alt={order.item_name} />
                          </div>
                          <div className="ml-4 text-sm text-gray-900">{order.item_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${calculateTotal(order.price, order.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.added_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>  
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold">{filteredOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{Object.keys(ordersByUser).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Items</p>
            <p className="text-2xl font-bold">
              {filteredOrders.reduce((sum, order) => sum + order.quantity, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">
              ${filteredOrders
                .reduce((sum, order) => sum + parseFloat(order.price) * order.quantity, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminOrdersView;