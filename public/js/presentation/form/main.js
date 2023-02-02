import { GreenExForm } from "../../logic/shipment/form/green-ex-form.js";
import { ModalCall, ModalMessage, ModalSubmitApplication } from "./modal.js";

const DA_DATA_TOKEN = "fa388077b3b1932cc0e3f661829082185bdcfb25";

// Modals

const modalCall = new ModalCall("modal-call");
const modalMessage = new ModalMessage("modal-comment");
const modalSubmitApplication = new ModalSubmitApplication(
  "modal-submit-application"
);

let modalsArray = [modalCall, modalMessage, modalSubmitApplication];

document.querySelectorAll(".popup-link").forEach((link) => {
  const linkHref = link.getAttribute("href").replace("#", "");
  modalsArray.forEach((modal) => {
    if (linkHref == modal.modalId) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        modal.show();
      });
    }
  });
});

// END Modals

class FormInput {
  constructor({ input, onPressEnterCallback = () => {} }) {
    this.input = input;
    this.block = input.closest(".form__block");
    this.onPressEnterCallback = onPressEnterCallback;

    if (this.onPressEnterCallback) {
      this.input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.onPressEnterCallback();
        }
      });
    }
  }

  clearError() {
    if (this.block.querySelector(".alert")) {
      this.block.querySelector(".alert").remove();
    }
  }

  setError({ type, message }) {
    this.clearError();
    let alert = document.createElement("div");
    alert.classList.add("alert", `alert_${type}`);
    alert.innerHTML = message;
    this.block.appendChild(alert);
  }

  setEmptyInputError() {
    this.setError({ type: "warning", message: "Заполните поле" });
  }

  focus() {
    this.input.focus();
  }

  checkEmptyValue() {
    if (this.input.value == "") {
      return true;
    }
    return false;
  }

  clearValue() {
    this.input.value = "";
  }

  setRequired() {
    this.input.required = true;
  }

  removeRequired() {
    this.input.required = false;
  }
}

class AddressInput extends FormInput {
  constructor({ input, addressChangedCallback, addressClearCallback }) {
    super({ input: input });
    this.addressChangedCallback = addressChangedCallback;
    this.addressClearCallback = addressClearCallback;

    $(this.input).suggestions({
      token: DA_DATA_TOKEN,
      type: "ADDRESS",
      hint: false,
      bounds: "city",
      count: 5,
      formatResult: this.formatTownResult.bind(this),
      formatSelected: this.formatTownSelected.bind(this),
      onSelect: (suggestion) => {
        addressChangedCallback(suggestion.data.city, suggestion.data.region);
        this.clearError();
      },
      onSelectNothing: () => {
        addressClearCallback();
        this.setError({
          type: "warning",
          message: "Выберите подходящую подсказку",
        });
      },
    });
    this.input.setAttribute("autocomplete", "off");
  }

  join(arr) {
    var separator = arguments.length > 1 ? arguments[1] : ", ";
    return arr
      .filter(function (n) {
        return n;
      })
      .join(separator);
  }
  makeTownAddressString(address) {
    if (address.city === address.region) {
      return this.join([address.city, address.settlement]);
    } else {
      return this.join([
        address.city,
        address.settlement,
        address.region_with_type,
        address.area_with_type,
      ]);
    }
  }
  formatTownResult(value, currentValue, suggestion) {
    var addressValue = this.makeTownAddressString(suggestion.data);
    suggestion.value = addressValue;
    return addressValue;
  }
  formatTownSelected(suggestion) {
    var addressValue = this.makeTownAddressString(suggestion.data);
    return addressValue;
  }
}

class TextInput extends FormInput {
  constructor({
    input,
    initialValue,
    valueChangeCallback,
    valueChangeTimerCallback,
    valueInputCallback,
    valueInputTimerCallback,
    onPressEnterCallback,
  }) {
    super({ input: input, onPressEnterCallback: onPressEnterCallback });

    this.initialValue = initialValue;

    if (initialValue) {
      this.input.value = initialValue;
      this.valueChangeCallback(this.input.value);
    }

    this.valueChangeCallback = valueChangeCallback;
    this.valueChangeTimerCallback = valueChangeTimerCallback;
    this.valueInputCallback = valueInputCallback;
    this.valueInputTimerCallback = valueInputTimerCallback;
    this.onPressEnterCallback = onPressEnterCallback;

    let delayTimer;

    this.input.addEventListener("change", (event) => {
      if (this.valueChangeCallback) {
        this.valueChangeCallback(this.input.value);
      }

      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        if (this.valueChangeTimerCallback) {
          this.valueChangeTimerCallback(this.input.value);
        }
      }, 1000);
    });

    this.input.addEventListener("input", (event) => {
      if (this.valueInputCallback) {
        this.valueInputCallback(this.input.value);
      }

      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        if (this.valueInputTimerCallback) {
          this.valueInputTimerCallback(this.input.value);
        }
      }, 1000);
    });
  }

  changeValue(value) {
    this.input.value = value;
    if (this.valueChangeCallback) {
      this.valueChangeCallback(value);
    } else if (this.valueInputCallback) {
      this.valueInputCallback(this.input.value);
    }
  }
}

