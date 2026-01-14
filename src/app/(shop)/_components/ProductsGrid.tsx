"use client";

import { useState } from "react";
import { useShopContext } from "~/context/ShopContext";
import { type Product } from "~/types";
import { ImageLightbox } from "./ImageLightbox";

export function ProductsGrid() {
  const { products, loadingProducts, addToCart } = useShopContext();
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    media: { url: string; type: "video" | "image"; isPrimary?: boolean }[];
    initialIndex: number;
  }>({
    isOpen: false,
    media: [],
    initialIndex: 0,
  });

  const openLightbox = (
    media: { url: string; type: "video" | "image"; isPrimary?: boolean }[],
    index: number
  ) => {
    setLightboxState({
      isOpen: true,
      media,
      initialIndex: index,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  if (loadingProducts) {
    return (
        <div className="shop-container">
            <h2 className="products-title">Ürünlerimiz</h2>
             <div className="products-grid">
                {/* Simplified Skeleton */}
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="product-card skeleton" style={{ height: '400px', background: '#f0f0f0' }}></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="shop-container">
      <h2 className="products-title">Ürünlerimiz</h2>
      <div className="products-carousel-wrapper">
         <div id="productsGrid" className="products-grid">
            {products.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", gridColumn: "1/-1" }}>Henüz ürün bulunmamaktadır.</p>
            ) : (
                products.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAdd={addToCart} 
                        onImageClick={openLightbox}
                    />
                ))
            )}
         </div>
      </div>
      
      <ImageLightbox
        isOpen={lightboxState.isOpen}
        onClose={closeLightbox}
        media={lightboxState.media}
        initialIndex={lightboxState.initialIndex}
      />
    </div>
  );
}

function ProductCard({ 
    product, 
    onAdd,
    onImageClick 
}: { 
    product: Product; 
    onAdd: (p: Product) => void;
    onImageClick: (media: { url: string; type: "video" | "image"; isPrimary?: boolean }[], index: number) => void;
}) {
    const isVideo = product.image && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(product.image);
    const defaultMedia: { url: string; type: 'video' | 'image'; isPrimary?: boolean }[] = product.image
        ? [{ url: product.image, type: isVideo ? 'video' : 'image', isPrimary: true }]
        : [];
    const mediaArray = product.media ?? defaultMedia;
    
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const currentMedia = mediaArray[currentMediaIndex];

    const nextMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMediaIndex((prev) => (prev + 1) % mediaArray.length);
    };

    const prevMedia = (e: React.MouseEvent) => {
         e.stopPropagation();
         setCurrentMediaIndex((prev) => (prev - 1 + mediaArray.length) % mediaArray.length);
    };

    const handleMediaClick = () => {
        onImageClick(mediaArray, currentMediaIndex);
    };

    return (
        <div className="product-card">
             {mediaArray.length > 0 && currentMedia ? (
                <div className="product-media-carousel" onClick={handleMediaClick} style={{ cursor: 'pointer' }}>
                    <div className="media-carousel-track">
                          {currentMedia.type === 'video' ? (
                               <video src={currentMedia.url} className="product-media-item" autoPlay muted loop playsInline />
                          ) : (
                               /* eslint-disable-next-line @next/next/no-img-element */
                               <img src={currentMedia.url} alt={product.name} className="product-media-item object-cover" />
                          )}
                    </div>
                    {mediaArray.length > 1 && (
                        <>
                            <button className="media-carousel-btn media-prev" onClick={prevMedia}>‹</button>
                            <button className="media-carousel-btn media-next" onClick={nextMedia}>›</button>
                            <div className="media-dots">
                                {mediaArray.map((_, idx) => (
                                    <span 
                                        key={idx} 
                                        className={`media-dot ${idx === currentMediaIndex ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentMediaIndex(idx);
                                        }}
                                    ></span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
             ) : (
                <div style={{ height: '300px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
             )}

            <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div className="product-price-container">
                        {product.original_price && <span className="product-original-price">{product.original_price} ₺</span>}
                        <span className="product-price">{product.price} ₺</span>
                    </div>
                    <button className="add-to-cart-btn" onClick={() => onAdd(product)}>
                        Sepete Ekle
                    </button>
                 </div>
            </div>
        </div>
    )
}
