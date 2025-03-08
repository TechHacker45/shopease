import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface CartItem {
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

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCartItems: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCartItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        set({ items: [], isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      
      // Transform the data to ensure product is properly structured
      const transformedData = (data || []).map(item => {
        // Handle case where products might be null
        return {
          ...item,
          // Ensure product field exists even if products is null
          product: item.products || null
        };
      }).filter(item => item.product !== null); // Filter out items with null products
      
      set({ items: transformedData as CartItem[], isLoading: false });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      set({ error: 'Failed to fetch cart items', isLoading: false });
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ error: 'You must be logged in to add items to cart', isLoading: false });
        return;
      }

      // Check if the item is already in the cart
      const existingItem = get().items.find(item => item.product_id === productId);

      if (existingItem) {
        // Update quantity if item exists
        await get().updateQuantity(existingItem.id, existingItem.quantity + quantity);
        set({ isLoading: false });
      } else {
        // Add new item if it doesn't exist
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: session.user.id,
            product_id: productId,
            quantity
          });

        if (error) throw error;
        await get().fetchCartItems();
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      set({ error: 'Failed to add item to cart', isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      if (quantity <= 0) {
        await get().removeFromCart(cartItemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await get().fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      set({ error: 'Failed to update quantity', isLoading: false });
    }
  },

  removeFromCart: async (cartItemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await get().fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      set({ error: 'Failed to remove item from cart', isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        set({ error: 'You must be logged in to clear cart', isLoading: false });
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      set({ items: [], isLoading: false });
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ error: 'Failed to clear cart', isLoading: false });
    }
  }
}));