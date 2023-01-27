import { TrackingOrderState } from "../../logic/tracking-order/tracking-order.js";
import { FormInput } from "../class/form_input.js";

export class TrackingOrderForm {
  constructor({ form, submitBtn, errorBlock, input, inputBlock }) {
    this._form = form;
    this._submitBtn = submitBtn;

    this.state = new TrackingOrderState({
      form: this._form,
      submitBtn: this._submitBtn,
      errorBlock: errorBlock,
    });

    this._input = new FormInput({
      input: input,
      inputBlock: inputBlock,
      onChangeCallback: (value) => {
        this.state.setShipmentNumber(value);
      },
      onInputCallback: () => {
        this._input.clearError();
      },
    });

    this._form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this._input.checkEmpty()) {
        this.state.getHistoryStatusChanges();
      } else {
        this._input.setError("warning", "Обязательное поле");
      }
    });
  }
}
