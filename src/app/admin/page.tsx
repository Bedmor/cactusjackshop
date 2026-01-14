"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "~/utils/supabase";
import { type Product, type Comment } from "~/types";
import "~/styles/admin.css";

const ADMIN_PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "comments">("products");

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "Giyim"
  });

  useEffect(() => {
    // Check session storage for "admin_logged_in" to persist login (optional)
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'comments') fetchComments();
    }
  }, [isAuthenticated, activeTab]);

  const hashPassword = async (str: string) => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await hashPassword(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      setIsAuthenticated(true);
    } else {
      alert("Hatalı Şifre!");
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
    setIsLoading(false);
  };
  
  const fetchComments = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('comments').select('*');
    if (data) setComments(data);
    setIsLoading(false);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const productData = {
      ...productFormData,
      id: editingProduct ? editingProduct.id : uuidv4()
    };

    if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if(!error) {
            setProducts(products.map(p => p.id === editingProduct.id ? productData as Product : p));
            setShowProductForm(false);
            setEditingProduct(null);
            setProductFormData({ name: "", description: "", price: 0, image: "", category: "Giyim" });
        }
    } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (!error) {
            setProducts([...products, productData as Product]);
            setShowProductForm(false);
            setProductFormData({ name: "", description: "", price: 0, image: "", category: "Giyim" });
        }
    }
    setIsLoading(false);
  };

  const deleteProduct = async (id: string) => {
      if(!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if(!error) {
          setProducts(products.filter(p => p.id !== id));
      }
  };

  const deleteComment = async (id: string) => {
        if(!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
        const { error } = await supabase.from('comments').delete().eq('id', id);
        if(!error) {
            setComments(comments.filter(c => c.id !== id));
        }
  };


  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>🔒 Yönetim Paneli</h1>
          <p>Lütfen giriş yapın</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Şifrenizi girin"
                  required
              />
            </div>
            <button type="submit" className="login-btn">Giriş Yap</button>
          </form>
          <a href="/" className="back-link">← Mağazaya Dön</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
        <div className="admin-header">
            <h1>CACTUS JACK - Yönetim Paneli</h1>
            <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>Çıkış Yap</button>
        </div>

        <div className="admin-nav" style={{ padding: '20px', background: 'white', borderBottom: '1px solid #ddd', display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={() => setActiveTab('products')} style={{ background: activeTab === 'products' ? '#000' : '#ddd', color: activeTab === 'products' ? '#fff' : '#000' }}>Ürün Yönetimi</button>
            <button className="btn" onClick={() => setActiveTab('comments')} style={{ background: activeTab === 'comments' ? '#000' : '#ddd', color: activeTab === 'comments' ? '#fff' : '#000' }}>Yorum Yönetimi</button>
        </div>

        <div className="admin-content">
            {activeTab === 'products' && (
                <div className="panel-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <h2>Ürün Listesi</h2>
                        <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setProductFormData({ name:"", description:"", price:0, image:"", category:"Giyim" }); setShowProductForm(true); }}>Yeni Ürün Ekle</button>
                    </div>

                    {showProductForm && (
                        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                            <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                                <h3>{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>
                                <form onSubmit={handleProductSubmit}>
                                    <div className="form-group">
                                        <label>Ürün Adı</label>
                                        <input type="text" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} required className="form-control" style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Fiyat (TL)</label>
                                        <input type="number" step="0.01" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: parseFloat(e.target.value)})} required className="form-control" style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Görsel URL</label>
                                        <input type="text" value={productFormData.image} onChange={e => setProductFormData({...productFormData, image: e.target.value})} required className="form-control" style={{ width: '100%', padding: '8px', margin: '5px 0' }} />
                                    </div>
                                     <div className="form-group">
                                        <label>Kategori</label>
                                        <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} className="form-control" style={{ width: '100%', padding: '8px', margin: '5px 0' }}>
                                            <option value="Giyim">Giyim</option>
                                            <option value="Aksesuar">Aksesuar</option>
                                            <option value="Diğer">Diğer</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Açıklama</label>
                                        <textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} className="form-control" style={{ width: '100%', padding: '8px', margin: '5px 0' }} rows={4}></textarea>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Kaydet</button>
                                        <button type="button" onClick={() => setShowProductForm(false)} className="btn btn-secondary" style={{ flex: 1, background: '#6c757d', color: 'white' }}>İptal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {products.map(product => (
                            <div key={product.id} className="product-card" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */ }
                                <img src={product.image || '/assets/cactusjacktr.jpeg'} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                                <h4 style={{ margin: '10px 0' }}>{product.name}</h4>
                                <p style={{ fontWeight: 'bold' }}>{product.price} TL</p>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                    <button onClick={() => { setEditingProduct(product); setProductFormData(product); setShowProductForm(true); }} className="btn btn-sm btn-warning" style={{ background: '#ffc107', padding: '5px', flex: 1 }}>Düzenle</button>
                                    <button onClick={() => deleteProduct(product.id)} className="btn btn-sm btn-danger" style={{ background: '#dc3545', color: 'white', padding: '5px', flex: 1 }}>Sil</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'comments' && (
                <div className="panel-section">
                     <h2>Yorum Yönetimi</h2>
                     <div className="comments-list" style={{ marginTop: '20px' }}>
                        {comments.map(comment => (
                            <div key={comment.id} className="comment-item" style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{comment.name}</strong>
                                    <span>{comment.stars} ⭐</span>
                                </div>
                                <p style={{ margin: '10px 0' }}>{comment.body}</p>
                                <button onClick={() => deleteComment(comment.id)} className="btn btn-danger" style={{ background: '#dc3545', color: 'white', padding: '5px 10px' }}>Sil</button>
                            </div>
                        ))}
                        {comments.length === 0 && <p>Henüz yorum yok.</p>}
                     </div>
                </div>
            )}
        </div>
    </div>
  );
}
