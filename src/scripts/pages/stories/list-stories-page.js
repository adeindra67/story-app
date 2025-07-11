import ListStoriesPresenter from '../../presenters/ListStoriesPresenter.js';
import { getAllStories, checkAuth } from '../../data/api';
import FavoriteStoryIdb from '../../data/database-helper.js';
import { showFormattedDate } from '../../utils/index.js';

class ListStoriesPage {
  #presenter = null;
  #pageContentContainerElement = null;
  #storiesListContainerElement = null;

  async render() {
    return `
      <section class="container" id="listStoriesPageContent">
        <h1 class="page-title">Daftar Cerita</h1>
        <div id="storiesListContainer" class="stories-list">
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#pageContentContainerElement = document.getElementById('listStoriesPageContent');
    this.#storiesListContainerElement = document.getElementById('storiesListContainer');

    const storyModel = {
      getAllStoriesFromApi: getAllStories,
      checkAuth,
      getStoryFromDb: FavoriteStoryIdb.getStory,
      getAllStoriesFromDb: FavoriteStoryIdb.getAllStories,
      putStoryToDb: FavoriteStoryIdb.putStory,
      deleteStoryFromDb: FavoriteStoryIdb.deleteStory,
    };

    this.#presenter = new ListStoriesPresenter({
      view: this,
      model: storyModel,
    });

    this.#presenter.initialLoadStories();
  }

  showLoading() {
    if (this.#storiesListContainerElement) {
      this.#storiesListContainerElement.classList.add('is-displaying-message');
      this.#storiesListContainerElement.innerHTML =
        '<p class="message-container message-info">Memuat cerita...</p>';
    }
  }

  displayStories(stories, savedStoryIds = []) {
    if (!this.#storiesListContainerElement) return;

    this.#storiesListContainerElement.classList.remove('is-displaying-message');

    if (!this.#pageContentContainerElement.querySelector('.page-title')) {
      const titleElement = document.createElement('h1');
      titleElement.classList.add('page-title');
      titleElement.textContent = 'Daftar Cerita';
      this.#pageContentContainerElement.insertBefore(
        titleElement,
        this.#storiesListContainerElement,
      );
    }

    if (stories && stories.length > 0) {
      this.#storiesListContainerElement.innerHTML = '';

      stories.forEach((story) => {
        const storyElement = document.createElement('article');
        storyElement.classList.add('story-item');
        
        // MENAMBAHKAN EVENT LISTENER UNTUK NAVIGASI
        storyElement.addEventListener('click', () => {
          window.location.hash = `#/stories/${story.id}`;
        });

        const formattedDate = showFormattedDate(story.createdAt);
        const mapId = `map-${story.id}`;
        const isSaved = savedStoryIds.includes(story.id);

        storyElement.innerHTML = `
          <img src="${story.photoUrl}" alt="Gambar cerita dari ${story.name}" class="story-image">
          <div class="story-content">
            <h2 class="story-name">${story.name}</h2>
            <p class="story-date">Dibuat pada: ${formattedDate}</p>
            <p class="story-description">${story.description}</p>
            
            ${story.lat != null && story.lon != null ? `
              <div class="story-location">
                <p>Lokasi:</p>
                <div id="${mapId}" class="story-map-container"></div>
              </div>` : `
              <div class="story-location">
                <p>Lokasi tidak tersedia.</p>
              </div>`
            }

            <div class="story-actions">
              <button class="button save-button ${isSaved ? 'saved' : ''}" data-id="${story.id}" aria-label="${isSaved ? `Hapus ${story.name} dari favorit` : `Simpan ${story.name} ke favorit`}">
                <i class="fa-heart ${isSaved ? 'fas' : 'far'}"></i> ${isSaved ? 'Tersimpan' : 'Simpan'}
              </button>
            </div>
          </div>
        `;
        this.#storiesListContainerElement.appendChild(storyElement);

        if (story.lat != null && story.lon != null && typeof L !== 'undefined') {
          try {
            const mapContainerElement = storyElement.querySelector(`#${mapId}`);
            if (mapContainerElement) {
              const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              });
              const osmHot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>',
              });
              const baseLayers = { "Standar OSM": osmStandard, "OSM Humanitarian": osmHot };
              const map = L.map(mapId, {
                center: [parseFloat(story.lat), parseFloat(story.lon)], zoom: 14, layers: [osmStandard]
              });
              L.control.layers(baseLayers).addTo(map);
              L.marker([parseFloat(story.lat), parseFloat(story.lon)])
                .addTo(map)
                .bindPopup(`<b>${story.name}</b>`);
            }
          } catch (mapError) {
            const mapDiv = storyElement.querySelector(`#${mapId}`);
            if (mapDiv) mapDiv.innerHTML = '<p class="message-error">Gagal memuat peta.</p>';
          }
        }
      });

      this._attachSaveButtonListeners();
    } else {
      this.#storiesListContainerElement.classList.add('is-displaying-message');
      this.#storiesListContainerElement.innerHTML = '<p class="message-container message-info">Tidak ada cerita untuk ditampilkan saat ini.</p>';
    }
  }

  _attachSaveButtonListeners() {
    const saveButtons = this.#storiesListContainerElement.querySelectorAll('.save-button');
    saveButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const storyId = button.dataset.id;
        this.#presenter.handleSaveToggle(storyId);
      });
    });
  }

  showError(message) {
    if (this.#pageContentContainerElement) {
      this.#pageContentContainerElement.classList.add('is-displaying-message');
      this.#pageContentContainerElement.innerHTML = `
        <h1 class="page-title" style="margin-top: 20px; margin-bottom: 10px;">Terjadi Kesalahan</h1>
        <p class="message-container message-error" style="margin: 0 auto 20px auto; max-width: 80%;">
          Error: ${message}
        </p>
      `;
    }
  }

  redirectToLogin() {
    if (this.#pageContentContainerElement) {
      this.#pageContentContainerElement.classList.add('is-displaying-message');
      this.#pageContentContainerElement.innerHTML = `
        <div>
          <h1 class="page-title" style="margin-top: 20px; margin-bottom: 10px;">Akses Ditolak</h1>
          <p class="message-container message-info" style="margin: 0 auto 20px auto; max-width: 80%;">
            Anda harus login untuk melihat daftar cerita. Mengarahkan ke halaman login...
          </p>
        </div>
      `;
    }
    setTimeout(() => { window.location.hash = '#/login'; }, 2000);
  }
}

export default ListStoriesPage;
