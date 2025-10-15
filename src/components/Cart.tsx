import { X, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Product } from "@/types/products";
import "@/types/datalayer";

interface CartProps {
  items: Product[];
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}

export const Cart = ({ items, onRemove, onCheckout, onClose }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleCheckout = () => {
    // Push view_cart event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_cart',
      ecommerce: {
        currency: 'GP',
        value: total,
        items: items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          item_category: item.item_category,
          quantity: item.quantity || 1,
        }))
      }
    });
    
    onCheckout();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border-2 border-primary/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-arcane">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-display text-glow-arcane flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Seu Inventário
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Seu inventário está vazio...</p>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.item_id} className="flex gap-4 p-4 bg-background/50 rounded border border-border">
                  <img src={item.image} alt={item.item_name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.item_name}</h3>
                    <p className="text-sm text-muted-foreground">Quantidade: {item.quantity || 1}</p>
                    <p className="text-gold font-semibold">{item.price * (item.quantity || 1)} GP</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => onRemove(item.item_id)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-display">Total:</span>
                <span className="text-2xl font-bold text-gold text-glow-gold">{total} GP</span>
              </div>
              <Button variant="arcane" size="lg" className="w-full" onClick={handleCheckout}>
                Prosseguir para o Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
