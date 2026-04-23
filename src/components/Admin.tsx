import React, { useState, useEffect } from "react";
import { supabase, uploadProductImage, fetchSneakers, debugBuckets } from "@/src/lib/supabase";
import { Sneaker } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Trash2, LogOut, Image as ImageIcon } from "lucide-react";

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    colors: ""
  });

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
  }

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
          colors: newProduct.colors.split(',').map(c => c.trim()).filter(c => c !== "")
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

    setNewProduct({ name: "", category: "CASUAL", sizes: "35 al 40", pack_size: 6, colors: "" });
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
        colors: Array.isArray(editingProduct.colors) ? editingProduct.colors : (editingProduct.colors as string).split(',').map(c => c.trim()).filter(c => c !== "")
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
            <CardTitle className="text-3xl font-anton tracking-widest">FLY <span className="text-white/80">WING</span> ADMIN</CardTitle>
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
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl font-anton tracking-widest text-lg"
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
            <h2 className="text-5xl font-anton tracking-tight text-neutral-900 leading-none">PANEL DE <span className="text-primary">CONTROL</span></h2>
            <p className="text-neutral-gray mt-2 font-poppins">Gestioná el stock y las imágenes de tus productos.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="rounded-full bg-primary hover:bg-primary/90 px-6 gap-2 font-anton tracking-widest text-xs h-12 shadow-lg"
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
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-neutral-200 hover:bg-neutral-100 px-6 gap-2 font-anton tracking-widest text-xs h-12">
              <LogOut size={16} /> CERRAR SESIÓN
            </Button>
          </div>
        </div>

        {isAddingProduct && (
          <Card className="mb-12 border-none shadow-2xl rounded-3xl overflow-hidden bg-white border-2 border-primary/20">
            <CardHeader className="bg-primary text-white p-6">
              <CardTitle className="text-2xl font-anton tracking-widest flex justify-between items-center">
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
                      className="w-full h-12 rounded-xl border border-neutral-200 px-3 bg-white font-poppins text-sm outline-none focus:border-primary"
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
                    className="rounded-xl h-12 px-8 font-anton tracking-widest uppercase text-xs"
                  >
                    Descartar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 h-12 rounded-xl font-anton tracking-widest px-12"
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
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3 block">{sneaker.category}</span>
                    <h3 className="text-4xl font-anton text-neutral-900 leading-tight mb-6">{sneaker.name}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Talles</span>
                        <span className="font-poppins text-sm font-semibold">{sneaker.sizes}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Pack por Mayor</span>
                        <span className="font-poppins text-sm font-semibold">{sneaker.pack_size} pares</span>
                      </div>
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
                      <h4 className="font-anton tracking-widest text-lg uppercase leading-none">Galería de Fotos</h4>
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
      </div>

      {/* Edit Modal / Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-neutral-900 text-white p-6">
              <CardTitle className="text-2xl font-anton tracking-widest flex justify-between items-center">
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
                      className="w-full h-12 rounded-xl border border-neutral-200 px-3 bg-white font-poppins text-sm outline-none"
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
                    className="rounded-xl h-12 px-8 font-anton tracking-widest"
                  >
                    CANCELAR
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 h-12 rounded-xl font-anton tracking-widest px-12"
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
                <CardTitle className="text-xl font-anton tracking-widest uppercase">{confirmDialog.title}</CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <p className="text-neutral-600 font-poppins text-sm mb-8 leading-relaxed">
                  {confirmDialog.message}
                </p>
                <div className="flex gap-4">
                   <Button 
                    variant="outline" 
                    onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})}
                    className="flex-1 rounded-xl h-12 border-neutral-200 font-anton tracking-widest text-xs"
                   >
                     CANCELAR
                   </Button>
                   <Button 
                    variant="destructive"
                    onClick={confirmDialog.onConfirm}
                    className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 font-anton tracking-widest text-xs shadow-lg text-white"
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
