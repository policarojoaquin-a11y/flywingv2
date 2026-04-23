import { motion } from "motion/react";
import { MessageCircle, Info, Loader2, ShoppingBag, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Sneaker } from "@/src/types";
import { fetchSneakers } from "@/src/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSearchParams } from "react-router-dom";

import { useCart } from "@/src/lib/store";
import { trackEvent } from "@/src/lib/tracking";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";

const COLOR_MAP: Record<string, string> = {
  "negro": "#000000",
  "blanco": "#FFFFFF",
  "gris": "#9CA3AF",
  "rojo": "#EF4444",
  "azul": "#3B82F6",
  "verde": "#22C55E",
  "amarillo": "#EAB308",
  "rosa": "#EC4899",
  "fucsia": "#D946EF",
  "violeta": "#8B5CF6",
  "purpura": "#A855F7",
  "marron": "#78350F",
  "beige": "#F5F5DC",
  "arena": "#D2B48C",
  "suela": "#A36A00",
  "bordo": "#800000",
  "celeste": "#7DD3FC",
  "naranja": "#F97316",
};

const ColorSwatch = (props: { colorName: string; [key: string]: any }) => {
  const { colorName } = props;
  const normalized = colorName.toLowerCase().trim();
  // Handle combined colors like "Negro/Blanco"
  const colors = normalized.includes("/") ? normalized.split("/") : [normalized];
  
  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] bg-white border-neutral-200 hover:border-primary transition-colors group/color"
    >
      <div className="flex -space-x-1">
        {colors.map((c, i) => {
          const colorCode = COLOR_MAP[c] || "#E5E7EB";
          return (
            <div 
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-neutral-200" 
              style={{ backgroundColor: colorCode }}
              title={c}
            />
          );
        })}
      </div>
      <span className="text-neutral-600 font-medium">{colorName}</span>
    </Badge>
  );
};

