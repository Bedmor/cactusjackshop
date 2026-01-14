"use client";

import { useShopContext } from "~/context/ShopContext";
import { useRef } from "react";

export function ProductShowcase() {
  const { products, loadingProducts } = useShopContext();
  const showcaseScrollRef = useRef<HTMLDivElement>(null);

  if (loadingProducts || products.length === 0) return null;

  // Duplicate products for infinite scroll effect (simple version)
  const displayProducts = [...products, ...products, ...products].slice(0, 15);

  const scrollToProduct = (_productId: string) => {
    // Scroll to products grid section
    const element = document.getElementById("productsGrid");
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="product-showcase">
      <div className="showcase-track" id="showcaseTrack" ref={showcaseScrollRef}>
        {displayProducts.map((product, index) => {
           const mediaArray = product.media ?? (product.image ? [{ url: product.image, type: (/\.(mp4|webm|mov|ogg)(\?|$)/i.exec(product.image) ? 'video' : 'image'), isPrimary: true }] : []);
           const primaryMedia = mediaArray.find(m => m.isPrimary) ?? mediaArray[0] ?? { url: 'assets/100mg.png', type: 'image' };
           const isVideo = primaryMedia.type === 'video';

           return (
            <div 
                key={`${product.id}-${index}`} 
                className="showcase-item" 
                onClick={() => scrollToProduct(product.id)}
            >
                {product.stock === 0 ? (
                    <div className="showcase-item-badge">Stokta Yok</div>
                ) : null}
                
                {isVideo ? (
                     <video src={primaryMedia.url} className="showcase-item-image" autoPlay loop muted playsInline />
                ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={primaryMedia.url} alt={product.name} className="showcase-item-image" />
                )}

                <div className="showcase-item-info">
                    <div className="showcase-item-name">{product.name}</div>
                </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}
