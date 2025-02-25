import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import ProductList from './component/ProductList';
import LoginPage from './component/LoginPage';
import AddProductForm from './component/AddProductForm';
import ProductDetails from './component/ProductDetails';

export default function App() {
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') setIsAdmin(true);
    
    fetchProducts(); // Cargar productos al iniciar
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error al obtener productos:', error);
    } else {
      setProducts(data);
    }
  };

  const deleteProduct = async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error al eliminar producto:', error);
    } else {
      setProducts(prevProducts => prevProducts.filter((p) => p.id !== productId));
      fetchProducts(); // Actualizar la lista de productos
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  return (
    <Routes>
      <Route path="/" element={<ProductList products={products} isAdmin={isAdmin} onLogout={handleLogout} />} />
      <Route path="/login" element={isAdmin ? <Navigate to="/" /> : <LoginPage setIsAdmin={setIsAdmin} />} />
      <Route path="/add-product" element={isAdmin ? <AddProductForm fetchProducts={fetchProducts} /> : <Navigate to="/login" />} />
      <Route path="/product/:id" element={<ProductDetails isAdmin={isAdmin} deleteProduct={deleteProduct} />} />
    </Routes>
  );
}
