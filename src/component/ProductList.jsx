import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import ProductCard from './ProductCard';
// eslint-disable-next-line react/prop-types
const ProductList = ({isAdmin,onLogout}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error("Error fetching products:", error);
      else setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);


  const deleteProduct = async (productId, image) => {
    try {
      if (image) {
        // Si la imagen está en products/images/
        // Necesitamos extraer solo la parte del path después de 'products/'
        
        console.log('URL completa de la imagen:', image);
        
        // Verificar si la URL contiene el patrón esperado
        if (image.includes('products/images/')) {
          // Extraer el nombre del archivo 
          const fileName = image.split('/').pop();
          // La ruta dentro del bucket debería ser 'images/nombredelarchivo'
          const filePath = `images/${fileName}`;
          
          console.log('Ruta para eliminar:', filePath);
          
          const { error: deleteImageError } = await supabase.storage
            .from('products')
            .remove([filePath]);
          
          if (deleteImageError) {
            console.error('Error eliminando la imagen del bucket: ', deleteImageError);
            return;
          }
        } else {
          console.error('Formato de URL de imagen no reconocido:', image);
          return;
        }
      }
  
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.error('Error eliminando el producto: ', error);
        return;
      } else {
        // Actualiza el estado para eliminar el producto de la lista
        setProducts(products.filter(product => product.id !== productId));
      }
    } catch (error) {
      console.error('Error al eliminar el producto o la imagen: ', error);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button onClick={() => navigate('/add-product')} className="px-4 py-2 bg-green-500 text-white rounded">Agregar Producto</button>
              <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded">Cerrar Sesión</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-500 text-white rounded">Admin Login</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? <p>Cargando productos...</p> : products.map(product => <ProductCard key={product.id} product={product} isAdmin={isAdmin} onDelete={() => deleteProduct(product.id,product.image)} />)}
      </div>
    </div>
  );
}

export default ProductList