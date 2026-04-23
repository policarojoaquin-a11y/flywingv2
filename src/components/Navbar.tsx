import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CartDrawer } from "./CartDrawer";
// @ts-ignore
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { 
      name: "Productos", 
      href: "/catalogo",
      dropdown: [
        { name: "Todos los productos", filter: "" },
        { name: "Casual", filter: "casual" },
        { name: "Deportivas", filter: "deportiva" },
        { name: "Elastizadas", filter: "elastizada" },
        { name: "Botas", filter: "bota" },
      ]
    },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== "/" ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Flywing Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div 
              key={link.name} 
              className="relative py-2"
              onMouseEnter={() => link.dropdown && setIsDropdownOpen(true)}
              onMouseLeave={() => link.dropdown && setIsDropdownOpen(false)}
            >
              <Link
                to={link.href}
                className={`text-sm font-medium transition-colors uppercase tracking-widest flex items-center gap-1 ${
                  location.pathname === link.href ? "text-primary" : "text-neutral-gray hover:text-primary"
                }`}
              >
                {link.name}
                {link.dropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
              </Link>

              {link.dropdown && (
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-xl border border-neutral-100 py-3 z-50"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.filter ? `/catalogo?categoria=${item.filter}` : '/catalogo'}
                          className="block px-6 py-2.5 text-xs font-medium text-neutral-gray hover:text-primary hover:bg-neutral-50 uppercase tracking-widest transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
          <CartDrawer />
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-primary">
                  <Menu size={24} />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <div className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <div key={link.name} className="flex flex-col gap-2">
                    <Link
                      to={link.href}
                      className={`text-2xl font-anton transition-colors ${
                        location.pathname === link.href ? "text-primary" : "text-neutral-gray hover:text-primary"
                      }`}
                    >
                      {link.name}
                    </Link>
                    {link.dropdown && (
                      <div className="flex flex-col gap-3 pl-4 mt-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.name}
                            to={item.filter ? `/catalogo?categoria=${item.filter}` : '/catalogo'}
                            className="text-sm font-medium text-neutral-gray hover:text-primary uppercase tracking-widest"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t border-neutral-100 pt-6">
                <CartDrawer />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
