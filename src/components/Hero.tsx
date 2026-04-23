import { motion } from "motion/react";
import { ArrowRight, Package, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Hero() {
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
            <h1 className="text-6xl md:text-8xl font-anton leading-[0.9] text-neutral-900 mb-6">
              IMPULSÁ TU <span className="text-primary">NEGOCIO</span> CON FLYWING
            </h1>
            <p className="text-lg text-neutral-gray font-montserrat max-w-lg mb-8 leading-relaxed">
              Catálogo actualizado con las últimas tendencias en calzado. 
              Packs curados por talle y modelo para maximizar tu rotación de stock.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/catalogo">
                <Button className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-full text-lg group">
                  VER CATÁLOGO
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contacto">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 h-14 px-8 rounded-full text-lg">
                  MÍNIMO DE COMPRA
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-neutral-100 pt-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary">
                  <Truck size={18} />
                  <span className="font-anton text-xl">ENVÍOS</span>
                </div>
                <span className="text-xs text-neutral-gray font-poppins uppercase">A todo el país</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary">
                  <Package size={18} />
                  <span className="font-anton text-xl">PACKS</span>
                </div>
                <span className="text-xs text-neutral-gray font-poppins uppercase">Por talle/modelo</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck size={18} />
                  <span className="font-anton text-xl">CALIDAD</span>
                </div>
                <span className="text-xs text-neutral-gray font-poppins uppercase">Garantizada</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 bg-neutral-100 aspect-video flex flex-col items-center justify-center text-neutral-400 border border-neutral-200">
              <Package size={64} strokeWidth={1} className="mb-4" />
              <p className="font-anton text-2xl uppercase tracking-tighter">Espacio para Foto del Local</p>
              <p className="text-[10px] uppercase tracking-widest font-medium">Próximamente</p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