class CargoDimension extends FormInput {
  constructor({
    input,
    initialValue,
    valueChangeCallback,
    valueInputCallback,
    onPressEnterCallback,
    maxValue,
    valueExcessCallback,
  }) {
    super({
      input: input,
      onPressEnterCallback: onPressEnterCallback,
    });

    this.initialValue = initialValue;

    this.valueChangeCallback = valueChangeCallback;

    this.valueInputCallback = valueInputCallback;

    this.maxValue = maxValue;
    this.valueExcessCallback = valueExcessCallback;

    if (this.initialValue) {
      this.input.value = this.initialValue;
      this._inputInput();
      this._inputChange();
    }

    let delayTimer;

    this.input.addEventListener("change", () => {
      this._inputChange();
    });

    this.input.addEventListener("input", () => {
      this._inputInput();
    });
  }

  _inputChange() {
    this._validateInputValue();

    if (this.valueChangeCallback) {
      this.valueChangeCallback(this.input.value);
    }
  }

  _inputInput() {
    this._validateInputValue();

    if (this.valueInputCallback) {
      this.valueInputCallback(this.input.value);
    }
  }

  _validateInputValue() {
    if (this.input.value < 0) {
      this.input.value = 0;
    }
    if (this.maxValue && this.input.value > this.maxValue) {
      this.input.value = this.maxValue;
      if (this.valueExcessCallback) {
        this.valueExcessCallback(this);
      }
    }
    if (this.input.value != "") {
      this.input.value = parseInt(this.input.value);
    }
  }
}

class ServiceInput extends FormInput {
  constructor({
    input,
    initialValue,
    valueChangeCallback,
    minValue,
    maxValue,
  }) {
    super({ input: input });
    this.initialValue = initialValue;
    this.valueChangeCallback = valueChangeCallback;
    this.minValue = minValue;
    this.maxValue = maxValue;

    if (this.initialValue) {
      this.input.value = this.initialValue;
      this._onChange();
    }

    this.input.addEventListener("change", (event) => {
      this._onChange();
    });
  }

  _onChange() {
    this.resetValue();
    this.changeValue();
  }

  resetValue() {
    if (this.input.value < this.minValue) {
      this.input.value = this.minValue;
    } else if (this.input.value > this.maxValue) {
      this.input.value = this.maxValue;
    }
  }

  changeValue() {
    if (this.input.value != "") {
      this.input.value = parseInt(this.input.value);
      this.resetValue();
      this.valueChangeCallback(this.input.value);
    } else {
      this.valueChangeCallback(0);
    }
  }
}

class DateInput extends FormInput {
  constructor({ input, initialValue, onSelectCallback }) {
    super({ input: input });
    this.onSelectCallback = onSelectCallback;
    this.initialValue = initialValue;

    $(input).datepicker({
      minDate: new Date(),
      dateFormat: "dd.mm.yy",
      onSelect: (dateText, inst) => {
        if (this.onSelectCallback) {
          let validDate =
            inst.currentMonth +
            1 +
            "." +
            inst.currentDay +
            "." +
            inst.currentYear;
          validDate = new Date(validDate);
          this.onSelectCallback(validDate);
        }
      },
    });
    if (this.initialValue) {
      $(input).datepicker("setDate", this.initialValue);
      this.onSelectCallback(this.initialValue);
    } else {
      let today = new Date();
      $(input).datepicker("setDate", today);
      this.onSelectCallback(today);
    }
  }
}

