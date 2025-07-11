class AddStoryPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async pageInitialized() {
    if (!this.#view) return;

    
    if (!this.#model.checkAuth()) {
      this.#view.showLoginRequiredMessageAndRedirect();
      return false;
    }

    this.#view.onUserAuthenticated();
    return true;
  }

  async handleAddStorySubmit({ description, photo, lat, lon }) {
    if (!this.#view || !this.#model || !this.#model.addNewStory || !this.#model.checkAuth) {
      this.#view.showSubmitError('Kesalahan sistem: Gagal mengirim cerita.');
      return;
    }

    if (!this.#model.checkAuth()) {
      this.#view.showSubmitError('Sesi Anda mungkin telah berakhir. Silakan login kembali.');
      this.#view.redirectToLogin(); 
      return;
    }

    try {
      this.#view.showLoading();

      const storyData = { description, photo };
      if (lat !== null && lat !== undefined && String(lat).trim() !== '') {
        storyData.lat = parseFloat(lat);
      }
      if (lon !== null && lon !== undefined && String(lon).trim() !== '') {
        storyData.lon = parseFloat(lon);
      }

      const result = await this.#model.addNewStory(storyData);

      this.#view.showSubmitSuccess(result.message || 'Cerita berhasil ditambahkan!');
      this.#view.clearFormAndUI();
      this.#view.redirectToStoriesPage();

    } catch (error) {
      this.#view.showSubmitError(error.message || 'Gagal menambahkan cerita.');
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default AddStoryPresenter;