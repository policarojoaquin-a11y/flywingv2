import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Package, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSneakers } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { getOptimizedImageUrl } from "@/lib/utils";

export default function Hero() {
  const [featuredSneakers, setFeaturedSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadFeatured() {
      const sneakers = await fetchSneakers();
      // Only keep sneakers that have images
      const withImages = sneakers.filter(s => s.imagenes_producto && s.imagenes_producto.length > 0);
      setFeaturedSneakers(withImages.slice(0, 5));
      setLoading(false);
    }
    loadFeatured();
  }, []);

  useEffect(() => {
    if (featuredSneakers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredSneakers.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredSneakers]);

  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-12 translate-x-1/4 z-0" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Package size={14} />
              Venta Exclusiva Mayorista
            </div>
            <h1 className="text-5xl md:text-8xl font-anton leading-[0.9] text-neutral-900 mb-6">
              IMPULSÁ TU <span className="text-primary">NEGOCIO</span> CON FLYWING
            </h1>
            <p className="text-base md:text-lg text-neutral-gray font-montserrat max-w-lg mb-8 leading-relaxed">
              Catálogo actualizado con las últimas tendencias en calzado. 
              Packs curados por talle y modelo para maximizar tu rotación de stock.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/catalogo" className="w-full sm:w-auto">
                <Button id="hero-cta-catalog" className="w-full bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-full text-lg group">
                  VER CATÁLOGO
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contacto" className="w-full sm:w-auto">
                <Button id="hero-cta-contact" variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10 h-14 px-8 rounded-full text-lg">
                  MÍNIMO DE COMPRA
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-neutral-100 pt-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary">
                  <Truck size={18} />
                  <span className="font-anton text-lg md:text-xl">ENVÍOS</span>
                </div>
                <span className="text-[10px] md:text-xs text-neutral-gray font-poppins uppercase">A todo el país</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary">
                  <Package size={18} />
                  <span className="font-anton text-lg md:text-xl">PACKS</span>
                </div>
                <span className="text-[10px] md:text-xs text-neutral-gray font-poppins uppercase">Por talle/modelo</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2 md:col-span-1 border-t border-neutral-100 pt-4 md:border-none md:pt-0">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck size={18} />
                  <span className="font-anton text-lg md:text-xl">CALIDAD</span>
                </div>
                <span className="text-[10px] md:text-xs text-neutral-gray font-poppins uppercase">Garantizada</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-all duration-700 bg-neutral-100 aspect-[4/3] md:aspect-video flex flex-col items-center justify-center text-neutral-400 border border-neutral-200">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 px-12 text-center"
                  >
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <div>
                      <p className="font-anton text-xl text-neutral-800 uppercase tracking-tighter">Cargando catálogo...</p>
                      <p className="text-[10px] uppercase tracking-widest font-medium text-neutral-500">Preparando exclusivas</p>
                    </div>
                  </motion.div>
                ) : featuredSneakers.length > 0 ? (
                  <motion.div
                    key={featuredSneakers[currentIndex].id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img 
                      src={getOptimizedImageUrl(featuredSneakers[currentIndex].imagenes_producto[0].url, { width: 800, quality: 80 })} 
                      alt={featuredSneakers[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold tracking-widest uppercase mb-2 rounded-full">
                          {featuredSneakers[currentIndex].category || "Novedad"}
                        </span>
                        <h3 className="text-white font-anton text-2xl md:text-4xl uppercase leading-none">
                          {featuredSneakers[currentIndex].name}
                        </h3>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Package size={64} strokeWidth={1} className="mb-4" />
                    <p className="font-anton text-2xl uppercase tracking-tighter">Espacio para Foto del Local</p>
                    <p className="text-[10px] uppercase tracking-widest font-medium">Próximamente</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Gallery Navigation Dots */}
            {!loading && featuredSneakers.length > 1 && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {featuredSneakers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      i === currentIndex ? "w-8 bg-primary" : "w-2 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
