import { motion } from "motion/react";
import { CheckCircle2, Package } from "lucide-react";

export default function AboutUs() {
  const values = [
    "Venta exclusiva a revendedores y locales.",
    "Stock permanente y actualización semanal.",
    "Envíos rápidos y seguros a todo el país.",
    "Atención personalizada vía WhatsApp.",
    "Garantía de calidad en cada par.",
    "Packs diseñados para una rotación eficiente."
  ];

  return (
    <section id="nosotros" className="py-24 pt-32 bg-white overflow-hidden min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl mb-8">SOMOS <span className="text-primary">FLYWING</span></h2>
            <div className="space-y-6 text-lg text-neutral-gray font-montserrat leading-relaxed">
              <p>
                Con más de 10 años en el mercado del calzado, nos especializamos en brindar 
                soluciones integrales para comerciantes y emprendedores de todo el país.
              </p>
              <p>
                Nuestra misión es simple: ofrecer calzado de tendencia con la mejor relación 
                precio-calidad, facilitando el crecimiento de tu negocio a través de un 
                sistema de compra mayorista ágil y transparente.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-12">
              {values.map((value, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary shrink-0 mt-1" size={18} />
                  <span className="text-sm font-poppins text-neutral-700">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl w-full h-64 bg-neutral-100 flex flex-col items-center justify-center text-neutral-300 border border-neutral-100">
                  <Package size={32} strokeWidth={1} />
                </div>
                <div className="rounded-2xl w-full h-80 bg-neutral-100 flex flex-col items-center justify-center text-neutral-300 border border-neutral-100">
                  <Package size={32} strokeWidth={1} />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl w-full h-80 bg-neutral-100 flex flex-col items-center justify-center text-neutral-300 border border-neutral-100">
                  <Package size={32} strokeWidth={1} />
                </div>
                <div className="rounded-2xl w-full h-64 bg-neutral-100 flex flex-col items-center justify-center text-neutral-300 border border-neutral-100">
                  <Package size={32} strokeWidth={1} />
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20 shadow-xl z-20">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Fotos del Local Próximamente</p>
            </div>
            {/* Decorative Background */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
