import React, { useEffect, useState } from "react";
import { fetchSneakers } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { motion } from "motion/react";
import { Clock, Loader2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import AddToCartDialog from "./AddToCartDialog";
import { ImageSlider } from "./Catalog";

export default function PreVentaSection() {
  const [preSales, setPreSales] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreSales() {
      const all = await fetchSneakers();
      // Usamos el fallback [] para evitar errores si la base de datos devuelve null
      const items = all || [];
      const filtered = items.filter(s => s.is_preventa === true);
      setPreSales(filtered);
      setLoading(false);
    }
    loadPreSales();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header más compacto y refinado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3">
              <Clock size={18} />
              <span className="font-gotham font-extrabold uppercase tracking-[0.2em] text-[10px]">
                Próximos ingresos
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-gotham font-extrabold leading-[0.9] mb-4">
              <span className="text-secondary">PRE-VENTA</span>
            </h2>
            <p className="text-neutral-500 max-w-sm font-montserrat text-sm leading-relaxed">
              Asegurá tu stock antes que nadie. Recibí los modelos exclusivos del próximo mes.
            </p>
          </div>
          
          <Link 
            to="/catalogo?preventa=true" 
            className="group flex items-center gap-2 font-gotham font-bold text-primary hover:text-secondary transition-colors uppercase tracking-widest text-xs self-start md:mb-2"
          >
            Ver todo el catálogo
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={14} />
          </Link>
        </div>

        {preSales.length > 0 ? (
          /* Grid ajustado: 2 columnas en móvil, 4 en desktop */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {preSales.map((product) => (
              <ProductCardPreSale key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-[2rem] py-20 text-center border border-dashed border-neutral-200">
            <Clock size={48} className="mx-auto text-neutral-200 mb-4" strokeWidth={1} />
            <p className="font-gotham text-lg text-neutral-400 uppercase">Sin pre-ventas disponibles</p>
          </div>
        )}
      </div>
    </section>
  );
}

const ProductCardPreSale: React.FC<{ product: Sneaker }> = ({ product }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[1.5rem] overflow-hidden border border-neutral-100 flex flex-col h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="relative">
        <ImageSlider 
          images={product.imagenes_producto || []} 
          productName={product.name} 
          className="h-32 md:h-48"
        />
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge className="bg-primary text-white border-none font-gotham font-bold px-2 py-0.5 rounded-full text-[8px] md:text-[9px] tracking-wider uppercase shadow-sm">
            Reservar
          </Badge>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-gotham text-xs md:text-sm uppercase font-bold leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-[8px] md:text-[9px] text-neutral-400 font-montserrat uppercase tracking-widest mb-3">
          Pack {product.pack_size}p • {product.category || 'Sneakers'}
        </p>

        <div className="mt-auto">
          <AddToCartDialog sneaker={product} isCompact={true} />
        </div>
      </div>
    </motion.div>
  );
}
