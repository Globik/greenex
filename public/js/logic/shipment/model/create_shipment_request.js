export class CreateShipmentRequest {
  constructor({
    desiredDate,
    desiredTimeFrom,
    desiredTimeTo,
    prepaid,
    paymentType,
    sender,
    recipient,
    items,
    weight,
    length,
    width,
    height,
    services,
  }) {
    this.desiredDate = desiredDate;
    this.desiredTimeFrom = desiredTimeFrom;
    this.desiredTimeTo = desiredTimeTo;
    this.prepaid = prepaid;
    this.paymentType = paymentType;
    this.sender = sender;
    this.recipient = recipient;
    this.items = items;
    this.weight = weight;
    this.length = length;
    this.width = width;
    this.height = height;
    this.services = services;
  }
}
