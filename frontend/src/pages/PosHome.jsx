import { IoCloseCircle } from "react-icons/io5";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { RiFileList3Fill } from "react-icons/ri";
import { GrTechnology } from "react-icons/gr";
import { FaMouse } from "react-icons/fa";
import { MdCable, MdTableRestaurant } from "react-icons/md";
import { CgSoftwareDownload } from "react-icons/cg";
import '../scrollbar.css';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from '../components/SearchBar';
import demoImage from '../assets/Demo.png';
import { IoIosCloseCircle } from "react-icons/io";
import ProceedToPayment from '../components/ProceedToPayment';

const PosHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryCounts, setCategoryCounts] = useState({
    'All Products': 0,
    'Components': 0,
    'Peripherals': 0,
    'Accessories': 0,
    'PC Furniture': 0,
    'OS & Software': 0
  });
  const [cart, setCart] = useState([]);
  const baseURL = 'http://localhost:5555';
  const { user } = useAuthContext();
  const { darkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.product.selling_price) || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handlePayButton = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/product`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        const productData = response.data.data;
        setProducts(productData);

        const counts = productData.reduce((acc, product) => {
          const category = product.category || 'Uncategorized';
          if (!acc[category]) acc[category] = 0;
          acc[category] += product.quantity_in_stock;
          acc['All Products'] += product.quantity_in_stock;
          return acc;
        }, {
          'All Products': 0,
          'Components': 0,
          'Peripherals': 0,
          'Accessories': 0,
          'PC Furniture': 0,
          'OS & Software': 0
        });

        setCategoryCounts(counts);

      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts = products.filter((product) => {
    const isInCategory = selectedCategory === 'All Products' || product.category === selectedCategory;
    const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isInCategory && matchesSearchQuery;
  });

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.product._id === product._id);
      if (existingProduct) {
        return prevCart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.product._id !== productId));
  };

  const buttons = [
    { icon: <RiFileList3Fill className='w-8 h-8' />, label: 'All Products', count: categoryCounts['All Products'] || 0 },
    { icon: <GrTechnology className='w-8 h-8' />, label: 'Components', count: categoryCounts['Components'] || 0 },
    { icon: <FaMouse className='w-8 h-8' />, label: 'Peripherals', count: categoryCounts['Peripherals'] || 0 },
    { icon: <MdCable className='w-8 h-8' />, label: 'Accessories', count: categoryCounts['Accessories'] || 0 },
    { icon: <MdTableRestaurant className='w-8 h-8' />, label: 'PC Furniture', count: categoryCounts['PC Furniture'] || 0 },
    { icon: <CgSoftwareDownload className='w-8 h-8' />, label: 'OS & Software', count: categoryCounts['OS & Software'] || 0 }
  ];

  const safeToFixed = (value, decimals = 2) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(decimals);
  };

  return (
    <div className={`${darkMode ? 'bg-light-BG' : 'dark:bg-dark-BG'} h-auto flex gap-1`}>
      <Navbar />
      <div className='h-[100vh] pt-[70px] px-2'>
        <div className='w-[14vw] h-[90vh] flex items-center flex-col justify-center gap-4'>
          <p className={`font-bold text-3xl pt-6 ${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>Cashier</p>
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleCategoryChange(button.label)}
              className={`${darkMode ? 'bg-light-CARD text-light-ACCENT' : 'dark:bg-dark-CARD dark:text-dark-ACCENT'} flex items-center justify-center w-[100%] h-[40%] rounded-xl ${selectedCategory === button.label ? 'border-light-ACCENT dark:border-dark-ACCENT border-2' : 'border-transparent'} transition-all duration-200`}
            >
              <div className='w-[30%]'>
                {button.icon}
              </div>
              <div className={`w-70% flex flex-col ${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>
                <p className='w-full text-sm'>{button.label}</p>
                <p className='w-full text-xs text-start'>{button.count}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className='flex flex-col w-[80%] pt-[90px] p-5 gap-4 items-end'>
        <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
        <div className='w-full grid grid-cols-4 gap-3 h-[78vh] overflow-auto'>
          {loading ? (
            <p>Loading...</p>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  image: `${baseURL}/images/${product.image.substring(14)}`,
                  name: product.name,
                  price: parseFloat(product.selling_price) || 0,
                  stock: product.quantity_in_stock,
                }}
                onClick={() => handleAddToCart(product)}
              />
            ))
          )}
        </div>
      </div>

      <div className={`flex items-center justify-between flex-col w-[50%] gap-1 pt-[120px] pb-4 px-4 ${darkMode ? 'bg-light-CARD text-light-TEXT' : 'dark:bg-dark-CARD dark:text-dark-TEXT'} rounded-xl`}>
        <div className={`overflow-y-auto h-[500px] w-full rounded-lg ${darkMode ? 'bg-light-CARD1' : 'dark:bg-dark-CARD1'}`}>
          <div style={{ width: '100%' }}> {/* Adjust this container width if needed */}
            <table className='border-collapse table-fixed h-auto w-full'>
              <thead>
                <tr className='border-b border-primary'>
                  <th style={{ width: '40%' }} className={`sticky top-0 px-4 py-2 text-left ${darkMode ? 'bg-light-TABLE' : 'dark:bg-dark-TABLE'}`}>Product</th>
                  <th style={{ width: '20%' }} className={`sticky top-0 px-1 py-2 text-left ${darkMode ? 'bg-light-TABLE' : 'dark:bg-dark-TABLE'}`}>Price</th>
                  <th style={{ width: '20%' }} className={`sticky top-0 px-4 py-2 text-left ${darkMode ? 'bg-light-TABLE' : 'dark:bg-dark-TABLE'}`}>Quantity</th>
                  <th style={{ width: '20%' }} className={`sticky top-0 px-4 py-2 text-left ${darkMode ? 'bg-light-TABLE' : 'dark:bg-dark-TABLE'}`}>Total</th>
                  <th style={{ width: '8%' }} className={`sticky top-0 px-4 py-2 text-left ${darkMode ? 'bg-light-TABLE' : 'dark:bg-dark-TABLE'}`}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx} className='border-b border-dark-ACCENT gap-2 text-xs'>
                    <td className='flex gap-2 items-center justify-center p-2'>
                      <img
                        src={`${baseURL}/images/${item.product.image.substring(14)}`}
                        className='w-16 h-16 object-cover rounded-lg'
                      />
                      <p className='w-full'>{item.product.name}</p>
                    </td>
                    <td>₱ {((item.product.selling_price).toLocaleString()) || 0}</td>
                    <td className='text-center'>{item.quantity}</td>
                    <td className='tracking-wide'>₱ {((item.quantity * item.product.selling_price).toLocaleString())}</td>
                    <td>
                      <IoCloseCircle 
                        className="text-lg cursor-pointer" 
                        onClick={() => handleRemoveFromCart(item.product._id)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='flex flex-col gap-3 justify-center items-center pt-6 w-full'>
          <div className='flex flex-col gap-2 tracking-wider items-center justify-center'>
            <p className='text-gray-400'>Subtotal</p>
            <p className={`${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>₱ {calculateTotal().toLocaleString()}</p>
          </div>

          <button
            className={`w-[80%] py-3 rounded text-black font-semibold ${darkMode ? 'bg-light-ACCENT text-light-TEXT' : 'dark:bg-dark-ACCENT text-dark-TEXT'}`}
            onClick={handlePayButton}
          >
            Proceed to Payment
          </button>
          <ProceedToPayment
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              totalAmount={calculateTotal()}
            />
        </div>
      </div>
    </div>
  );
};

export default PosHome;
