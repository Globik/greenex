import { BillingApi } from "./model/billing_api.js";
import { BillingRequestApi } from "./model/billing_request_api.js";
import { CreateShipmentRequestApi } from "./model/create_shipment_request_api.js";

import { CreateShipmentRequestProvider } from "../shipment_provider/model/create_shipment_request_provider.js";

import { MyCookie } from "../../core/cookie/cookie.js";

export class SessionError extends Error {
  constructor(message) {
    super(message);
    this.name = "SessionError";
  }
}

export class ApiServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiServerError";
  }
}

export class RequestErrorApi extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestError";
  }
}

export class DelansApiClient {
  constructor() {
    this.baseUrl = "https://greenex.pro/wp-json/delans/v1";
  }

  async tarifCalc({ billRequst }) {
    await this._getCookie();
    let request = new BillingRequestApi({
      icn: billRequst.icn,
      typeDelivery: billRequst.typeDelivery,
      urgent: billRequst.urgent,
      b2b: billRequst.b2b,
      weight: billRequst.weight,
      height: billRequst.height,
      length: billRequst.length,
      width: billRequst.width,
      amount: billRequst.amount,
      cod: billRequst.cod,
      services: billRequst.services,
      toCity: billRequst.toCity,
      fromCity: billRequst.fromCity,
      toRegion: billRequst.toRegion,
      fromRegion: billRequst.fromRegion,
    });
    return await fetch(`${this.baseUrl}/tarifCalc/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "data-calc": request.props(),
        "session-id": MyCookie.getCookie("session_id"),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((text) => {
            throw new ApiServerError(text.message);
          });
        }
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          let bill = new BillingApi({
            priceDelivery: response.priceDelivery,
            timeDelivery: response.timeDelivery,
            services: response.services,
            totalSum: response.totalSum,
            success: response.success,
            errorMessage: response.errorMessage,
          });
          if (
            bill.priceDelivery == "Не удалось рассчитать стоимость доставки"
          ) {
            throw new ApiServerError(bill.priceDelivery);
          }
          return bill;
        } else {
          throw new RequestErrorApi(response.errorMessage);
        }
      });
  }

  async shipmentCreate(createShipmentRequest) {
    await this._getCookie();
    return await fetch(`${this.baseUrl}/shipmentsCreate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: createShipmentRequest.props(),
        "session-id": MyCookie.getCookie("session_id"),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((text) => {
            throw new ApiServerError(text.message);
          });
        }
        return response.json();
      })
      .then((response) => {
        response = JSON.parse(response["body"]);
        if (response.success) {
          return response;
        } else {
          throw new RequestErrorApi(response.errorMessage);
        }
      });
  }

  async historyStatusChangesInvoices(request) {
    console.log(request);
    await this._getCookie();
    return await fetch(`${this.baseUrl}/historyStatusChangesInvoices/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: request,
        "session-id": MyCookie.getCookie("session_id"),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((text) => {
            throw new ApiServerError(text.message);
          });
        }
        return response.json();
      })
      .then((response) => {
        response = JSON.parse(response["body"]);
        if (response.success) {
          return response;
        } else {
          throw new RequestErrorApi(response.errorMessage);
        }
      });
  }

  async _getCookie() {
    if (MyCookie.getCookie("session_id") == undefined) {
      await this.login();
    }
  }

  async login() {
    await fetch(`${this.baseUrl}/login/`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((text) => {
            throw new ApiServerError(text.message);
          });
        }
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          MyCookie.setCookie("session_id", response["sessionId"], {
            "max-age": 3600,
          });
        } else {
          throw new SessionError(response.errorMessage);
        }
      });
  }
}
