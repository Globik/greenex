import { SenderProvider } from "../../../data/shipment_provider/model/sender_provider.js";

export class Sender {
  constructor({ address, name, surname, phone }) {
    this.address = address;
    this.name = name;
    this.surname = surname;
    this.phone = phone;
  }

  toProvider(desiredDate, desiredTimeFrom, desiredTimeTo) {
    return new SenderProvider({
      desiredDate: $.datepicker.formatDate("yy-mm-dd", desiredDate),
      desiredTimeFrom: desiredTimeFrom.toISOString(),
      desiredTimeTo: desiredTimeTo.toISOString(),
      address: { fullAddress: this.address },
      name: this.name + " " + this.surname,
      phone: this.phone,
      email: this.email,
    });
  }
}