class GreenExFormPresentation {
  constructor(form, priceBlock) {
    this.form = form;
    this.state = new GreenExForm(form, priceBlock);

    this.tarifCalculationTimer;

    this.tarifCalculationFunction = () => {
      clearTimeout(this.tarifCalculationTimer);
      this.tarifCalculationTimer = setTimeout(() => {
        this.state.tarifCalculation();
      }, 2000);
    };

    this.derivalAddress = new AddressInput({
      input: this.state.form.querySelector("input[name=derival-address]"),
      addressChangedCallback: (city, region) => {
        this.state.derivalAddressChange(city, region);
        this.tarifCalculationFunction();
      },
      addressClearCallback: () => {
        this.state.derivalAddressClear();
      },
    });
    this.arrivalAddress = new AddressInput({
      input: this.state.form.querySelector("input[name=arrival-address]"),
      addressChangedCallback: (city, region) => {
        this.state.arrivalAddressChange(city, region);
        this.tarifCalculationFunction();
      },
      addressClearCallback: () => {
        this.state.arrivalAddressClear();
      },
    });

    this.cargoWeight = new CargoDimension({
      input: this.state.form.querySelector("input[name=cargo-weight]"),
      valueChangeCallback: (value) => {
        this.state.weightValueChange(value);
        this.tarifCalculationFunction();
      },
      maxValue: 20000,
      valueExcessCallback: (inst) => {
        inst.setError({
          type: "warning",
          message:
            'Превышен лимит, воспользуйтесь <a href="https://cargogreen.ru/" target="_blank">доставкой выделенной фурой</a>',
        });
      },
    });
    this.cargoLength = new CargoDimension({
      input: this.state.form.querySelector("input[name=cargo-length]"),
      valueChangeCallback: (value) => {
        this.state.lengthValueChange(value);
        this.tarifCalculationFunction();
      },
    });
    this.cargoWidth = new CargoDimension({
      input: this.state.form.querySelector("input[name=cargo-width]"),
      valueChangeCallback: (value) => {
        this.state.widthValueChange(value);
        this.tarifCalculationFunction();
      },
    });
    this.cargoHeight = new CargoDimension({
      input: this.state.form.querySelector("input[name=cargo-height]"),
      valueChangeCallback: (value) => {
        this.state.heightValueChange(value);
        this.tarifCalculationFunction();
      },
    });
  }
}

class IntercityForm extends GreenExFormPresentation {
  constructor(form, priceBlock) {
    super(form, priceBlock);

    this._submitApplicationButton = this.form.querySelector(
      "button[data-type=submit-application]"
    );

    this._submitApplicationButton.addEventListener("click", () => {
      modalSubmitApplication.billing = this.state.billingRequest.props();
      modalSubmitApplication.show();
    });
  }
}

if (document.getElementById("intercity-form")) {
  let intercityForm = new IntercityForm( document.getElementById("intercity-form"), document.getElementById("intercity-form-price"));
}

// ***

