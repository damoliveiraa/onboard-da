import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const GTMSettings = () => {
  const [gtmId, setGtmId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("gtm_id");
    if (savedId) {
      setGtmId(savedId);
      injectGTM(savedId);
    }
  }, []);

  const injectGTM = (id: string) => {
    if (!id.startsWith("GTM-")) return;

    // Remove existing GTM scripts if any
    const existingScript = document.getElementById("gtm-script");
    const existingNoScript = document.getElementById("gtm-noscript");
    if (existingScript) existingScript.remove();
    if (existingNoScript) existingNoScript.remove();

    // Inject Script
    const script = document.createElement("script");
    script.id = "gtm-script";
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${id}');`;
    document.head.appendChild(script);

    // Inject NoScript (Optional, but good practice)
    const noscript = document.createElement("noscript");
    noscript.id = "gtm-noscript";
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  };

  const handleSave = () => {
    if (!gtmId.startsWith("GTM-")) {
      toast.error("ID inválido! Deve começar com 'GTM-'");
      return;
    }
    localStorage.setItem("gtm_id", gtmId);
    injectGTM(gtmId);
    toast.success("GTM configurado com sucesso!");
    setIsOpen(false);
    window.location.reload(); // Reload to ensure clean state
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-glow-arcane">Configuração do GTM</DialogTitle>
          <DialogDescription>
            Insira o ID do seu container do Google Tag Manager para testar o tagueamento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="gtm-id"
              placeholder="GTM-XXXXXX"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              className="col-span-3"
            />
          </div>
          <Button variant="arcane" onClick={handleSave}>
            Salvar e Recarregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
