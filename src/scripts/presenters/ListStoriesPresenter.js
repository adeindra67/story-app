class ListStoriesPresenter {
  #view = null;

  #model = null;

  #stories = [];

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialLoadStories() {
    if (!this.#view || !this.#model) return;

    if (!this.#model.checkAuth()) {
      this.#view.redirectToLogin();
      return;
    }

    this.#view.showLoading();

    try {
      const [apiStories, savedStories] = await Promise.all([
        this.#model.getAllStoriesFromApi(),
        this.#model.getAllStoriesFromDb(),
      ]);

      this.#stories = apiStories;
      const savedStoryIds = savedStories.map((story) => story.id);

      this.#view.displayStories(this.#stories, savedStoryIds);
    } catch (error) {
      this.#view.showError(
        error.message || 'Gagal memuat daftar cerita. Periksa koneksi internet Anda.',
      );
    }
  }

  async handleSaveToggle(storyId) {
    if (!this.#view || !this.#model) return;

    const isCurrentlySaved = await this.#model.getStoryFromDb(storyId);

    if (isCurrentlySaved) {
      await this.#model.deleteStoryFromDb(storyId);
    } else {
      const storyToSave = this.#stories.find((story) => story.id === storyId);
      if (storyToSave) {
        await this.#model.putStoryToDb(storyToSave);
      }
    }

    await this.initialLoadStories();
  }
}

export default ListStoriesPresenter;
