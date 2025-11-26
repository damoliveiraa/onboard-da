import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/products';
import { toast } from 'sonner';

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.item_id === product.item_id);
      if (existing) {
        return prev.map(p => 
          p.item_id === product.item_id 
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.item_name} adicionado ao inventário!`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(p => p.item_id !== itemId));
    toast.info("Item removido do inventário");
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
