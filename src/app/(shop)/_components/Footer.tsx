export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-column">
          <h3 className="footer-title">Hakkımızda</h3>
          <p className="footer-text">
            Doğanın güzelliğini el emeğimizle birleştirerek, ahşaptan özgün
            takılar ve dekoratif ürünler üretiyoruz. Her parça, deniz kenarından
            topladığımız odunların hikayesini ve ruhunu taşır.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/arkeolog99" target="_blank" className="social-link" aria-label="Instagram">
              Instagram
            </a>
            <a href="https://wa.me/9055327958765" target="_blank" className="social-link" aria-label="WhatsApp">
              WhatsApp
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3 className="footer-title">İletişim</h3>
          <ul className="footer-contact">
            <li>+90 532 795 8765</li>
            <li>arkeolog_99@hotmail.com</li>
            <li>Sakarya, Türkiye</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CactusJackShop - Tüm hakları saklıdır.</p>
        <div className="footer-bottom-links">
            <a href="#">Gizlilik Politikası</a>
            <span>•</span>
            <a href="#">Kullanım Koşulları</a>
        </div>
      </div>
    </footer>
  );
}
