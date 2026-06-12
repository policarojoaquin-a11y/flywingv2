import React, { useState, useEffect } from "react";
import { supabase, uploadProductImage, fetchSneakers, debugBuckets, fetchPreSaleReservations, clearPreSaleReservations } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Trash2, LogOut, Image as ImageIcon, Eye, EyeOff, BarChart2 } from "lucide-react";

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Sneaker | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "CASUAL",
    sizes: "35 al 40",
    pack_size: 6,
    colors: "",
    is_offer: false,
    is_preventa: false,
    original_price: "",
    discount_price: "",
    discount_percentage: ""
  });

  const [activeTab, setActiveTab] = useState<"productos" | "preventas">("productos");
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) debugBuckets();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  async function loadData() {
    const data = await fetchSneakers();
    setSneakers(data);

    setReservationsLoading(true);
    const resData = await fetchPreSaleReservations();
    setReservations(resData);
    setReservationsLoading(false);
  }

  // Calculate grouped pre-sales statistics
  const groupedReservations = React.useMemo(() => {
    const groups: { [key: string]: any } = {};

    reservations.forEach(item => {
      const pName = item.producto_name || "Desconocido";
      const pColor = item.color || "No especificado";
      const key = `${pName}_${pColor}`;
      
      if (!groups[key]) {
        groups[key] = {
          productName: pName,
          color: pColor,
          totalPacks: 0,
          totalPairs: 0,
          clickCount: 0,
          lastSelected: item.created_at || new Date().toISOString()
        };
      }

      groups[key].totalPacks += Number(item.packs || 1);
      groups[key].totalPairs += Number(item.packs || 1) * Number(item.pack_size || 6);
      groups[key].clickCount += 1;
      if (item.created_at && item.created_at > groups[key].lastSelected) {
        groups[key].lastSelected = item.created_at;
      }
    });

    return Object.values(groups).sort((a: any, b: any) => b.totalPacks - a.totalPacks);
  }, [reservations]);

  // Calculate global popularity by sneaker model name
  const groupedByModel = React.useMemo(() => {
    const models: { [key: string]: any } = {};

    reservations.forEach(item => {
      const pName = item.producto_name || "Desconocido";
      if (!models[pName]) {
        models[pName] = {
          productName: pName,
          totalPacks: 0,
          totalPairs: 0,
          clickCount: 0,
          colors: new Set<string>()
        };
      }
      models[pName].totalPacks += Number(item.packs || 1);
      models[pName].totalPairs += Number(item.packs || 1) * Number(item.pack_size || 6);
      models[pName].clickCount += 1;
      if (item.color) {
        models[pName].colors.add(item.color);
      }
    });

    return Object.values(models)
      .map((m: any) => ({
        ...m,
        colorsCount: m.colors.size,
        colorsList: Array.from(m.colors)
      }))
      .sort((a: any, b: any) => b.totalPacks - a.totalPacks);
  }, [reservations]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function onFileSelected(sneakerId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(sneakerId);
    for (let i = 0; i < files.length; i++) {
      const { error } = await uploadProductImage(sneakerId, files[i]);
      if (error) {
        setErrorMsg(`Error subiendo imagen: ${error.message}`);
      }
    }
    setUploading(null);
    loadData(); // Refresh to see new images
  }

  async function proceedDeleteImage(imageId: number) {
    setLoading(true);
    const { error } = await supabase
      .from('imagenes_producto')
      .delete()
      .eq('id', imageId);
    
    if (error) setErrorMsg(error.message);
    else loadData();
    setLoading(false);
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  }

  async function deleteImage(imageId: number) {
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Imagen",
      message: "¿Seguro quieres eliminar esta imagen?",
      onConfirm: () => proceedDeleteImage(imageId)
    });
  }

  async function updateImageColor(imageId: number, color: string) {
    const { error } = await supabase
      .from('imagenes_producto')
      .update({ color_variante: color === "none" ? null : color })
      .eq('id', imageId);
    
    if (error) setErrorMsg(error.message);
    else loadData();
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: productData, error: productError } = await supabase
      .from('productos')
      .insert([
        {
          name: newProduct.name,
          category: newProduct.category,
          sizes: newProduct.sizes,
          pack_size: newProduct.pack_size,
          colors: newProduct.colors.split(',').map(c => c.trim()).filter(c => c !== ""),
          is_offer: newProduct.is_offer,
          is_preventa: newProduct.is_preventa,
          original_price: newProduct.original_price ? parseFloat(newProduct.original_price as string) : null,
          discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price as string) : null,
          discount_percentage: newProduct.discount_percentage ? parseFloat(newProduct.discount_percentage as string) : null
        }
      ])
      .select();

    if (productError) {
      setErrorMsg("Error creando producto: " + productError.message);
      setLoading(false);
      return;
    }

    const productId = productData[0].id;

    if (selectedFiles && selectedFiles.length > 0) {
      setUploading("new");
      for (let i = 0; i < selectedFiles.length; i++) {
        const { error: imgError } = await uploadProductImage(productId, selectedFiles[i]);
        if (imgError) console.error("Error subiendo imagen:", imgError);
      }
      setUploading(null);
    }

    setNewProduct({ 
      name: "", 
      category: "CASUAL", 
      sizes: "35 al 40", 
      pack_size: 6, 
      colors: "",
      is_offer: false,
      is_preventa: false,
      original_price: "",
      discount_price: "",
      discount_percentage: ""
    });
    setSelectedFiles(null);
    setIsAddingProduct(false);
    loadData();
    setLoading(false);
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);

    const { error } = await supabase
      .from('productos')
      .update({
        name: editingProduct.name,
        category: editingProduct.category,
        sizes: editingProduct.sizes,
        pack_size: editingProduct.pack_size,
        colors: Array.isArray(editingProduct.colors) ? editingProduct.colors : (editingProduct.colors as string).split(',').map(c => c.trim()).filter(c => c !== ""),
        is_offer: editingProduct.is_offer,
        is_preventa: editingProduct.is_preventa,
        original_price: editingProduct.original_price || null,
        discount_price: editingProduct.discount_price || null,
        discount_percentage: editingProduct.discount_percentage || null
      })
      .eq('id', editingProduct.id);

    if (error) {
      setErrorMsg("Error actualizando producto: " + error.message);
    } else {
      setEditingProduct(null);
      loadData();
    }
    setLoading(false);
  }

  async function proceedDeleteProduct(productId: string) {
    setLoading(true);
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', productId);
    
    if (error) setErrorMsg(error.message);
    else loadData();
    setLoading(false);
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  }

  async function deleteProduct(productId: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Producto",
      message: "¿Seguro quieres eliminar este producto? Esto también borrará sus fotos asociadas.",
      onConfirm: () => proceedDeleteProduct(productId)
    });
  }

  const filteredSneakers = sneakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary text-white p-8 text-center">
            <CardTitle className="text-3xl font-gotham font-bold tracking-widest">FLYWING <span className="text-white/80"></span> ADMIN</CardTitle>
            <p className="text-white/70 text-xs uppercase tracking-tighter mt-2 font-poppins">Ingreso exclusivo para administradores</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Email</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Contraseña</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="rounded-xl border-neutral-200 h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl font-gotham font-bold tracking-widest text-lg"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "ENTRAR AL PANEL"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h2 className="text-5xl font-gotham font-bold tracking-tight text-neutral-900 leading-none">PANEL DE <span className="text-primary">CONTROL</span></h2>
            <p className="text-neutral-gray mt-2 font-poppins">Gestioná el stock y las imágenes de tus productos.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="rounded-full bg-primary hover:bg-primary/90 px-6 gap-2 font-gotham font-bold tracking-widest text-xs h-12 shadow-lg"
            >
              {isAddingProduct ? "CANCELAR" : "+ NUEVO PRODUCTO"}
            </Button>
            <div className="relative w-64">
              <Input 
                placeholder="Buscar producto..." 
                className="rounded-full pl-10 h-12 bg-white border-neutral-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-neutral-200 hover:bg-neutral-100 px-6 gap-2 font-gotham font-bold tracking-widest text-xs h-12">
              <LogOut size={16} /> CERRAR SESIÓN
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 mb-8 gap-6">
          <button
            onClick={() => setActiveTab("productos")}
            className={`pb-4 text-xs font-gotham font-extrabold uppercase tracking-widest transition-all relative ${
              activeTab === "productos" 
                ? "text-primary border-b-2 border-primary" 
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Modelos en Stock ({sneakers.length})
          </button>
          <button
            onClick={() => setActiveTab("preventas")}
            className={`pb-4 text-xs font-gotham font-extrabold uppercase tracking-widest transition-all relative ${
              activeTab === "preventas" 
                ? "text-secondary border-b-2 border-secondary" 
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Estadísticas Pre-Venta ({reservations.length})
          </button>
        </div>

        {activeTab === "productos" ? (
          <>
            {isAddingProduct && (
              <Card className="mb-12 border-none shadow-2xl rounded-3xl overflow-hidden bg-white border-2 border-primary/20">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="text-2xl font-gotham font-extrabold tracking-widest flex justify-between items-center">
                    <span>CARGAR NUEVO MODELO</span>
                    {loading && <Loader2 className="animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleAddProduct} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nombre del Modelo</label>
                        <Input 
                          value={newProduct.name} 
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                          required 
                          placeholder="Ej: Flywing Pro 1"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Categoría</label>
                        <select 
                          className={`w-full h-12 rounded-xl border px-3 bg-white font-poppins text-sm outline-none transition-colors ${newProduct.category === 'preventa' ? 'border-secondary bg-secondary/5' : 'border-neutral-200 focus:border-primary'}`}
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        >
                          <option value="CASUAL">CASUAL</option>
                          <option value="DEPORTIVA">DEPORTIVA</option>
                          <option value="ELASTIZADA">ELASTIZADA</option>
                          <option value="BOTA">BOTA</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Rango de Talles</label>
                        <Input 
                          value={newProduct.sizes} 
                          onChange={e => setNewProduct({...newProduct, sizes: e.target.value})} 
                          placeholder="Ej: 35 al 40"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Pares por Pack</label>
                        <Input 
                          type="number"
                          value={newProduct.pack_size} 
                          onChange={e => setNewProduct({...newProduct, pack_size: parseInt(e.target.value)})} 
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                      <div className="space-y-4 flex flex-col justify-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={newProduct.is_offer}
                            onChange={e => setNewProduct({...newProduct, is_offer: e.target.checked})}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">¿Está en Oferta?</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={newProduct.is_preventa}
                            onChange={e => setNewProduct({...newProduct, is_preventa: e.target.checked})}
                            className="w-4 h-4 accent-secondary"
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">¿Es Pre-venta?</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Precio Original</label>
                        <Input 
                          type="number"
                          value={newProduct.original_price} 
                          onChange={e => setNewProduct({...newProduct, original_price: e.target.value})} 
                          placeholder="Ej: 45000"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Precio Oferta</label>
                        <Input 
                          type="number"
                          value={newProduct.discount_price} 
                          onChange={e => setNewProduct({...newProduct, discount_price: e.target.value})} 
                          placeholder="Ej: 38000"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">% Descuento</label>
                        <Input 
                          type="number"
                          value={newProduct.discount_percentage} 
                          onChange={e => setNewProduct({...newProduct, discount_percentage: e.target.value})} 
                          placeholder="Ej: 15"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Colores (separados por coma)</label>
                        <Input 
                          value={newProduct.colors} 
                          onChange={e => setNewProduct({...newProduct, colors: e.target.value})} 
                          placeholder="Ej: Negro, Blanco, Rojo"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Fotos del Producto</label>
                        <div className="relative">
                          <Input 
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="rounded-xl border-neutral-200 h-12 pt-2"
                          />
                          {selectedFiles && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary">
                              {selectedFiles.length} ARCHIVOS
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 border-t border-neutral-100 pt-6">
                      <Button 
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddingProduct(false)}
                        className="rounded-xl h-12 px-8 font-gotham font-bold tracking-widest uppercase text-xs"
                      >
                        Descartar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 h-12 rounded-xl font-gotham font-bold tracking-widest px-12"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            {uploading === "new" ? "SUBIENDO FOTOS..." : "GUARDANDO..."}
                          </div>
                        ) : "CREAR Y SUBIR"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-8">
              {filteredSneakers.map(sneaker => (
                <Card key={sneaker.id} className="border-none shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow bg-white border border-neutral-100 relative">
                  {/* Global Action Buttons */}
                  <div className="absolute top-6 right-6 flex gap-2 z-20">
                    <button 
                      onClick={() => setEditingProduct(sneaker)}
                      className="text-neutral-500 hover:text-blue-600 transition-all p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-neutral-100 hover:scale-110 active:scale-95"
                      title="Editar producto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button 
                      onClick={() => deleteProduct(sneaker.id)}
                      className="text-neutral-500 hover:text-red-600 transition-all p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-neutral-100 hover:scale-110 active:scale-95"
                      title="Eliminar producto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row min-h-[320px]">
                    {/* Product Info */}
                    <div className="p-8 md:w-1/4 border-b md:border-b-0 md:border-r border-neutral-100 bg-neutral-50/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{sneaker.category}</span>
                          {sneaker.is_preventa && (
                            <span className="text-[10px] font-bold bg-secondary text-white px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">Pre-venta</span>
                          )}
                        </div>
                        <h3 className="text-4xl font-gotham font-extrabold text-neutral-900 leading-tight mb-6">{sneaker.name}</h3>
                        
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Talles</span>
                            <span className="font-poppins text-sm font-semibold">{sneaker.sizes}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Pack por Mayor</span>
                            <span className="font-poppins text-sm font-semibold">{sneaker.pack_size} pares</span>
                          </div>
                          {sneaker.is_offer && (
                            <div className="flex flex-col gap-1 bg-primary/5 p-3 rounded-xl border border-primary/20">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Estado: EN OFERTA</span>
                              <div className="mt-1">
                                {sneaker.original_price && <p className="text-[10px] line-through text-neutral-400">${sneaker.original_price}</p>}
                                <p className="text-sm font-bold text-primary">${sneaker.discount_price || "S/D"}</p>
                                {sneaker.discount_percentage && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full ml-auto">-{sneaker.discount_percentage}%</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <label className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-white border border-neutral-200 rounded-2xl cursor-pointer hover:border-primary hover:text-primary transition-all shadow-sm">
                          {uploading === sneaker.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Upload size={18} />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest">Añadir Fotos</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => onFileSelected(sneaker.id, e)}
                            disabled={!!uploading}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Images Preview */}
                    <div className="p-8 flex-grow bg-white">
                      <div className="flex items-center gap-2 mb-8">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <ImageIcon size={18} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-gotham font-bold tracking-widest text-lg uppercase leading-none">Galería de Fotos</h4>
                          <p className="text-[10px] text-neutral-400 font-poppins mt-1">Imágenes que verán tus clientes</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {sneaker.imagenes_producto?.map((img: any) => (
                          <div key={img.id} className="group relative flex flex-col gap-2 p-2 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-primary/30 transition-all">
                            <div className="relative aspect-square rounded-xl overflow-hidden">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  onClick={() => deleteImage(img.id)}
                                  className="bg-white text-red-500 p-2 rounded-full hover:scale-110 transition-transform active:scale-95 shadow-lg"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <select 
                              className="w-full text-[9px] font-bold uppercase tracking-widest bg-white border border-neutral-200 rounded-lg p-1.5 outline-none focus:border-primary transition-colors appearance-none text-center"
                              value={img.color_variante || "none"}
                              onChange={(e) => updateImageColor(img.id, e.target.value)}
                            >
                              <option value="none">SIN COLOR</option>
                              {sneaker.colors?.map((c: string) => (
                                <option key={c} value={c}>{c.toUpperCase()}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        {(!sneaker.imagenes_producto || sneaker.imagenes_producto.length === 0) && (
                          <div className="col-span-full h-32 flex items-center justify-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50 text-neutral-400 font-poppins text-sm uppercase tracking-widest">
                            No hay imágenes todavía
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-md bg-white rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Modelos Solicitados</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-gotham font-extrabold text-neutral-900">{groupedReservations.length}</span>
                  <span className="text-xs text-neutral-400">Variaciones</span>
                </div>
              </Card>
              <Card className="border-none shadow-md bg-white rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Packs Totales</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-gotham font-extrabold text-secondary">
                    {groupedReservations.reduce((acc: number, curr: any) => acc + curr.totalPacks, 0)}
                  </span>
                  <span className="text-xs text-neutral-400">Packs</span>
                </div>
              </Card>
              <Card className="border-none shadow-md bg-white rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Pares Totales</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-gotham font-extrabold text-primary">
                    {groupedReservations.reduce((acc: number, curr: any) => acc + curr.totalPairs, 0)}
                  </span>
                  <span className="text-xs text-neutral-400">Pares</span>
                </div>
              </Card>
            </div>

            {/* Ranking Histórico de Modelos Más Solicitados */}
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white border border-neutral-100">
              <CardHeader className="bg-neutral-900 text-white p-6">
                <CardTitle className="text-lg font-gotham font-extrabold tracking-widest uppercase flex items-center gap-2">
                  🏆 RANKING HISTÓRICO DE MODELOS REQUERIDOS
                </CardTitle>
                <p className="text-white/60 text-xs font-poppins mt-1">
                  Qué zapatillas de pre-venta fueron las más elegidas por el público (acumulado histórico).
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {reservationsLoading ? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader2 className="animate-spin text-secondary" size={24} />
                  </div>
                ) : groupedByModel.length > 0 ? (
                  <div className="space-y-6">
                    {groupedByModel.map((model: any, index: number) => {
                      const maxPacks = Math.max(...groupedByModel.map((m: any) => m.totalPacks), 1);
                      const percent = Math.round((model.totalPacks / maxPacks) * 100);
                      
                      return (
                        <div key={model.productName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors border border-neutral-100/60">
                          <div className="flex-grow space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-gotham ${
                                index === 0 ? 'bg-amber-100 text-amber-700 font-extrabold scale-110' :
                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                index === 2 ? 'bg-amber-50 text-amber-800/80' : 'bg-neutral-200 text-neutral-600'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="font-gotham font-extrabold text-base text-neutral-900 uppercase">
                                {model.productName}
                              </span>
                              {index === 0 && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold font-gotham px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Más Solicitada
                                </span>
                              )}
                            </div>
                            
                            {/* Progress bar representing popularity */}
                            <div className="w-full bg-neutral-200/60 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-secondary h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-poppins text-neutral-500">
                              <span>Colores solicitados: <strong className="text-neutral-800">{model.colorsCount}</strong> ({model.colorsList.join(", ") || "Sin color específico"})</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:border-l sm:border-neutral-200 sm:pl-6 shrink-0 justify-between sm:justify-start">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Solicitado</p>
                              <p className="font-gotham font-black text-xl text-secondary">{model.totalPacks} Packs</p>
                              <p className="text-xs font-bold text-neutral-500 font-poppins">{model.totalPairs} Pares totales</p>
                            </div>
                            <div className="bg-neutral-100/80 rounded-xl px-3 py-2 text-center min-w-[55px]">
                              <p className="text-[9px] font-semibold text-neutral-400 uppercase">Veces</p>
                              <p className="font-bold text-neutral-700 text-sm">{model.clickCount}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm font-poppins text-neutral-400 py-4 text-center">No hay registros de reservaciones para mostrar.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white border border-neutral-100">
              <CardHeader className="bg-neutral-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-gotham font-bold tracking-widest uppercase flex items-center gap-2">
                    <BarChart2 size={20} className="text-secondary" /> Estadísticas Pre-Venta
                  </CardTitle>
                  <p className="text-white/60 text-xs font-poppins mt-1">Conteo en tiempo real de zapatillas y colores elegidos por los clientes al agregar al carrito.</p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: "Reiniciar Estadísticas",
                      message: "¿Seguro quieres borrar todas las estadísticas de pre-venta? Esta acción no se puede deshacer.",
                      onConfirm: async () => {
                        setLoading(true);
                        await clearPreSaleReservations();
                        const resData = await fetchPreSaleReservations();
                        setReservations(resData);
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                        setLoading(false);
                      }
                    });
                  }}
                  className="rounded-full bg-red-600 hover:bg-red-700 px-6 font-gotham font-extrabold text-white tracking-widest text-xs h-10 border-none shadow-md"
                >
                  REINICIAR CONTADORES
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {reservationsLoading ? (
                  <div className="py-20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                ) : groupedReservations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-poppins">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-neutral-100">
                          <th className="py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Zapatilla / Modelo</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Color elegido</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Cantidad Packs</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Pares Totales</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Cant. Veces</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Última Selección</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {groupedReservations.map((groupRef: any, i: number) => (
                          <tr key={i} className="hover:bg-neutral-50/40 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-gotham font-bold uppercase text-sm text-neutral-900">{groupRef.productName}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-block px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                {groupRef.color}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center font-semibold text-neutral-800 text-sm">
                              {groupRef.totalPacks} Packs
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-block px-3 py-1 bg-primary/5 rounded-full text-xs font-bold text-primary">
                                {groupRef.totalPairs} Pares
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-xs text-neutral-500">
                              Agregado {groupRef.clickCount} {groupRef.clickCount === 1 ? 'vez' : 'veces'}
                            </td>
                            <td className="py-4 px-6 text-right text-xs text-neutral-400">
                              {new Date(groupRef.lastSelected).toLocaleString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} hs
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-neutral-200 mb-4 animate-pulse"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                    <p className="font-gotham uppercase tracking-wider text-sm">No se han registrado reservas para pre-venta todavía</p>
                    <p className="text-xs text-neutral-400 mt-1">Los datos aparecerán aquí cuando los clientes agreguen productos de pre-venta al carrito.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Modal / Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-neutral-900 text-white p-6">
              <CardTitle className="text-2xl font-gotham font-extrabold tracking-widest flex justify-between items-center">
                <span>EDITAR PRODUCTO</span>
                <button onClick={() => setEditingProduct(null)} className="text-white/50 hover:text-white transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nombre</label>
                    <Input 
                      value={editingProduct.name} 
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                      required 
                      className="rounded-xl border-neutral-200 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Categoría</label>
                    <select 
                      className={`w-full h-12 rounded-xl border px-3 bg-white font-poppins text-sm outline-none transition-colors ${editingProduct.category === 'preventa' ? 'border-secondary bg-secondary/5' : 'border-neutral-200 focus:border-primary'}`}
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    >
                      <option value="CASUAL">CASUAL</option>
                      <option value="DEPORTIVA">DEPORTIVA</option>
                      <option value="ELASTIZADA">ELASTIZADA</option>
                      <option value="BOTA">BOTA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Talles</label>
                    <Input 
                      value={editingProduct.sizes} 
                      onChange={e => setEditingProduct({...editingProduct, sizes: e.target.value})} 
                      className="rounded-xl border-neutral-200 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Pack</label>
                    <Input 
                      type="number"
                      value={editingProduct.pack_size} 
                      onChange={e => setEditingProduct({...editingProduct, pack_size: parseInt(e.target.value)})} 
                      className="rounded-xl border-neutral-200 h-12"
                    />
                  </div>
                  <div className="space-y-4 flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editingProduct.is_offer}
                        onChange={e => setEditingProduct({...editingProduct, is_offer: e.target.checked})}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">¿Está en Oferta?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editingProduct.is_preventa}
                        onChange={e => setEditingProduct({...editingProduct, is_preventa: e.target.checked})}
                        className="w-4 h-4 accent-secondary"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">¿Es Pre-venta?</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Precio Original</label>
                    <Input 
                      type="number"
                      value={editingProduct.original_price || ""} 
                      onChange={e => setEditingProduct({...editingProduct, original_price: e.target.value === "" ? undefined : parseFloat(e.target.value)})} 
                      className="rounded-xl border-neutral-200 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Precio Oferta</label>
                    <Input 
                      type="number"
                      value={editingProduct.discount_price || ""} 
                      onChange={e => setEditingProduct({...editingProduct, discount_price: e.target.value === "" ? undefined : parseFloat(e.target.value)})} 
                      className="rounded-xl border-neutral-200 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">% Descuento</label>
                    <Input 
                      type="number"
                      value={editingProduct.discount_percentage || ""} 
                      onChange={e => setEditingProduct({...editingProduct, discount_percentage: e.target.value === "" ? undefined : parseFloat(e.target.value)})} 
                      className="rounded-xl border-neutral-200 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Colores (separados por coma)</label>
                  <Input 
                    value={Array.isArray(editingProduct.colors) ? editingProduct.colors.join(', ') : editingProduct.colors} 
                    onChange={e => setEditingProduct({...editingProduct, colors: e.target.value})} 
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                   <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-xl h-12 px-8 font-gotham font-bold tracking-widest"
                  >
                    CANCELAR
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 h-12 rounded-xl font-gotham font-bold tracking-widest px-12"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "ACTUALIZAR CAMBIOS"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Error Toast/Notification */}
      {errorMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-poppins text-sm animate-bounce">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <Card className="w-full max-w-sm border-none shadow-2xl rounded-3xl overflow-hidden bg-white animate-in zoom-in-95 duration-200">
             <CardHeader className="bg-red-500 text-white p-6 pb-4">
                <CardTitle className="text-xl font-gotham font-bold tracking-widest uppercase">{confirmDialog.title}</CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <p className="text-neutral-600 font-poppins text-sm mb-8 leading-relaxed">
                  {confirmDialog.message}
                </p>
                <div className="flex gap-4">
                   <Button 
                    variant="outline" 
                    onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})}
                    className="flex-1 rounded-xl h-12 border-neutral-200 font-gotham font-bold tracking-widest text-xs"
                   >
                     CANCELAR
                   </Button>
                   <Button 
                    variant="destructive"
                    onClick={confirmDialog.onConfirm}
                    className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 font-gotham font-bold tracking-widest text-xs shadow-lg text-white"
                    disabled={loading}
                   >
                     {loading ? <Loader2 className="animate-spin text-white" /> : "ELIMINAR"}
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
