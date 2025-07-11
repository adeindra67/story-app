import LoginPresenter from '../../presenters/LoginPresenter.js';
import { loginUser, saveAuthData } from '../../data/api'; 
import { realtimeValidationHandler } from '../../utils/validation-handler.js'; 

class LoginPage {
  #presenter = null;
  #formElement = null;
  #emailInputElement = null;
  #passwordInputElement = null;
  #submitButtonElement = null;
  #messageContainerElement = null;

  async render() {
    return `
      <section class="container">
        <h1 class="page-title">Login</h1>
        <form id="loginForm" class="form" novalidate>
          <div class="form-group">
            <label for="emailInput">Email</label>
            <input type="email" id="emailInput" name="email" required
                   aria-describedby="loginEmailValidation">
            <small>Contoh: user@example.com.</small>
            <p id="loginEmailValidation" class="validation-message" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="passwordInput">Password</label>
            <input type="password" id="passwordInput" name="password" required 
                   aria-describedby="loginPasswordValidation"> 
            <p id="loginPasswordValidation" class="validation-message" aria-live="polite"></p>
          </div>
          <button type="submit" id="loginButton" class="button button-primary">Login</button>
        </form>
        <div id="messageContainer" class="message-container" role="alert"></div>
        <p class="text-center mt-1">
          Belum punya akun? <a href="#/register">Registrasi di sini</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    this.#formElement = document.getElementById('loginForm');
    this.#emailInputElement = document.getElementById('emailInput');
    this.#passwordInputElement = document.getElementById('passwordInput');
    this.#submitButtonElement = document.getElementById('loginButton');
    this.#messageContainerElement = document.getElementById('messageContainer');

    if (this.#messageContainerElement) {
      this.#messageContainerElement.setAttribute('aria-live', 'polite');
    }

    const authModel = {
      loginUser: loginUser,
      saveAuthData: saveAuthData, 
    };

    this.#presenter = new LoginPresenter({
      view: this,
      model: authModel,
    });

    this._setupRealtimeValidation();

    if (this.#formElement) {
      this.#formElement.addEventListener('submit', (event) => {
        event.preventDefault();
        if (this.#submitButtonElement && this.#submitButtonElement.disabled) return;

        const isFormValid = this._validateAllFieldsRealtime();

        if (isFormValid) {
          const email = this.#emailInputElement.value;
          const password = this.#passwordInputElement.value;
          this.#presenter.handleLogin({ email, password });
        } else {
          this.showLoginError('Harap perbaiki semua kesalahan pada formulir.');
          const firstInvalidInput = [this.#emailInputElement, this.#passwordInputElement].find(
            (input) => input && !input.validity.valid
          );
          if (firstInvalidInput) {
            firstInvalidInput.focus();
          }
        }
      });
    }
  }

  _setupRealtimeValidation() {
    const inputsToValidate = [this.#emailInputElement, this.#passwordInputElement];
    inputsToValidate.forEach((input) => {
      if (input) {
        input.addEventListener('blur', realtimeValidationHandler);
        input.addEventListener('input', realtimeValidationHandler);
      }
    });
  }

  _validateAllFieldsRealtime() {
    let isFormValid = true;
    const inputsToValidate = [this.#emailInputElement, this.#passwordInputElement];
    inputsToValidate.forEach((input) => {
      if (input) {
        realtimeValidationHandler({ target: input });
        if (!input.validity.valid) {
          isFormValid = false;
        }
      }
    });
    return isFormValid;
  }

  showLoading() {
    if (this.#submitButtonElement) {
      this.#submitButtonElement.disabled = true;
    }
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = 'Sedang memproses login...';
      this.#messageContainerElement.className = 'message-container message-info';
    }
  }

  hideLoading() {
    if (this.#submitButtonElement) {
      this.#submitButtonElement.disabled = false;
    }
  }

  showLoginSuccess(name) {
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = `Login berhasil! Selamat datang, ${name}. Mengarahkan...`;
      this.#messageContainerElement.className = 'message-container message-success';
    }
  }

  showLoginError(message) {
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = message;
      this.#messageContainerElement.className = 'message-container message-error';
    }
  }

  clearForm() {
    if (this.#formElement) {
      this.#formElement.reset();
    }
    const inputsToClearValidation = [this.#emailInputElement, this.#passwordInputElement];
    inputsToClearValidation.forEach((input) => {
      if (input) {
        const validationMessageId = input.getAttribute('aria-describedby');
        const validationElement = document.getElementById(validationMessageId);
        if (validationElement) validationElement.textContent = '';
        input.classList.remove('input-invalid');
      }
    });
  }

  redirectToStories() {
    setTimeout(() => {
      window.location.hash = '#/stories';
    }, 1000);
  }
}

export default LoginPage;