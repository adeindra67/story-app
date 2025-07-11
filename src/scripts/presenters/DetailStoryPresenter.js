import Swal from 'sweetalert2';

class DetailStoryPresenter {
  #view = null;
  #model = null;
  #storyId = null;
  #story = null; 
  #fromFavorites = false; 

  constructor({ view, model, storyId, fromFavorites }) {
    this.#view = view;
    this.#model = model;
    this.#storyId = storyId;
    this.#fromFavorites = fromFavorites;

    this._loadStoryDetail();
  }

  async _loadStoryDetail() {
    if (!this.#view || !this.#model) return;
    this.#view.showLoading();
    try {
      // Ambil data detail dari API
      const story = await this.#model.getStoryById(this.#storyId);
      this.#story = story; // Simpan data cerita ke properti kelas

      // Cek apakah cerita ini sudah disimpan di IndexedDB
      const isSaved = await this._isStorySaved();
      
      // Perintahkan View untuk menampilkan semua data
      this.#view.displayStoryDetail(this.#story, isSaved, this.#fromFavorites);
    } catch (error) {
      this.#view.showError(error.message || 'Gagal memuat detail cerita.');
    } finally {
      this.#view.hideLoading();
    }
  }

  async _isStorySaved() {
    const savedStory = await this.#model.getStoryFromDb(this.#storyId);
    return !!savedStory;
  }

  // Untuk tombol Simpan/Tersimpan dari halaman daftar utama
  async handleSaveToggle() {
    if (!this.#view || !this.#model || !this.#story) return;

    const isCurrentlySaved = await this._isStorySaved();
    if (isCurrentlySaved) {
      await this.#model.deleteStoryFromDb(this.#storyId);
      Swal.fire('Dihapus!', 'Cerita telah dihapus dari favorit.', 'success');
    } else {
      await this.#model.putStoryToDb(this.#story);
      Swal.fire('Disimpan!', 'Cerita telah ditambahkan ke favorit.', 'success');
    }
    const isNowSaved = await this._isStorySaved();
    this.#view.updateSaveButtonState(isNowSaved);
  }

  // Untuk tombol Hapus dari halaman favorit
  async handleDeleteStory() {
    if (!this.#view || !this.#model) return;

    Swal.fire({
      title: 'Anda yakin?',
      text: "Cerita ini akan dihapus dari favorit secara permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.#model.deleteStoryFromDb(this.#storyId);
          await Swal.fire(
            'Dihapus!',
            'Cerita telah berhasil dihapus.',
            'success'
          );
          // Setelah dihapus, kembali ke halaman favorit
          this.#view.redirectToFavorites();
        } catch (error) {
          this.#view.showError(error.message || 'Gagal menghapus cerita.');
        }
      }
    });
  }
}

export default DetailStoryPresenter;
