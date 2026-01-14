import { useState, useEffect } from "react";
import { supabase } from "~/utils/supabase";
import { type Product, type Comment, type CartItem } from "~/types";

export function useShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      // Products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (productsData) setProducts(productsData);
      setLoadingProducts(false);

      // Comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (commentsData) setComments(commentsData);
      setLoadingComments(false);
    }

    void loadData();

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) as CartItem[]);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    // Subscribe to products
    const subscription = supabase
      .channel("products-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Product change detected:", payload);
          // Reload products - simple strategy
          void loadData(); 
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  return {
    products,
    comments,
    cart,
    isCartOpen,
    loadingProducts,
    loadingComments,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
