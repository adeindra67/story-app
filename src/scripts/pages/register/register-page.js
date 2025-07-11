import { registerUser } from '../../data/api';
import RegisterPresenter from '../../presenters/RegisterPresenter.js';
import { realtimeValidationHandler } from '../../utils/validation-handler.js';

class RegisterPage {
  #presenter = null;
  #formElement = null;
  #nameInputElement = null;
  #emailInputElement = null;
  #passwordInputElement = null;
  #submitButtonElement = null;
  #messageContainerElement = null;

  async render() {
    return `
      <section class="container">
        <h1 class="page-title">Registrasi Akun Baru</h1>
        <form id="registerForm" class="form" novalidate>
          <div class="form-group">
            <label for="nameInput">Nama</label>
            <input type="text" id="nameInput" name="name" required 
                   aria-describedby="nameValidation">
            <p id="nameValidation" class="validation-message" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="emailInput">Email</label>
            <input type="email" id="emailInput" name="email" required
                   aria-describedby="emailValidation">
            <small>Contoh: user@example.com.</small>
            <p id="emailValidation" class="validation-message" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="passwordInput">Password</label>
            <input type="password" id="passwordInput" name="password" minlength="8" required
                   aria-describedby="passwordValidation">
            <small>Minimal 8 karakter.</small>
            <p id="passwordValidation" class="validation-message" aria-live="polite"></p>
          </div>
          <button type="submit" id="registerButton" class="button button-primary">Registrasi</button>
        </form>
        <div id="messageContainer" class="message-container" role="alert"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#formElement = document.getElementById('registerForm');
    this.#nameInputElement = document.getElementById('nameInput');
    this.#emailInputElement = document.getElementById('emailInput');
    this.#passwordInputElement = document.getElementById('passwordInput');
    this.#submitButtonElement = document.getElementById('registerButton');
    this.#messageContainerElement = document.getElementById('messageContainer');

    if (this.#messageContainerElement) {
      this.#messageContainerElement.setAttribute('aria-live', 'polite');
    }

    const authModel = {
      registerUser: registerUser,
    };

    this.#presenter = new RegisterPresenter({
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
          const name = this.#nameInputElement.value;
          const email = this.#emailInputElement.value;
          const password = this.#passwordInputElement.value;
          this.#presenter.handleRegistration({ name, email, password });
        } else {
          this.showRegisterError('Harap perbaiki semua kesalahan pada formulir.');
          const firstInvalidInput = [
            this.#nameInputElement,
            this.#emailInputElement,
            this.#passwordInputElement,
          ].find((input) => input && !input.validity.valid);
          if (firstInvalidInput) {
            firstInvalidInput.focus();
          }
        }
      });
    }
  }

  _setupRealtimeValidation() {
    const inputsToValidate = [
      this.#nameInputElement,
      this.#emailInputElement,
      this.#passwordInputElement,
    ];
    inputsToValidate.forEach((input) => {
      if (input) {
        input.addEventListener('blur', realtimeValidationHandler);
        input.addEventListener('input', realtimeValidationHandler);
      }
    });
  }

  _validateAllFieldsRealtime() {
    let isFormValid = true;
    const inputsToValidate = [
      this.#nameInputElement,
      this.#emailInputElement,
      this.#passwordInputElement,
    ];
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
    if (this.#submitButtonElement) this.#submitButtonElement.disabled = true;
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = 'Sedang memproses registrasi...';
      this.#messageContainerElement.className = 'message-container message-info';
    }
  }

  hideLoading() {
    if (this.#submitButtonElement) this.#submitButtonElement.disabled = false;
  }

  showRegisterSuccess(message) {
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = message;
      this.#messageContainerElement.className = 'message-container message-success';
    }
  }

  showRegisterError(message) {
    if (this.#messageContainerElement) {
      this.#messageContainerElement.textContent = message;
      this.#messageContainerElement.className = 'message-container message-error';
    }
  }

  clearForm() {
    if (this.#formElement) this.#formElement.reset();
    const inputsToClearValidation = [
      this.#nameInputElement,
      this.#emailInputElement,
      this.#passwordInputElement,
    ];
    inputsToClearValidation.forEach((input) => {
      if (input) {
        const validationMessageId = input.getAttribute('aria-describedby');
        const validationElement = document.getElementById(validationMessageId);
        if (validationElement) validationElement.textContent = '';
        input.classList.remove('input-invalid');
      }
    });
  }
}

export default RegisterPage;
