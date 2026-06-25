import { useState, useEffect } from "react";
import { ShoppingCart, Sword, Axe, Crosshair, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { GTMSettings } from "@/components/GTMSettings";
import { LoginModal } from "@/components/LoginModal";
import { Product } from "@/types/products";
import productsData from "@/data/products.json";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import "@/types/datalayer";



const Index = () => {
  const [gateMessage, setGateMessage] = useState("");
  const [goblinDamage, setGoblinDamage] = useState(0);
  const [dragonResult, setDragonResult] = useState("");
  const [dragonCep, setDragonCep] = useState("");
  const [bridgeFixed, setBridgeFixed] = useState(false);
  const [chestItems, setChestItems] = useState<{[key: number]: string}>({});
  const [showDamage, setShowDamage] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [treasureTimer, setTreasureTimer] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { cart, addToCart, removeFromCart } = useCart();
  const { user, logout } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Push virtualPageView on mount
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtualPageView',
      page_title: 'Home - O Arsenal do Aventureiro',
      page_path: '/'
    });
    
    // Intersection Observer for view_item_list
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.dataLayer.push({
            event: 'view_item_list',
            ecommerce: {
              items: productsData.map(p => ({
                item_id: p.item_id,
                item_name: p.item_name,
                price: p.price,
                item_category: p.item_category,
              }))
            }
          });
          observer.disconnect(); // Only fire once
        }
      });
    }, { threshold: 0.5 });

    const productSection = document.getElementById('product-list-section');
    if (productSection) {
      observer.observe(productSection);
    }

    return () => observer.disconnect();
  }, []);

  // Treasure timer effect
  useEffect(() => {
    if (treasureTimer !== null && treasureTimer > 0) {
      const interval = setInterval(() => {
        setTreasureTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setChestItems({});
            toast.success("Os baús foram reabastecidos!");
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [treasureTimer]);

  const handleGateClick = () => {
    setGateMessage("O portão se abre rangendo. A jornada começou!");
    window.dataLayer.push({ 
      event: 'level_start',
      level_name: 'Introduction'
    });
    toast.success("A aventura começa!");
  };

  const handleGoblinClick = () => {
    const damage = Math.floor(Math.random() * 21);
    setGoblinDamage(damage);
    window.dataLayer.push({ 
      event: 'select_content',
      content_type: 'monster',
      item_id: 'goblin',
      damage_dealt: damage 
    });
    toast.info(`Você causou ${damage} de dano no goblin!`);
  };

  const scanTreasures = () => {
    const kingItems = productsData.filter(p => 
      p.item_name.toLowerCase().includes('king') || 
      p.item_name.toLowerCase().includes('rei')
    );
    const names = kingItems.map(p => p.item_name).join(", ");
    toast.success(`Tesouros reais encontrados: ${names || "Nenhum"}`);
  };

  const handleDragonSpell = () => {
    const cepNum = parseInt(dragonCep);
    if (!dragonCep || isNaN(cepNum)) {
      setDragonResult("O feitiço falhou! Insira um CEP válido.");
      window.dataLayer.push({ 
        event: 'level_end',
        level_name: 'Dragon Battle',
        success: false,
        power_level: dragonCep
      });
      toast.error("Feitiço falhou!");
      return;
    }
    
    if (cepNum % 2 === 0) {
      setDragonResult("✨ SUCESSO! O dragão foi banido! A magia ressoou em harmonia!");
      window.dataLayer.push({ 
        event: 'level_end',
        level_name: 'Dragon Battle',
        success: true,
        power_level: dragonCep
      });
      toast.success("Dragão banido com sucesso!");
    } else {
      setDragonResult("💀 FALHA! O dragão resistiu ao feitiço! Tente um número par.");
      window.dataLayer.push({ 
        event: 'level_end',
        level_name: 'Dragon Battle',
        success: false,
        power_level: dragonCep
      });
      toast.error("O dragão resistiu!");
    }
  };

  const handleBridgeRepair = () => {
    setBridgeFixed(true);
    toast.success("Ponte reparada com sucesso!");
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };



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
        {/* Hero Section - Cidadela */}
        <section 
          className="relative h-[70vh] md:h-screen flex items-center justify-center overflow-hidden"
          data-promo-id="hero_citadel"
          data-promo-name="Cidadela do Eco Fragmentado"
          data-promo-position="hero"
        >
          <div className="absolute inset-0">
            <img src="/assets/citadel-hero.jpg" alt="Cidadela do Eco Fragmentado" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6 text-glow-arcane animate-float">
              A Cidadela do Eco Fragmentado
            </h2>
            <p className="text-lg md:text-xl text-parchment/90 mb-8">
              Bem-vindo à saga dos Feiticeiros de Dados. Sua jornada épica começa aqui.
            </p>
          </div>
        </section>

        {/* Seção 1: Atividades da Cidadela */}
        <section className="py-20 px-4 bg-gradient-dark">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl md:text-5xl font-display text-center mb-16 text-glow-gold">
              Desafios da Cidadela
            </h2>

            {/* Atividade 1.1 - Portão Sussurrante */}
            <div 
              className="mb-20 bg-card/50 border-2 border-primary/30 rounded-lg p-8 shadow-arcane"
              data-promo-id="challenge_gate"
              data-promo-name="O Portão Sussurrante"
              data-promo-position="challenge_1"
            >
              <h3 className="text-2xl md:text-3xl font-display mb-6 text-primary">O Portão Sussurrante</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <img src="/assets/whispering-gate.jpg" alt="Portão Sussurrante" className="w-full rounded-lg shadow-deep" />
                <div>
                  <Button variant="hero" size="xl" onClick={handleGateClick} className="w-full mb-4">
                    Entre
                  </Button>
                  {gateMessage && (
                    <p className="text-success text-lg font-semibold animate-pulse">{gateMessage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Atividade 1.2 - Emboscada Goblin */}
            <div 
              className="mb-20 bg-card/50 border-2 border-destructive/30 rounded-lg p-8 shadow-deep"
              data-promo-id="challenge_goblin"
              data-promo-name="Emboscada Goblin"
              data-promo-position="challenge_2"
            >
              <h3 className="text-2xl md:text-3xl font-display mb-6 text-destructive">Emboscada Goblin</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <img 
                  src="/assets/goblin.jpg" 
                  alt="Goblin" 
                  className="w-full rounded-lg shadow-deep cursor-pointer hover:scale-105 transition-transform"
                  onClick={handleGoblinClick}
                />
                <div className="text-center">
                  <p className="text-xl mb-4 text-foreground">Clique no goblin para atacar!</p>
                  <p className="text-3xl font-display text-dragon">
                    Dano Causado: <span className="text-4xl font-bold">{goblinDamage}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Atividade 1.3 - Sala do Tesouro */}
            <div 
              className="mb-20 bg-card/50 border-2 border-gold/30 rounded-lg p-8 shadow-gold"
              data-promo-id="challenge_treasure"
              data-promo-name="Sala do Tesouro"
              data-promo-position="challenge_3"
            >
              <h3 className="text-2xl md:text-3xl font-display mb-6 text-gold text-glow-gold">Sala do Tesouro</h3>
              <p className="text-center mb-6 text-muted-foreground">Clique nos baús para revelar tesouros antigos!</p>
              
              {treasureTimer !== null && (
                <div className="mb-6 text-center">
                  <p className="text-lg font-display text-gold mb-2">Próximos tesouros em:</p>
                  <p className="text-4xl font-bold text-glow-gold">
                    {Math.floor(treasureTimer / 60)}:{(treasureTimer % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((chestId) => (
                  <button 
                    key={chestId}
                    className="group relative h-32 bg-background/80 border-2 border-gold/50 rounded-lg p-4 flex flex-col items-center justify-center hover:border-gold hover:bg-gold/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={treasureTimer !== null}
                    onClick={() => {
                      if (chestItems[chestId]) return;
                      
                      const regularItems = [
                        "Elmo de Bronze", "Poção de Vida", "Pergaminho Antigo", "Moedas de Ouro",
                        "Espada Flamejante", "Escudo de Mithril", "Anel Mágico", "Capa da Invisibilidade",
                        "Botas Aladas", "Amuleto de Proteção", "Cristal de Mana", "Grimório Ancestral",
                        "Elixir Raro", "Gema Encantada", "Chave Dourada", "Mapa do Tesouro"
                      ];
                      
                      const kingItems = [
                        "Bússula do Rei", "King's Sword", "Coroa do Rei Louco", "Cálice do Rei",
                        "King's Shield", "Manto do Rei", "Cetro do Rei", "King's Ring"
                      ];

                      const currentItems = Object.values(chestItems);
                      const hasKingItem = currentItems.some(item => 
                        item.includes('Rei') || item.includes('King')
                      );
                      const isLastChest = currentItems.length === 3;

                      let pool = [...regularItems, ...kingItems];
                      
                      // If this is the last chest and we haven't found a king item yet, force one
                      if (isLastChest && !hasKingItem) {
                        pool = kingItems;
                      }

                      const randomItem = pool[Math.floor(Math.random() * pool.length)];
                      const newChestItems = {...chestItems, [chestId]: randomItem};
                      setChestItems(newChestItems);
                      toast.success(`Você encontrou: ${randomItem}!`);
                      window.dataLayer.push({
                        event: 'select_content',
                        content_type: 'treasure_chest',
                        item_id: `chest_${chestId}`,
                        item_name: randomItem
                      });
                      
                      // Check if all chests are opened
                      if (Object.keys(newChestItems).length === 4) {
                        setTreasureTimer(10); // 10 seconds
                        toast.info("Todos os baús foram abertos! Aguarde 10 segundos para novos tesouros.");
                      }
                    }}
                  >
                    {chestItems[chestId] ? (
                      <div className="text-center animate-in fade-in zoom-in duration-500">
                        <div className="text-3xl mb-1">✨</div>
                        <span className="text-xs font-bold text-gold">{chestItems[chestId]}</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎁</div>
                        <span className="text-sm font-bold text-gold">Baú {chestId}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Atividade 1.4 - Ira do Dragão */}
            <div 
              className="bg-card/50 border-2 border-dragon/30 rounded-lg p-8 shadow-deep overflow-hidden relative"
              data-promo-id="challenge_dragon"
              data-promo-name="Ira do Dragão"
              data-promo-position="challenge_4"
            >
              <div className="absolute inset-0 opacity-20">
                <img src="/assets/red-dragon.jpg" alt="Dragão" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-display mb-6 text-dragon">Ira do Dragão</h3>
                <div className="max-w-2xl mx-auto bg-background/90 p-6 rounded-lg border border-dragon/50">
                  <h4 className="text-xl font-display mb-4 text-center">Feitiço de Banimento</h4>
                  <Input
                    type="text"
                    placeholder="Insira o poder numérico (CEP)"
                    value={dragonCep}
                    onChange={(e) => setDragonCep(formatCEP(e.target.value))}
                    maxLength={9}
                    className="mb-4"
                  />
                  <Button variant="arcane" size="lg" onClick={handleDragonSpell} className="w-full mb-4">
                    Lançar Feitiço!
                  </Button>
                  {dragonResult && (
                    <p className={`text-center font-semibold text-lg ${dragonResult.includes('SUCESSO') ? 'text-success' : 'text-destructive'}`}>
                      {dragonResult}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2: A Forja */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl md:text-5xl font-display text-center mb-16 text-glow-arcane">
              A Forja do Grimório Arcano
            </h2>

            {/* Atividade 2.1 - Ponte Quebrada */}
            <div 
              className="mb-12 bg-card/50 border-2 border-primary/30 rounded-lg p-8"
              data-promo-id="forge_bridge"
              data-promo-name="Ponte Quebrada"
              data-promo-position="forge_1"
            >
              <h3 className="text-2xl font-display mb-4">Ponte Quebrada</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <p 
                  id="ponte_quebrada" 
                  className={`text-xl font-semibold ${bridgeFixed ? 'text-success' : 'text-destructive'}`}
                >
                  {bridgeFixed ? "A ponte está segura. Prossiga!" : "O caminho está bloqueado"}
                </p>
                <Button variant={bridgeFixed ? "success" : "arcane"} onClick={handleBridgeRepair} disabled={bridgeFixed}>
                  {bridgeFixed ? "✓ Reparada" : "Reparar"}
                </Button>
              </div>
            </div>

            {/* Atividade 2.2 - Arsenal de Gatilhos */}
            <div 
              className="bg-card/50 border-2 border-gold/30 rounded-lg p-8"
              data-promo-id="forge_arsenal"
              data-promo-name="Arsenal de Gatilhos"
              data-promo-position="forge_2"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-display text-gold">Arsenal de Gatilhos</h3>
                <div className="group relative">
                  <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs font-bold text-primary cursor-help">
                    i
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card border-2 border-primary rounded-lg shadow-arcane opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="text-xs text-center text-muted-foreground">
                      💡 Aventureiro! Use este local para treinar triggers customizados do GTM
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">Escolha sua arma para treinar:</p>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    className="flex flex-col items-center gap-2 p-6 bg-background/80 rounded-lg hover:bg-primary/10 border border-border hover:border-primary transition-all active:scale-95 h-32"
                    data-name="Espada"
                    data-id="weapon_sword"
                    onClick={() => {
                      const damage = Math.floor(Math.random() * 20) + 10;
                      setDamageAmount(damage);
                      setShowDamage(true);
                      setTimeout(() => setShowDamage(false), 1000);
                      toast("⚔️ Slash!", { description: `Você causou ${damage} de dano com a Espada!` });
                      const dummy = document.getElementById('training-dummy');
                      if(dummy) {
                        dummy.classList.add('animate-shake');
                        setTimeout(() => dummy.classList.remove('animate-shake'), 500);
                      }
                    }}
                  >
                    <Sword className="w-12 h-12 text-primary" />
                    <span className="font-display text-sm">Espada</span>
                  </button>
                  <button 
                    className="flex flex-col items-center gap-2 p-6 bg-background/80 rounded-lg hover:bg-destructive/10 border border-border hover:border-destructive transition-all active:scale-95 h-32"
                    data-name="Machado"
                    data-id="weapon_axe"
                    onClick={() => {
                      const damage = Math.floor(Math.random() * 30) + 15;
                      setDamageAmount(damage);
                      setShowDamage(true);
                      setTimeout(() => setShowDamage(false), 1000);
                      toast("🪓 Chop!", { description: `Você causou ${damage} de dano com o Machado!` });
                      const dummy = document.getElementById('training-dummy');
                      if(dummy) {
                        dummy.classList.add('animate-shake');
                        setTimeout(() => dummy.classList.remove('animate-shake'), 500);
                      }
                    }}
                  >
                    <Axe className="w-12 h-12 text-destructive" />
                    <span className="font-display text-sm">Machado</span>
                  </button>
                  <button 
                    className="flex flex-col items-center gap-2 p-6 bg-background/80 rounded-lg hover:bg-success/10 border border-border hover:border-success transition-all active:scale-95 h-32"
                    data-name="Arco"
                    data-id="weapon_bow"
                    onClick={() => {
                      const damage = Math.floor(Math.random() * 15) + 8;
                      setDamageAmount(damage);
                      setShowDamage(true);
                      setTimeout(() => setShowDamage(false), 1000);
                      toast("🏹 Swoosh!", { description: `Você causou ${damage} de dano com o Arco!` });
                      const dummy = document.getElementById('training-dummy');
                      if(dummy) {
                        dummy.classList.add('animate-shake');
                        setTimeout(() => dummy.classList.remove('animate-shake'), 500);
                      }
                    }}
                  >
                    <Crosshair className="w-12 h-12 text-success" />
                    <span className="font-display text-sm">Arco</span>
                  </button>
                </div>
                <div className="flex justify-center relative">
                  {/* Training Dummy - Simple Silhouette */}
                  <div id="training-dummy" className="relative w-48 h-56 transition-transform">
                    {/* Dummy Body - Simple rectangular shape */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-muted/60 to-muted/40 border-4 border-muted-foreground/50 rounded-lg flex items-center justify-center">
                    </div>
                    {/* Dummy Head */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-muted/50 border-4 border-muted-foreground/50 rounded-full"></div>
                  </div>
                  {showDamage && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-bold text-destructive animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none">
                      -{damageAmount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 3: Loja */}
        <section id="product-list-section" className="py-20 px-4 bg-gradient-dark">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-5xl font-display text-center mb-4 text-glow-gold">
              Produtos para o Aventureiro Sábio
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Equipe-se com os melhores itens mágicos do reino
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsData.map(product => (
                <ProductCard
                  key={product.item_id}
                  product={product as Product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-background/50 border-t border-primary/20">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">
              © 2025 A Saga dos Feiticeiros de Dados | Programa de Treinamento em Web Tracking
            </p>
          </div>
        </footer>
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

export default Index;
