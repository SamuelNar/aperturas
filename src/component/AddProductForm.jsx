import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../utils/supabaseClient";

// eslint-disable-next-line react/prop-types
const AddProductForm = ({fetchProducts}) => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",    
    image: null
  });
  const navigate = useNavigate();

  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    // Subir imagen si se seleccionó una
    let imageUrl = '';
    if (newProduct.image) {
      const file = newProduct.image;
      const fileName = `images/${Date.now()}-${file.name}`;
      
      // Subir la imagen al bucket
      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file);
  
      if (error) {
        console.error("Error uploading image: ", error);
      } else {
        imageUrl = `https://ihbtfjcrkfszkifefwsm.supabase.co/storage/v1/object/public/products/${fileName}`;
      }
    }
  
    // Insertar el producto en la base de datos
    const { error: insertError } = await supabase
      .from('products')
      .insert([
        {
          title: newProduct.title,
          description: newProduct.description,          
          image: imageUrl
        }
      ]);
  
    if (insertError) {
      console.error("Error adding product: ", insertError);
    } else {
      setNewProduct({ title: "", description: "",image: null });      
      await fetchProducts();
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center mb-6">Agregar Producto</h2>
        <form onSubmit={handleAddProduct}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Título"
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              value={newProduct.title}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Descripción"
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              value={newProduct.description}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>         
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Agregar Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
