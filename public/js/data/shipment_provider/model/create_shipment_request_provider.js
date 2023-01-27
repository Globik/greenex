export class CreateShipmentRequestProvider {
  constructor({
    icn = "НФ-000003",
    urgent = 2,
    typeDelivery = "Д-Д",
    shipmentNumber = "",
    clientShipmentNumber = "",
    desiredDate,
    desiredTimeFrom,
    desiredTimeTo,
    prepaid,
    paymentType,
    payer = 0,
    sender,
    recipient,
    items,
    weight,
    length,
    width,
    height,
    cod = 0,
    amount = 0,
    warehouseComment = "",
    services,
  }) {
    this.icn = icn;
    this.urgent = urgent;
    this.typeDelivery = typeDelivery;
    this.shipmentNumber = shipmentNumber;
    this.clientShipmentNumber = clientShipmentNumber;
    this.desiredDate = desiredDate;
    this.desiredTimeFrom = desiredTimeFrom;
    this.desiredTimeTo = desiredTimeTo;
    this.prepaid = prepaid;
    this.paymentType = paymentType;
    this.payer = payer;
    this.sender = sender;
    this.recipient = recipient;
    this.items = items;
    this.weight = weight;
    this.length = length;
    this.width = width;
    this.height = height;
    this.cod = cod;
    this.amount = amount;
    this.warehouseComment = warehouseComment;
    this.services = services;
  }

  props() {
    return {
      icn: this.icn,
      urgent: this.urgent,
      typeDelivery: this.typeDelivery,
      shipmentNumber: this.shipmentNumber,
      clientShipmentNumber: this.clientShipmentNumber,
      desiredDate: this.desiredDate,
      desiredTimeFrom: this.desiredTimeFrom,
      desiredTimeTo: this.desiredTimeTo,
      prepaid: this.prepaid,
      paymentType: this.paymentType,
      payer: this.payer,
      sender: this.sender,
      recipient: this.recipient,
      items: this.items,
      weight: this.weight,
      length: this.length,
      width: this.width,
      height: this.height,
      cod: this.cod,
      amount: this.amount,
      warehouseComment: this.warehouseComment,
      services: this.services,
    };
  }
}
