import { SberbankApi } from "../sberbank_api/sberbank_api.js";

export class SberbankError extends Error {
  constructor(message) {
    super(message);
    this.name = "SberbankError";
  }
}

export class SberbankProvider {
  constructor() {
    this._api = new SberbankApi();
  }

  async registerOrder({ returnUrl, failUrl, description, price, orderNumber }) {
    // Цена в копейках
    let amount = price * 100;
    try {
      return this._api.registerOrder({
        returnUrl: returnUrl,
        failUrl: failUrl,
        description: description,
        amount: amount,
        orderNumber: orderNumber,
      });
    } catch (error) {
      throw new SberbankError();
    }
  }
}
