import '../styles/styles.css';
import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-to-content-link');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function (event) {
      event.preventDefault();
      skipLink.blur();

      if (mainContent.getAttribute('tabindex') === null) {
        mainContent.setAttribute('tabindex', '-1');
      }
      mainContent.focus();
    });
  }
});
