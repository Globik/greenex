export class CargoProvider {
  constructor({
    isService = false,
    article = "",
    name,
    barCode = "",
    count = 1,
    price = 0,
    discount = 0,
    vat = "",
    vatSum = 0,
    cod = 0,
    amount = 0,
    weight,
    length,
    width,
    height,
  }) {
    this.isService = isService;
    this.article = article;
    this.name = name;
    this.barCode = barCode;
    this.count = count;
    this.price = price;
    this.discount = discount;
    this.vat = vat;
    this.vatSum = vatSum;
    this.cod = cod;
    this.amount = amount;
    this.weight = weight;
    this.length = length;
    this.width = width;
    this.height = height;
  }

  props() {
    return {
      isService: this.isService,
      article: this.article,
      name: this.name,
      barCode: this.barCode,
      count: this.count,
      price: this.price,
      discount: this.discount,
      vat: this.vat,
      vatSum: this.vatSum,
      cod: this.cod,
      amount: this.amount,
      weight: this.weight,
      length: this.length,
      width: this.width,
      height: this.height,
    };
  }
}