class TransportationForm extends GreenExFormPresentation {
  constructor(form, priceBlock) {
    super(form, priceBlock);

    this.serviceWorkers = new ServiceInput({
      input: form.querySelector("input[name=service-workers]"),
      valueChangeCallback: (value) => {
        switch (parseInt(value)) {
          case 0:
          case 1:
            this.servicePassengers.maxValue = 2;
            this.servicePassengers.clearError();
            break;
          case 2:
            this.servicePassengers.maxValue = 1;
            this.servicePassengers.clearError();
            break;
          case 3:
            this.servicePassengers.maxValue = 0;
            this.servicePassengers.setError({
              type: "warning",
              message: "При 3 грузчиках нет мест для пассажиров",
            });
            break;
          default:
            break;
        }
        this.servicePassengers.changeValue();
        this.state.setWorkersService(
          parseInt(this.serviceWorkers.input.value),
          parseInt(this.serviceDuration.input.value)
        );
        this.tarifCalculationFunction();
      },
      minValue: 0,
      maxValue: 3,
    });
    this.servicePassengers = new ServiceInput({
      input: form.querySelector("input[name=service-passengers]"),
      valueChangeCallback: (value) => {
        this.state.setPassengersService(
          parseInt(this.servicePassengers.input.value)
        );
        this.tarifCalculationFunction();
      },
      minValue: 0,
      maxValue: 2,
    });
    this.serviceDuration = new ServiceInput({
      input: form.querySelector("input[name=service-duration]"),
      valueChangeCallback: (value) => {
        this.state.setWorkersService(
          parseInt(this.serviceWorkers.input.value),
          parseInt(this.serviceDuration.input.value)
        );
        this.tarifCalculationFunction();
      },
      minValue: 2,
      maxValue: 12,
    });
    this.dateSupply = new DateInput({
      input: this.form.querySelector("input[name=date]"),
      onSelectCallback: (date) => {
        this.state.changeDesiredDate(date);
      },
    });
    this.desiredTimeFrom = new TextInput({
      input: this.form.querySelector("input[name=datetime-from]"),
      valueChangeCallback: (value) => {
        this.state.changeDesiredTimeFrom(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
    this.desiredTimeTo = new TextInput({
      input: this.form.querySelector("input[name=datetime-to]"),
      valueChangeCallback: (value) => {
        this.state.changeDesiredTimeTo(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
  }
}

if (document.getElementById("transportation-form")) {
  let transportationForm = new TransportationForm(
    document.getElementById("transportation-form"),
    document.getElementById("transportation-form-price")
  );
}

// ***

class LocalityInput extends FormInput {
  constructor({
    input,
    initialValue,
    addressChangedCallback,
    addressClearCallback,
  }) {
    super({ input: input });
    this.initialValue = initialValue;
    this.addressChangedCallback = addressChangedCallback;
    this.addressClearCallback = addressClearCallback;

    if (this.initialValue) {
      this.input.value = initialValue;
    }

    $(this.input).suggestions({
      token: DA_DATA_TOKEN,
      type: "ADDRESS",
      hint: false,
      bounds: "city",
      count: 5,
      onSelect: (suggestion) => {
        addressChangedCallback(
          suggestion.data.city,
          suggestion.data.region,
          suggestion.unrestricted_value
        );
        this.clearError();
      },
      onSelectNothing: () => {
        addressClearCallback();
        this.setError({
          type: "warning",
          message: "Выберите подходящую подсказку",
        });
      },
    });
    this.input.setAttribute("autocomplete", "off");
  }
}

class StreetInput extends FormInput {
  constructor({
    input,
    constraints,
    addressChangedCallback,
    addressClearCallback,
  }) {
    super({ input: input });
    this.constraints = constraints;
    this.addressChangedCallback = addressChangedCallback;
    this.addressClearCallback = addressClearCallback;

    let suggestion = $(this.input)
      .suggestions({
        token: DA_DATA_TOKEN,
        type: "ADDRESS",
        hint: false,
        bounds: "street",
        count: 5,
        constraints: this.constraints.input,
        onSelect: (suggestion) => {
          addressChangedCallback(
            suggestion.data.city,
            suggestion.data.region,
            suggestion.unrestricted_value
          );
          this.clearError();
        },
        onSelectNothing: () => {
          addressClearCallback();
          this.setError({
            type: "warning",
            message: "Выберите подходящую подсказку",
          });
        },
      })
      .suggestions();
    suggestion.fixData();
    this.input.setAttribute("autocomplete", "off");
  }

  clearError() {
    super.clearError();
    this.constraints.clearError();
  }
}

class HouseInput extends FormInput {
  constructor({
    input,
    constraints,
    addressChangedCallback,
    addressClearCallback,
  }) {
    super({ input: input });
    this.constraints = constraints;
    this.addressChangedCallback = addressChangedCallback;
    this.addressClearCallback = addressClearCallback;

    let suggestion = $(this.input)
      .suggestions({
        token: DA_DATA_TOKEN,
        type: "ADDRESS",
        hint: false,
        bounds: "house",
        count: 5,
        constraints: this.constraints.input,
        onSelect: (suggestion) => {
          addressChangedCallback(
            suggestion.data.city,
            suggestion.data.region,
            suggestion.unrestricted_value
          );
          this.clearError();
        },
        onSelectNothing: () => {
          addressClearCallback();
          this.setError({
            type: "warning",
            message: "Выберите подходящую подсказку",
          });
        },
      })
      .suggestions();
    suggestion.fixData();
    this.input.setAttribute("autocomplete", "off");
  }

  clearError() {
    super.clearError();
    this.constraints.clearError();
  }
}

class ExtraService {
  constructor({ input, onCheckedTrue, onCheckedFalse }) {
    this.input = input;
    this._onCheckedTrue = onCheckedTrue;
    this.onCheckedFalse = onCheckedFalse;
    this.input.addEventListener("change", (event) => {
      this.eventChangeInput(event);
    });
  }

  eventChangeInput(event) {
    if (this.input.checked) {
      this._onCheckedTrue();
    } else {
      this.onCheckedFalse();
    }
  }
}

class CargosState {
  constructor({ block, cargoAddedCallback, cargoDeletedCallback }) {
    this.block = block;

    const weightInitialValue = GET_DATA ? GET_DATA.dimensions.weight : null;
    // Габариты умножаем на 100 для перевода в сантиметры
    const lengthInitialValue = GET_DATA ? GET_DATA.dimensions.length * 100 : null;
    const widthInitialValue = GET_DATA ? GET_DATA.dimensions.width  * 100  : null;
    const heightInitialValue = GET_DATA  ? GET_DATA.dimensions.height  * 100 : null;

    this.currentCargo = {
      name: null,
      weight: weightInitialValue,
      length: lengthInitialValue,
      width: widthInitialValue,
      height: heightInitialValue,
    };
    //console.warn("currentCargo: ", this.currentCargo);
    this.cargos = new Map();

    let onPressEnterFunction = () => {
      this.addItem();
    };

    this.nameInput = new TextInput({
      input: this.block.querySelector("input[name=cargo-name]"),
      valueInputCallback: (value) => {
        this.currentCargo.name = value;
        this.nameInput.clearError();
      },
      onPressEnterCallback: onPressEnterFunction,
    });
    this.weightInput = new CargoDimension({
      input: this.block.querySelector("input[name=cargo-weight]"),
      initialValue: weightInitialValue,
      valueInputCallback: (value) => {
        this.currentCargo.weight = value;
        if (this.weightInput) {
          this.weightInput.clearError();
        }
      },
      onPressEnterCallback: onPressEnterFunction,
    });
    this.lengthInput = new CargoDimension({
      input: this.block.querySelector("input[name=cargo-length]"),
      initialValue: lengthInitialValue,
      valueInputCallback: (value) => {
        this.currentCargo.length = value;
        if (this.lengthInput) {
          this.lengthInput.clearError();
        }
      },
      onPressEnterCallback: onPressEnterFunction,
    });
    this.widthInput = new CargoDimension({
      input: this.block.querySelector("input[name=cargo-width]"),
      initialValue: widthInitialValue,
      valueInputCallback: (value) => {
        this.currentCargo.width = value;
        if (this.widthInput) {
          this.widthInput.clearError();
        }
      },
      onPressEnterCallback: onPressEnterFunction,
    });
    this.heightInput = new CargoDimension({
      input: this.block.querySelector("input[name=cargo-height]"),
      initialValue: heightInitialValue,
      valueInputCallback: (value) => {
        this.currentCargo.height = value;
        if (this.heightInput) {
          this.heightInput.clearError();
        }
      },
      onPressEnterCallback: onPressEnterFunction,
    });

    this.cargoAddedCallback = cargoAddedCallback;
    this.cargoDeletedCallback = cargoDeletedCallback;
    this.addBtn = block.querySelector("#add-cargo");
    this.cargoList = block.querySelector("#list-cargo");

    this.addBtn.addEventListener("click", (event) => {
      this.addItem();
    });

    this.block.querySelectorAll(".form__hint a").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        let value = element.innerHTML;
        this.nameInput.changeValue(value);
      });
    });
  }

  clearInputs() {
    this.nameInput.clearValue();
    this.weightInput.clearValue();
    this.lengthInput.clearValue();
    this.widthInput.clearValue();
    this.heightInput.clearValue();
  }

  clearCurrentCargo() {
    this.currentCargo = {
      name: null,
      weight: null,
      length: null,
      width: null,
      height: null,
    };
  }

  addItem() {
    if (this.addItemCheck()) {
      let id = this.cargoAddedCallback(this.currentCargo);
      this.addCargo(id, this.currentCargo);
      this.addListItem(id);
      this.clearInputs();
      this.clearCurrentCargo();
    }
  }

  deleteItem(id, listItem) {
    this.deleteCargo(id);
    this.deleteListItem(listItem);
    this.cargoDeletedCallback(id);
  }

  addCargo(id, cargo) {
    if (!this.cargos.length) {
      this.removeRequiredInputs();
    }
    this.cargos.set(id, cargo);
  }

  deleteCargo(id) {
    this.cargos.delete(id);
    if (!this.cargos.length) {
      this.setRequiredInputs();
    }
  }

  deleteListItem(item) {
    item.remove();
  }

  addItemCheck() {
    if (!this.currentCargo.name) {
      this.focusEmpty(this.nameInput);
      return false;
    }
    if (!this.currentCargo.weight) {
      this.focusEmpty(this.weightInput);
      return false;
    }
    if (!this.currentCargo.length) {
      this.focusEmpty(this.lengthInput);
      return false;
    }
    if (!this.currentCargo.width) {
      this.focusEmpty(this.widthInput);
      return false;
    }
    if (!this.currentCargo.height) {
      this.focusEmpty(this.heightInput);
      return false;
    }
    return true;
  }

  addListItem(id) {
    let listItem = document.createElement("li");
    listItem.classList.add("added-list__item");

    let text = document.createElement("div");
    text.classList.add("added-list__text");
    text.innerHTML = `${this.currentCargo.name}, ${this.currentCargo.weight}кг, ${this.currentCargo.length}x${this.currentCargo.width}x${this.currentCargo.height}`;

    let btn = document.createElement("button");
    btn.classList.add("added-list__btn");
    btn.setAttribute("data-id", id);

    btn.addEventListener("click", () => {
      this.deleteItem(id, listItem);
    });

    listItem.appendChild(text);
    listItem.appendChild(btn);
    this.cargoList.appendChild(listItem);
  }

  setRequiredInputs() {
    this.nameInput.setRequired();
    this.weightInput.setRequired();
    this.lengthInput.setRequired();
    this.widthInput.setRequired();
    this.heightInput.setRequired();
  }

  removeRequiredInputs() {
    this.nameInput.removeRequired();
    this.weightInput.removeRequired();
    this.lengthInput.removeRequired();
    this.widthInput.removeRequired();
    this.heightInput.removeRequired();
  }

  focusEmpty(input) {
    input.focus();
    input.setError({ type: "warning", message: "Заполните поле" });
  }
}

class CalculationRadioInput extends FormInput {
  constructor({
    input,
    checkedCallback = () => {},
    checkedTimerCallback = () => {},
  }) {
    super({ input: input });
    this.value = this.input.value;
    this.name = this.input.getAttribute("data-name");
    this.checkedCallback = checkedCallback;
    this.checkedTimerCallback = checkedTimerCallback;
    this.input.addEventListener("change", () => {
      this.checkedCallback(this.value, this.name);
      this.checkedTimerCallback(this.value, this.name);
    });
  }
}

class SinglePageForm {
  constructor(form, priceBlock) {
    this.form = form;
    this.state = new GreenExForm(form, priceBlock);

    this._cargos = new CargosState({
      block: this.form.querySelector("#cargos"),
      cargoAddedCallback: (cargo) => {
        return this.state.addCargo(cargo);
      },
      cargoDeletedCallback: (id) => {
        this.state.deleteCargo(id);
      },
    });

    this.derivalLocality = new LocalityInput({
      input: this.form.querySelector("input[name=derival-address-town]"),
      initialValue: GET_DATA ? GET_DATA.fromCity : null,
      addressChangedCallback: () => {},
      addressClearCallback: () => {},
    });
    this.derivalStreet = new StreetInput({
      input: this.form.querySelector("input[name=derival-address-street]"),
      constraints: this.derivalLocality,
      addressChangedCallback: (city, region, fullAddress) => {
        this.state.derivalAddressChange(city, region, fullAddress);
        this.state.tarifCalculation();
      },
      addressClearCallback: () => {
        this.state.derivalAddressClear();
      },
    });
    this.derivalHouse = new HouseInput({
      input: this.form.querySelector("input[name=derival-address-house]"),
      constraints: this.derivalStreet,
      addressChangedCallback: (city, region, fullAddress) => {
        this.state.derivalAddressChange(city, region, fullAddress);
        this.state.tarifCalculation();
      },
      addressClearCallback: () => {
        this.state.derivalAddressClear();
      },
    });

    this.dateSupply = new DateInput({
      input: this.form.querySelector("input[name=date]"),
      initialValue: GET_DATA
        ? GET_DATA.desiredDate
          ? new Date(GET_DATA.desiredDate)
          : null
        : null,
      onSelectCallback: (date) => {
        this.state.changeDesiredDate(date);
      },
    });
    this.desiredTimeFrom = new TextInput({
      input: this.form.querySelector("input[name=datetime-from]"),
      valueChangeCallback: (value) => {
        this.state.changeDesiredTimeFrom(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
    this.desiredTimeTo = new TextInput({
      input: this.form.querySelector("input[name=datetime-to]"),
      valueChangeCallback: (value) => {
        this.state.changeDesiredTimeTo(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });

    this.arrivalLocality = new LocalityInput({
      input: this.form.querySelector("input[name=arrival-address-town]"),
      initialValue: GET_DATA ? GET_DATA.toCity : null,
      addressChangedCallback: () => {},
      addressClearCallback: () => {},
    });
    this.arrivalStreet = new StreetInput({
      input: this.form.querySelector("input[name=arrival-address-street]"),
      constraints: this.arrivalLocality,
      addressChangedCallback: (city, region, fullAddress) => {
       this.state.arrivalAddressChange(city, region, fullAddress);
        this.state.tarifCalculation();
      },
      addressClearCallback: () => {
        this.state.arrivalAddressClear();
      },
    });
    this.arrivalHouse = new HouseInput({
      input: this.form.querySelector("input[name=arrival-address-house]"),
      constraints: this.arrivalStreet,
      addressChangedCallback: (city, region, fullAddress) => {
        this.state.arrivalAddressChange(city, region, fullAddress);
        this.state.tarifCalculation();
      },
      addressClearCallback: () => {
        this.state.arrivalAddressClear();
      },
    });

    this.inputSenderName = new TextInput({
      input: this.form.querySelector("input[name=derival-name]"),
      valueChangeCallback: (value) => {
        this.state.changeSenderName(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
    this.inputSenderSurname = new TextInput({
      input: this.form.querySelector("input[name=derival-surname]"),
      valueChangeCallback: (value) => {
        this.state.changeSenderSurname(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
    this.inputSenderPhone = new TextInput({
      input: this.form.querySelector("input[name=derival-tel]"),
      valueChangeCallback: (value) => {
        this.state.changeSenderPhone(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });

    this.inputRecipientName = new TextInput({
      input: this.form.querySelector("input[name=arrival-name]"),
      valueChangeCallback: (value) => {
        this.state.changeRecipientName(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
    this.inputRecipientSurname = new TextInput({
      input: this.form.querySelector("input[name=arrival-surname]"),
      valueChangeCallback: (value) => {
        this.state.changeRecipientSurname(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });
    this.inputRecipientPhone = new TextInput({
      input: this.form.querySelector("input[name=arrival-tel]"),
      valueChangeCallback: (value) => {
        this.state.changeRecipientPhone(value);
      },
      valueChangeTimerCallback: () => {},
      onPressEnterCallback: () => {},
    });

    let paymentRadioAll = this.form.querySelectorAll(
      "input[name=payment-type]"
    );
    paymentRadioAll.forEach((radio) => {
      let radioFunction = (value, name) => {
        switch (value) {
          case "credit-card":
            this.state.setPaymentAcquiring();
            this.state.drawBillPaymentType(name);
            break;
          case "to-courier":
            this.state.setPaymentToCourier();
            this.state.drawBillPaymentType(name);
            break;
        }
        // this.state.setPaymentToCourier();
      };
      let radioClass = new CalculationRadioInput({
        input: radio,
        checkedCallback: radioFunction,
      });
    });

    this.printBtn = document.querySelector("#print-order");
    this.printBtn.addEventListener("click", () => {
      if (this.state.checkPrint()) {
        this.state.print();
      } else {
        if (this.derivalStreet.checkEmptyValue()) {
          this.derivalStreet.setEmptyInputError();
        }
        if (this.arrivalStreet.checkEmptyValue()) {
          this.arrivalStreet.setEmptyInputError();
        }
      }
    });
  }
}


if(document.getElementById("total-price")){
	document.getElementById("total-price").textContent = GET_DATA ? GET_DATA.priceDelivery : 0;
}

class CalculationForm extends SinglePageForm {
  constructor(form, priceBlock) {
    super(form, priceBlock);

    this.extraServicesAll = this.form.querySelectorAll(
      "input[name=service-extra]"
    );
    this.additionalServicesAll = this.form.querySelectorAll(
      "input[name=service-derival]"
    );
    let servicesTimer;
    this.extraServicesAll.forEach((serviceInput) => {
      let code = serviceInput.getAttribute("value");
      let shortName = serviceInput.getAttribute("data-short-name");
      let fullName = serviceInput.getAttribute("data-full-name");
      let extraService = new ExtraService({
        input: serviceInput,
        onCheckedTrue: () => {
          this.state.setExtraService(code, shortName, fullName);

          clearTimeout(servicesTimer);
          servicesTimer = setTimeout(() => {
            this.state.tarifCalculation();
          }, 1000);
        },
        onCheckedFalse: () => {
          this.state.deleteExtraService(code);

          clearTimeout(servicesTimer);
          servicesTimer = setTimeout(() => {
            this.state.tarifCalculation();
          }, 1000);
        },
      });
    });
    this.additionalServicesAll.forEach((serviceInput) => {
      let code = serviceInput.getAttribute("value");
      let shortName = serviceInput.getAttribute("data-short-name");
      let fullName = serviceInput.getAttribute("data-full-name");
      let derivalService = new ExtraService({
        input: serviceInput,
        onCheckedTrue: () => {
          this.state.setDerivalService(code, shortName, fullName);

          clearTimeout(servicesTimer);
          servicesTimer = setTimeout(() => {
            this.state.tarifCalculation();
          }, 1000);
        },
        onCheckedFalse: () => {
          this.state.deleteDerivalService(code);

          clearTimeout(servicesTimer);
          servicesTimer = setTimeout(() => {
            this.state.tarifCalculation();
          }, 1000);
        },
      });
    });
  }
}

if (document.getElementById("calculation-form")) {
  let calculationForm = new CalculationForm(
    document.getElementById("calculation-form"),
    document.getElementById("total-price")
  );
  let w = calculationForm.form["cargo-weight"];
  let l = calculationForm.form["cargo-length"];
  let h = calculationForm.form["cargo-height"];
  let width = calculationForm.form["cargo-width"];
 
 let derivalCity = calculationForm.form["derival-address-town"];
 let arrivalCity = calculationForm.form["arrival-address-town"];
 console.log("arrival: ", arrivalCity.value);
    calculationForm.state.billingRequest["toCity"] = arrivalCity.value;
    calculationForm.state.billingRequest["toRegion"] = arrivalCity.value;
    calculationForm.state.billingRequest["fromCity"] = derivalCity.value;
    calculationForm.state.billingRequest["fromRegion"] = derivalCity.value;
    
    arrivalCity.onchange = function(e){
		calculationForm.state.billingRequest["toCity"] = arrivalCity.value;
		calculationForm.state.billingRequest["toRegion"] = arrivalCity.value;
		calculationForm.state.tarifCalculation();
	}
	
	derivalCity.onchange = function(e){
		calculationForm.state.billingRequest["fromCity"] = derivalCity.value;
		calculationForm.state.billingRequest["fromRegion"] = derivalCity.value;
		calculationForm.state.tarifCalculation();
	}
	
	w.value = GET_DATA ? w.value : 0;
	l.value = GET_DATA ? l.value : 0;
	h.value = GET_DATA ? h.value : 0;
	width.value = GET_DATA ? width.value : 0;
  
  calculationForm.state.billingRequest.weight = w.value;
  calculationForm.state.billingRequest.length = l.value;
  calculationForm.state.billingRequest.height = h.value;
  calculationForm.state.billingRequest.width = width.value;
  
  if(w.value && l.value && h.value && width.value){
	 
  w.onchange = hChange;
  l.onchange = hChange;
  h.onchange = hChange;
  width.onchange = hChange;
}


function hChange(e){
	
  calculationForm.state.billingRequest.weight = w.value;
  calculationForm.state.billingRequest.length = l.value;
  calculationForm.state.billingRequest.height = h.value;
  calculationForm.state.billingRequest.width = width.value;
  calculationForm.state.tarifCalculation();
}
}
class TaxiForm extends SinglePageForm {
  constructor(form, priceBlock) {
    super(form, priceBlock);

    let delayTimer;
    let tarifCalculationFunction = () => {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        this.state.tarifCalculation();
      }, 2000);
    };

    this.servicePassengers = new ServiceInput({
      input: form.querySelector("input[name=service-passengers]"),
      initialValue: GET_DATA ? GET_DATA.servicePassengersValue : null,
      valueChangeCallback: (value) => {
        this.state.setPassengersService(parseInt(value));
        clearTimeout();
        tarifCalculationFunction();
      },
      minValue: 0,
      maxValue: 2,
    });
    this.serviceWorkers = new ServiceInput({
      input: form.querySelector("input[name=service-workers]"),
      initialValue: GET_DATA ? GET_DATA.serviceWorkersValue : null,
      valueChangeCallback: (value) => {
        switch (parseInt(value)) {
          case 0:
          case 1:
            this.servicePassengers.maxValue = 2;
            this.servicePassengers.clearError();
            break;
          case 2:
            this.servicePassengers.maxValue = 1;
            this.servicePassengers.clearError();
            break;
          case 3:
            this.servicePassengers.maxValue = 0;
            this.servicePassengers.setError({
              type: "warning",
              message: "При 3 грузчиках нет мест для пассажиров",
            });
            break;
          default:
            break;
        }
        this.servicePassengers.changeValue();
        if (this.serviceDuration) {
          this.state.setWorkersService(
            parseInt(this.serviceWorkers.input.value),
            parseInt(this.serviceDuration.input.value)
          );
        }
        tarifCalculationFunction();
      },
      minValue: 0,
      maxValue: 3,
    });
    this.serviceDuration = new ServiceInput({
      input: form.querySelector("input[name=service-duration]"),
      initialValue: GET_DATA ? GET_DATA.serviceWorkersValue : null,
      valueChangeCallback: (value) => {
        this.state.setWorkersService(
          parseInt(this.serviceWorkers.input.value),
          parseInt(value)
        );
        tarifCalculationFunction();
      },
      minValue: 2,
      maxValue: 12,
    });
  }
}

if (document.getElementById("taxi-form")) {
  let taxiForm = new TaxiForm(
    document.getElementById("taxi-form"),
    document.getElementById("total-price")
  );
}
