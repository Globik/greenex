import {
  DelansApiClient,
  SessionError,
  ApiServerError,
  RequestErrorApi,
} from "../delans_api/delans_api_client.js";

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

export class TrackingOrderProvider {
  constructor() {
    this._client = new DelansApiClient();
  }

  async getHistoryStatusChanges({ icn = "НФ-000003", shipmentNumber }) {
    let request = {
      icn: icn,
      shipmentNumber: [shipmentNumber],
    };
    try {
      let response = await this._client.historyStatusChangesInvoices(request);
      return response;
    } catch (error) {
      if (error instanceof ApiServerError || error instanceof SessionError) {
        throw new ApiErrorProvider();
      }
      if (error instanceof RequestErrorApi) {
        throw new RequestErrorProvider(error.message);
      }
      console.error(error);
    }
  }
}
