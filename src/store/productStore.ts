import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
type Product = Database['public']['Tables']['products']['Row'];

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  singleProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  featuredProducts: [],
  singleProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ products: data as Product[], isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: 'Failed to fetch products', isLoading: false });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      set({ featuredProducts: data as Product[], isLoading: false });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      set({ error: 'Failed to fetch featured products', isLoading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null, singleProduct: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ singleProduct: data as Product, isLoading: false });
    } catch (error) {
      console.error('Error fetching product:', error);
      set({ error: 'Failed to fetch product', isLoading: false });
    }
  },

  createProduct: async (product) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .insert(product);

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      console.error('Error creating product:', error);
      set({ error: 'Failed to create product', isLoading: false });
    }
  },

  updateProduct: async (id, product) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id);

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating product:', error);
      set({ error: 'Failed to update product', isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ error: 'Failed to delete product', isLoading: false });
    }
  },
}));