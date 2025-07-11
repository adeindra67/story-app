import FavoriteStoriesPresenter from '../../presenters/FavoriteStoriesPresenter.js';
import FavoriteStoryIdb from '../../data/database-helper.js';
import { showFormattedDate } from '../../utils/index.js';

class FavoriteStoriesPage {
  #presenter = null;
  #pageContentContainerElement = null;
  #favoriteStoriesContainerElement = null;

  async render() {
    return `
      <section class="container" id="favoriteStoriesPageContent">
        <h1 class="page-title">Cerita Tersimpan</h1>
        <div id="favoriteStoriesListContainer" class="stories-list">
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#pageContentContainerElement = document.getElementById('favoriteStoriesPageContent');
    this.#favoriteStoriesContainerElement = document.getElementById('favoriteStoriesListContainer');

    const favoriteStoryModel = {
      getAllStoriesFromDb: FavoriteStoryIdb.getAllStories,
      deleteStoryFromDb: FavoriteStoryIdb.deleteStory,
    };

    this.#presenter = new FavoriteStoriesPresenter({
      view: this,
      model: favoriteStoryModel,
    });

    this.#presenter.loadSavedStories();
  }

  showLoading() {
    if (this.#favoriteStoriesContainerElement) {
      this.#favoriteStoriesContainerElement.classList.add('is-displaying-message');
      this.#favoriteStoriesContainerElement.innerHTML =
        '<p class="message-container message-info">Memuat cerita tersimpan...</p>';
    }
  }

  showError(message) {
    if (this.#favoriteStoriesContainerElement) {
      this.#favoriteStoriesContainerElement.classList.add('is-displaying-message');
      this.#favoriteStoriesContainerElement.innerHTML = `<p class="message-container message-error">Error: ${message}</p>`;
    }
  }

  displayFavoriteStories(stories) {
    if (!this.#favoriteStoriesContainerElement) return;
    this.#favoriteStoriesContainerElement.classList.remove('is-displaying-message');

    if (stories && stories.length > 0) {
      this.#favoriteStoriesContainerElement.innerHTML = '';

      stories.forEach((story) => {
        const storyElement = document.createElement('article');
        storyElement.classList.add('story-item');

        storyElement.addEventListener('click', () => {
        window.location.hash = `#/stories/${story.id}?from=favorites`;
        });

        const formattedDate = showFormattedDate(story.createdAt);
        const mapId = `map-favorite-${story.id}`; 

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
              <button class="button button-danger delete-button" data-id="${story.id}" aria-label="Hapus ${story.name} dari favorit">
                <i class="fas fa-trash-alt"></i> Hapus
              </button>
            </div>
          </div>
        `;
        this.#favoriteStoriesContainerElement.appendChild(storyElement);

        if (story.lat != null && story.lon != null && typeof L !== 'undefined') {
          try {
            const mapContainerElement = storyElement.querySelector(`#${mapId}`);
            if (mapContainerElement) {
              const map = L.map(mapId, {
                center: [parseFloat(story.lat), parseFloat(story.lon)],
                zoom: 14
              });
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);
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

      this._attachDeleteButtonListeners();
    } else {
      this.#favoriteStoriesContainerElement.classList.add('is-displaying-message');
      this.#favoriteStoriesContainerElement.innerHTML =
        '<p class="message-container message-info">Anda belum memiliki cerita yang disimpan.</p>';
    }
  }

  _attachDeleteButtonListeners() {
    const deleteButtons = this.#favoriteStoriesContainerElement.querySelectorAll('.delete-button');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const storyId = button.dataset.id;
        this.#presenter.handleDeleteStory(storyId);
      });
    });
  }
}

export default FavoriteStoriesPage;
