import React, { useEffect, useState } from "react";
import { fetchSneakers } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { motion } from "motion/react";
import { ChevronRight, Percent, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AddToCartDialog from "./AddToCartDialog";

export default function PromotionSections() {
  const [offers, setOffers] = useState<Sneaker[]>([]);
  const [preSales, setPreSales] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPromos() {
      const all = await fetchSneakers();
      // filtering by category for now, or you can add specific boolean fields in Supabase later
      const promoItems = all || [];
      setOffers(promoItems.filter(s => s.is_offer === true || s.category?.toLowerCase() === 'oferta').slice(0, 4));
      setPreSales(promoItems.filter(s => s.category?.toLowerCase() === 'preventa').slice(0, 4));
      setLoading(false);
    }
    loadPromos();
  }, []);

  if (loading) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 space-y-32">
        
        {/* Pre-venta Section */}
        <div id="preventa">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <Clock size={24} />
                <span className="font-gotham font-extrabold uppercase tracking-widest text-sm">Próximos lanzamientos</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-gotham font-extrabold leading-[0.8] mb-4">
                PRODUCTOS <br />
                <span className="text-secondary">PRE-VENTA</span>
              </h2>
              <p className="text-neutral-gray max-w-md font-montserrat">
                Asegurá tu stock antes que nadie. Modelos exclusivos que están por ingresar.
              </p>
            </div>
            <Link to="/catalogo?categoria=preventa" className="group flex items-center gap-2 font-gotham font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-sm">
              Ver todos
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {preSales.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {preSales.map((product) => (
                <ProductCard key={product.id} product={product} badge="PRE-VENTA" />
              ))}
            </div>
          ) : (
            <div className="bg-app-bg rounded-[3rem] p-12 text-center border border-dashed border-neutral-200">
              <p className="font-gotham text-xl text-neutral-400 uppercase">Nuevos modelos en camino...</p>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2">Próximamente disponibles para reserva</p>
            </div>
          )}
        </div>

        {/* Ofertas Section */}
        <div id="ofertas">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <Percent size={24} />
                <span className="font-gotham font-extrabold uppercase tracking-widest text-sm">Precios imbatibles</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-gotham font-extrabold leading-[0.8] mb-4">
                DESCUENTOS <br />
                <span className="text-primary">ESPECIALES</span>
              </h2>
              <p className="text-neutral-gray max-w-md font-montserrat">
                Liquidación de stock y oportunidades únicas para maximizar tu rentabilidad.
              </p>
            </div>
            <Link to="/catalogo?categoria=oferta" className="group flex items-center gap-2 font-gotham font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-sm">
              Ver ofertas
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {offers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {offers.map((product) => (
                <ProductCard key={product.id} product={product} badge="OFERTA" />
              ))}
            </div>
          ) : (
            <div className="bg-primary/5 rounded-[3rem] p-12 text-center border border-dashed border-primary/20">
              <p className="font-gotham text-xl text-primary opacity-50 uppercase">Nuevas ofertas cargándose...</p>
              <p className="text-xs text-primary/40 uppercase tracking-widest mt-2">¡Seguinos para no perderte nada!</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

const ProductCard: React.FC<{ product: Sneaker; badge: string }> = ({ product, badge }) => {
  const mainImage = product.imagenes_producto?.[0]?.url;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group flex flex-col h-full"
    >
      <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-app-bg relative mb-4">
        {mainImage ? (
          <img 
            src={getOptimizedImageUrl(mainImage, { width: 400, quality: 75 })} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Percent size={48} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge className="bg-white text-primary font-gotham font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
            {badge}
          </Badge>
          {product.is_offer && product.discount_percentage && (
            <Badge className="bg-primary text-white font-gotham font-bold px-3 py-1 rounded-full text-[8px] tracking-widest shadow-sm">
              -{product.discount_percentage}%
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <h3 className="font-gotham text-lg uppercase leading-tight mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mb-4">
          {product.category === 'preventa' ? (
            <p className="text-[10px] text-neutral-400 font-montserrat uppercase tracking-widest">
              Stock {product.pack_size}p • {product.category || "General"}
            </p>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-gotham font-extrabold text-primary">
                ${product.discount_price?.toLocaleString() || "S/D"}
              </span>
              {product.original_price && (
                <span className="text-[10px] line-through text-neutral-300 font-montserrat">
                  ${product.original_price.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto">
          <AddToCartDialog sneaker={product} isCompact={true} />
        </div>
      </div>
    </motion.div>
  );
}
