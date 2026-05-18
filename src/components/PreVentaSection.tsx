import React, { useEffect, useState } from "react";
import { fetchSneakers } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { motion } from "motion/react";
import { Clock, ShoppingBag, Loader2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AddToCartDialog from "./AddToCartDialog";

export default function PreVentaSection() {
  const [preSales, setPreSales] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreSales() {
      const all = await fetchSneakers();
      const filtered = all.filter(s => s.is_preventa === true);
      setPreSales(filtered);
      setLoading(false);
    }
    loadPreSales();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <section className="py-24 bg-white min-h-screen pt-32">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Clock size={24} />
            <span className="font-gotham font-extrabold uppercase tracking-widest text-sm">Próximos ingresos</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-gotham font-extrabold leading-[0.8] mb-6">
            ZONAS DE <br />
            <span className="text-secondary">PRE-VENTA</span>
          </h2>
          <p className="text-neutral-gray max-w-md font-montserrat">
            Asegurá tu stock antes que nadie. Recibí los modelos exclusivos del próximo mes.
          </p>
        </div>

        {preSales.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {preSales.map((product) => (
              <ProductCardPreSale key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-[3rem] p-24 text-center border border-dashed border-neutral-200">
            <Clock size={64} className="mx-auto text-neutral-200 mb-6" strokeWidth={1} />
            <p className="font-gotham text-xl text-neutral-400 uppercase">Sin pre-ventas disponibles</p>
            <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2">¡Nuevos modelos próximamente!</p>
          </div>
        )}
      </div>
    </section>
  );
}

const ProductCardPreSale: React.FC<{ product: Sneaker }> = ({ product }) => {
  const mainImage = product.imagenes_producto?.[0]?.url;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-lg border border-neutral-100 flex flex-col h-full"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        {mainImage ? (
          <img 
            src={getOptimizedImageUrl(mainImage, { width: 400, quality: 75 })} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className="bg-secondary text-white font-gotham font-bold px-3 py-1 rounded-full text-[9px] tracking-widest uppercase shadow-sm">
            Reservar
          </Badge>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-gotham text-lg uppercase leading-tight mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-[10px] text-neutral-400 font-montserrat uppercase tracking-[0.2em] mb-6">
          Pack {product.pack_size}p • {product.category}
        </p>

        <div className="mt-auto">
          <AddToCartDialog sneaker={product} isCompact={true} />
        </div>
      </div>
    </motion.div>
  );
}
