import { RecipientProvider } from "../../../data/shipment_provider/model/recipient_provider.js";

export class Recipient {
  constructor({ address, name, surname, phone }) {
    this.address = address;
    this.name = name;
    this.surname = surname;
    this.phone = phone;
  }

  toProvider() {
    return new RecipientProvider({
      address: { fullAddress: this.address },
      name: this.name + " " + this.surname,
      phone: this.phone,
      email: this.email,
    });
  }
}
