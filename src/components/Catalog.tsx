import { motion } from "motion/react";
import { MessageCircle, Info, Loader2, ShoppingBag, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Sneaker } from "@/src/types";
import { fetchSneakers } from "@/src/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSearchParams } from "react-router-dom";

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

const ColorSwatch = ({ colorName }: { colorName: string }) => {
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
    <section id="catalogo" className="py-24 pt-32 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-5xl md:text-6xl mb-4">NUESTRO <span className="text-primary">CATÁLOGO</span></h2>
            <p className="text-neutral-gray max-w-md font-poppins">
              Explorá nuestra colección exclusiva para mayoristas directamente desde nuestra base de datos.
            </p>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                placeholder="Buscar modelo..." 
                className="pl-10 pr-10 rounded-full border-neutral-200 focus:border-primary transition-all"
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
            <div className="flex flex-wrap gap-2 justify-end">
              {categories.map((cat) => (
                <Badge 
                  key={cat}
                  variant={filter === cat ? "default" : "outline"} 
                  className={`cursor-pointer px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] transition-all duration-300 ${
                    filter === cat 
                      ? "bg-primary text-white border-primary shadow-md transform scale-105" 
                      : "bg-white text-neutral-gray border-neutral-200 hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === "DEPORTIVA" ? "DEPORTIVAS" : cat === "ELASTIZADA" ? "ELASTIZADAS" : cat === "BOTA" ? "BOTAS" : cat === "TODOS" ? "TODOS LOS PRODUCTOS" : cat}
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
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No encontramos modelos</h3>
            <p className="text-neutral-gray font-poppins max-w-sm mx-auto">
              Probá ajustando los filtros o la búsqueda para encontrar lo que necesitás.
            </p>
            {(searchQuery || filter !== "TODOS") && (
              <Button 
                variant="link" 
                className="mt-4 text-primary font-bold"
                onClick={() => { setSearchQuery(""); setFilter("TODOS"); }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Card className="group border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden bg-white h-full flex flex-col">
                    <CardHeader className="p-0 relative overflow-hidden">
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-primary text-white font-poppins text-[10px] uppercase tracking-tighter">
                          {sneaker.category}
                        </Badge>
                      </div>
                      
                      {hasImages ? (
                        <img
                          src={mainImage!}
                          alt={sneaker.name}
                          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-72 bg-neutral-100 flex flex-col items-center justify-center gap-3 text-neutral-400">
                          <ShoppingBag size={48} strokeWidth={1} />
                          <span className="text-[10px] uppercase tracking-widest font-medium">Imagen en proceso</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6 flex-grow">
                      <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                        {sneaker.name}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                          <span className="text-neutral-gray font-medium uppercase tracking-widest">Talles</span>
                          <span className="font-bold text-neutral-900">{sneaker.sizes || "Consultar"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                          <span className="text-neutral-gray font-medium uppercase tracking-widest">Pack</span>
                          <span className="font-bold text-primary">{sneaker.pack_size ? `${sneaker.pack_size} Pares` : "Consultar"}</span>
                        </div>
                        <div className="pt-2">
                          <span className="text-[10px] text-neutral-gray uppercase tracking-widest block mb-1.5 font-semibold">Colores Disponibles</span>
                          <div className="flex flex-wrap gap-1.5">
                            {sneaker.colors?.map(color => (
                              <ColorSwatch key={color} colorName={color} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button 
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full py-6 font-bold flex items-center justify-center gap-2"
                        onClick={() => window.open(`https://wa.me/5491135677101?text=Hola! Me interesa el modelo ${sneaker.name}`, '_blank')}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.876 9.88-9.876a9.88 9.88 0 019.874 9.88c-.001 5.447-4.431 9.878-9.88 9.878m0-21.821C6.47 0 1.617 4.852 1.615 10.858c0 1.919.499 3.791 1.447 5.432L0 24l7.335-1.924a10.84 10.84 0 005.14 1.292h.005c6.012 0 10.864-4.853 10.866-10.86 0-2.912-1.133-5.649-3.191-7.707A10.81 10.81 0 0012.051 0z"/>
                        </svg>
                        CONSULTAR PRECIO
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-16 bg-primary text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-3xl md:text-4xl mb-4">¿BUSCÁS UN MODELO ESPECÍFICO?</h3>
            <p className="font-poppins opacity-90">
              Si no encontrás lo que buscás en nuestro catálogo, contactanos. 
              Trabajamos con pedidos personalizados para grandes volúmenes.
            </p>
          </div>
          <Button variant="secondary" className="h-14 px-10 rounded-full text-primary font-bold text-lg hover:bg-white transition-colors">
            HABLAR CON UN ASESOR
          </Button>
        </div>
      </div>
    </section>
  );
}
