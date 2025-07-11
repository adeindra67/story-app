import UserAuth from '../../data/user-auth.js';
import '../../../styles/home-page.css';

class HomePage {
  async render() {
    const isLoggedIn = UserAuth.isAuthenticated();

    const ctaButtonHtml = isLoggedIn
      ? `<a href="#/stories/add" class="button button-primary cta-button">Bagikan Cerita Anda</a>`
      : `<a href="#/login" class="button button-primary cta-button">Mulai Sekarang</a>`;

    return `
      <div class="hero">
        <div class="hero__inner container">
          <div class="hero__text">
            <h1 class="hero__title">Bagikan Kisahmu, Jelajahi Dunia</h1>
            <p class="hero__tagline">Platform untuk berbagi momen, pengalaman, dan menemukan cerita menarik dari berbagai penjuru.</p>
            ${ctaButtonHtml}
          </div>
          <div class="hero__image">
            <img 
              src="	https://assets.cdn.dicoding.com/original/commons/homepage-hero.png" 
              alt="Logo Dicoding" 
              style="width: 100%; height: auto; max-width: 800px;">
          </div>
        </div>
      </div>

      <section id="features" class="page-section container">
        <h2 class="section-title">Fitur Unggulan</h2>
        <div class="features-list">
          <article class="feature-item">
            <div class="feature-icon-wrapper">
              <i class="fas fa-camera fa-2x feature-icon"></i>
            </div>
            <h3 class="feature-title">Abadikan Momen</h3>
            <p class="feature-description">Ambil foto langsung dari kamera perangkat Anda dan ceritakan kisah di baliknya.</p>
          </article>
          <article class="feature-item">
            <div class="feature-icon-wrapper">
              <i class="fas fa-map-marked-alt fa-2x feature-icon"></i>
            </div>
            <h3 class="feature-title">Sematkan Lokasi</h3>
            <p class="feature-description">Tandai lokasi di peta untuk memberikan konteks geografis pada cerita Anda.</p>
          </article>
          <article class="feature-item">
            <div class="feature-icon-wrapper">
              <i class="fas fa-heart fa-2x feature-icon"></i>
            </div>
            <h3 class="feature-title">Simpan Favorit</h3>
            <p class="feature-description">Simpan cerita yang menginspirasi untuk dibaca kembali kapan saja, bahkan saat offline.</p>
          </article>
        </div>
      </section>

      <section class="cta-section">
        <div class="container">
          <h2 class="section-title">Jelajahi Dunia Penuh Cerita</h2>
          <p>Ribuan momen dan pengalaman menanti untuk ditemukan. Lihat apa yang telah dibagikan oleh komunitas kami.</p>
          <a href="#/stories" class="button button-primary cta-button">Jelajahi Semua Cerita</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    
  }
}

export default HomePage;
