export class BillingRequestApi {
  constructor({
    icn,
    typeDelivery,
    urgent,
    b2b,
    weight,
    height,
    length,
    width,
    amount,
    cod,
    services,
    toCity,
    fromCity,
    toRegion,
    fromRegion,
  }) {
    this.icn = icn;
    this.typeDelivery = typeDelivery;
    this.urgent = urgent;
    this.b2b = b2b;
    this.weight = weight;
    this.height = height;
    this.length = length;
    this.width = width;
    this.amount = amount;
    this.cod = cod;
    this.services = services;
    this.toCity = toCity;
    this.fromCity = fromCity;
    this.toRegion = toRegion;
    this.fromRegion = fromRegion;
  }

  props() {
    return {
      icn: this.icn,
      typeDelivery: this.typeDelivery,
      urgent: this.urgent,
      b2b: this.b2b,
      weight: this.weight,
      height: this.height,
      length: this.length,
      width: this.width,
      amount: this.amount,
      cod: this.cod,
      services: this.services,
      toCity: this.toCity,
      fromCity: this.fromCity,
      toRegion: this.toRegion,
      fromRegion: this.fromRegion,
    };
  }
}
