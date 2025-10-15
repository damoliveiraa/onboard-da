import { useState, useEffect } from "react";
import { ShoppingCart, Sword, Axe, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { PRODUCTS, Product } from "@/types/products";
import { toast } from "sonner";
import "@/types/datalayer";

import citadelHero from "@/assets/citadel-hero.jpg";
import whisperingGate from "@/assets/whispering-gate.jpg";
import goblinImg from "@/assets/goblin.jpg";
import redDragon from "@/assets/red-dragon.jpg";

const Index = () => {
  const [gateMessage, setGateMessage] = useState("");
  const [goblinDamage, setGoblinDamage] = useState(0);
  const [dragonResult, setDragonResult] = useState("");
  const [dragonCep, setDragonCep] = useState("");
  const [bridgeFixed, setBridgeFixed] = useState(false);
  
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(0);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cep: "",
    address: "",
    guild: "",
    cardNumber: "",
  });

  useEffect(() => {
    // Push view_item_list on mount
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_item_list',
      ecommerce: {
        items: PRODUCTS.map(p => ({
          item_id: p.item_id,
          item_name: p.item_name,
          price: p.price,
          item_category: p.item_category,
        }))
      }
    });
  }, []);

  const handleGateClick = () => {
    setGateMessage("O portão se abre rangendo. A jornada começou!");
    window.dataLayer.push({ event: 'hero_journey_start' });
    toast.success("A aventura começa!");
  };

  const handleGoblinClick = () => {
    const damage = Math.floor(Math.random() * 21);
    setGoblinDamage(damage);
    window.dataLayer.push({ 
      event: 'goblin_attack', 
      damage_dealt: damage 
    });
    toast.info(`Você causou ${damage} de dano no goblin!`);
  };

  const scanTreasures = () => {
    const kingItems = PRODUCTS.filter(p => 
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
        event: 'dragon_battle_attempt', 
        power_level: dragonCep, 
        outcome: 'failure' 
      });
      toast.error("Feitiço falhou!");
      return;
    }
    
    if (cepNum % 2 === 0) {
      setDragonResult("✨ SUCESSO! O dragão foi banido! A magia ressoou em harmonia!");
      window.dataLayer.push({ 
        event: 'dragon_battle_attempt', 
        power_level: dragonCep, 
        outcome: 'success' 
      });
      toast.success("Dragão banido com sucesso!");
    } else {
      setDragonResult("💀 FALHA! O dragão resistiu ao feitiço! Tente um número par.");
      window.dataLayer.push({ 
        event: 'dragon_battle_attempt', 
        power_level: dragonCep, 
        outcome: 'failure' 
      });
      toast.error("O dragão resistiu!");
    }
  };

  const handleBridgeRepair = () => {
    setBridgeFixed(true);
    toast.success("Ponte reparada com sucesso!");
  };

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

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        items: [{
          item_id: product.item_id,
          item_name: product.item_name,
          price: product.price,
          item_category: product.item_category,
        }]
      }
    });
  };

  const handleBeginCheckout = () => {
    const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'GP',
        value: total,
        items: cart.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          item_category: item.item_category,
          quantity: item.quantity || 1,
        }))
      }
    });
    
    setCheckoutStep(1);
    setShowCart(false);
  };

  const handlePurchase = () => {
    const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const transactionId = 'T' + new Date().getTime();
    
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: total,
        tax: 0,
        shipping: 0,
        currency: 'GP',
        items: cart.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          item_category: item.item_category,
          quantity: item.quantity || 1,
        }))
      }
    });
    
    setCheckoutStep(4);
    toast.success("Compra realizada com sucesso!");
  };

  return (
    <div className="min-h-screen">
      {/* Header com Carrinho */}
      <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-primary/30 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-display text-glow-arcane">O Arsenal do Aventureiro</h1>
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
      </header>

      <div className="pt-20">
        {/* Hero Section - Cidadela */}
        <section className="relative h-[70vh] md:h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={citadelHero} alt="Cidadela do Eco Fragmentado" className="w-full h-full object-cover" />
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
            <div className="mb-20 bg-card/50 border-2 border-primary/30 rounded-lg p-8 shadow-arcane">
              <h3 className="text-2xl md:text-3xl font-display mb-6 text-primary">O Portão Sussurrante</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <img src={whisperingGate} alt="Portão Sussurrante" className="w-full rounded-lg shadow-deep" />
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
            <div className="mb-20 bg-card/50 border-2 border-destructive/30 rounded-lg p-8 shadow-deep">
              <h3 className="text-2xl md:text-3xl font-display mb-6 text-destructive">Emboscada Goblin</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <img 
                  src={goblinImg} 
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
            <div className="mb-20 bg-card/50 border-2 border-gold/30 rounded-lg p-8 shadow-gold">
              <h3 className="text-2xl md:text-3xl font-display mb-6 text-gold text-glow-gold">Sala do Tesouro</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {["Elmo de Bronze", "Manopla do Poder Ocular do Rei Thror", "Adaga Enferrujada", 
                  "Botas do King's Guard", "Poção Menor", "Pergaminho do Blacking", "Escudo Antigo", "Anel Simples"].map((item, i) => (
                  <div key={i} className="bg-background/80 border border-border rounded p-4 text-center hover:border-gold/50 transition-colors">
                    <p className="text-sm md:text-base text-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <Button variant="gold" size="lg" onClick={scanTreasures} className="w-full">
                Escanear Tesouros Reais
              </Button>
            </div>

            {/* Atividade 1.4 - Ira do Dragão */}
            <div className="bg-card/50 border-2 border-dragon/30 rounded-lg p-8 shadow-deep overflow-hidden relative">
              <div className="absolute inset-0 opacity-20">
                <img src={redDragon} alt="Dragão" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-display mb-6 text-dragon">Ira do Dragão</h3>
                <div className="max-w-2xl mx-auto bg-background/90 p-6 rounded-lg border border-dragon/50">
                  <h4 className="text-xl font-display mb-4 text-center">Feitiço de Banimento</h4>
                  <Input
                    type="text"
                    placeholder="Insira o poder numérico (CEP)"
                    value={dragonCep}
                    onChange={(e) => setDragonCep(e.target.value)}
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
            <div className="mb-12 bg-card/50 border-2 border-primary/30 rounded-lg p-8">
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
            <div className="bg-card/50 border-2 border-gold/30 rounded-lg p-8">
              <h3 className="text-2xl font-display mb-6 text-gold">Arsenal de Gatilhos</h3>
              <p className="text-muted-foreground mb-6">Clique nas armas para testar os gatilhos do GTM:</p>
              <div className="flex flex-wrap justify-center gap-8">
                <button className="flex flex-col items-center gap-2 p-6 bg-background/80 rounded-lg hover:bg-background border border-border hover:border-primary/50 transition-all">
                  <Sword className="w-16 h-16 text-primary" />
                  <span className="font-display">Espada</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-6 bg-background/80 rounded-lg hover:bg-background border border-border hover:border-primary/50 transition-all">
                  <Axe className="w-16 h-16 text-primary" />
                  <span className="font-display">Machado</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-6 bg-background/80 rounded-lg hover:bg-background border border-border hover:border-primary/50 transition-all">
                  <Crosshair className="w-16 h-16 text-primary" />
                  <span className="font-display">Arco</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 3: Loja */}
        <section className="py-20 px-4 bg-gradient-dark">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-5xl font-display text-center mb-4 text-glow-gold">
              Produtos para o Aventureiro Sábio
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Equipe-se com os melhores itens mágicos do reino
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PRODUCTS.map(product => (
                <ProductCard
                  key={product.item_id}
                  product={product}
                  onAddToCart={addToCart}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Checkout */}
        {checkoutStep > 0 && checkoutStep < 4 && (
          <section className="py-20 px-4 bg-background">
            <div className="container mx-auto max-w-2xl">
              <div className="bg-card border-2 border-primary/30 rounded-lg p-8 shadow-arcane">
                <h2 className="text-3xl font-display mb-8 text-center text-glow-arcane">
                  Checkout - Etapa {checkoutStep} de 3
                </h2>

                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display mb-4">Informações do Aventureiro</h3>
                    <Input placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <Input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <Input placeholder="CEP" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} />
                    <Button variant="arcane" size="lg" className="w-full" onClick={() => setCheckoutStep(2)}>
                      Próxima Etapa
                    </Button>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display mb-4">Informações de Entrega</h3>
                    <Input placeholder="Endereço" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    <Input placeholder="Guilda" value={formData.guild} onChange={e => setFormData({...formData, guild: e.target.value})} />
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCheckoutStep(1)}>Voltar</Button>
                      <Button variant="arcane" size="lg" className="flex-1" onClick={() => setCheckoutStep(3)}>
                        Próxima Etapa
                      </Button>
                    </div>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display mb-4">Pagamento</h3>
                    <Input placeholder="Cartão de Crédito Arcano" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} />
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCheckoutStep(2)}>Voltar</Button>
                      <Button variant="gold" size="lg" className="flex-1" onClick={handlePurchase}>
                        Finalizar Compra
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Confirmação */}
        {checkoutStep === 4 && (
          <section className="py-20 px-4 bg-gradient-dark">
            <div className="container mx-auto max-w-2xl text-center">
              <div className="bg-card border-2 border-success/50 rounded-lg p-12 shadow-gold">
                <h2 className="text-4xl font-display mb-6 text-success text-glow-gold">
                  🎉 Missão Cumprida!
                </h2>
                <p className="text-xl mb-8">Seu pedido foi forjado com sucesso!</p>
                <p className="text-muted-foreground mb-8">
                  ID da Transação: <span className="font-mono text-gold">T{Date.now()}</span>
                </p>
                <Button variant="arcane" onClick={() => {
                  setCheckoutStep(0);
                  setCart([]);
                }}>
                  Voltar à Loja
                </Button>
              </div>
            </div>
          </section>
        )}

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
          onCheckout={handleBeginCheckout}
          onClose={() => setShowCart(false)}
        />
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-card border-2 border-primary/30 rounded-lg p-8 max-w-2xl w-full shadow-arcane" onClick={e => e.stopPropagation()}>
            <div className="grid md:grid-cols-2 gap-8">
              <img src={selectedProduct.image} alt={selectedProduct.item_name} className="w-full rounded-lg shadow-deep" />
              <div>
                <h2 className="text-3xl font-display mb-4 text-glow-arcane">{selectedProduct.item_name}</h2>
                <p className="text-sm text-muted-foreground mb-2">{selectedProduct.item_category}</p>
                <p className="text-foreground mb-6">{selectedProduct.description}</p>
                <p className="text-3xl font-bold text-gold text-glow-gold mb-6">{selectedProduct.price} GP</p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>Fechar</Button>
                  <Button variant="arcane" size="lg" className="flex-1" onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}>
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
