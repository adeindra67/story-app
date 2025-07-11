import '../../../styles/about-page.css'; // Impor file CSS khusus untuk halaman ini

class AboutPage {
  async render() {
    return `
      <div class="about-page">
        <!-- Bagian Header Halaman About -->
        <section class="about-hero">
          <div class="container">
            <h1 class="page-title about-hero__title">Tentang Aplikasi Cerita</h1>
            <p class="about-hero__subtitle">Menghubungkan Dunia Melalui Setiap Kisah yang Berharga</p>
          </div>
        </section>

        <!-- Bagian Misi Kami -->
        <section class="page-section container">
          <h2 class="section-title">Misi Kami</h2>
          <div class="mission-content">
            <div class="mission-text">
              <p>Kami percaya bahwa setiap orang memiliki cerita yang layak untuk dibagikan dan didengar. Misi kami adalah menyediakan sebuah ruang yang sederhana, aman, dan indah bagi Anda untuk mengabadikan momen, berbagi pengalaman, dan terhubung dengan orang lain melalui kekuatan narasi.</p>
              <p>Di dunia yang serba cepat, kami ingin menciptakan oase di mana setiap kisah, besar atau kecil, dapat menemukan tempatnya dan menginspirasi orang lain.</p>
            </div>
            <div class="mission-image">
              <img src="https://assets.cdn.dicoding.com/original/impact-report/company-profile.avif" alt="Ilustrasi komunitas orang">
            </div>
          </div>
        </section>

        <!-- Bagian Cara Kerja -->
        <section class="page-section how-it-works">
          <div class="container">
            <h2 class="section-title">Bagaimana Ini Bekerja?</h2>
            <div class="steps-list">
              <article class="step-item">
                <div class="step-number">1</div>
                <h3 class="step-title">Bagikan Cerita</h3>
                <p>Gunakan kamera dan peta interaktif untuk membuat cerita Anda lebih hidup. Tuliskan narasi Anda dan bagikan dengan dunia.</p>
              </article>
              <article class="step-item">
                <div class="step-number">2</div>
                <h3 class="step-title">Temukan & Jelajahi</h3>
                <p>Jelajahi daftar cerita dari pengguna lain. Temukan perspektif baru dan lihat dunia dari sudut pandang yang berbeda.</p>
              </article>
              <article class="step-item">
                <div class="step-number">3</div>
                <h3 class="step-title">Simpan yang Berkesan</h3>
                <p>Simpan cerita-cerita yang menyentuh atau menginspirasi Anda. Akses kembali kapan saja, bahkan saat Anda sedang offline.</p>
              </article>
            </div>
          </div>
        </section>
        
        <!-- Bagian Dari Pengembang -->
        <section class="page-section container from-developer">
            <h2 class="section-title">Dari Pengembang</h2>
            <p class="developer-note">
              Aplikasi ini dibangun dengan cinta dan teknologi web modern sebagai bagian dari perjalanan belajar di Dicoding. Terima kasih telah menjadi bagian dari komunitas ini.
            </p>
            <p class="developer-name">- Indra D.S -</p>
        </section>
      </div>
    `;
  }

  async afterRender() {
  }
}

export default AboutPage;
