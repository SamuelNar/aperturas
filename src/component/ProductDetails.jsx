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
    <div className="container mx-auto px-4 py-8">
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="md:flex">
      <div className="md:w-1/2">
        {product.image ? (
          <div className="relative h-235 md:h-235"> {/* Aumenté la altura */}
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-128 md:h-128 bg-gray-200 flex items-center justify-center"> {/* Asegúrate de que el contenedor tenga la misma altura */}
            <p className="text-gray-500">Sin imagen</p>
          </div>
        )}
      </div>
      <div className="p-8 md:w-1/2">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Descripción</h2>
          <p className="text-gray-700">{product.description}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => {
              const message = `Pedido del producto: ${product.title}\nDescripción: ${product.description}`;
              const phoneNumber = "1234567890"; // Número de teléfono al que enviar el mensaje, incluye el código de país.
              const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                message
              )}`;
              window.open(url, "_blank");
            }}
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

  ) : (
    <p className="text-center text-lg text-gray-600">Cargando...</p>
  );
};

export default ProductDetails;
