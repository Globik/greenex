export class RecipientProvider {
  constructor({
    withoutDelivery = false,
    address,
    companyName = "",
    name,
    phone,
    email = "",
    comment = "",
  }) {
    this.address = address;
    this.companyName = companyName;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.comment = comment;
    this.withoutDelivery = withoutDelivery;
  }
}
