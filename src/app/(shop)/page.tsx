"use client";

import { Navbar } from "./_components/Navbar";
import { Hero } from "./_components/Hero";
import { ProductShowcase } from "./_components/ProductShowcase";
import { ProductsGrid } from "./_components/ProductsGrid";
import { CartSidebar } from "./_components/CartSidebar";
import { Footer } from "./_components/Footer";
import { FloatingCartButton } from "./_components/FloatingCartButton";

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <ProductShowcase />
      <Hero />
      <ProductsGrid />
      <Features />
      <About />
      <Footer />
      <FloatingCartButton />
      <CartSidebar />
    </>
  );
}

function Features() {
  return (
    <div className="features-section">
      <div className="features-container">
        <div className="feature-item">
          <div className="feature-icon">
            {/* Icons should be SVGs, using text for now or simple circle */}
            📦
          </div>
          <h3 className="feature-title">Hızlı ve Ücretsiz Kargo</h3>
          <p className="feature-description">
            2-5 iş günü içinde ücretsiz teslimat
          </p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🌿</div>
          <h3 className="feature-title">El Yapımı Ürünler</h3>
          <p className="feature-description">Doğal malzemeden özenle üretilir</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">💬</div>
          <h3 className="feature-title">7/24 Destek</h3>
          <p className="feature-description">Her zaman yanınızdayız</p>
        </div>
        <div className="feature-item">
           <div className="feature-icon">👀</div>
          <h3 className="feature-title">Önce Gör Sonra Satın Al</h3>
          <p className="feature-description">
            Ürünü WhatsApp&apos;tan görüp beğendikten sonra ödeme yapın
          </p>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div id="about" className="about about-story">
      <h2 className="about-title">Biz Kimiz</h2>
      <div className="about-content">
        <p className="about-intro">
          <strong>Biz, Feridun ve Turgay</strong> — iki dost, iki usta, iki doğa
          aşığıyız.
        </p>
        <p className="about-text">
          Ahşabın kokusunu, denizin tuzunu ve el emeğinin sıcaklığını her
          işimize katıyoruz. Yaptığımız her takı, her oyuncak; kalbimizden ve
          doğadan bir parça taşır.
        </p>
        <p className="about-text">
          Kimi zaman ormanda yürürken bulduğumuz bir dal, kimi zaman deniz
          kıyısına vuran yıpranmış bir odun parçası… Her biri, geçmişin izini
          taşıyan küçük bir hatıradır bizim için. O hatıraları ellerimizle
          yeniden şekillendirir, onlara ikinci bir hayat veririz.
        </p>
        <p className="about-text">
          Bizim için önemli olan sadece bir ürün yapmak değil, sizleri mutlu
          edecek bir hikâye yaratmak. Her parçamızın içinde biraz doğa, biraz
          sevgi, biraz da siz varsınız.
        </p>
        <p className="about-signature">
          <em>Feridun & Turgay</em><br />
          <span className="signature-tagline">Ahşabın kalbinden, sizler için…</span>
        </p>
      </div>
    </div>
  );
}
