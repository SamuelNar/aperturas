import { useNavigate } from "react-router-dom"
import PropTypes from 'prop-types'

// eslint-disable-next-line react/prop-types
const ProductCard = ({product,isAdmin,onDelete}) => {
    const navigate = useNavigate()

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold mb-2">{product.title}</h2>
    {product.image && (
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
    )}    
    <button
      onClick={() => navigate(`/product/${product.id}`)}
      className="w-full px-4 py-2 bg-gray-500 text-white rounded mt-2"
    >
      Ver Detalles
    </button>

    {isAdmin && (
      <button
        onClick={() => onDelete(product.id)}
        className="w-full px-4 py-2 bg-red-500 text-white rounded mt-4 hover:bg-red-600 transition"
      >
        Eliminar Producto
      </button>
    )}
  </div>
  )
}
ProductCard.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    price: PropTypes.number.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
}

export default ProductCard