import React, { useEffect, useState } from "react";
import { fetchSneakers } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { motion } from "motion/react";
import { Percent, ShoppingBag, Loader2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AddToCartDialog from "./AddToCartDialog";

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
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <section className="py-24 bg-neutral-50 min-h-screen pt-32">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Percent size={24} />
            <span className="font-gotham font-extrabold uppercase tracking-widest text-sm">Oportunidades únicas</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-gotham font-extrabold leading-[0.8] mb-6">
            HOT <br />
            <span className="text-secondary">OFERTAS</span>
          </h2>
          <p className="text-neutral-gray max-w-md font-montserrat">
            Precios de liquidación para maximizar tu rentabilidad. Stock limitado.
          </p>
        </div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {offers.map((product) => (
              <ProductCardOffer key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-neutral-300">
            <Percent size={64} className="mx-auto text-neutral-200 mb-6" strokeWidth={1} />
            <p className="font-gotham text-xl text-neutral-400 uppercase">No hay ofertas activas en este momento</p>
            <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2">¡Volvé pronto para ver novedades!</p>
          </div>
        )}
      </div>
    </section>
  );
}

const ProductCardOffer: React.FC<{ product: Sneaker }> = ({ product }) => {
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
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.discount_percentage && (
            <Badge className="bg-primary text-white font-gotham font-bold px-3 py-1 rounded-full text-[10px] tracking-widest">
              -{product.discount_percentage}%
            </Badge>
          )}
          <Badge className="bg-white text-primary border border-primary/20 font-gotham font-bold px-3 py-1 rounded-full text-[8px] tracking-widest uppercase shadow-sm">
            Oferta
          </Badge>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-gotham text-lg uppercase leading-tight mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mb-6">
          {product.original_price && (
            <span className="text-xs text-neutral-400 line-through block font-montserrat">
              ${product.original_price.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-gotham font-bold text-primary">
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
