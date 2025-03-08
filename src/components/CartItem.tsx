import React from 'react';
import { useCartStore } from '../store/cartStore';
import { Trash, Minus, Plus } from 'lucide-react';

interface CartItemProps {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

const CartItem: React.FC<CartItemProps> = ({ id, quantity, product }) => {
  const { updateQuantity, removeFromCart, isLoading } = useCartStore();

  // If product is undefined, don't render the cart item
  if (!product) return null;

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeFromCart(id);
    }
  };

  const handleRemove = () => {
    removeFromCart(id);
  };

  return (
    <div className="flex items-center border-b py-4">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-md font-medium text-gray-900">{product.name}</h3>
          <p className="ml-4 text-md font-medium text-gray-900">${product.price}</p>
        </div>

        <div className="flex flex-1 items-center justify-between mt-2">
          <div className="flex items-center border rounded">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleDecrement}
              className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="px-2 py-1 text-gray-800">{quantity}</span>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleIncrement}
              className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              <Trash size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;