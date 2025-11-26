import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId || 'T' + Date.now();
  const cart = location.state?.cart || [];
  const total = location.state?.total || 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border-2 border-primary/30 rounded-lg p-8 shadow-arcane text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-display mb-4 text-glow-arcane">Missão Cumprida!</h2>
        <p className="text-muted-foreground mb-2">Sua compra foi realizada com sucesso!</p>
        <p className="text-sm text-muted-foreground mb-8">ID da Transação: <span className="font-mono text-gold">{transactionId}</span></p>
        
        {cart.length > 0 && (
          <div className="mb-8 p-6 bg-background/50 rounded border border-border text-left">
            <h3 className="font-display text-lg mb-4 text-gold text-center">Resumo da Compra</h3>
            <ul className="space-y-2 mb-4">
              {cart.map((item: any) => (
                <li key={item.item_id} className="flex justify-between text-sm">
                  <span>{item.quantity || 1}x {item.item_name}</span>
                  <span className="text-gold">{item.price * (item.quantity || 1)} GP</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-4">
              <span>Total:</span>
              <span className="text-gold text-glow-gold">{total} GP</span>
            </div>
          </div>
        )}
        
        <Button variant="arcane" size="lg" onClick={() => navigate("/")}>
          Voltar à Loja
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
