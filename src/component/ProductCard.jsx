import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// eslint-disable-next-line react/prop-types
const ProductCard = ({ product, isAdmin, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2 text-center">{product.title}</h2>
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
           className="w-full h-52 object-cover rounded-lg mb-4"
        />
      )}
       {product.prices !== null && (
                 <p className="text-lg font-semibold text-gray-700 mb-3">${product.prices}</p>
            )}
      <button
        onClick={() => navigate(`/product/${product.id}`)}
        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg mt-2 hover:bg-gray-600 transition"
      >
        Ver Detalles
      </button>

      {isAdmin && (
         <div className="flex w-full justify-between mt-4">
          <button
            onClick={() => navigate(`/edit-product/${product.id}`)}
             className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition mx-1"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition mx-1"
          >
            Eliminar Producto
          </button>
        </div>
      )}
    </div>
  );
};
ProductCard.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    prices: PropTypes.number.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default ProductCard;
