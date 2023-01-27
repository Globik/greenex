export class CreateShipmentRequestApi {
  constructor({
    icn,
    urgent,
    typeDelivery,
    shipmentNumber,
    clientShipmentNumber,
    desiredDate,
    desiredTimeFrom,
    desiredTimeTo,
    prepaid,
    paymentType,
    payer,
    sender,
    recipient,
    items,
    weight,
    length,
    width,
    height,
    cod,
    amount,
    warehouseComment,
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
      urgent: this.urgent.icn,
      typeDelivery: this.typeDelivery.icn,
      shipmentNumber: this.shipmentNumber.icn,
      clientShipmentNumber: this.clientShipmentNumber.icn,
      desiredDate: this.desiredDate.icn,
      desiredTimeFrom: this.desiredTimeFrom.icn,
      desiredTimeTo: this.desiredTimeTo.icn,
      prepaid: this.prepaid.icn,
      paymentType: this.paymentType.icn,
      payer: this.payer.icn,
      sender: this.sender.icn,
      recipient: this.recipient.icn,
      items: this.items.icn,
      weight: this.weight.icn,
      length: this.length.icn,
      width: this.width.icn,
      height: this.height.icn,
      cod: this.cod.icn,
      amount: this.amount.icn,
      warehouseComment: this.warehouseComment.icn,
      services: this.services.icn,
    };
  }
}
