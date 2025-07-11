class LoginPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async handleLogin({ email, password }) {
    if (!this.#view || !this.#model || !this.#model.loginUser || !this.#model.saveAuthData) {
      this.#view.showLoginError('Terjadi kesalahan sistem, silakan coba lagi.');
      return;
    }

    try {
      this.#view.showLoading();

      const loginResult = await this.#model.loginUser({ email, password });

      this.#model.saveAuthData(loginResult);

      this.#view.showLoginSuccess(loginResult.name);
      this.#view.clearForm();
      this.#view.redirectToStories();

    } catch (error) {
      this.#view.showLoginError(error.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default LoginPresenter;