import { Button } from "./ui/button";
import { Product } from "@/types/products";
import "@/types/datalayer";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart, onViewDetails }: ProductCardProps) => {
  const handleClick = () => {
    // Push select_item event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'select_item',
      ecommerce: {
        items: [{
          item_id: product.item_id,
          item_name: product.item_name,
          price: product.price,
          item_category: product.item_category,
        }]
      }
    });
    onViewDetails(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Push add_to_cart event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: product.currency,
        value: product.price,
        items: [{
          item_id: product.item_id,
          item_name: product.item_name,
          price: product.price,
          item_category: product.item_category,
          quantity: 1,
        }]
      }
    });
    
    onAddToCart(product);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-arcane cursor-pointer group"
    >
      <div className="aspect-square overflow-hidden bg-background/50">
        <img 
          src={product.image} 
          alt={product.item_name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg mb-2 text-foreground">{product.item_name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{product.item_category}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gold text-glow-gold">{product.price} GP</span>
          <Button variant="arcane" size="sm" onClick={handleAddToCart}>
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};
