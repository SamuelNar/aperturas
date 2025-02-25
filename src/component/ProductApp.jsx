import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';

// Configuración de Supabase
const supabaseUrl = 'https://ihbtfjcrkfszkifefwsm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYnRmamNya2ZzemtpZmVmd3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDM1NjU0OCwiZXhwIjoyMDU1OTMyNTQ4fQ.g0Hoxww-RuB0NSKWrNrY0QjNeU_YVhVBBtm5cgkOwmo';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Componente principal que maneja el estado global y las rutas
const ProductApp = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Verificar si hay una sesión de administrador guardada
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  return (
    <Routes>
      <Route path="/" element={<ProductList isAdmin={isAdmin} onLogout={handleLogout} />} />
      <Route path="/login" element={isAdmin ? <Navigate to="/" /> : <LoginPage setIsAdmin={setIsAdmin} />} />
      <Route path="/add-product" element={isAdmin ? <AddProductForm /> : <Navigate to="/login" />} />
      <Route path="/product/:id" element={<ProductDetails isAdmin={isAdmin} />} />
    </Routes>
  );
};

// Componente para mostrar los detalles de un producto
const ProductDetails = ({ isAdmin }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching product details:", error);
        navigate('/');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProductDetails();
  }, [id, navigate]);

  // Eliminar un producto
  const handleDeleteProduct = async () => {
    if (isAdmin && product) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .match({ id: product.id });

        if (error) {
          console.error("Error deleting product:", error);
        } else {
          navigate('/');
        }
      } catch (e) {
        console.error("Error deleting product:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <p className="text-xl">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <p className="text-xl">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {product.image ? (
              <div className="relative h-96 md:h-full">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-96 md:h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Sin imagen</p>
              </div>
            )}
          </div>
          <div className="p-8 md:w-1/2">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
            <p className="text-2xl font-semibold text-green-600 mb-6">${product.price}</p>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => alert(`Pedido del producto: ${product.title}`)}
                className="w-full px-6 py-3 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Hacer Pedido
              </button>
              {isAdmin && (
                <button
                  onClick={handleDeleteProduct}
                  className="w-full px-6 py-3 rounded bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Eliminar Producto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar la lista de productos
const ProductList = ({ isAdmin, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar productos desde Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Eliminar un producto
  const handleDeleteProduct = async (productId) => {
    if (isAdmin) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .match({ id: productId });

        if (error) {
          console.error("Error deleting product:", error);
        } else {
          setProducts(products.filter(product => product.id !== productId));
        }
      } catch (e) {
        console.error("Error deleting product:", e);
      }
    }
  };

  // Componente ProductCard
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-2">{product.title}</h2>
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}
      <p className="text-lg font-semibold text-green-600">${product.price}</p>
      <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
      <div className="mt-4 space-y-2">
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="w-full px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
        >
          Ver Detalles
        </button>
        <button
          onClick={() => alert(`Pedido del producto: ${product.title}`)}
          className="w-full px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Hacer Pedido
        </button>
        {isAdmin && (
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
          >
            Eliminar Producto
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => navigate('/add-product')}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Agregar Producto
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>

      {/* Mostrar productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          products.map(product => (
            <ProductCard key={product.id || product.title} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

// Componente de página de login
const LoginPage = ({ setIsAdmin }) => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === ADMIN_USER && loginData.password === ADMIN_PASS) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      navigate('/'); // Redirigir al inicio después del login exitoso
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login Administrador</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-gray-700">Usuario</label>
            <input
              id="username"
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-gray-700">Contraseña</label>
            <input
              id="password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
            Ingresar
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="w-full mt-2 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Volver a Productos
          </button>
        </form>
      </div>
    </div>
  );
};

// Componente para agregar productos
const AddProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    image: null
  });
  const navigate = useNavigate();

  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    // Subir imagen si se seleccionó una
    let imageUrl = '';
    if (newProduct.image) {
      const file = newProduct.image;
      const fileName = `images/${file.name}`;
      
      // Subir la imagen al bucket
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);
  
      if (error) {
        console.error("Error uploading image: ", error);
      } else {
        imageUrl = `https://ihbtfjcrkfszkifefwsm.supabase.co/storage/v1/object/public/products/${fileName}`;
      }
    }
  
    // Insertar el producto en la base de datos
    const { data, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          title: newProduct.title,
          description: newProduct.description,
          price: Number(newProduct.price),
          image: imageUrl
        }
      ]);
  
    if (insertError) {
      console.error("Error adding product: ", insertError);
    } else {
      setNewProduct({ title: "", description: "", price: "", image: null });
      // Redirigir al inicio después de agregar el producto
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Agregar Nuevo Producto</h2>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
        <form onSubmit={handleAddProduct}>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2 text-gray-700">Título</label>
            <input
              id="title"
              type="text"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2 text-gray-700">Descripción</label>
            <textarea
              id="description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block mb-2 text-gray-700">Precio</label>
            <input
              id="price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block mb-2 text-gray-700">Imagen</label>
            <input
              id="image"
              type="file"
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">
            Agregar Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductApp;