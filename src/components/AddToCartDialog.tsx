import React, { useState } from "react";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { Sneaker } from "@/src/types";
import { useCart } from "@/src/lib/store";
import { trackEvent } from "@/src/lib/tracking";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

interface AddToCartDialogProps {
  sneaker: Sneaker;
  isCompact?: boolean;
}

export default function AddToCartDialog({ sneaker, isCompact = false }: AddToCartDialogProps) {
  const [selectedColor, setSelectedColor] = useState(sneaker.colors?.[0] || "");
  const [packs, setPacks] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const { addItem } = useCart();

  // Find image for selected color
  const colorImage = sneaker.imagenes_producto?.find(img => img.color_variante === selectedColor)?.url 
    || sneaker.imagenes_producto?.[0]?.url;

  const handleAdd = () => {
    addItem({
      id: sneaker.id,
      name: sneaker.name,
      color: selectedColor,
      packs: packs,
      pack_size: sneaker.pack_size,
      category: sneaker.category,
      imageUrl: colorImage
    });
    
    // Tracking Meta Pixel
    trackEvent("AddToCart", {
      content_name: sneaker.name,
      content_category: sneaker.category,
      content_ids: [sneaker.id],
      content_type: "product",
      value: sneaker.discount_price || 0,
      currency: "ARS"
    });
    
    setIsOpen(false);
    setPacks(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className={`w-full bg-primary hover:bg-primary/90 text-white rounded-full font-gotham font-bold tracking-widest flex items-center justify-center gap-2 ${isCompact ? 'h-10 text-xs md:h-12 md:text-base' : 'h-14 text-lg'}`}>
            <ShoppingBag size={isCompact ? 14 : 18} />
            {isCompact ? 'COMPRAR' : 'COMPRAR AHORA'}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-gotham font-bold tracking-widest text-neutral-900">
            PERSONALIZAR <span className="text-primary">PEDIDO</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 md:py-8 space-y-6 md:space-y-8">
          <div className="flex gap-4 items-center p-3 md:p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-neutral-200">
              {colorImage && (
                <img 
                  src={getOptimizedImageUrl(colorImage, { width: 200, quality: 70 })} 
                  alt={sneaker.name} 
                  className="w-full h-full object-cover transition-all duration-300"
                  decoding="async"
                />
              )}
            </div>
            <div>
              <h4 className="font-gotham font-bold text-xl uppercase leading-none mb-1 tracking-wide">{sneaker.name}</h4>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{sneaker.category} • {sneaker.pack_size} pares x pack</p>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Elegir Color</label>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {sneaker.colors?.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                    selectedColor === color 
                    ? "bg-primary text-white border-primary shadow-md scale-105" 
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-primary"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Cantidad de Packs</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
              <div className="flex items-center border border-neutral-200 rounded-full h-10 md:h-12 overflow-hidden bg-white">
                <button 
                  className="px-3 md:px-4 h-full hover:bg-neutral-50 border-r border-neutral-200 transition-colors"
                  onClick={() => setPacks(Math.max(1, packs - 1))}
                >
                  <Minus size={14} />
                </button>
                <div className="px-4 md:px-6 text-base md:text-lg font-bold min-w-[50px] md:min-w-[60px] text-center">
                  {packs}
                </div>
                <button 
                  className="px-3 md:px-4 h-full hover:bg-neutral-50 border-l border-neutral-200 transition-colors"
                  onClick={() => setPacks(packs + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-sm">
                <p className="font-bold text-neutral-900">{packs * sneaker.pack_size} Pares en total</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Mínimo 1 pack</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start pt-4 border-t border-neutral-100">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 md:h-16 font-gotham font-bold tracking-widest text-base md:text-xl"
            onClick={handleAdd}
          >
            AGREGAR AL CARRITO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
