import Swal from 'sweetalert2';
import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import { checkAuth, performLogout, sendPushSubscription, getUserInfo } from '../data/api';
import CONFIG from '../config';
import { urlBase64ToUint8Array } from '../utils';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #notificationButton = null;
  #profileMenu = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#notificationButton = document.getElementById('notificationButton');
    this.#profileMenu = document.querySelector('.profile-menu');

    this._initialAppShell();
  }

  _initialAppShell() {
    this.#setupDrawer();
    this._updateAuthNavLinks();
    this._setupLogoutButtonListener();
    this._setupNotificationButtonListener();
    this._updateNotificationButtonVisibility();
    this._setupProfileMenuListener();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });
    document.body.addEventListener('click', (event) => {
      if (this.#navigationDrawer && !this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }
      if (this.#navigationDrawer) {
        this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
          if (link.contains(event.target)) {
            this.#navigationDrawer.classList.remove('open');
          }
        });
      }
    });
  }

  _updateAuthNavLinks() {
    const isLoggedIn = checkAuth();

    const loginLink = document.querySelector('.nav-auth-login');
    const registerLink = document.querySelector('.nav-auth-register');
    const logoutLink = document.querySelector('.nav-auth-logout');
    const protectedLinks = document.querySelectorAll('.nav-protected');

    if (loginLink) loginLink.classList.toggle('hidden', isLoggedIn);
    if (registerLink) registerLink.classList.toggle('hidden', isLoggedIn);
    if (logoutLink) logoutLink.classList.toggle('hidden', !isLoggedIn);

    if (protectedLinks) {
      protectedLinks.forEach((link) => {
        link.classList.toggle('hidden', !isLoggedIn);
      });
    }

    const dropdownHeader = document.querySelector('.dropdown-header');
    if (dropdownHeader) {
      if (isLoggedIn) {
        const userInfo = getUserInfo(); 
        if (userInfo && userInfo.name) {
          dropdownHeader.innerHTML = `<p>Hai, <strong>${userInfo.name}</strong></p>`;
        }
      } else {
        dropdownHeader.innerHTML = '';
      }
    }
  }
  
  _setupProfileMenuListener() {
    const profileButton = document.querySelector('.profile-button');
    if (profileButton && this.#profileMenu) {
      profileButton.addEventListener('click', (event) => {
        event.stopPropagation();
        this.#profileMenu.classList.toggle('is-open');
      });
      document.body.addEventListener('click', (event) => {
        if (this.#profileMenu && !this.#profileMenu.contains(event.target)) {
          this.#profileMenu.classList.remove('is-open');
        }
      });
    }
  }

  _setupLogoutButtonListener() {
    const logoutButtons = document.querySelectorAll('#logoutButton, #logoutButtonDesktop');
    logoutButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        Swal.fire({
          title: 'Anda yakin ingin logout?',
          text: "Anda akan perlu login kembali untuk mengakses data cerita.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, logout!',
          cancelButtonText: 'Batal'
        }).then((result) => {
          if (result.isConfirmed) {
            performLogout();
            this._updateAuthNavLinks();
            window.location.hash = '#/login';
            if (this.#navigationDrawer) this.#navigationDrawer.classList.remove('open');
            Swal.fire({
              title: 'Logout!',
              text: 'Anda telah berhasil logout.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
          }
        });
      });
    });
  }

  async _updateNotificationButtonVisibility() {
    if (
      !('Notification' in window) ||
      !('PushManager' in window) ||
      !('serviceWorker' in navigator)
    ) {
      if (this.#notificationButton) this.#notificationButton.style.display = 'none';
      return;
    }

    const subscription = await this._getPushSubscription(false);
    if (subscription) {
      if (this.#notificationButton) this.#notificationButton.style.display = 'none';
    } else {
      if (this.#notificationButton) this.#notificationButton.style.display = 'inline-block';
    }
  }

  _setupNotificationButtonListener() {
    if (this.#notificationButton) {
      this.#notificationButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const result = await Notification.requestPermission();
        if (result === 'denied') {
          Swal.fire({
            title: 'Ditolak!',
            text: 'Izin notifikasi ditolak. Anda tidak akan menerima notifikasi.',
            icon: 'error',
          });
          return;
        }
        if (result === 'default') {
          Swal.fire({
            title: 'Diabaikan',
            text: 'Pilihan izin notifikasi ditutup. Coba lagi nanti.',
            icon: 'info',
          });
          return;
        }

        const subscription = await this._getPushSubscription(true);
        if (subscription) {
          try {
            await sendPushSubscription(subscription);
            Swal.fire({
              title: 'Berhasil!',
              text: 'Anda berhasil berlangganan notifikasi.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
            this._updateNotificationButtonVisibility();
          } catch (error) {
            Swal.fire({
              title: 'Gagal',
              text: `Gagal mengirim data langganan ke server: ${error.message}`,
              icon: 'error',
            });
          }
        }
      });
    }
  }

    _setupProfileMenuListener() {
    const profileButton = document.querySelector('.profile-button');
    if (profileButton && this.#profileMenu) {
      profileButton.addEventListener('click', (event) => {
        event.stopPropagation(); 
        this.#profileMenu.classList.toggle('is-open');
      });

      document.body.addEventListener('click', (event) => {
        if (this.#profileMenu && !this.#profileMenu.contains(event.target)) {
          this.#profileMenu.classList.remove('is-open');
        }
      });
    }
  }

  async _getPushSubscription(create = false) {
    try {
      const serviceWorker = await navigator.serviceWorker.ready;
      let subscription = await serviceWorker.pushManager.getSubscription();

      if (!subscription && create) {
        const vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await serviceWorker.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }
      return subscription;
    } catch (error) {
      Swal.fire({
        title: 'Subscribe Gagal',
        text: `Gagal melakukan subscribe ke layanan push: ${error.message}`,
        icon: 'error',
      });
      return null;
    }
  }

  async renderPage() {
    this._updateAuthNavLinks();
    this._updateNotificationButtonVisibility();
    const activePath = getActivePathname();
    let page = routes[activePath];
    if (!page) {
      const structuredRouteKey = getActiveRoute();
      page = routes[structuredRouteKey];
    }
    if (!page) {
      this.#content.innerHTML = '<h1>404 - Halaman Tidak Ditemukan</h1>';
      return;
    }
    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      if (page && typeof page.afterRender === 'function') {
        await page.afterRender();
      }
      return;
    }
    const transition = document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      if (page && typeof page.afterRender === 'function') {
        await page.afterRender();
      }
    });
    try {
      await transition.finished;
    } catch (error) {
      // Error pada transisi biasanya sudah ditangani browser.
    }
  }
}

export default App;

