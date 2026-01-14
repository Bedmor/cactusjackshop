"use client";

import { useState, useEffect } from "react";
import { Tag, Truck, Headset, Leaf, MessageCircle } from "lucide-react";
import "~/styles/animations.css";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeBandIndex, setActiveBandIndex] = useState(0);

  const bandMessages = [
    { text: "Alışverişte %40 indirim fırsatını kaçırmayın!", icon: <Tag size={18} /> },
    { text: "Ücretsiz kargo fırsatından yararlanın!", icon: <Truck size={18} /> },
    { text: "7/24 müşteri desteği ile yanınızdayız!", icon: <Headset size={18} /> },
    { text: "Doğal ve el yapımı ürünlerimizle tanışın!", icon: <Leaf size={18} /> },
    { text: "WhatsApp üzerinden sipariş verin!", icon: <MessageCircle size={18} /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBandIndex((prev) => (prev + 1) % bandMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bandMessages.length]);


  return (
    <>
      <div className={`nav-overlay ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}></div>
      
      {/* Mobile Menu */}
      <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`} id="navMenu">
        <ul>
          <li>
            <a href="#home" onClick={() => setIsMenuOpen(false)}>
              <span className="menu-icon"></span>
              <span>Ana Sayfa</span>
            </a>
          </li>
           <li>
            <a href="#productsGrid" onClick={() => setIsMenuOpen(false)}>
              <span className="menu-icon"></span>
              <span>Ürünler</span>
            </a>
          </li>
          <li>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>
              <span className="menu-icon"></span>
              <span>Hakkımızda</span>
            </a>
          </li>
          <li>
            <a href="#" id="contactLink" onClick={(e) => { e.preventDefault(); /* Open Contact Modal */ setIsMenuOpen(false); }}>
              <span className="menu-icon"></span>
              <span>İletişim</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="shop-band">
        <div className="shop-band-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <div className="animate-bounce-in" key={activeBandIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {bandMessages[activeBandIndex]?.icon}
                <span>{bandMessages[activeBandIndex]?.text}</span>
             </div>
        </div>
      </div>

      <div className="shop-header">
        <button
          className={`burger-menu ${isMenuOpen ? "active" : ""}`}
          id="burgerMenu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span className="burger-line"></span>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
        </button>

        <h1>Cactus Jack</h1>

        <nav className="desktop-nav">
          <ul>
            <li>
              <a href="#home">
                <span className="menu-icon"></span>
                <span>Ana Sayfa</span>
              </a>
            </li>
            <li>
              <a href="#productsGrid">
                <span className="menu-icon"></span>
                <span>Ürünler</span>
              </a>
            </li>
            <li>
              <a href="#about">
                <span className="menu-icon"></span>
                <span>Hakkımızda</span>
              </a>
            </li>
            <li>
              <a href="#" className="desktop-contact-link">
                <span className="menu-icon"></span>
                <span>İletişim</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
