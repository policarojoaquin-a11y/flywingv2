import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
// @ts-ignore
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src={logo} alt="Flywing Logo" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-neutral-400 font-poppins max-w-sm mb-8">
              Tu socio estratégico en calzado mayorista. 
              Calidad, tendencia y compromiso con el crecimiento de tu negocio.
              <br /><br />
              <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-1">Showroom</span>
              Domingo de Acassuso 3519, Olivos, Buenos Aires.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://wa.me/5491135677101" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.876 9.88-9.876a9.88 9.88 0 019.874 9.88c-.001 5.447-4.431 9.878-9.88 9.878m0-21.821C6.47 0 1.617 4.852 1.615 10.858c0 1.919.499 3.791 1.447 5.432L0 24l7.335-1.924a10.84 10.84 0 005.14 1.292h.005c6.012 0 10.864-4.853 10.866-10.86 0-2.912-1.133-5.649-3.191-7.707A10.81 10.81 0 0012.051 0z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-anton text-xl mb-6 tracking-widest text-center md:text-left">NAVEGACIÓN</h4>
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 font-poppins text-sm text-neutral-400 uppercase tracking-tighter text-center">
              <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link to="/catalogo" className="hover:text-primary transition-colors">Productos</Link></li>
              <li><Link to="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 text-xs text-neutral-500 font-poppins uppercase tracking-widest">
          <p>© 2026 Flywing Todos los derechos reservados. Hecho con Popsi</p>
        </div>
      </div>
    </footer>
  );
}
