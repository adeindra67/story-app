Storia ID - Aplikasi Cerita PWA
Ini adalah proyek submission akhir untuk kelas Belajar Pengembangan Web Intermediate dari Dicoding Indonesia. Aplikasi ini dibangun sebagai Progressive Web App (PWA) modern yang memungkinkan pengguna untuk berbagi dan menemukan cerita dari berbagai lokasi.

🚀 Live Demo
Aplikasi ini sudah di-deploy dan dapat diakses secara publik melalui Netlify:

https://indra-story-app.netlify.app/

✨ Fitur Utama
Aplikasi ini dibangun dengan serangkaian fitur modern untuk memberikan pengalaman pengguna yang kaya dan andal:

Autentikasi Pengguna: Alur lengkap untuk registrasi, login, dan logout.

Berbagi Cerita: Pengguna dapat menambahkan cerita baru dengan deskripsi dan foto.

Input Gambar Fleksibel: Mendukung pengambilan gambar langsung dari kamera perangkat atau mengunggah dari galeri.

Geolokasi: Menyematkan lokasi pada setiap cerita menggunakan peta interaktif Leaflet.js.

Simpan Cerita (Favorit): Pengguna dapat menyimpan cerita yang mereka sukai. Data disimpan secara lokal menggunakan IndexedDB, memungkinkan akses ke cerita favorit bahkan saat offline.

Halaman Detail: Setiap cerita dapat dilihat secara detail pada halaman tersendiri.

Progressive Web App (PWA):

Dapat Diinstal: Aplikasi dapat dipasang ke homescreen di perangkat mobile maupun desktop.

Akses Offline: Berkat Service Worker dan Workbox, aplikasi dapat diakses dan dijelajahi bahkan tanpa koneksi internet. Aset, gambar, dan data cerita yang pernah dimuat akan disajikan dari cache.

Push Notification: Pengguna dapat berlangganan notifikasi untuk menerima pembaruan.

Desain Responsif & Profesional: Antarmuka yang bersih, modern, dan beradaptasi dengan baik di berbagai ukuran layar, dari mobile hingga desktop.

Pengalaman Pengguna (UX) yang Disempurnakan:

Validasi Formulir Realtime: Memberikan umpan balik langsung saat pengguna mengisi formulir.

Dialog Konfirmasi: Menggunakan SweetAlert2 untuk konfirmasi pada aksi penting seperti logout dan hapus cerita.

Transisi Halaman Halus: Menggunakan View Transition API untuk perpindahan antar halaman yang mulus.

Aksesibilitas: Dibangun dengan memperhatikan standar aksesibilitas, termasuk skip-to-content, hierarki heading yang benar, dan label yang tepat.

📸 Tangkapan Layar (Screenshots)
[Gambar Tampilan Daftar Cerita di Desktop]

[Gambar Tampilan Tambah Cerita di Mobile]

🛠️ Tumpukan Teknologi (Tech Stack)
Frontend: HTML, CSS, JavaScript (Vanilla JS, ES6+)

Build Tool: Vite

Service Worker & Caching: Workbox (dengan strategi generateSW)

Database Lokal: IndexedDB (dengan library idb sebagai wrapper)

Peta: Leaflet.js

Notifikasi UI: SweetAlert2

Ikon: Font Awesome

Code Formatter: Prettier

⚙️ Instalasi & Menjalankan Proyek Secara Lokal
Untuk menjalankan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut:

Clone repositori ini:

git clone https://github.com/adeindra67/story-app.git

Masuk ke direktori proyek:

cd story-app

Instal semua dependensi:

npm install

Jalankan di mode development:
Aplikasi akan berjalan di http://localhost:5173.

npm run dev

Untuk membuat build produksi:
Perintah ini akan membuat folder dist yang siap untuk di-deploy.

npm run build

Untuk menjalankan preview dari build produksi:

npm run preview

👨‍💻 Kredit
Proyek ini dibuat sebagai tugas akhir dari kelas Belajar Pengembangan Web Intermediate di Dicoding Indonesia.