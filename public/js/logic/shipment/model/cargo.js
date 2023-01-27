import { CargoProvider } from "../../../data/delans_api/model/cargo_provider.js";

export class Cargo {
  constructor({ name, weight, length, width, height }) {
    this.name = name;
    this.weight = weight;
    this.length = length;
    this.width = width;
    this.height = height;
  }

  toProvider() {
    return new CargoProvider({
      name: this.name,
      weight: this.weight,
      length: this.length,
      width: this.width,
      height: this.height,
    });
  }
}
