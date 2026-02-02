"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "~/utils/supabase";
import "~/styles/admin.css";

const ADMIN_PASSWORD_HASH =
  "52ad5d996e8ee34811206346277ef2fedd7236d6f5009256ab337f57c5f39a20";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  media?: MediaItem[];
  created_at?: string;
}

interface MediaItem {
  url: string;
  type: "image" | "video";
  isPrimary: boolean;
  file?: File;
  isExisting?: boolean;
}

interface Comment {
  id: number;
  name: string;
  body: string;
  stars: number;
  created_at: string;
}

interface Order {
  id: number;
  items: OrderItem[];
  total_amount: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Stats {
  totalProducts: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  storageMB: string;
}

export default function AdminPage() {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hero Settings
  const [heroBackgroundStatus, setHeroBackgroundStatus] = useState(
    "Gradyan (Varsayılan)",
  );
  const [heroPreview, setHeroPreview] = useState<{
    url: string;
    isVideo: boolean;
  } | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Font Settings
  const [fontStatus, setFontStatus] = useState("Varsayılan (Oswald, Oxygen)");
  const [googleFontLink, setGoogleFontLink] = useState("");
  const [fontFamily, setFontFamily] = useState("");

  // Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
  });
  const [productMediaGallery, setProductMediaGallery] = useState<MediaItem[]>(
    [],
  );
  const [uploadProgress, setUploadProgress] = useState({
    show: false,
    progress: 0,
    text: "",
  });
  const mediaFileRef = useRef<HTMLInputElement>(null);

  // Comment Modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentForm, setCommentForm] = useState({
    name: "",
    body: "",
    stars: 5,
  });

  // Drag and drop
  const [draggedMediaIndex, setDraggedMediaIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (isLoggedIn === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadProducts(),
      loadComments(),
      loadOrders(),
      loadStats(),
      updateHeroBackgroundStatus(),
      updateFontStatus(),
    ]);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Hash password
  const hashPassword = async (str: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hash = await hashPassword(password);
      if (hash === ADMIN_PASSWORD_HASH) {
        sessionStorage.setItem("adminLoggedIn", "true");
        setIsAuthenticated(true);
        setLoginError(false);
      } else {
        setLoginError(true);
        setPassword("");
        setTimeout(() => setLoginError(false), 3000);
      }
    } catch (error) {
      console.error("Hashing error:", error);
      setLoginError(true);
    }
  };

  // Logout
  const handleLogout = () => {
    if (confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
      sessionStorage.removeItem("adminLoggedIn");
      setIsAuthenticated(false);
    }
  };

  // Load Products
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Load Comments
  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Load Orders
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  // Load Stats
  const loadStats = async () => {
    try {
      const { data: productsData } = await supabase
        .from("products")
        .select("*");
      const { data: ordersData } = await supabase.from("orders").select("*");

      const products = productsData ?? [];
      const orders = ordersData ?? [];

      // Get storage stats
      let storageMB = "0";
      try {
        const { data: files } = await supabase.storage
          .from("product-images")
          .list();
        if (files) {
          const totalSize = files.reduce(
            (acc: number, file) => acc + ((file.metadata?.size as number) ?? 0),
            0,
          );
          storageMB = (totalSize / (1024 * 1024)).toFixed(2);
        }
      } catch {
        storageMB = "N/A";
      }

      setStats({
        totalProducts: products.length,
        outOfStock: products.filter((p: Product) => p.stock === 0).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: Order) => o.status === "pending")
          .length,
        storageMB,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Hero Background Functions
  const updateHeroBackgroundStatus = async () => {
    try {
      const { data: files } = await supabase.storage
        .from("product-images")
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      const heroFile = files?.find((file) =>
        file.name.startsWith("hero-background"),
      );
      if (heroFile) {
        const isVideo = /\.(mp4|webm|mov|ogg)$/i.test(heroFile.name);
        const mediaType = isVideo ? "📹 Video" : "🖼️ Resim";
        setHeroBackgroundStatus(`${mediaType} - Yüklü`);
      } else {
        setHeroBackgroundStatus("Gradyan (Varsayılan)");
      }
    } catch (error) {
      console.error("Error fetching hero background status:", error);
      setHeroBackgroundStatus("Gradyan (Varsayılan)");
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const isVideo = file.type.startsWith("video/");
        setHeroPreview({ url: event.target?.result as string, isVideo });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveHeroBackground = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = heroFileRef.current?.files?.[0];
    if (!file) {
      alert("Lütfen bir resim veya video seçin!");
      return;
    }

    try {
      setIsLoading(true);

      // Delete existing hero backgrounds
      const { data: existingFiles } = await supabase.storage
        .from("product-images")
        .list("", { limit: 100 });

      if (existingFiles) {
        const heroFiles = existingFiles.filter((f) =>
          f.name.startsWith("hero-background"),
        );
        if (heroFiles.length > 0) {
          await supabase.storage
            .from("product-images")
            .remove(heroFiles.map((f) => f.name));
        }
      }

      // Upload new file
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-background-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      await updateHeroBackgroundStatus();
      setHeroPreview(null);
      if (heroFileRef.current) heroFileRef.current.value = "";
      alert("Hero arkaplanı başarıyla güncellendi!");
    } catch (error) {
      console.error("Error saving hero background:", error);
      alert("Arkaplan kaydedilemedi!");
    } finally {
      setIsLoading(false);
    }
  };

  const removeHeroBackground = async () => {
    if (!confirm("Hero arkaplanını kaldırmak istediğinize emin misiniz?"))
      return;

    try {
      const { data: files } = await supabase.storage
        .from("product-images")
        .list("", { limit: 100 });

      const heroFile = files?.find((f) => f.name.startsWith("hero-background"));
      if (heroFile) {
        await supabase.storage.from("product-images").remove([heroFile.name]);
      }

      await updateHeroBackgroundStatus();
      alert("Hero arkaplanı kaldırıldı!");
    } catch (error) {
      console.error("Error removing hero background:", error);
      alert("Hero arkaplanı kaldırılırken bir hata oluştu!");
    }
  };

  // Font Functions
  const updateFontStatus = async () => {
    try {
      const { data } = await supabase
        .from("links")
        .select("url, family")
        .eq("id", "customFont")
        .single();

      if (data?.url && data?.family) {
        setFontStatus(`📝 ${data.family}`);
      } else {
        setFontStatus("Varsayılan (Oswald, Oxygen)");
      }
    } catch {
      setFontStatus("Varsayılan (Oswald, Oxygen)");
    }
  };

  const saveFontSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!googleFontLink || !fontFamily) {
      alert("Lütfen hem Google Fonts linkini hem de font ailesi adını girin.");
      return;
    }

    if (!googleFontLink.includes("fonts.googleapis.com")) {
      alert("Lütfen geçerli bir Google Fonts linki girin.");
      return;
    }

    try {
      const { error } = await supabase.from("links").upsert({
        id: "customFont",
        url: googleFontLink,
        family: fontFamily,
      });

      if (error) throw error;

      await updateFontStatus();
      setGoogleFontLink("");
      setFontFamily("");
      alert("Font ayarları kaydedildi!");
    } catch (error) {
      console.error("Font kaydetme hatası:", error);
      alert("Font kaydedilirken bir hata oluştu!");
    }
  };

  const removeCustomFont = async () => {
    if (
      !confirm(
        "Özel fontu kaldırıp varsayılan fonta dönmek istediğinizden emin misiniz?",
      )
    )
      return;

    try {
      await supabase.from("links").delete().eq("id", "customFont");
      await updateFontStatus();
      alert("Özel font kaldırıldı!");
    } catch (error) {
      console.error("Error removing custom font:", error);
      alert("Font kaldırılırken bir hata oluştu!");
    }
  };

  // Order Functions
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!newStatus) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      alert("Sipariş durumu güncellendi!");
      await loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Sipariş durumu güncellenirken hata oluştu.");
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm("Bu siparişi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
      alert("Sipariş silindi!");
      await loadOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Sipariş silinirken hata oluştu.");
    }
  };

  const viewOrderDetails = (order: Order) => {
    const date = new Date(order.created_at).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const statusLabels = {
      pending: "Beklemede",
      completed: "Tamamlandı",
      cancelled: "İptal Edildi",
    };

    const itemsList = order.items
      .map(
        (item) =>
          `- ${item.product_name} (${item.quantity}x) = ${item.subtotal.toFixed(2)} ₺`,
      )
      .join("\n");

    alert(
      `Sipariş Detayları\n\nSipariş No: #${order.id}\nTarih: ${date}\nDurum: ${statusLabels[order.status]}\n\nÜrünler:\n${itemsList}\n\nToplam: ${order.total_amount.toFixed(2)} ₺`,
    );
  };

  // Product Functions
  const openAddProductModal = () => {
    setEditingProductId(null);
    setProductForm({ name: "", description: "", price: 0, stock: 0 });
    setProductMediaGallery([]);
    setShowProductModal(true);
  };

  const editProduct = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setEditingProductId(productId);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });

    // Load existing media
    if (
      product.media &&
      Array.isArray(product.media) &&
      product.media.length > 0
    ) {
      setProductMediaGallery(
        product.media.map((mediaItem: MediaItem) => ({
          url: mediaItem.url,
          type:
            mediaItem.type ??
            (/\.(mp4|webm|mov|ogg)(\?|$)/i.exec(mediaItem.url)
              ? "video"
              : "image"),
          isPrimary: mediaItem.isPrimary || false,
          isExisting: true,
        })),
      );
    } else if (product.image) {
      const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.exec(product.image);
      setProductMediaGallery([
        {
          url: product.image,
          type: isVideo ? "video" : "image",
          isPrimary: true,
          isExisting: true,
        },
      ]);
    } else {
      setProductMediaGallery([]);
    }

    setShowProductModal(true);
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

    try {
      const product = products.find((p) => p.id === productId);
      if (product) {
        // Delete media files
        const mediaToDelete: string[] = [];
        if (product.media && Array.isArray(product.media)) {
          product.media.forEach((m: MediaItem) => {
            if (m.url) mediaToDelete.push(m.url);
          });
        }
        if (product.image && !mediaToDelete.includes(product.image)) {
          mediaToDelete.push(product.image);
        }

        for (const url of mediaToDelete) {
          try {
            const fileName = url.split("/").pop();
            if (fileName) {
              await supabase.storage.from("product-images").remove([fileName]);
            }
          } catch (e) {
            console.error("Failed to delete media:", e);
          }
        }
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;

      await loadProducts();
      await loadStats();
      alert("✅ Ürün ve tüm medya dosyaları başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("❌ Ürün silinirken hata oluştu.");
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();

      reader.onload = (event) => {
        setProductMediaGallery((prev) => [
          ...prev,
          {
            file,
            url: event.target?.result as string,
            type: isVideo ? "video" : "image",
            isPrimary: prev.length === 0,
          },
        ]);
      };

      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  };

  const removeMediaItem = (index: number) => {
    setProductMediaGallery((prev) => {
      const newGallery = prev.filter((_, i) => i !== index);
      if (newGallery.length > 0 && !newGallery.some((m) => m.isPrimary)) {
        const firstItem = newGallery[0];
        if (firstItem) firstItem.isPrimary = true;
      }
      return newGallery;
    });
  };

  const setPrimaryMedia = (index: number) => {
    setProductMediaGallery((prev) =>
      prev.map((media, i) => ({ ...media, isPrimary: i === index })),
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedMediaIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedMediaIndex === null || draggedMediaIndex === dropIndex) return;

    setProductMediaGallery((prev) => {
      const newGallery = [...prev];
      const draggedItem = newGallery[draggedMediaIndex];
      if (!draggedItem) return prev;
      newGallery.splice(draggedMediaIndex, 1);
      newGallery.splice(dropIndex, 0, draggedItem);
      return newGallery;
    });
    setDraggedMediaIndex(null);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 1200;
          let { width, height } = img;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (productMediaGallery.length === 0) {
        throw new Error("Lütfen en az bir medya dosyası ekleyin");
      }

      setUploadProgress({ show: true, progress: 0, text: "Yükleniyor..." });

      // Upload new media files
      const uploadedMedia: MediaItem[] = [];

      for (let i = 0; i < productMediaGallery.length; i++) {
        const media = productMediaGallery[i];
        if (!media) continue;

        if (media.isExisting) {
          uploadedMedia.push({
            url: media.url,
            type: media.type,
            isPrimary: media.isPrimary,
          });
        } else if (media.file) {
          const isVideo = media.file.type.startsWith("video/");
          const fileToUpload = isVideo
            ? media.file
            : await compressImage(media.file);
          const fileExt = media.file.name.split(".").pop();
          const fileName = `product-${Date.now()}-${i}.${fileExt}`;

          const { error } = await supabase.storage
            .from("product-images")
            .upload(fileName, fileToUpload, {
              cacheControl: "3600",
              upsert: true,
            });

          if (error) throw error;

          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          uploadedMedia.push({
            url: data.publicUrl,
            type: media.type,
            isPrimary: media.isPrimary,
          });
        }

        setUploadProgress({
          show: true,
          progress: ((i + 1) / productMediaGallery.length) * 100,
          text: `${i + 1}/${productMediaGallery.length} yüklendi`,
        });
      }

      const primaryMedia =
        uploadedMedia.find((m) => m.isPrimary) ?? uploadedMedia[0];
      if (!primaryMedia) {
        throw new Error("Medya yüklenemedi");
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        stock: productForm.stock,
        image: primaryMedia.url,
        media: uploadedMedia,
      };

      if (editingProductId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProductId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
      }

      setShowProductModal(false);
      setUploadProgress({ show: false, progress: 0, text: "" });
      await loadProducts();
      await loadStats();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("❌ " + (error instanceof Error ? error.message : "Hata oluştu"));
      setUploadProgress({ show: false, progress: 0, text: "" });
    }
  };

  // Comment Functions
  const openAddCommentModal = () => {
    setEditingCommentId(null);
    setCommentForm({ name: "", body: "", stars: 5 });
    setShowCommentModal(true);
  };

  const editComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setCommentForm({
      name: comment.name,
      body: comment.body,
      stars: comment.stars || 5,
    });
    setShowCommentModal(true);
  };

  const deleteComment = async (commentId: number) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Yorum silinirken hata oluştu.");
    }
  };

  const saveComment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCommentId) {
        const { error } = await supabase
          .from("comments")
          .update(commentForm)
          .eq("id", editingCommentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("comments").insert([commentForm]);
        if (error) throw error;
      }

      setShowCommentModal(false);
      await loadComments();
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("Yorum kaydedilirken hata oluştu.");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="login-container" id="loginScreen">
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
            <button type="submit" className="login-btn">
              Giriş Yap
            </button>
            {loginError && (
              <div className="error-message" style={{ display: "block" }}>
                Hatalı şifre! Lütfen tekrar deneyin.
              </div>
            )}
          </form>
          <Link href="/" className="back-link">
            ← Mağazaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Admin Panel
  return (
    <div className="admin-panel" style={{ display: "block" }}>
      <div className="admin-header">
        <h1>CACTUS JACK - Yönetim Paneli</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>

      <div className="admin-content">
        {/* Stats Section */}
        <div className="panel-section">
          <h2>İstatistikler</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalProducts ?? 0}</div>
              <div className="stat-label">Toplam Ürün</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.outOfStock ?? 0}</div>
              <div className="stat-label">Stokta Yok</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalOrders ?? 0}</div>
              <div className="stat-label">Toplam Sipariş</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.pendingOrders ?? 0}</div>
              <div className="stat-label">Bekleyen Sipariş</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.storageMB ?? "0"}</div>
              <div className="stat-label">Depolama (MB)</div>
            </div>
          </div>
        </div>

        {/* Hero Section Settings */}
        <div className="panel-section">
          <div className="section-header">
            <h2>Üst Bölüm Ayarları</h2>
          </div>
          <div
            style={{
              marginBottom: 20,
              padding: 15,
              background: "var(--cream)",
              borderRadius: 8,
            }}
          >
            <strong>Mevcut Arkaplan:</strong>{" "}
            <span>{heroBackgroundStatus}</span>
          </div>
          <form className="modal-form" onSubmit={saveHeroBackground}>
            <div className="form-group">
              <label htmlFor="heroBackground">
                Arkaplan Resmi veya Videosu
              </label>
              <input
                type="file"
                id="heroBackground"
                ref={heroFileRef}
                accept="image/*,video/*"
                onChange={handleHeroFileChange}
              />
              <small
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  marginTop: 5,
                }}
              >
                Resim veya video yükleyebilirsiniz. Mevcut arkaplan silinecek ve
                yeni medya kullanılacak.
              </small>
            </div>
            {heroPreview && (
              <div style={{ marginTop: 15, textAlign: "center" }}>
                {heroPreview.isVideo ? (
                  <video
                    src={heroPreview.url}
                    controls
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroPreview.url}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>
            )}
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? "Yükleniyor..." : "Arkaplanı Kaydet"}
            </button>
            <button
              type="button"
              className="save-btn"
              onClick={removeHeroBackground}
              style={{ background: "var(--danger)", marginTop: 10 }}
            >
              Arkaplanı Kaldır (Gradyan Kullan)
            </button>
          </form>
        </div>

        {/* Font Settings */}
        <div className="panel-section">
          <div className="section-header">
            <h2>Font Ayarları</h2>
          </div>
          <div
            style={{
              marginBottom: 20,
              padding: 15,
              background: "var(--cream)",
              borderRadius: 8,
            }}
          >
            <strong>Mevcut Font:</strong> <span>{fontStatus}</span>
          </div>
          <form className="modal-form" onSubmit={saveFontSettings}>
            <div className="form-group">
              <label htmlFor="googleFontLink">Google Fonts Link</label>
              <input
                type="url"
                id="googleFontLink"
                value={googleFontLink}
                onChange={(e) => setGoogleFontLink(e.target.value)}
                placeholder="https://fonts.googleapis.com/css2?family=..."
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
              <small
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  marginTop: 5,
                }}
              >
                Google Fonts&apos;tan aldığınız link&apos;i buraya yapıştırın.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="fontFamily">Font Ailesi Adı</label>
              <input
                type="text"
                id="fontFamily"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                placeholder="Roboto, sans-serif"
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
              <small
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  marginTop: 5,
                }}
              >
                Font ailesinin CSS adını girin.
              </small>
            </div>
            <button type="submit" className="save-btn">
              Fontu Kaydet
            </button>
            <button
              type="button"
              className="save-btn"
              onClick={removeCustomFont}
              style={{ background: "var(--danger)", marginTop: 10 }}
            >
              Varsayılan Fonta Dön
            </button>
          </form>
        </div>

        {/* Orders Management */}
        <div className="panel-section">
          <div className="section-header">
            <h2>Sipariş Yönetimi</h2>
          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Tarih</th>
                <th>Ürünler</th>
                <th>Toplam</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 40, color: "#666" }}
                  >
                    Henüz sipariş bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString(
                    "tr-TR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );

                  const itemsList = order.items
                    .map((item) => `${item.product_name} (${item.quantity}x)`)
                    .join(", ");

                  const statusColors: Record<string, string> = {
                    pending: "var(--warning)",
                    completed: "var(--success)",
                    cancelled: "var(--danger)",
                  };

                  const statusLabels: Record<string, string> = {
                    pending: "Beklemede",
                    completed: "Tamamlandı",
                    cancelled: "İptal Edildi",
                  };

                  return (
                    <tr key={order.id}>
                      <td data-label="Sipariş No">#{order.id}</td>
                      <td data-label="Tarih">{date}</td>
                      <td
                        data-label="Ürünler"
                        style={{
                          maxWidth: 300,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={itemsList}
                      >
                        {itemsList}
                      </td>
                      <td data-label="Toplam">
                        <strong>{order.total_amount.toFixed(2)} ₺</strong>
                      </td>
                      <td data-label="Durum">
                        <span
                          style={{
                            background: statusColors[order.status],
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: 4,
                            fontSize: "0.9rem",
                          }}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td data-label="İşlemler">
                        <button
                          className="action-btn"
                          onClick={() => viewOrderDetails(order)}
                          title="Detayları Gör"
                          style={{
                            background: "var(--primary)",
                            color: "white",
                          }}
                        >
                          👁️
                        </button>
                        <select
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          style={{ marginLeft: 10, padding: 5 }}
                          defaultValue=""
                        >
                          <option value="">Durum Değiştir</option>
                          <option value="pending">Beklemede</option>
                          <option value="completed">Tamamlandı</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteOrder(order.id)}
                          title="Sil"
                          style={{ marginLeft: 5 }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Products Management */}
        <div className="panel-section">
          <div className="section-header">
            <h2>Ürün Yönetimi</h2>
            <button className="add-product-btn" onClick={openAddProductModal}>
              + Yeni Ürün Ekle
            </button>
          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>Resim</th>
                <th>Ürün Adı</th>
                <th>Açıklama</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 40, color: "#666" }}
                  >
                    Henüz ürün eklenmemiş. &quot;Yeni Ürün Ekle&quot; butonuna
                    tıklayarak başlayın.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isVideo = product.image
                    ? /\.(mp4|webm|mov|ogg)(\?|$)/i.exec(product.image)
                    : null;

                  return (
                    <tr key={product.id}>
                      <td data-label="Resim">
                        {isVideo ? (
                          <video
                            src={product.image}
                            className="product-image-small"
                            muted
                            controls
                            playsInline
                            loop
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image || "/assets/100mg.png"}
                            alt={product.name}
                            className="product-image-small"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/100mg.png";
                            }}
                          />
                        )}
                      </td>
                      <td data-label="Ürün Adı">{product.name}</td>
                      <td data-label="Açıklama">{product.description}</td>
                      <td data-label="Fiyat">{product.price.toFixed(2)} ₺</td>
                      <td
                        data-label="Stok"
                        style={{
                          color:
                            product.stock < 10 ? "var(--danger)" : "#2e7d32",
                          fontWeight: "bold",
                        }}
                      >
                        {product.stock} adet
                      </td>
                      <td data-label="İşlemler">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => editProduct(product.id)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Comments Section */}
        <div className="panel-section comment-section">
          <h2>Yorum Yönetimi</h2>
          <button className="add-comment-btn" onClick={openAddCommentModal}>
            + Yeni Yorum Ekle
          </button>
          <table className="comments-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Yorum</th>
                <th>Yıldız</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: 40, color: "#666" }}
                  >
                    Henüz yorum bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id}>
                    <td data-label="Kullanıcı">{comment.name || "Anonim"}</td>
                    <td data-label="Yorum">{comment.body || ""}</td>
                    <td data-label="Yıldız">
                      {"⭐".repeat(comment.stars || 0)}
                    </td>
                    <td data-label="Tarih">
                      {new Date(comment.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td data-label="İşlemler">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => editComment(comment)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteComment(comment.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCommentId ? "Yorumu Düzenle" : "Yeni Yorum Ekle"}</h2>
              <button
                className="close-modal"
                onClick={() => setShowCommentModal(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-form" onSubmit={saveComment}>
              <div className="form-group">
                <label htmlFor="cmt-author">Kullanıcı Adı</label>
                <input
                  type="text"
                  id="cmt-author"
                  value={commentForm.name}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cmt-body">Yorum</label>
                <textarea
                  id="cmt-body"
                  value={commentForm.body}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, body: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cmt-stars">Yıldız (1-5)</label>
                <input
                  type="number"
                  id="cmt-stars"
                  min={1}
                  max={5}
                  value={commentForm.stars}
                  onChange={(e) =>
                    setCommentForm({
                      ...commentForm,
                      stars: parseInt(e.target.value) || 5,
                    })
                  }
                  required
                  style={{ width: 80 }}
                />
              </div>
              <button type="submit" className="save-btn">
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProductId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
              <button
                className="close-modal"
                onClick={() => setShowProductModal(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-form" onSubmit={saveProduct}>
              <div className="form-group">
                <label htmlFor="productName">Ürün Adı</label>
                <input
                  type="text"
                  id="productName"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productDescription">Açıklama</label>
                <textarea
                  id="productDescription"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productPrice">Fiyat (₺)</label>
                <input
                  type="number"
                  id="productPrice"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productStock">Stok Adedi</label>
                <input
                  type="number"
                  id="productStock"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              {/* Multiple Media Upload Section */}
              <div className="form-group">
                <label>Medya Galerisi (Resim veya Video)</label>
                <div style={{ marginBottom: 15 }}>
                  <input
                    type="file"
                    ref={mediaFileRef}
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaFileChange}
                    style={{ marginBottom: 10 }}
                  />
                  <small style={{ display: "block", color: "#666" }}>
                    📷 Birden fazla resim/video seçebilirsiniz
                    <br />
                    📹 İlk medya ana görsel olarak kullanılacak
                    <br />
                    🔄 Sürükle-bırak ile sıralama yapabilirsiniz
                  </small>
                </div>

                {/* Media Gallery Preview */}
                {productMediaGallery.length > 0 && (
                  <div style={{ marginTop: 15 }}>
                    <strong style={{ display: "block", marginBottom: 10 }}>
                      Yüklü Medyalar:
                    </strong>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(120px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {productMediaGallery.map((media, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            border: `3px solid ${media.isPrimary ? "var(--primary)" : "#ddd"}`,
                            borderRadius: 8,
                            overflow: "hidden",
                            aspectRatio: "1",
                            cursor: "grab",
                          }}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(index)}
                        >
                          {media.type === "video" ? (
                            <video
                              src={media.url}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              muted
                              controls
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={media.url}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          {media.isPrimary && (
                            <div
                              style={{
                                position: "absolute",
                                top: 5,
                                left: 5,
                                background: "var(--primary)",
                                color: "var(--dark-brown)",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                              }}
                            >
                              ANA
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaItem(index)}
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              background: "var(--danger)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 25,
                              height: 25,
                              cursor: "pointer",
                              fontSize: "1rem",
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                          {!media.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryMedia(index)}
                              style={{
                                position: "absolute",
                                bottom: 5,
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "rgba(0,0,0,0.7)",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                              }}
                            >
                              Ana Yap
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {uploadProgress.show && (
                <div style={{ margin: "10px 0" }}>
                  <div
                    style={{
                      background: "#e0e0e0",
                      borderRadius: 8,
                      height: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background: "var(--success)",
                        height: "100%",
                        width: `${uploadProgress.progress}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <small
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 5,
                      color: "var(--text-muted)",
                    }}
                  >
                    {uploadProgress.text}
                  </small>
                </div>
              )}

              <button type="submit" className="save-btn">
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
