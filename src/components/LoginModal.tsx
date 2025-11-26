import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    guild: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const success = login(formData.email, formData.password);
      if (success) {
        toast.success("Login realizado com sucesso!");
        onClose();
      } else {
        toast.error("Email ou senha incorretos!");
      }
    } else {
      if (!formData.name || !formData.email || !formData.guild || !formData.password) {
        toast.error("Preencha todos os campos!");
        return;
      }
      const success = register(formData.name, formData.email, formData.guild, formData.password);
      if (success) {
        toast.success("Cadastro realizado com sucesso!");
        onClose();
      } else {
        toast.error("Este email já está cadastrado!");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border-2 border-primary/30 rounded-lg p-8 max-w-md w-full shadow-arcane" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-glow-arcane">{isLogin ? "Entrar" : "Cadastrar"}</h2>
          <button onClick={onClose} className="hover:bg-primary/10 p-2 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button 
            variant={isLogin ? "arcane" : "outline"} 
            className="flex-1"
            onClick={() => setIsLogin(true)}
          >
            Login
          </Button>
          <Button 
            variant={!isLogin ? "arcane" : "outline"} 
            className="flex-1"
            onClick={() => setIsLogin(false)}
          >
            Cadastro
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                placeholder="Nome"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <Input
                placeholder="Guilda"
                value={formData.guild}
                onChange={e => setFormData({...formData, guild: e.target.value})}
              />
            </>
          )}
          <Input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input
            placeholder="Senha"
            type="password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <Button variant="arcane" size="lg" className="w-full" type="submit">
            {isLogin ? "Entrar" : "Cadastrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};
