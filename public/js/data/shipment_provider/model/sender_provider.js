export class SenderProvider {
  constructor({
    desiredDate,
    desiredTimeFrom,
    desiredTimeTo,
    address,
    companyName = "",
    name,
    phone,
    email = "",
    comment = "",
  }) {
    this.desiredDate = desiredDate;
    this.desiredTimeFrom = desiredTimeFrom;
    this.desiredTimeTo = desiredTimeTo;
    this.address = address;
    this.companyName = companyName;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.comment = comment;
  }
}
