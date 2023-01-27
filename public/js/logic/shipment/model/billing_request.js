export class BillingRequest {
  constructor({
    weight = 0,
    height = 0,
    length = 0,
    width = 0,
    services = [],
    toCity,
    fromCity,
    toRegion,
    fromRegion,
  }) {
    this.weight = weight;
    this.height = height;
    this.length = length;
    this.width = width;
    this.services = services;
    this.toCity = toCity;
    this.fromCity = fromCity;
    this.toRegion = toRegion;
    this.fromRegion = fromRegion;
  }

  props() {
    return {
      weight: this.weight,
      height: this.height,
      length: this.length,
      width: this.width,
      toCity: this.toCity,
      fromCity: this.fromCity,
      toRegion: this.toRegion,
      fromRegion: this.fromRegion,
    };
  }
}
