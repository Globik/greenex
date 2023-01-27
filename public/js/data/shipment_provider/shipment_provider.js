import { BillingProvider } from "./model/billing_provider.js";
import { BillingRequestProvider } from "./model/billing_request_provider.js";
import { CreateShipmentRequestProvider } from "./model/create_shipment_request_provider.js";

// Delans Api
import { BillingApi } from "../delans_api/model/billing_api.js";
import { BillingRequestApi } from "../delans_api/model/billing_request_api.js";
import {
  DelansApiClient,
  SessionError,
  ApiServerError,
  RequestErrorApi,
} from "../delans_api/delans_api_client.js";
import { SenderProvider } from "./model/sender_provider.js";
// Delans Api END

export class ApiErrorProvider extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiErrorProvider";
  }
}

export class RequestErrorProvider extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestErrorProvider";
  }
}

export class ShipmentProvider {
  constructor() {
    this.delansClient = new DelansApiClient();
  }

  async tarifCalculation({ billRequst }) {
    try {
      let requestApi = new BillingRequestProvider({
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
      let response = await this.delansClient.tarifCalc({
        billRequst: requestApi,
      });
      return new BillingProvider({
        priceDelivery: response.priceDelivery,
        timeDelivery: response.timeDelivery,
        services: response.services,
        totalSum: response.totalSum,
      });
    } catch (error) {
      if (error instanceof SessionError || error instanceof ApiServerError) {
        throw new ApiErrorProvider(error);
      }
      if (
        error instanceof RequestErrorProvider ||
        error instanceof RequestErrorApi
      ) {
        throw new RequestErrorProvider(error.message);
      }
    }
  }

  async shipmentCreate(createShipmentRequest) {
    try {
      let response = await this.delansClient.shipmentCreate(
        createShipmentRequest
      );
      return response;
    } catch (error) {
      if (error instanceof SessionError || error instanceof ApiServerError) {
        throw new ApiErrorProvider(error);
      }
      if (
        error instanceof RequestErrorProvider ||
        error instanceof RequestErrorApi
      ) {
        throw new RequestErrorProvider(error.message);
      }
    }
  }
}
