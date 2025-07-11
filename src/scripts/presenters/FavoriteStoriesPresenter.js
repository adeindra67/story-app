import Swal from 'sweetalert2';

class FavoriteStoriesPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadSavedStories() {
    if (!this.#view || !this.#model) return;
    this.#view.showLoading();
    try {
      const stories = await this.#model.getAllStoriesFromDb();
      this.#view.displayFavoriteStories(stories);
    } catch (error) {
      this.#view.showError(error.message || 'Gagal memuat cerita yang tersimpan.');
    }
  }

  async handleDeleteStory(storyId) {
    if (!this.#view || !this.#model) return;

    Swal.fire({
      title: 'Anda yakin?',
      text: "Cerita ini akan dihapus dari daftar tersimpan Anda secara permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.#model.deleteStoryFromDb(storyId);
          Swal.fire({
            title: 'Dihapus!',
            text: 'Cerita telah berhasil dihapus dari favorit.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
          await this.loadSavedStories();
        } catch (error) {
          this.#view.showError(error.message || 'Gagal menghapus cerita.');
        }
      }
    });
  }
}

export default FavoriteStoriesPresenter;
