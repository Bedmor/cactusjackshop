"use client";

import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";

export function Hero() {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    async function loadHero() {
      const bucketName = "product-images";
      const { data: files } = await supabase.storage.from(bucketName).list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
      });

      const heroFile = files?.find((file) => file.name.startsWith("hero-background"));
      if (heroFile) {
         const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(heroFile.name);
         if (urlData.publicUrl) {
            setBackgroundUrl(urlData.publicUrl);
            setIsVideo(/\.(mp4|webm|mov|ogg)$/i.test(heroFile.name));
         }
      }
    }
    void loadHero();
  }, []);

  return (
    <section className="hero-section" id="home" style={(!isVideo && backgroundUrl) ? { backgroundImage: `url('${backgroundUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
      {isVideo && backgroundUrl && (
        <video
            src={backgroundUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      )}
      <div className="hero-overlay" style={backgroundUrl ? { background: 'rgba(0,0,0,0.4)' } : {}}></div>
      <div className="hero-content">
        <div className="hero-text">
          <h2 className="hero-title">Hoş Geldiniz</h2>
          <h1 className="hero-main">Cactus Jack Shop</h1>
          <p className="hero-description">Ahşaptaki Gizem</p>
        </div>
        <div className="hero-buttons">
          <a href="#productsGrid" className="hero-btn primary">
            Alışverişe Başla
          </a>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.0001 3.67157L13.0001 3.67157L13.0001 16.4999L16.2426 13.2574L17.6568 14.6716L12 20.3284L6.34314 14.6716L7.75735 13.2574L11.0001 16.5001L11.0001 3.67157Z" fill="currentColor" />
            </svg>
        </span>
        <p>Ürünleri Görüntüle</p>
      </div>
    </section>
  );
}
