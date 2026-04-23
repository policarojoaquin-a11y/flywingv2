import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactForm() {
  const whatsappNumber = "5491135677101";
  const contactText = encodeURIComponent("Hola! Vengo de la web y me gustaría realizar una consulta.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${contactText}`;

  return (
    <section id="contacto" className="py-24 pt-32 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-16 text-center">
            <h2 className="text-4xl md:text-6xl mb-6 text-neutral-900 uppercase">CONTÁCTANOS</h2>
            <p className="font-poppins mb-12 text-neutral-600 max-w-2xl mx-auto">
              ¿Tenés un local o sos revendedor? Estamos listos para asesorarte y enviarte nuestra lista de precios mayorista actualizada por WhatsApp.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary fill-primary">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.876 9.88-9.876a9.88 9.88 0 019.874 9.88c-.001 5.447-4.431 9.878-9.88 9.878m0-21.821C6.47 0 1.617 4.852 1.615 10.858c0 1.919.499 3.791 1.447 5.432L0 24l7.335-1.924a10.84 10.84 0 005.14 1.292h.005c6.012 0 10.864-4.853 10.866-10.86 0-2.912-1.133-5.649-3.191-7.707A10.81 10.81 0 0012.051 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-poppins">WhatsApp</p>
                  <p className="font-bold text-neutral-900">+54 9 11 3567-7101</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-poppins">Email</p>
                  <p className="font-bold text-neutral-900">ventas@argenshoes.com</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-poppins">Showroom</p>
                  <p className="font-bold text-neutral-900">Vicente López, BA</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={24} className="rotate-90" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-poppins">Atención</p>
                  <p className="font-bold text-neutral-900">Lun a Sáb</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => window.open(whatsappUrl, '_blank')}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-12 py-8 rounded-full text-xl font-bold transition-all hover:scale-105 flex items-center gap-3 mx-auto shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.876 9.88-9.876a9.88 9.88 0 019.874 9.88c-.001 5.447-4.431 9.878-9.88 9.878m0-21.821C6.47 0 1.617 4.852 1.615 10.858c0 1.919.499 3.791 1.447 5.432L0 24l7.335-1.924a10.84 10.84 0 005.14 1.292h.005c6.012 0 10.864-4.853 10.866-10.86 0-2.912-1.133-5.649-3.191-7.707A10.81 10.81 0 0012.051 0z"/>
              </svg>
              ENVIAR CONSULTA
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <div className="max-w-4xl mx-auto mt-12 overflow-hidden rounded-3xl shadow-lg h-[400px]">
          <iframe
            src="https://maps.google.com/maps?q=Domingo%20de%20Acassuso%203519,%20Olivos&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
