// NOT USED

import { Billing } from "./model/billing.js";
import { BillingRequest } from "./model/billing_request.js";

// ShipmentProvider
import { BillingProvider } from "../../data/shipment_provider/model/billing_provider.js";
import { BillingRequestProvider } from "../../data/shipment_provider/model/billing_request_provider.js";
import {
  ApiErrorProvider,
  RequestErrorProvider,
  ShipmentProvider,
} from "../../data/shipment_provider/shipment_provider.js";
// ShipmentProvider END

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

export class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestError";
  }
}

export class Shipment {
  constructor() {
    this.shipmentProvider = new ShipmentProvider();
    this.billingRequest = new BillingRequest({});
    this.billing = null;
  }

  async tarifCalculation() {
    console.log(this.billingRequest);
    if (!this._addressesCheck()) {
      return;
    }
    try {
      let response = await this.shipmentProvider.tarifCalculation({
        billRequst: this.billingRequest,
      });
      return new Billing({
        priceDelivery: response.priceDelivery,
        timeDelivery: response.timeDelivery,
        services: response.services,
        totalSum: response.totalSum,
      });
    } catch (error) {
      if (error instanceof ApiErrorProvider) {
        console.error(error);
        throw new ApiError(error);
      }
      if (error instanceof RequestErrorProvider) {
        throw new RequestError(error.message);
      }
    }
  }

  _addressesCheck() {
    if (
      this.billingRequest.toCity != undefined &&
      this.billingRequest.toRegion != undefined &&
      this.billingRequest.fromCity != undefined &&
      this.billingRequest.fromRegion != undefined
    ) {
      return true;
    }
    return false;
  }

  derivalAddressChange(city, region) {
    this.billingRequest["fromCity"] = city;
    this.billingRequest["fromRegion"] = region;
  }
  derivalAddressClear() {
    this.billingRequest["fromCity"] = undefined;
    this.billingRequest["fromRegion"] = undefined;
  }

  arrivalAddressChange(city, region) {
    this.billingRequest["toCity"] = city;
    this.billingRequest["toRegion"] = region;
  }
  arrivalAddressClear() {
    this.billingRequest["toCity"] = undefined;
    this.billingRequest["toRegion"] = undefined;
  }

  weightValueChange(value) {
    value = Number(value);
    this.billingRequest.weight = value;
  }
  lengthValueChange(value) {
    value = Number(value);
    this.billingRequest.length = value;
  }
  widthValueChange(value) {
    value = Number(value);
    this.billingRequest.width = value;
  }
  heightValueChange(value) {
    value = Number(value);
    this.billingRequest.height = value;
  }
}
