"use client";

import { useShopContext } from "~/context/ShopContext";
import { ShoppingCart } from "lucide-react";

export function FloatingCartButton() {
  const { cart, setIsCartOpen } = useShopContext();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button
      className="cart-button"
      id="cartButton"
      aria-label="Sepet"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart size={24} />
      <span className="cart-count" id="cartCount">{cartCount}</span>
    </button>
  );
}
