export class SberbankApi {
  constructor() {
    this._baseUrl = "https://greenex.pro/wp-json/delans/v1";
  }

  async registerOrder({
    returnUrl,
    failUrl,
    description,
    amount,
    orderNumber,
  }) {
    let request = {
      returnUrl: returnUrl,
      failUrl: failUrl,
      description: description,
      amount: amount,
      orderNumber: orderNumber,
    };
    return await fetch(`${this._baseUrl}/sberbank/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
      .then((response) => response.json())
      .then((response) => {
        let responseBody = JSON.parse(response["body"]);
        return responseBody;
      });
  }
}
