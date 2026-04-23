import { useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { useCart } from "@/src/lib/store";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((acc, item) => acc + item.packs, 0);

  const formatWhatsAppMessage = () => {
    let message = "¡Hola Flywing! 👋 Quisiera realizar el siguiente pedido mayorista:\n\n";
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.category})\n`;
      message += `   🔹 Color: ${item.color}\n`;
      message += `   🔹 Cantidad: ${item.packs} Packs (${item.packs * item.pack_size} pares)\n\n`;
    });
    
    const totalPares = items.reduce((acc, item) => acc + (item.packs * item.pack_size), 0);
    message += `Total de productos: ${items.length}\n`;
    message += `Total de pares: ${totalPares}\n\n`;
    message += "Quedo a la espera de la confirmación de stock y precios. ¡Muchas gracias!";
    
    return encodeURIComponent(message);
  };

  const handleContact = () => {
    const url = `https://wa.me/5491135677101?text=${formatWhatsAppMessage()}`;
    window.open(url, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative text-neutral-600 hover:text-primary">
            <ShoppingCart size={24} />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-[10px]">
                {itemCount}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-anton tracking-widest flex items-center gap-2">
            MI PEDIDO <span className="text-primary">({itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow p-0">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300">
                <ShoppingCart size={40} />
              </div>
              <div>
                <p className="text-neutral-900 font-bold">Tu carrito está vacío</p>
                <p className="text-sm text-neutral-500">Agregá modelos desde el catálogo para iniciar tu pedido.</p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-full border-primary text-primary"
                onClick={() => setIsOpen(false)}
              >
                VER PRODUCTOS
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)] px-6">
              <div className="space-y-6 pt-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}`} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-xl bg-neutral-50 overflow-hidden border border-neutral-100 shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-100">
                          <ShoppingCart size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow py-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-anton text-lg uppercase leading-none group-hover:text-primary transition-colors tracking-wide">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                            {item.category} • {item.pack_size} Pares p/ pack
                          </p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id, item.color)}
                          className="text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-neutral-400">Color:</span>
                          <Badge variant="outline" className="text-[9px] uppercase border-neutral-200">
                            {item.color}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center border border-neutral-200 rounded-full h-8 overflow-hidden">
                          <button 
                            className="px-2 h-full hover:bg-neutral-50 border-r border-neutral-200 transition-colors"
                            onClick={() => updateQuantity(item.id, item.color, Math.max(1, item.packs - 1))}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-bold min-w-[32px] text-center">
                            {item.packs}
                          </span>
                          <button 
                            className="px-2 h-full hover:bg-neutral-50 border-l border-neutral-200 transition-colors"
                            onClick={() => updateQuantity(item.id, item.color, item.packs + 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-neutral-100 flex flex-col gap-3">
            <div className="flex justify-between items-center w-full mb-2">
              <span className="text-xs text-neutral-400 uppercase tracking-widest font-medium">Total Estimado</span>
              <span className="text-xl font-anton text-neutral-900">
                {items.reduce((acc, item) => acc + (item.packs * item.pack_size), 0)} PARES
              </span>
            </div>
            <Button 
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full h-14 font-anton tracking-widest text-lg flex items-center justify-center gap-2"
                onClick={handleContact}
            >
              <MessageSquare size={20} />
              PEDIR POR WHATSAPP
            </Button>
            <Button 
              variant="ghost" 
              className="text-neutral-400 hover:text-red-500 text-[10px] uppercase tracking-widest h-auto p-0"
              onClick={clearCart}
            >
              VACIAR CARRITO
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
