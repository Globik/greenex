export class BillingApi {
  constructor({
    priceDelivery,
    timeDelivery,
    services,
    totalSum,
    success,
    errorMessage,
  }) {
    this.priceDelivery = priceDelivery;
    this.timeDelivery = timeDelivery;
    this.services = services;
    this.totalSum = totalSum;
    this.success = success;
    this.errorMessage = errorMessage;
  }

  props() {
    return [
      this.priceDelivery,
      this.timeDelivery,
      this.services,
      this.totalSum,
      this.success,
      this.errorMessage,
    ];
  }
}
