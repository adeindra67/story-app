export const realtimeValidationHandler = (event) => {
  const inputElement = event.target;
  const validationMessageId = inputElement.getAttribute('aria-describedby');
  const validationElement = document.getElementById(validationMessageId);

  if (!inputElement || !validationElement) return;

  let labelText = '';
  if (inputElement.labels && inputElement.labels.length > 0) {
    labelText = inputElement.labels[0].textContent.replace(':', '').trim();
  } else {
    labelText = inputElement.name || 'Kolom ini';
  }

  inputElement.setCustomValidity('');

  if (inputElement.validity.valid) {
    validationElement.textContent = '';
    inputElement.classList.remove('input-invalid');
  } else {
    if (inputElement.validity.valueMissing) {
      validationElement.textContent = `${labelText} wajib diisi.`;
    } else if (event.type === 'blur') {
      if (inputElement.validity.typeMismatch) {
        if (inputElement.type === 'email') {
          validationElement.textContent = `Format ${labelText.toLowerCase()} tidak valid.`;
        } else {
          validationElement.textContent = `Format ${labelText.toLowerCase()} tidak sesuai.`;
        }
      } else if (inputElement.validity.tooShort) {
        if (inputElement.id === 'passwordInput') {
          validationElement.textContent = '';
        } else {
          validationElement.textContent = `${labelText} minimal ${inputElement.minLength} karakter.`;
        }
      } else if (inputElement.validity.patternMismatch) {
        validationElement.textContent = `${labelText} tidak sesuai dengan pola yang diminta.`;
      } else {
        validationElement.textContent = inputElement.validationMessage;
      }
    } else if (
      event.type === 'input' &&
      inputElement.type === 'email' &&
      inputElement.validity.typeMismatch
    ) {
      validationElement.textContent = '';
    } else if (event.type === 'input' && inputElement.id !== 'emailInput') {
      if (inputElement.validity.tooShort) {
        if (inputElement.id === 'passwordInput') {
          validationElement.textContent = '';
        } else {
          validationElement.textContent = `${labelText} minimal ${inputElement.minLength} karakter.`;
        }
      } else if (inputElement.validity.patternMismatch) {
        validationElement.textContent = `${labelText} tidak sesuai dengan pola yang diminta.`;
      } else if (!inputElement.validity.valueMissing && !inputElement.validity.typeMismatch) {
        validationElement.textContent = inputElement.validationMessage;
      } else if (inputElement.validity.valueMissing) {
      } else {
        validationElement.textContent = '';
      }
    }

    if (validationElement.textContent !== '') {
      inputElement.classList.add('input-invalid');
    } else {
      if (
        inputElement.validity.valid ||
        (inputElement.type === 'email' &&
          event.type === 'input' &&
          inputElement.validity.typeMismatch)
      ) {
        inputElement.classList.remove('input-invalid');
      }
    }
  }
};
