import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

// eslint-disable-next-line react/prop-types
const ProductDetails = ({ isAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) navigate("/");
      else setProduct(data);
    };
    fetchProduct();
  }, [id, navigate]);

  const handleDeleteProduct = async () => {
    try {
      if (product.image) {
        console.log("URL completa de la imagen:", product.image);

        // Verificar si la URL contiene el patrón esperado
        if (product.image.includes("products/images/")) {
          // Extraer el nombre del archivo
          const fileName = product.image.split("/").pop();
          // La ruta dentro del bucket debería ser 'images/nombredelarchivo'
          const filePath = `images/${fileName}`;

          console.log("Ruta para eliminar:", filePath);

          const { error: deleteImageError } = await supabase.storage
            .from("products")
            .remove([filePath]);

          if (deleteImageError) {
            console.error(
              "Error eliminando la imagen del bucket: ",
              deleteImageError
            );
            return;
          }
        } else {
          console.error(
            "Formato de URL de imagen no reconocido:",
            product.image
          );
        }
      }

      // Una vez eliminada la imagen (o si no hay imagen), eliminar el producto
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("Error al eliminar el producto", error);
        return;
      }

      // Si todo salió bien, redirigir a la página principal
      navigate("/");
    } catch (error) {
      console.error("Error al eliminar el producto o la imagen", error);
    }
  };

  return product ? (
    <div className="container mx-auto px-8 py-8 min-h-screen flex items-center">
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden w-full">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-3/5">
          {product.image ? (
            <div className="relative h-128 sm:h-140 md:h-160">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="h-128 sm:h-140 md:h-160 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500 text-2xl">Sin imagen</p>
            </div>
          )}
        </div>
        <div className="p-10 sm:p-12 md:p-16 w-full md:w-2/5">
          <div className="flex justify-between items-start mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold">{product.title}</h1>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-200 rounded-md hover:bg-gray-300 text-lg"
            >
              Volver
            </button>
          </div>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
            <p className="text-gray-700 text-lg">{product.description}</p>
          </div>
          <div className="flex flex-col space-y-6">
            <button
              onClick={() => {
                const message = `Pedido del producto: ${product.title}\nDescripción: ${product.description}`;
                const phoneNumber = "+543584024059";
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                  message
                )}`;
                window.open(url, "_blank");
              }}
              className="w-full px-10 py-5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-lg font-medium"
            >
              Hacer Pedido
            </button>
            {isAdmin && (
              <button
                onClick={handleDeleteProduct}
                className="w-full px-10 py-5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-lg font-medium"
              >
                Eliminar Producto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  

  ) : (
    <p className="text-center text-lg text-gray-600">Cargando...</p>
  );
};

export default ProductDetails;