const ImageSlider = ({ images, productName }: { images: any[], productName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-40 md:h-72 bg-neutral-100 flex flex-col items-center justify-center gap-2 text-neutral-400">
        <ShoppingBag size={24} md:size={48} strokeWidth={1} />
        <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-medium">Imagen en proceso</span>
      </div>
    );
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative group/slider w-full h-40 md:h-72 overflow-hidden">
      <img
        src={images[currentIndex].url}
        alt={`${productName} - vista ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-neutral-800 opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-neutral-800 opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-1 rounded-full transition-all ${i === currentIndex ? 'bg-primary w-3' : 'bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function Catalog() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("categoria")?.toUpperCase() || "TODOS";

  const setFilter = (newFilter: string) => {
    if (newFilter === "TODOS") {
      searchParams.delete("categoria");
    } else {
      searchParams.set("categoria", newFilter.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    async function getSneakers() {
      setLoading(true);
      try {
        const data = await fetchSneakers();
        console.log("Sneakers loaded:", data);
        setSneakers(data);
      } catch (err) {
        console.error("Error in component:", err);
      } finally {
        setLoading(false);
      }
    }
    getSneakers();
  }, []);

  const filteredSneakers = sneakers.filter(s => {
    const matchesCategory = filter === "TODOS" || s.category.toUpperCase() === filter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["TODOS", "CASUAL", "DEPORTIVA", "ELASTIZADA", "BOTA"];

  return (
    <section id="catalogo" className="py-12 md:py-24 pt-24 md:pt-32 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl mb-4 font-anton tracking-tight text-neutral-900 leading-[0.9]">NUESTRO <span className="text-primary">CATÁLOGO</span></h2>
            <p className="text-neutral-gray max-w-md font-poppins text-sm md:text-base">
              Explorá nuestra colección exclusiva para mayoristas directamente desde nuestra base de datos.
            </p>
          </div>
          <div className="flex flex-col gap-4 items-stretch md:items-end w-full md:w-auto">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                placeholder="Buscar modelo..." 
                className="pl-10 pr-10 rounded-full border-neutral-200 focus:border-primary transition-all bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                   onClick={() => setSearchQuery("")}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 justify-start md:justify-end">
              {categories.map((cat) => (
                <Badge 
                  key={cat}
                  variant={filter === cat ? "default" : "outline"} 
                  className={`cursor-pointer px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] md:text-[10px] transition-all duration-300 shrink-0 snap-start ${
                    filter === cat 
                      ? "bg-primary text-white border-primary shadow-md transform scale-105" 
                      : "bg-white text-neutral-gray border-neutral-200 hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === "DEPORTIVA" ? "DEPORTIVAS" : cat === "ELASTIZADA" ? "ELASTIZADAS" : cat === "BOTA" ? "BOTAS" : cat === "TODOS" ? "TODOS" : cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-neutral-gray font-poppins">Cargando catálogo...</p>
          </div>
        ) : filteredSneakers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-neutral-300 shadow-inner">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-50 mb-6 text-neutral-300">
              <ShoppingBag size={40} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-anton text-neutral-900 mb-4 tracking-wide uppercase">No encontramos modelos</h3>
            <p className="text-neutral-gray font-poppins max-w-sm mx-auto">
              Probá ajustando los filtros o la búsqueda para encontrar lo que necesitás.
            </p>
            {(searchQuery || filter !== "TODOS") && (
              <Button 
                variant="link" 
                className="mt-6 text-primary font-anton uppercase tracking-widest text-xs"
                onClick={() => { setSearchQuery(""); setFilter("TODOS"); }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {filteredSneakers.map((sneaker, index) => {
              const hasImages = sneaker.imagenes_producto && sneaker.imagenes_producto.length > 0;
              const mainImage = hasImages ? sneaker.imagenes_producto![0].url : null;
              
              return (
                <motion.div
                  key={sneaker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group border-none shadow-sm md:shadow-lg hover:shadow-xl transition-shadow overflow-hidden bg-white h-full flex flex-col rounded-2xl md:rounded-3xl">
                    <CardHeader className="p-0 relative overflow-hidden">
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                        <Badge className="bg-primary text-white font-poppins text-[8px] md:text-[10px] px-1.5 py-0 md:px-2.5 md:py-0.5 uppercase tracking-tighter">
                          {sneaker.category}
                        </Badge>
                      </div>
                      
                      <ImageSlider images={sneaker.imagenes_producto || []} productName={sneaker.name} />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 flex-grow">
                      <CardTitle className="text-sm md:text-2xl mb-1 md:mb-2 font-anton uppercase tracking-wide group-hover:text-primary transition-colors line-clamp-1">
                        {sneaker.name}
                      </CardTitle>
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between text-[10px] md:text-xs border-b border-neutral-100 pb-1 md:pb-2">
                          <span className="text-neutral-gray font-medium uppercase tracking-widest">Talles</span>
                          <span className="font-bold text-neutral-900">{sneaker.sizes || "S/D"}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-xs border-b border-neutral-100 pb-1 md:pb-2">
                          <span className="text-neutral-gray font-medium uppercase tracking-widest">Pack</span>
                          <span className="font-bold text-primary">{sneaker.pack_size ? `${sneaker.pack_size}p` : "S/D"}</span>
                        </div>
                        <div className="pt-1 md:pt-2 hidden md:block">
                          <span className="text-[10px] text-neutral-gray uppercase tracking-widest block mb-1.5 font-semibold">Colores</span>
                          <div className="flex flex-wrap gap-1">
                            {sneaker.colors?.slice(0, 3).map(color => (
                              <ColorSwatch key={color} colorName={color} />
                            ))}
                            {sneaker.colors && sneaker.colors.length > 3 && (
                              <span className="text-[8px] text-neutral-400">+{sneaker.colors.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 md:p-6 pt-0">
                      <AddToCartDialog sneaker={sneaker} isCompact={true} />
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 md:mt-16 bg-primary text-white rounded-[2rem] md:rounded-3xl p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl md:text-4xl mb-3 md:mb-4 font-anton tracking-tight">¿BUSCÁS UN MODELO ESPECÍFICO?</h3>
            <p className="font-poppins opacity-90 leading-relaxed text-sm md:text-base">
              Si no encontrás lo que buscás en nuestro catálogo, contactanos. 
              Trabajamos con pedidos personalizados para grandes volúmenes.
            </p>
          </div>
          <Button variant="secondary" className="w-full md:w-auto h-12 md:h-14 px-8 md:px-10 rounded-full text-primary font-anton tracking-widest text-base md:text-lg hover:bg-white transition-all shadow-lg hover:shadow-xl active:scale-95">
            HABLAR CON UN ASESOR
          </Button>
        </div>
      </div>
    </section>
  );
}

function AddToCartDialog({ sneaker, isCompact = false }: { sneaker: Sneaker, isCompact?: boolean }) {
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
      value: 0, // Optionally add price if available
      currency: "ARS"
    });
    
    setIsOpen(false);
    setPacks(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className={`w-full bg-primary hover:bg-primary/90 text-white rounded-full font-anton tracking-widest flex items-center justify-center gap-2 ${isCompact ? 'h-10 text-xs md:h-12 md:text-base' : 'h-14 text-lg'}`}>
            <ShoppingBag size={isCompact ? 14 : 18} />
            {isCompact ? 'COMPRAR' : 'COMPRAR AHORA'}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-anton tracking-widest text-neutral-900">
            PERSONALIZAR <span className="text-primary">PEDIDO</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 md:py-8 space-y-6 md:space-y-8">
          <div className="flex gap-4 items-center p-3 md:p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-neutral-200">
              {colorImage && (
                <img src={colorImage} alt={sneaker.name} className="w-full h-full object-cover transition-all duration-300" />
              )}
            </div>
            <div>
              <h4 className="font-anton text-xl uppercase leading-none mb-1 tracking-wide">{sneaker.name}</h4>
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
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 md:h-16 font-anton tracking-widest text-base md:text-xl"
            onClick={handleAdd}
          >
            AGREGAR AL CARRITO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
