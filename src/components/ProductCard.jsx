import { useNavigate } from "react-router-dom";
import { Tags } from "lucide-react";

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    return (
        <div className="product-card-container flex gap-3 flex-row justify-center items-center flex-wrap mt-4">
            <div className="product-card rounded-lg border border-gray-300 p-4 shadow-md hover:cursor-pointer" onClick={() => navigate('/products/' + product.id)}>
                <img src={product.image} alt={product.name} className="product-image rounded-t-lg w-full h-50 object-cover" />
                <div className="product-info mt-4">
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <h3 className="text-lg text-gray-600">{product.brand}</h3>
                    <span className="text-gray-500"><Tags size={12} className="inline-block align-baseline"/> {product.category}</span>
                </div>
            </div>
        </div>
    );
};

import PropTypes from 'prop-types';
ProductCard.propTypes = {
    product: PropTypes.objectOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        brand: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
    }),
};