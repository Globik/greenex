export class FormInput {
  constructor({
    input,
    inputBlock = "div",
    onChangeCallback = () => {},
    onInputCallback = () => {},
  }) {
    this._input = input;
    this._inputBlock = inputBlock;
    this._onChangeCallback = onChangeCallback;
    this._onInputCallback = onInputCallback;

    this._input.addEventListener("change", () => {
      this._onChange();
    });

    this._input.addEventListener("input", () => {
      this._onInput();
    });
  }

  _onChange() {
    let value = this._input.value;
    this._onChangeCallback(value);
  }

  _onInput() {
    let value = this._input.value;
    this._onInputCallback(value);
  }

  checkEmpty() {
    let value = this._input.value;
    if (value == "") {
      return true;
    }
    return false;
  }

  clear() {
    this._input.value = "";
  }

  setError(type, message) {
    this.clearError();
    let error = document.createElement("div");
    error.classList.add("alert", `alert_${type}`);
    error.innerHTML = message;
    this._inputBlock.appendChild(error);
  }

  clearError() {
    let errorBlock = this._inputBlock.querySelector(".alert");
    if (errorBlock) {
      errorBlock.remove();
    }
  }
}
