import DetailStoryPresenter from '../../presenters/DetailStoryPresenter.js';
import { getStoryById } from '../../data/api.js';
import FavoriteStoryIdb from '../../data/database-helper.js';
import { parseActiveUrlWithCombiner } from '../../routes/url-parser.js';
import { showFormattedDate } from '../../utils/index.js';
import Swal from 'sweetalert2';

class DetailStoryPage {
  #presenter = null;
  #pageContainerElement = null;
  #storyDetailContainerElement = null;

  async render() {
    return `
      <section class="container" id="detailPageContainer">
        <div id="storyDetailContainer">
          <!-- Konten akan dimuat di sini -->
        </div>
        <div id="loadingIndicatorContainer"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#pageContainerElement = document.getElementById('detailPageContainer');
    this.#storyDetailContainerElement = document.getElementById('storyDetailContainer');

    const url = parseActiveUrlWithCombiner();
    const storyId = url.id;
    const fromFavorites = url.query.from === 'favorites';

    const storyDetailModel = {
      getStoryById,
      getStoryFromDb: FavoriteStoryIdb.getStory,
      putStoryToDb: FavoriteStoryIdb.putStory,
      deleteStoryFromDb: FavoriteStoryIdb.deleteStory,
    };

    this.#presenter = new DetailStoryPresenter({
      view: this,
      model: storyDetailModel,
      storyId,
      fromFavorites,
    });
  }

  showLoading() {
    const loadingContainer = document.getElementById('loadingIndicatorContainer');
    if (loadingContainer) {
      loadingContainer.innerHTML = '<p class="message-container message-info">Memuat detail cerita...</p>';
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById('loadingIndicatorContainer');
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }

  showError(message) {
    if (this.#pageContainerElement) {
      this.#pageContainerElement.innerHTML = `<p class="message-container message-error" style="text-align: center;">Error: ${message}</p>`;
    }
  }

  displayStoryDetail(story, isSaved, fromFavorites) {
    if (!this.#storyDetailContainerElement) return;
    this.hideLoading();

    const formattedDate = showFormattedDate(story.createdAt);
    const mapId = `detail-map-${story.id}`;

    const backButtonUrl = fromFavorites ? '#/favorites' : '#/stories';
    const backButtonText = fromFavorites ? 'Kembali ke Favorit' : 'Kembali ke Daftar';

    const actionButtonHtml = fromFavorites
      ? `<button class="button button-danger" id="detailDeleteButton" aria-label="Hapus ${story.name} dari favorit">
           <i class="fas fa-trash-alt"></i> Hapus dari Favorit
         </button>`
      : `<button class="button save-button ${isSaved ? 'saved' : ''}" id="detailSaveButton" aria-label="${isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit'}">
           <i class="fa-heart ${isSaved ? 'fas' : 'far'}"></i> ${isSaved ? 'Tersimpan' : 'Simpan'}
         </button>`;

    this.#storyDetailContainerElement.innerHTML = `
      <div class="back-button-container">
        <a href="${backButtonUrl}" class="button back-button">
          <i class="fas fa-arrow-left"></i> ${backButtonText}
        </a>
      </div>
      <article class="story-detail">
        <h1 class="page-title story-detail__title">${story.name}</h1>
        <p class="story-detail__author">Dibuat oleh: ${story.name}</p>
        <p class="story-detail__date">Pada: ${formattedDate}</p>
        
        <img src="${story.photoUrl}" alt="Gambar untuk cerita ${story.name}" class="story-detail__image">
        
        <div class="story-detail__content">
          <p class="story-detail__description">${story.description}</p>
        </div>
        
        ${story.lat != null && story.lon != null ? `
          <div class="story-detail__location">
            <h2>Lokasi Cerita</h2>
            <div id="${mapId}" class="story-map-container" style="height: 300px;"></div>
          </div>
        ` : ''}

        <div class="story-detail__actions">
          ${actionButtonHtml}
        </div>
      </article>
    `;

    this._initializeMap(story, mapId);
    
    if (fromFavorites) {
      this._attachDeleteButtonListener();
    } else {
      this._attachSaveButtonListener();
    }
  }
  
  _initializeMap(story, mapId) {
    if (story.lat != null && story.lon != null && typeof L !== 'undefined') {
      try {
        const mapContainer = document.getElementById(mapId);
        if (mapContainer) {
          const map = L.map(mapId, {
            center: [parseFloat(story.lat), parseFloat(story.lon)], zoom: 15
          });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          L.marker([parseFloat(story.lat), parseFloat(story.lon)])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b>`).openPopup();
        }
      } catch (e) { /* Gagal init peta */ }
    }
  }

  _attachSaveButtonListener() {
    const saveButton = document.getElementById('detailSaveButton');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.#presenter.handleSaveToggle();
      });
    }
  }
  
  _attachDeleteButtonListener() {
    const deleteButton = document.getElementById('detailDeleteButton');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.#presenter.handleDeleteStory();
      });
    }
  }
  
  updateSaveButtonState(isSaved) {
    const saveButton = document.getElementById('detailSaveButton');
    if (saveButton) {
      saveButton.classList.toggle('saved', isSaved);
      saveButton.innerHTML = `
        <i class="fa-heart ${isSaved ? 'fas' : 'far'}"></i> ${isSaved ? 'Tersimpan' : 'Simpan'}
      `;
      saveButton.setAttribute('aria-label', isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit');
    }
  }

  redirectToFavorites() {
    window.location.hash = '#/favorites';
  }
}

export default DetailStoryPage;
