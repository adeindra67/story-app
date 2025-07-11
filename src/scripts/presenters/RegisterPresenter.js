class RegisterPresenter {
  #view = null;
  #model = null;
  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async handleRegistration({ name, email, password }) {
    if (!this.#view || !this.#model || !this.#model.registerUser) {
      this.#view.showRegisterError('Terjadi kesalahan sistem, silakan coba lagi.');
      return;
    }

    try {
      this.#view.showLoading();

      const result = await this.#model.registerUser({ name, email, password });

      this.#view.showRegisterSuccess(result.message || 'Registrasi berhasil! Silakan login.');
      this.#view.clearForm();
    } catch (error) {
      this.#view.showRegisterError(error.message || 'Registrasi gagal. Periksa kembali data Anda.');
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default RegisterPresenter;
