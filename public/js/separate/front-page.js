import { TrackingOrderForm } from "../presentation/tracking-order/tracking-order.js";

if (document.getElementById("form-track-number")) {
  let form = document.getElementById("form-track-number");
  let input = form.querySelector("input[name=track-number]");
  let trackingOrderForm = new TrackingOrderForm({
    form: form,
    input: input,
    submitBtn: form.querySelector("button[type=submit]"),
    inputBlock: input.closest(".order-state__input-block"),
    errorBlock: form.querySelector(".order-state__error"),
  });
}

if (document.getElementById("slider-form-track-number")) {
  let form = document.getElementById("slider-form-track-number");
  let input = form.querySelector("input[name=track-number]");
  let trackingOrderSlide = new TrackingOrderForm({
    form: form,
    input: input,
    submitBtn: form.querySelector("button[type=submit]"),
    inputBlock: input.closest(".form__block"),
    errorBlock: form.querySelector(".form__error"),
  });
}
