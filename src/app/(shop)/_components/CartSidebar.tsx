"use client";

import { useShopContext } from "~/context/ShopContext";
import { X } from "lucide-react";

export function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useShopContext();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const checkout = () => {
      const message = "Sipariş Listesi:\n" + cart.map(item => `- ${item.name} (${item.quantity} adet) - ${item.price * item.quantity} TL`).join("\n") + `\n\nToplam: ${total} TL\n\nSiparişi onaylıyorum.`;
      const url = `https://wa.me/9055327958765?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <div className={`cart-sidebar ${isCartOpen ? "active" : ""}`} id="cartSidebar">
      <div className="cart-header">
        <h2>Sepetim</h2>
        <button className="close-cart" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
        </button>
      </div>
      <div className="cart-items" id="cartItems">
        {cart.length === 0 ? (
            <div className="empty-cart">Sepetiniz boş</div>
        ) : (
            cart.map(item => (
                <div key={item.id} className="cart-item" style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee'}}>
                    <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p>{item.price} ₺</p>
                    </div>
                    <div className="cart-controls" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)} style={{color:'red'}}>×</button>
                    </div>
                </div>
            ))
        )}
      </div>
      {cart.length > 0 && (
          <div className="cart-footer" id="cartFooter" style={{display:'flex'}}>
            <div className="cart-total">
              <span>Kargo:</span>
              <span id="cartShipping">Ücretsiz</span>
              <span>Toplam:</span>
              <span id="cartTotal">{total} ₺</span>
            </div>
            <button className="checkout-btn" onClick={checkout}>
              WhatsApp&apos;tan Sipariş Ver
            </button>
          </div>
      )}
    </div>
  );
}
