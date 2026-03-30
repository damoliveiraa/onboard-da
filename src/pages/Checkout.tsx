import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginModal } from "@/components/LoginModal";
import { toast } from "sonner";
import "@/types/datalayer";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    guild: "",
    cep: "",
    address: "",
    cidade: "",
    numero: "",
    cardNumber: "",
  });

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        guild: user.guild,
      }));
      
      // Load saved address if exists
      const savedAddress = localStorage.getItem(`address_${user.email}`);
      if (savedAddress) {
        const addressData = JSON.parse(savedAddress);
        setFormData(prev => ({
          ...prev,
          ...addressData,
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
      toast.error("Seu inventário está vazio!");
    }
  }, [cart, navigate]);

  useEffect(() => {
    // Push virtualPageView on step change
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtualPageView',
      page_title: `Checkout - Step ${step}`,
      page_path: `/checkout/step-${step}`
    });

    if (step === 1) {
      // Push begin_checkout event when entering step 1
      window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BRL',
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
    }
  }, [step, total, cart]);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const fetchAddressFromCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          address: data.street || '',
          cidade: data.city || '',
        }));
        toast.success("Endereço preenchido automaticamente!");
      } else {
        toast.error("CEP não encontrado!");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleStep1Next = () => {
    const errors: {[key: string]: boolean} = {};
    if (!formData.name) errors.name = true;
    if (!formData.email) errors.email = true;
    if (!validateEmail(formData.email)) errors.email = true;
    if (!formData.guild) errors.guild = true;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("Por favor, preencha todos os campos corretamente!");
      return;
    }
    setValidationErrors({});
    setStep(2);
  };

  const handleStep2Next = () => {
    const errors: {[key: string]: boolean} = {};
    if (!formData.cep) errors.cep = true;
    if (!formData.address) errors.address = true;
    if (!formData.cidade) errors.cidade = true;
    if (!formData.numero) errors.numero = true;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("Por favor, preencha todas as informações de entrega!");
      return;
    }
    
    setValidationErrors({});

    window.dataLayer.push({
      event: 'add_address_info',
      ecommerce: {
        currency: 'BRL',
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
    setStep(3);
  };

  const handlePurchase = () => {
    const errors: {[key: string]: boolean} = {};
    if (!formData.cardNumber) errors.cardNumber = true;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("Por favor, insira os dados do pagamento!");
      return;
    }
    
    setValidationErrors({});

    // Fire add_shipping_info before purchase
    window.dataLayer.push({
      event: 'add_shipping_info',
      ecommerce: {
        currency: 'BRL',
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

    const transactionId = 'T' + new Date().getTime();
    
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: total,
        tax: 0,
        shipping: 0,
        currency: 'BRL',
        items: cart.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          item_category: item.item_category,
          quantity: item.quantity || 1,
        }))
      }
    });
    
    clearCart();
    
    // Save address for logged-in users
    if (user) {
      const addressData = {
        cep: formData.cep,
        address: formData.address,
        cidade: formData.cidade,
        numero: formData.numero,
      };
      localStorage.setItem(`address_${user.email}`, JSON.stringify(addressData));
    }
    
    navigate("/thank-you", { state: { transactionId, cart, total } });
    toast.success("Compra realizada com sucesso!");
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-card border-2 border-primary/30 rounded-lg p-8 shadow-arcane">
          <h2 className="text-3xl font-display mb-4 text-center text-glow-arcane">
            Checkout - Etapa {step} de 3
          </h2>

          {/* Cart Summary */}
          <div className="mb-8 p-4 bg-background/50 rounded border border-border">
            <h3 className="font-display text-lg mb-2 text-gold">Resumo do Pedido</h3>
            <ul className="space-y-1 text-sm text-muted-foreground mb-2">
              {cart.map(item => (
                <li key={item.item_id} className="flex justify-between">
                  <span>{item.quantity || 1}x {item.item_name}</span>
                  <span>{item.price * (item.quantity || 1)} BRL</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
              <span>Total:</span>
              <span className="text-gold">{total} BRL</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-display mb-4">Informações do Aventureiro</h3>
              
              {!user && (
                <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Já tem uma conta?</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Fazer Login
                  </Button>
                </div>
              )}
              
              <Input 
                placeholder="Nome" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className={validationErrors.name ? 'border-destructive' : ''}
                disabled={!!user}
              />
              <Input 
                placeholder="Email" 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={validationErrors.email ? 'border-destructive' : ''}
                disabled={!!user}
              />
              <Input 
                placeholder="Guilda" 
                value={formData.guild} 
                onChange={e => setFormData({...formData, guild: e.target.value})}
                className={validationErrors.guild ? 'border-destructive' : ''}
                disabled={!!user}
              />
              <Button variant="arcane" size="lg" className="w-full" onClick={handleStep1Next}>
                Próxima Etapa
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-display mb-4">Informações de Entrega</h3>
              <Input 
                placeholder="CEP" 
                value={formData.cep} 
                onChange={e => {
                  const formatted = formatCEP(e.target.value);
                  setFormData({...formData, cep: formatted});
                  if (formatted.replace(/\D/g, '').length === 8) {
                    fetchAddressFromCEP(formatted);
                  }
                }}
                maxLength={9}
                className={validationErrors.cep ? 'border-destructive' : ''}
              />
              <Input 
                placeholder="Endereço" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                className={validationErrors.address ? 'border-destructive' : ''}
              />
              <Input 
                placeholder="Cidade" 
                value={formData.cidade} 
                onChange={e => setFormData({...formData, cidade: e.target.value})}
                className={validationErrors.cidade ? 'border-destructive' : ''}
              />
              <Input 
                placeholder="Número" 
                value={formData.numero} 
                onChange={e => setFormData({...formData, numero: e.target.value})}
                className={validationErrors.numero ? 'border-destructive' : ''}
              />
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button variant="arcane" size="lg" className="flex-1" onClick={handleStep2Next}>
                  Próxima Etapa
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-display mb-4">Pagamento</h3>
              <Input 
                placeholder="Cartão de Crédito Arcano" 
                value={formData.cardNumber} 
                onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                className={validationErrors.cardNumber ? 'border-destructive' : ''}
              />
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button variant="gold" size="lg" className="flex-1" onClick={handlePurchase}>
                  Finalizar Compra
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default Checkout;
