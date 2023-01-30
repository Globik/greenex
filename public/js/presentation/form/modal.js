import { FormInput } from "../class/form_input.js";

const BODY = document.querySelector("body");
const BASE_URL = "https://greenex.pro/wp-json/mail/v1";

class Modal {
  constructor(modalId) {
    this.modalId = modalId;
    this._modal = document.getElementById(this.modalId);
    this.form = this._modal.querySelector("form");
    this._formDisabled = false;
    this.responseBlock = this.form.querySelector(".response");

    this._url = "";
    this._data = {};

    this._modal.addEventListener("click", (event) => {
      if (!event.target.closest(".popup_content")) {
        this.hide();
      }
    });

    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this._formDisabled) {
        grecaptcha.ready(() => {
          grecaptcha
            .execute("6LcXdyUeAAAAADWV209rKbvD8LgSHpaWxO60beD_", {
              action: "submit",
            })
            .then((token) => {
              this.send(token);
            });
        });
      }
    });

    let close = this._modal.querySelector(".popup_close");
    close.addEventListener("click", (event) => {
      event.preventDefault();
      this.hide();
    });
  }

  show() {
    this._modal.classList.add("popup_active");
    BODY.classList.add("disabled-scroll");
  }

  hide() {
    this._modal.classList.remove("popup_active");
    BODY.classList.remove("disabled-scroll");
    this._clearResponse();
    this._clearInputs();
  }

  async _send(token) {
    this._setLoading();

    await fetch(this._url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: this._data,
        token: token,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response["success"]) {
          this._setResponse("success", response["message"]);
          this._clearInputs();
        } else {
          this._setResponse("danger", response["message"]);
        }
      });

    this._removeLoading();
  }

  _setLoading() {
    this._formDisabled = true;
    this._modal.querySelectorAll("button[type=submit]").forEach((button) => {
      button.classList.add("button_loading");
    });
  }

  _removeLoading() {
    this._formDisabled = false;
    this._modal.querySelectorAll("button[type=submit]").forEach((button) => {
      button.classList.remove("button_loading");
    });
  }

  _clearResponse() {
    this._responseBlock.innerHTML = "";
  }

  _setResponse(type, message) {
    this._clearResponse();
    let errorBlock = document.createElement("div");
    errorBlock.classList.add("alert", `alert_${type}`);
    errorBlock.innerHTML = message;
    this._responseBlock.append(errorBlock);
  }

  _clearInputs() {}
}

export class ModalCall extends Modal {
  constructor(modalId) {
    super(modalId);

    this._url = `${BASE_URL}/call/`;

    this.nameInput = new FormInput({
      input: this._modal.querySelector("input[name=name]"),
      onChangeCallback: (value) => {
        this._data["name"] = value;
      },
    });

    this._telInput = new FormInput({
      input: this._modal.querySelector("input[name=tel]"),
      onChangeCallback: (value) => {
        this._data["tel"] = value;
      },
    });
  }

  _clearInputs() {
    this._nameInput.clear();
    this._telInput.clear();
  }
}

export class ModalMessage extends Modal {
  constructor(modalId) {
    super(modalId);

    this._url = `${BASE_URL}/message/`;

    this._nameInput = new FormInput({
      input: this._modal.querySelector("input[name=name]"),
      onChangeCallback: (value) => {
        this._data["name"] = value;
      },
    });

    this._telInput = new FormInput({
      input: this._modal.querySelector("input[name=tel]"),
      onChangeCallback: (value) => {
        this._data["tel"] = value;
      },
    });

    this._messageInput = new FormInput({
      input: this._modal.querySelector("textarea[name=message]"),
      onChangeCallback: (value) => {
        this._data["message"] = value;
      },
    });
  }

  _clearInputs() {
    this._nameInput.clear();
    this._telInput.clear();
    this._messageInput.clear();
  }
}

export class ModalSubmitApplication extends Modal {
  constructor(modalId) {
    super(modalId);
    this._url = `${BASE_URL}/submit-application/`;

    this._nameInput = new FormInput({
      input: this._modal.querySelector("input[name=name]"),
      onChangeCallback: (value) => {
        this._data["name"] = value;
      },
    });

    this._telInput = new FormInput({
      input: this._modal.querySelector("input[name=tel]"),
      onChangeCallback: (value) => {
        this._data["tel"] = value;
      },
    });
  }

  set billing(billing) {
    this._data["billing"] = billing;
  }

  _clearInputs() {
    this._nameInput.clear();
    this._telInput.clear();
  }
}
