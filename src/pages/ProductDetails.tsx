import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Cart } from "@/components/Cart";
import { GTMSettings } from "@/components/GTMSettings";
import { LoginModal } from "@/components/LoginModal";
import { Product } from "@/types/products";
import productsData from "@/data/products.json";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const foundProduct = productsData.find((p) => p.item_id === id);
    
    if (foundProduct) {
      setProduct(foundProduct as Product);
      
      // GA4 view_item event
      window.dataLayer = window.dataLayer || [];
      (window.dataLayer as any).push({ ecommerce: null });  // Clear the previous ecommerce object.
      window.dataLayer.push({
        event: "view_item",
        ecommerce: {
          items: [{
            item_id: foundProduct.item_id,
            item_name: foundProduct.item_name,
            price: foundProduct.price,
            item_category: foundProduct.item_category,
            quantity: 1
          }]
        }
      });

      // Generate recommendations (3 random products excluding current)
      const otherProducts = productsData.filter(p => p.item_id !== id);
      const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 3) as Product[]);
    } else {
      navigate("/404");
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      
      window.dataLayer = window.dataLayer || [];
      (window.dataLayer as any).push({ ecommerce: null });  // Clear the previous ecommerce object.
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: product.currency,
          value: product.price,
          items: [{
            item_id: product.item_id,
            item_name: product.item_name,
            price: product.price,
            item_category: product.item_category,
            quantity: 1
          }]
        }
      });
      
      toast.success(`${product.item_name} adicionado ao carrinho!`);
    }
  };

  const handleRecommendationClick = (recProduct: Product) => {
    window.dataLayer = window.dataLayer || [];
    (window.dataLayer as any).push({ ecommerce: null });  // Clear the previous ecommerce object.
    window.dataLayer.push({
      event: "select_item",
      ecommerce: {
        items: [{
          item_id: recProduct.item_id,
          item_name: recProduct.item_name,
          price: recProduct.price,
          item_category: recProduct.item_category,
          quantity: 1
        }]
      }
    });
  };

  if (!product) return null;

  return (
    <div className="min-h-screen">
      {/* Header com Carrinho */}
      <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-primary/30 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-display text-glow-arcane">O Arsenal do Aventureiro</h1>
          <div className="flex items-center gap-2">
            <GTMSettings />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden md:inline">{user.name}</span>
                <button 
                  onClick={logout}
                  className="p-3 hover:bg-destructive/10 rounded-full transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5 text-destructive" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="p-3 hover:bg-primary/10 rounded-full transition-colors"
                title="Entrar"
              >
                <User className="w-5 h-5 text-primary" />
              </button>
            )}
            <button 
              onClick={() => setShowCart(true)}
              className="relative p-3 hover:bg-primary/10 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gold" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-dragon text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-20">
        <div className="min-h-screen bg-background pt-4 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <Button 
              variant="ghost" 
              className="mb-8 hover:bg-primary/10" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Cidadela
        </Button>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-card/50 border-2 border-primary/30 rounded-lg p-4 shadow-arcane">
            <img 
              src={product.image} 
              alt={product.item_name} 
              className="w-full h-auto rounded-lg shadow-deep object-cover aspect-square"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-primary font-display text-lg mb-2">{product.item_category}</span>
            <h1 className="text-4xl md:text-5xl font-display text-glow-arcane mb-6">{product.item_name}</h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between p-6 bg-card/30 rounded-lg border border-gold/20 mb-8">
              <span className="text-3xl font-bold text-gold text-glow-gold">{product.price} BRL</span>
              <Button size="lg" variant="arcane" onClick={handleAddToCart} className="px-8">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="border-t border-primary/20 pt-12">
          <h2 className="text-3xl font-display text-center mb-12 text-glow-gold">
            Isso poderá ajudar na sua aventura
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((rec) => (
              <Link 
                key={rec.item_id} 
                to={`/product/${rec.item_id}`}
                onClick={() => handleRecommendationClick(rec)}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-arcane"
              >
                <div className="aspect-square overflow-hidden bg-background/50">
                  <img 
                    src={rec.image} 
                    alt={rec.item_name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                    {rec.item_name}
                  </h3>
                  <p className="text-gold font-bold">{rec.price} BRL</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCart && (
        <Cart
          items={cart}
          onRemove={removeFromCart}
          onCheckout={() => setShowCart(false)}
          onClose={() => setShowCart(false)}
        />
      )}

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default ProductDetails;
