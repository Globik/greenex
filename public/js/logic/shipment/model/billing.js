export class Billing {
  constructor({ priceDelivery, timeDelivery, services, totalSum }) {
    this.priceDelivery = priceDelivery;
    this.timeDelivery = timeDelivery;
    this.services = services;
    this.totalSum = totalSum;
  }

  props() {
    return [
      this.priceDelivery,
      this.timeDelivery,
      this.services,
      this.totalSum,
    ];
  }
}
