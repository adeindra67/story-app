import AddStoryPresenter from '../../presenters/AddStoryPresenter.js';
import { addNewStory, checkAuth } from '../../data/api';
import { realtimeValidationHandler } from '../../utils/validation-handler.js';
import Swal from 'sweetalert2';

class AddStoryPage {
  #presenter = null;
  #pageContentContainerElement = null;
  #formElement = null;
  #descriptionTextarea = null;
  #submitButtonElement = null;
  #messageContainerElement = null;
  #cameraPreviewElement = null;
  #photoPreviewElement = null;
  #photoCanvasElement = null;
  #startCameraButtonElement = null;
  #uploadButtonElement = null;
  #photoUploadInputElement = null;
  #capturePhotoButtonElement = null;
  #changePhotoButtonElement = null; 
  #cancelCameraButtonElement = null;
  #locationPickerMapDivElement = null;
  #latitudeInputElement = null;
  #longitudeInputElement = null;
  #selectedLocationTextElement = null;
  #cameraStream = null;
  #capturedPhotoData = null;
  #locationPickerMapInstance = null;
  #locationMarker = null;

  async render() {
    return `
      <section class="container add-story-container" id="addStoryPageContent">
        <h1 class="page-title">Tambah Cerita Baru</h1>
        <form id="addStoryForm" class="form" novalidate>
          <div class="form-group">
            <label for="storyDescription">Deskripsi Cerita:</label>
            <textarea id="storyDescription" name="description" rows="4" required
                      aria-describedby="descriptionValidation"></textarea>
            <p id="descriptionValidation" class="validation-message" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label>Foto Cerita:</label>
            <div id="cameraPreviewContainer" class="camera-preview-container">
              <video id="cameraPreview" autoplay muted playsinline class="hidden"></video>
              <img id="photoPreview" src="#" alt="Preview Foto" class="photo-preview hidden">
              <canvas id="photoCanvas" class="hidden"></canvas>
              <div class="camera-placeholder">
                <i class="fas fa-image fa-3x"></i>
                <p>Pilih sumber gambar Anda</p>
              </div>
            </div>
            <div class="camera-controls">
              <button type="button" id="startCameraButton" class="button">
                <i class="fas fa-camera"></i> Mulai Kamera
              </button>
              <button type="button" id="uploadButton" class="button">
                <i class="fas fa-image"></i> Pilih dari Galeri
              </button>
              <button type="button" id="capturePhotoButton" class="button hidden">Ambil Foto</button>
              <button type="button" id="changePhotoButton" class="button hidden">
                <i class="fas fa-redo"></i> Ganti Foto
              </button>
              <button type="button" id="cancelCameraButton" class="button button-danger hidden">
                <i class="fas fa-times"></i> Batal
              </button>
            </div>
            <input type="file" id="photoUpload" class="hidden" accept="image/*">
          </div>
          <div class="form-group">
            <label>Pilih Lokasi Cerita:</label>
            <p class="location-info">Klik pada peta untuk memilih lokasi.</p>
            <div id="locationPickerMap" class="location-picker-map"></div>
            <input type="hidden" id="latitude" name="lat">
            <input type="hidden" id="longitude" name="lon">
            <p>Lokasi terpilih: <span id="selectedLocationText">Belum ada</span></p>
          </div>
          <button type="submit" id="submitStoryButton" class="button button-primary">Unggah Cerita</button>
        </form>
        <div id="messageContainerAddStory" class="message-container" role="alert"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#pageContentContainerElement = document.getElementById('addStoryPageContent');
    this.#formElement = document.getElementById('addStoryForm');
    this.#descriptionTextarea = document.getElementById('storyDescription');
    this.#submitButtonElement = document.getElementById('submitStoryButton');
    this.#messageContainerElement = document.getElementById('messageContainerAddStory');
    this.#cameraPreviewElement = document.getElementById('cameraPreview');
    this.#photoPreviewElement = document.getElementById('photoPreview');
    this.#photoCanvasElement = document.getElementById('photoCanvas');
    this.#startCameraButtonElement = document.getElementById('startCameraButton');
    this.#uploadButtonElement = document.getElementById('uploadButton');
    this.#photoUploadInputElement = document.getElementById('photoUpload');
    this.#capturePhotoButtonElement = document.getElementById('capturePhotoButton');
    this.#changePhotoButtonElement = document.getElementById('changePhotoButton');
    this.#cancelCameraButtonElement = document.getElementById('cancelCameraButton');
    this.#locationPickerMapDivElement = document.getElementById('locationPickerMap');
    this.#latitudeInputElement = document.getElementById('latitude');
    this.#longitudeInputElement = document.getElementById('longitude');
    this.#selectedLocationTextElement = document.getElementById('selectedLocationText');

    if (this.#messageContainerElement) {
      this.#messageContainerElement.setAttribute('aria-live', 'polite');
    }

    const storyModel = { addNewStory, checkAuth };
    this.#presenter = new AddStoryPresenter({ view: this, model: storyModel });
    this.#presenter.pageInitialized();
  }

  onUserAuthenticated() {
    this._setupImageHandlers();
    this._setupLocationPickerMap();
    this._setupRealtimeValidation();
    this._setupFormSubmitListener();
    window.addEventListener('hashchange', this._cleanupResources.bind(this));
  }
  
  _setupImageHandlers() {
    if (this.#startCameraButtonElement) this.#startCameraButtonElement.addEventListener('click', this._startCamera.bind(this));
    if (this.#capturePhotoButtonElement) this.#capturePhotoButtonElement.addEventListener('click', this._capturePhoto.bind(this));
    if (this.#changePhotoButtonElement) this.#changePhotoButtonElement.addEventListener('click', this._resetToInitialState.bind(this));
    if (this.#cancelCameraButtonElement) this.#cancelCameraButtonElement.addEventListener('click', this._resetToInitialState.bind(this));
    if (this.#uploadButtonElement && this.#photoUploadInputElement) {
      this.#uploadButtonElement.addEventListener('click', () => {
        this.#photoUploadInputElement.click();
      });
      this.#photoUploadInputElement.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          this.#capturedPhotoData = file;
          this._setUIState('previewActive');
        }
      });
    }
  }

  _resetToInitialState() {
    this._stopCameraStream();
    this.#capturedPhotoData = null;
    if (this.#photoUploadInputElement) this.#photoUploadInputElement.value = '';
    this._setUIState('initial');
  }

  _setUIState(state) {
    const cameraPlaceholder = document.querySelector('.camera-placeholder');
    switch (state) {
      case 'cameraActive':
        if(cameraPlaceholder) cameraPlaceholder.classList.add('hidden');
        if(this.#cameraPreviewElement) this.#cameraPreviewElement.classList.remove('hidden');
        if(this.#photoPreviewElement) this.#photoPreviewElement.classList.add('hidden');
        if(this.#startCameraButtonElement) this.#startCameraButtonElement.classList.add('hidden');
        if(this.#uploadButtonElement) this.#uploadButtonElement.classList.add('hidden');
        if(this.#capturePhotoButtonElement) this.#capturePhotoButtonElement.classList.remove('hidden');
        if(this.#changePhotoButtonElement) this.#changePhotoButtonElement.classList.add('hidden');
        if(this.#cancelCameraButtonElement) this.#cancelCameraButtonElement.classList.remove('hidden');
        break;
      case 'previewActive':
        if(cameraPlaceholder) cameraPlaceholder.classList.add('hidden');
        if(this.#cameraPreviewElement) this.#cameraPreviewElement.classList.add('hidden');
        if(this.#photoPreviewElement) {
          this.#photoPreviewElement.src = URL.createObjectURL(this.#capturedPhotoData);
          this.#photoPreviewElement.classList.remove('hidden');
        }
        if(this.#startCameraButtonElement) this.#startCameraButtonElement.classList.add('hidden');
        if(this.#uploadButtonElement) this.#uploadButtonElement.classList.add('hidden');
        if(this.#capturePhotoButtonElement) this.#capturePhotoButtonElement.classList.add('hidden');
        if(this.#changePhotoButtonElement) this.#changePhotoButtonElement.classList.remove('hidden');
        if(this.#cancelCameraButtonElement) this.#cancelCameraButtonElement.classList.add('hidden');
        break;
      case 'initial':
      default:
        if(cameraPlaceholder) cameraPlaceholder.classList.remove('hidden');
        if(this.#cameraPreviewElement) this.#cameraPreviewElement.classList.add('hidden');
        if(this.#photoPreviewElement) {
          this.#photoPreviewElement.classList.add('hidden');
          this.#photoPreviewElement.src = '#';
        }
        if(this.#startCameraButtonElement) this.#startCameraButtonElement.classList.remove('hidden');
        if(this.#uploadButtonElement) this.#uploadButtonElement.classList.remove('hidden');
        if(this.#capturePhotoButtonElement) this.#capturePhotoButtonElement.classList.add('hidden');
        if(this.#changePhotoButtonElement) this.#changePhotoButtonElement.classList.add('hidden');
        if(this.#cancelCameraButtonElement) this.#cancelCameraButtonElement.classList.add('hidden');
        break;
    }
  }

  async _startCamera() {
    try {
      this.#cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if(this.#cameraPreviewElement) this.#cameraPreviewElement.srcObject = this.#cameraStream;
      this._setUIState('cameraActive');
    } catch (error) {
      this.showSubmitError('Tidak bisa mengakses kamera. Pastikan Anda memberikan izin.');
    }
  }

  _capturePhoto() {
    if (!this.#cameraStream || !this.#cameraStream.active) {
      this.showSubmitError('Kamera tidak aktif.');
      return;
    }
    if(this.#photoCanvasElement && this.#cameraPreviewElement) {
      this.#photoCanvasElement.width = this.#cameraPreviewElement.videoWidth;
      this.#photoCanvasElement.height = this.#cameraPreviewElement.videoHeight;
      const context = this.#photoCanvasElement.getContext('2d');
      context.drawImage(this.#cameraPreviewElement, 0, 0, this.#photoCanvasElement.width, this.#photoCanvasElement.height);
      this.#photoCanvasElement.toBlob((blob) => {
        this.#capturedPhotoData = blob;
        this._setUIState('previewActive');
      }, 'image/jpeg', 0.9);
    }
    this._stopCameraStream();
  }

  _setupLocationPickerMap() {
    if (this.#locationPickerMapDivElement && typeof L !== 'undefined') {
      const defaultCenter = [-2.548926, 118.0148634];
      const defaultZoom = 5;
      if (this.#locationPickerMapInstance) {
        this.#locationPickerMapInstance.remove();
        this.#locationPickerMapInstance = null;
      }
      const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      const osmHot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>',
        maxZoom: 19,
      });
      const baseLayers = { 'Standar OSM': osmStandard, 'OSM Humanitarian': osmHot };
      this.#locationPickerMapInstance = L.map(this.#locationPickerMapDivElement, {
        center: defaultCenter,
        zoom: defaultZoom,
        layers: [osmStandard],
      });
      L.control.layers(baseLayers).addTo(this.#locationPickerMapInstance);
      this.#locationPickerMapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (this.#latitudeInputElement) this.#latitudeInputElement.value = lat.toFixed(7);
        if (this.#longitudeInputElement) this.#longitudeInputElement.value = lng.toFixed(7);
        if (this.#selectedLocationTextElement) this.#selectedLocationTextElement.textContent = `Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`;
        if (this.#locationMarker) this.#locationPickerMapInstance.removeLayer(this.#locationMarker);
        this.#locationMarker = L.marker([lat, lng]).addTo(this.#locationPickerMapInstance).bindPopup('Lokasi cerita akan diambil dari sini.').openPopup();
      });
    } else if (this.#locationPickerMapDivElement && !(typeof L !== 'undefined')) {
      this.#locationPickerMapDivElement.innerHTML = '<p class="message-error">Gagal memuat library peta.</p>';
    }
  }

  _setupRealtimeValidation() {
    if (this.#descriptionTextarea) {
      this.#descriptionTextarea.addEventListener('blur', realtimeValidationHandler);
      this.#descriptionTextarea.addEventListener('input', realtimeValidationHandler);
    }
  }

  // 

  _validateAllFieldsBeforeSubmit() {
    let isFormValid = true;
    if (this.#descriptionTextarea) {
      realtimeValidationHandler({ target: this.#descriptionTextarea });
      if (!this.#descriptionTextarea.validity.valid) isFormValid = false;
    }
    if (!this.#capturedPhotoData) {
      this.showSubmitError('Foto cerita belum diambil. Silakan gunakan kamera.');
      isFormValid = false;
    }
    return isFormValid;
  }
  
  _setupFormSubmitListener() {
    if (this.#formElement && this.#submitButtonElement) {
      this.#formElement.addEventListener('submit', (event) => {
        event.preventDefault();
        if (this.#submitButtonElement.disabled) return;
        const isClientValid = this._validateAllFieldsBeforeSubmit();
        if (!isClientValid) {
          if (this.#descriptionTextarea && !this.#descriptionTextarea.validity.valid) this.#descriptionTextarea.focus();
          return;
        }
        const description = this.#descriptionTextarea.value.trim();
        const photo = this.#capturedPhotoData;
        const lat = this.#latitudeInputElement ? this.#latitudeInputElement.value : '';
        const lon = this.#longitudeInputElement ? this.#longitudeInputElement.value : '';
        this.#presenter.handleAddStorySubmit({ description, photo, lat, lon });
      });
    }
  }

  showLoading() {
    if (this.#submitButtonElement) this.#submitButtonElement.disabled = true;
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = 'Sedang mengunggah cerita...';
      this.#messageContainerElement.className = 'message-container message-info';
    }
  }

  hideLoading() {
    if (this.#submitButtonElement) this.#submitButtonElement.disabled = false;
  }

  showSubmitSuccess(message) {
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = message;
      this.#messageContainerElement.className = 'message-container message-success';
    }
  }

  showSubmitError(message) {
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = message;
      this.#messageContainerElement.className = 'message-container message-error';
    }
  }

  clearFormAndUI() {
    if (this.#formElement) this.#formElement.reset();
    if (this.#descriptionTextarea) {
      const descValidationEl = document.getElementById('descriptionValidation');
      if (descValidationEl) descValidationEl.textContent = '';
      this.#descriptionTextarea.classList.remove('input-invalid');
    }
    this.#capturedPhotoData = null;
    if (this.#photoPreviewElement) { this.#photoPreviewElement.src = '#'; this.#photoPreviewElement.classList.add('hidden'); }
    if (this.#cameraPreviewElement) this.#cameraPreviewElement.classList.add('hidden');
    if (this.#startCameraButtonElement) this.#startCameraButtonElement.classList.remove('hidden');
    if (this.#capturePhotoButtonElement) this.#capturePhotoButtonElement.classList.add('hidden');
    if (this.#changePhotoButtonElement) this.#changePhotoButtonElement.classList.add('hidden');
    if (this.#selectedLocationTextElement) this.#selectedLocationTextElement.textContent = 'Belum ada';
    if (this.#latitudeInputElement) this.#latitudeInputElement.value = '';
    if (this.#longitudeInputElement) this.#longitudeInputElement.value = '';
    if (this.#locationPickerMapInstance && this.#locationMarker) {
        this.#locationPickerMapInstance.removeLayer(this.#locationMarker);
        this.#locationMarker = null;
    }
    this._stopCameraStream();
  }

  showLoginRequiredMessageAndRedirect() {
    if (this.#pageContentContainerElement) {
      this.#pageContentContainerElement.classList.add('is-displaying-message'); 
      this.#pageContentContainerElement.innerHTML = `
        <h1 class="page-title" style="margin-top: 20px;">Akses Ditolak</h1>
        <p class="message-container message-info" style="margin: 20px auto; max-width: 80%;">
          Anda harus login untuk menambahkan cerita baru. Mengarahkan ke halaman login...
        </p>
      `;
    }
    this._cleanupResources(); 
    setTimeout(() => {
        window.location.hash = '#/login';
    }, 2000); 
  }

  redirectToStoriesPage() {
    setTimeout(() => { window.location.hash = '#/stories'; }, 1500);
  }

  _stopCameraStream() {
    if (this.#cameraStream) {
      this.#cameraStream.getTracks().forEach((track) => track.stop());
      this.#cameraStream = null;
    }
  }

  _cleanupResources() {
    this._stopCameraStream();
    if (this.#locationPickerMapInstance) {
      this.#locationPickerMapInstance.remove();
      this.#locationPickerMapInstance = null;
    }
    window.removeEventListener('hashchange', this._cleanupResources.bind(this));
  }
}

export default AddStoryPage;