import React, { useEffect, useState } from "react";
import { fetchSneakers } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { motion } from "motion/react";
import { Percent, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddToCartDialog from "./AddToCartDialog";
import { ImageSlider } from "./Catalog";

export default function OfertasSection() {
  const [offers, setOffers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      const all = await fetchSneakers();
      const filtered = all.filter(s => s.is_offer === true);
      setOffers(filtered);
      setLoading(false);
    }
    loadOffers();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3">
              <Percent size={18} />
              <span className="font-gotham font-extrabold uppercase tracking-[0.2em] text-[10px]">
                Oportunidades únicas
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-gotham font-extrabold leading-[0.9] mb-4">
              HOT <br />
              <span className="text-secondary">OFERTAS</span>
            </h2>
            <p className="text-neutral-500 max-w-sm font-montserrat text-sm leading-relaxed">
              Precios de liquidación para maximizar tu rentabilidad. Stock limitado.
            </p>
          </div>
        </div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {offers.map((product) => (
              <ProductCardOffer key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] py-20 text-center border border-dashed border-neutral-200">
            <Percent size={48} className="mx-auto text-neutral-200 mb-4" strokeWidth={1} />
            <p className="font-gotham text-lg text-neutral-400 uppercase">No hay ofertas activas en este momento</p>
          </div>
        )}
      </div>
    </section>
  );
}

const ProductCardOffer: React.FC<{ product: Sneaker }> = ({ product }) => {
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
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.discount_percentage && (
            <Badge className="bg-primary text-white border-none font-gotham font-bold px-2 py-0.5 rounded-full text-[8px] md:text-[9px] tracking-wider w-fit">
              -{product.discount_percentage}%
            </Badge>
          )}
          <Badge className="bg-white text-primary border border-primary/20 font-gotham font-bold px-2 py-0.5 rounded-full text-[7px] md:text-[8px] tracking-wide uppercase shadow-sm w-fit">
            Oferta
          </Badge>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-gotham text-xs md:text-sm uppercase font-bold leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="mb-3">
          {product.original_price && (
            <span className="text-[9px] md:text-[10px] text-neutral-400 line-through block font-montserrat">
              ${product.original_price.toLocaleString()}
            </span>
          )}
          <span className="text-sm md:text-base font-gotham font-bold text-primary">
            ${product.discount_price?.toLocaleString() || "S/D"}
          </span>
        </div>

        <div className="mt-auto">
          <AddToCartDialog sneaker={product} isCompact={true} />
        </div>
      </div>
    </motion.div>
  );
}
