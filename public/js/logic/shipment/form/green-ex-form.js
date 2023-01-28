import { Billing } from "../model/billing.js";
import { BillingRequest } from "../model/billing_request.js";
import { CreateShipmentRequest } from "../model/create_shipment_request.js";
import { Sender } from "../model/sender.js";
import { Recipient } from "../model/recipient.js";
import { Cargo } from "../model/cargo.js";
// import { ApiError, RequestError, Shipment } from "../shipment.js";

// ShipmentProvider
import {
  ApiErrorProvider,
  RequestErrorProvider,
  ShipmentProvider,
} from "../../../data/shipment_provider/shipment_provider.js";
import { CreateShipmentRequestProvider } from "../../../data/shipment_provider/model/create_shipment_request_provider.js";
import { CargoProvider } from "../../../data/delans_api/model/cargo_provider.js";
// ShipmentProvider END

// SberbankProvider
import { SberbankProvider } from "../../../data/sberbank_provider/sberbank_provider.js";
// SberbankProvider END

export class GreenExForm {
  constructor(form, priceBlock) {
    this.form = form;

    this._isLoading = false;

    this._shipmentProvider = new ShipmentProvider();
    this._sberbankProvider = new SberbankProvider();

    this.billingRequest = new BillingRequest({});
    this._errorBlock = form.querySelector(".form__error");
    this._btnList = this.form.querySelectorAll("button[type=submit]");
    this._totalSum;
    this._priceDelivery;
    this._priceBlock = priceBlock;

    this._sender = new Sender({});
    this._recipient = new Recipient({});

    this._desiredDate;
    this._desiredTimeFrom;
    this._desiredTimeTo;
    this._prepaid;
    this._paymentType;

    this._derivalFullAddress;
    this._arrivalFullAddress;

    this._cargos = new Map();

    if (document.getElementById("bill")) {
      this._billBlock = document.getElementById("bill");
      this._billExtraServices =
        this._billBlock.querySelector("#extra-services");
      this._billDerivalServices =
        this._billBlock.querySelector("#derival-services");
      this._billPaymentType =
        this._billBlock.querySelector("#bill-payment-type");
    }

    this._extraServices = new Map();
    this._derivalServices = new Map();
    this._taxiServices = new Map();

    this._serviceWorkersValue;
    this._serviceDurationValue;
    this._servicePassengersValue;

    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this._isLoading) {
        if (this._billBlock) {
          this.shipmentCreate();
        } else {
          let action = this.form.getAttribute("action");
          let getData = {
            fromCity: this.billingRequest.fromCity,
            toCity: this.billingRequest.toCity,
            serviceWorkersValue: this._serviceWorkersValue,
            serviceDurationValue: this._serviceDurationValue,
            servicePassengersValue: this._servicePassengersValue,
            desiredDate: this._desiredDate,
            desiredTimeFrom: this._desiredTimeFrom,
            desiredTimeTo: this._desiredTimeTo,
            dimensions: this._getDimensions(),
            priceDelivery: ( event.target.price.value ? event.target.price.value : "0")
          };
          this._sendPostData(action, getData);
        }
      }
    });
  }

  _sendPostData(action, data) {
    let form = document.createElement("form");
    form.setAttribute("action", action);

    let inputData = document.createElement("input");
    form.appendChild(inputData);
    inputData.setAttribute("type", "hidden");
    inputData.setAttribute("name", "js-data");
    inputData.setAttribute("value", JSON.stringify(data));

    document.querySelector("body").appendChild(form);
    form.submit();
    form.remove();
  }

  _getDimensions() {
    return {
      weight: this.billingRequest.weight,
      length: this.billingRequest.length,
      height: this.billingRequest.height,
      width: this.billingRequest.width,
    };
  }

  // ***
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

  async tarifCalculation() {
    if (!this._addressesCheck()) {
      return;
    }
    if (
      !this.billingRequest.weight &&
      !this.billingRequest.length &&
      !this.billingRequest.height &&
      !this.billingRequest.width
    ) {
      return;
    }
    this.clearError();
    this.setTarificationLoading();
    console.log(JSON.stringify(this.billingRequest));
    try {
    

      let dataToSend = {
        "derival-address": this.billingRequest.fromCity,
        "arrival-address": this.billingRequest.toCity,
        "cargo-weight": this.billingRequest.weight,
        "cargo-length": this.billingRequest.length,
        "cargo-width": this.billingRequest.width,
        "cargo-height": this.billingRequest.height,
      };
      let response = await fetch( "/wp-content/themes/greenEx/php/calc.php?" + new URLSearchParams(dataToSend));

      let si;
      if (response.ok) {
        si = await response.json();
        if (si) {
          console.log("si: ", si);
          if (si.error && si.error.length == 0) {
            let bill = new Billing({
              priceDelivery: si.amount, 
              timeDelivery: new Date(), 
              services: [],
              totalSum: si.amount, 
            });

            this._totalSum = si.amount;
            console.log("totalSum: ", this._totalSum);
            this.priceDelivery = si.amount;
            this.setPrice(si.amount);

            this.setServicesPrice(bill.services);
            if (this._billBlock) {
              this.drawBillInfo(bill.services);
            }
          } else {
            console.log(si.error);
            this.setError("danger", si.error);
          }
        }
      }
    } catch (error) {
      if (error instanceof ApiErrorProvider) {
        this.setError(
          "danger",
          "Произошла непредвиденная ошибка. Попробуйте позже"
        );
      }
      if (error instanceof RequestErrorProvider) {
        this.setError("danger", error.message);
      }
      console.log(error);
    } finally {
      this.removeTarificationLoading();
    }
  }

  async shipmentCreate() {
    this.clearError();
    this.setShipmentCreateLoading();
    try {
      let senderProvider = this._sender.toProvider(
        this._desiredDate,
        this._desiredTimeFrom,
        this._desiredTimeTo
      );
      let recipientProvider = this._recipient.toProvider();

      let items = [];

      this._cargos.forEach((cargo) => {
        items.push(cargo.toProvider().props());
      });

      let request = new CreateShipmentRequestProvider({
        desiredDate: $.datepicker.formatDate("yy-mm-dd", this._desiredDate),
        desiredTimeFrom: this._desiredTimeFrom.toISOString(),
        desiredTimeTo: this._desiredTimeTo.toISOString(),
        sender: senderProvider,
        recipient: recipientProvider,
        items: items,
        weight: this.billingRequest.weight,
        length: this.billingRequest.length,
        height: this.billingRequest.height,
        width: this.billingRequest.width,
        services: this.billingRequest.services,
        prepaid: this._prepaid,
        paymentType: this._paymentType,
      });

      let response = await this._shipmentProvider.shipmentCreate(request);

      if (this._prepaid == false && this._paymentType == 0) {
        document.location.href =
          myajax.success +
          `?order-id=${encodeURIComponent(response.shipmentNumber)}`;
      }

      if (this._prepaid == false && this._paymentType == 2) {
        try {
          let sberbankResponse = await this.sberbankRegisterOrder({
            price: this._totalSum,
            orderNumber: response.shipmentNumber,
            description: "Заказ на междугороднюю перевозку на сайте GreenEx",
          });
          document.location.href = sberbankResponse["formUrl"];
        } catch (error) {
          this.setError(
            "danger",
            "Не удается подтвердить оплату сбербанком. Попробуйте заказать позже или другой способ оплаты"
          );
        }
      }
    } catch (error) {
      if (error instanceof ApiErrorProvider) {
        this.setError(
          "danger",
          "Произошла непредвиденная ошибка. Попробуйте позже"
        );
      }
      if (error instanceof RequestErrorProvider) {
        this.setError("danger", error.message);
      }
      this.setError(
        "danger",
        "Произошла непредвиденная ошибка. Попробуйте позже"
      );
      console.log(error);
    } finally {
      this.removeShipmentCreateLoading();
    }
  }

  async sberbankRegisterOrder({ price, orderNumber, description }) {
    try {
      let response = await this._sberbankProvider.registerOrder({
        price: price,
        orderNumber: orderNumber,
        description: description,
        returnUrl:
          myajax.success + `?order-id=${encodeURIComponent(orderNumber)}`,
      });
      return response;
    } catch (error) {
      throw new Error();
    }
  }
  // ***

  clearError() {
    this._enableButtons();
    this._errorBlock.innerHTML = "";
  }

  setError(type, message) {
    this.clearError();
    this._disableButtons();
    let alert = document.createElement("div");
    alert.classList.add("alert", `alert_${type}`);
    alert.innerHTML = message;
    this._errorBlock.appendChild(alert);
  }

  _disableButtons() {
    this._btnList.forEach((btn) => {
      btn.disabled = true;
    });
  }

  _enableButtons() {
    this._btnList.forEach((btn) => {
      btn.disabled = false;
    });
  }

  _setButtonsLoading() {
    this._btnList.forEach((btn) => {
      btn.classList.add("button_loading");
    });
  }

  _removeButtonsLoading() {
    this._btnList.forEach((btn) => {
      btn.classList.remove("button_loading");
    });
  }

  _setBillLoading() {
    this._billBlock.classList.add("bill_loading");
  }

  _removeBillLoading() {
    this._billBlock.classList.remove("bill_loading");
  }

  setTarificationLoading() {
    this._isLoading = true;
    this._setButtonsLoading();
    if (this._billBlock) {
      this._setBillLoading();
    }
  }

  removeTarificationLoading() {
    this._isLoading = false;
    this._removeButtonsLoading();
    if (this._billBlock) {
      this._removeBillLoading();
    }
  }

  setShipmentCreateLoading() {
    this._isLoading = true;
    this._setButtonsLoading();
    this._disableButtons();
  }

  removeShipmentCreateLoading() {
    this._isLoading = false;
    this._removeButtonsLoading();
    this._enableButtons();
  }

  setPrice(value) {
    this._priceBlock.innerHTML = value;
  }

  drawBillInfo(services) {
    this._billExtraServices.innerHTML = "";
    this._billDerivalServices.innerHTML = "";
    if (this._extraServices.size) {
      let extraServicesBlock = this._generateBillServicesBlock({
        servicesMap: this._extraServices,
        title: "Дополнительные услуги",
      });
      this._billExtraServices.appendChild(extraServicesBlock);
    }
    if (this._derivalServices.size) {
      let derivalServicesBlock = this._generateBillServicesBlock({
        servicesMap: this._derivalServices,
        title: "Услуги на терминале отправителе",
      });
      this._billDerivalServices.appendChild(derivalServicesBlock);
    }
  }

  drawBillPaymentType(text) {
    this._billPaymentType.innerHTML = "";
    let block = this._generateBillPaymentTypeBlock(text);
    this._billPaymentType.appendChild(block);
  }

  _generateBillServicesBlock({ servicesMap, title }) {
    let block = document.createElement("div");
    block.classList.add("bill__row");

    let titleBlock = document.createElement("div");
    titleBlock.classList.add("bill__title");
    titleBlock.innerHTML = title;
    block.appendChild(titleBlock);

    let line = document.createElement("div");
    line.classList.add("bill__line");
    block.appendChild(line);

    let lineName = document.createElement("div");
    lineName.classList.add("bill__name-line");
    line.appendChild(lineName);

    let lineValue = document.createElement("div");
    lineValue.classList.add("bill__value-line");
    line.appendChild(lineValue);

    let totalPrice = 0;
    let lineString = "";
    servicesMap.forEach((service) => {
      totalPrice += service.price;
      if (!lineString.includes(service.name)) {
        lineString += service.name + ";";
      }
    });

    lineName.innerHTML = lineString.slice(0, -1);
    lineValue.innerHTML = totalPrice + " ₽";

    return block;
  }

  _generateBillPaymentTypeBlock(text) {
    let block = document.createElement("div");
    block.classList.add("bill__row");

    let titleBlock = document.createElement("div");
    titleBlock.classList.add("bill__title");
    titleBlock.innerHTML = "Способ оплаты:";
    block.appendChild(titleBlock);

    let line = document.createElement("div");
    line.classList.add("bill__line", "bill__line_only-name");
    block.appendChild(line);

    let lineName = document.createElement("div");
    lineName.classList.add("bill__name-line");
    lineName.innerHTML = text;
    line.appendChild(lineName);

    return block;
  }

  // ***
  _makeId() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  derivalAddressChange(city, region, fullAddress) {
    this.billingRequest["fromCity"] = city;
    this.billingRequest["fromRegion"] = region;
    this._derivalFullAddress = fullAddress;
    this.changeSenderAddress(fullAddress);
  }
  derivalAddressClear() {
    this.billingRequest["fromCity"] = undefined;
    this.billingRequest["fromRegion"] = undefined;
    this._derivalFullAddress = undefined;
    this.changeSenderAddress(undefined);
  }

  arrivalAddressChange(city, region, fullAddress) {
    this.billingRequest["toCity"] = city;
    this.billingRequest["toRegion"] = region;
    this._arrivalFullAddress = fullAddress;
    this.changeRecipientAddress(fullAddress);
  }
  arrivalAddressClear() {
    this.billingRequest["toCity"] = undefined;
    this.billingRequest["toRegion"] = undefined;
    this._arrivalFullAddress = undefined;
    this.changeRecipientAddress(undefined);
  }

  // Габариты делим на сто для перевода в метры

  weightValueChange(value) {
    value = Number(value);
    this.billingRequest.weight = value;
  }
  lengthValueChange(value, isMeasureMeters = false) {
    value = Number(value);
    if (!isMeasureMeters) {
      value = value / 100;
    }
    this.billingRequest.length = value;
  }
  widthValueChange(value, isMeasureMeters = false) {
    value = Number(value);
    if (!isMeasureMeters) {
      value = value / 100;
    }
    this.billingRequest.width = value;
  }
  heightValueChange(value, isMeasureMeters = false) {
    value = Number(value);
    if (!isMeasureMeters) {
      value = value / 100;
    }
    this.billingRequest.height = value;
  }

  addCargo(cargo) {
    let id = this._makeId();

    let cargoItem = new Cargo({
      name: cargo.name,
      weight: parseInt(cargo.weight),
      length: parseInt(cargo.length) / 100,
      width: parseInt(cargo.width) / 100,
      height: parseInt(cargo.height) / 100,
    });
    this._cargos.set(id, cargoItem);

    this.setMaxDimensions();
    this.tarifCalculation();

    return id;
  }

  deleteCargo(id) {
    this._cargos.delete(id);

    this.setMaxDimensions();
    this.tarifCalculation();
  }

  setMaxDimensions() {
    let maxWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    this._cargos.forEach((cargo) => {
      if (cargo.weight > maxWeight) {
        maxWeight = cargo.weight;
      }
      if (cargo.length > maxLength) {
        maxLength = cargo.length;
      }
      if (cargo.width > maxWidth) {
        maxWidth = cargo.width;
      }
      if (cargo.height > maxHeight) {
        maxHeight = cargo.height;
      }
    });

    this.weightValueChange(maxWeight);
    this.lengthValueChange(maxLength, true);
    this.widthValueChange(maxWidth, true);
    this.heightValueChange(maxHeight, true);
  }

  addService(name, code, shortName, rusName) {
    this.deleteService(name);
    let service = {
      name: name,
      shortName: shortName || null,
      code: code,
      count: 1,
      rusName: rusName,
    };
    this.billingRequest.services.push(service);
  }

  deleteService(name) {
    for (let index = 0; index < this.billingRequest.services.length; index++) {
      const element = this.billingRequest.services[index];
      if (element.name == name) {
        this.billingRequest.services.splice(index, 1);
        break;
      }
    }
  }

  setWorkersService(workersNumber, duration) {
    if (workersNumber && duration) {
      this.addService(
        "service-workers",
        `Г${workersNumber}-Ч${duration}`,
        null,
        "Услуги грузчиков"
      );
      this._taxiServices.set("service-workers", {
        name: "Услуги грузчиков",
        fullName: `Услуги ${workersNumber} грузчиков (${duration}ч.)`,
        price: null,
      });
    } else {
      this.deleteService("service-workers");
      this._taxiServices.delete("service-workers");
    }
    this._serviceWorkersValue = workersNumber;
    this._serviceDurationValue = duration;
  }

  setPassengersService(passengersNumber) {
    if (passengersNumber) {
      this.addService(
        "service-passengers",
        `П${passengersNumber}`,
        null,
        "Перевозка пассажиров"
      );
      this._taxiServices.set("service-passengers", {
        name: "Перевозка пассажиров",
        fullName: `Перевозка ${passengersNumber} пассажиров`,
        price: null,
      });
    } else {
      this.deleteService("service-passengers");
      this._taxiServices.delete("service-passengers");
    }
    this._servicePassengersValue = passengersNumber;
  }

  setExtraService(code, shortName, fullName) {
    this.addService(code, code, shortName);
    this._extraServices.set(code, {
      name: shortName,
      fullName: fullName,
      price: null,
    });
  }

  deleteExtraService(code) {
    this.deleteService(code);
    this._extraServices.delete(code);
  }

  setDerivalService(code, shortName, fullName) {
    this.addService(code, code, shortName);
    this._derivalServices.set(code, {
      name: shortName,
      fullName: fullName,
      price: null,
    });
  }

  deleteDerivalService(code) {
    this.deleteService(code);
    this._derivalServices.delete(code);
  }

  setServicesPrice(services) {
    this.setExtraServicesPrice(services);
    this.setDerivalServicesPrice(services);
  }

  setExtraServicesPrice(services) {
    services.forEach((service) => {
      let serviceCode = service.code;
      if (this._extraServices.has(serviceCode)) {
        let extraService = this._extraServices.get(serviceCode);
        extraService.price = service.price;
        this._extraServices.set(serviceCode, extraService);
      }
    });
  }

  setDerivalServicesPrice(services) {
    services.forEach((service) => {
      let serviceCode = service.code;
      if (this._derivalServices.has(serviceCode)) {
        let extraService = this._derivalServices.get(serviceCode);
        extraService.price = service.price;
        this._derivalServices.set(serviceCode, extraService);
      }
    });
  }

  changeDesiredDate(date) {
    this._desiredDate = date;
    this.recalculateDesiredTimeFrom();
    this.recalculateDesiredTimeTo();
  }

  recalculateDesiredTimeFrom() {
    if (this._desiredTimeFrom) {
      if (this._desiredDate) {
        this._desiredTimeFrom = new Date(
          this._desiredDate.getFullYear(),
          this._desiredDate.getMonth(),
          this._desiredDate.getDate(),
          this._desiredTimeFrom.getHours(),
          this._desiredTimeFrom.getMinutes()
        );
      } else {
        let today = new Date();
        this._desiredTimeFrom = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          this._desiredTimeFrom.getHours(),
          this._desiredTimeFrom.getMinutes()
        );
      }
    }
  }

  recalculateDesiredTimeTo() {
    if (this._desiredTimeTo) {
      if (this._desiredDate) {
        this._desiredTimeTo = new Date(
          this._desiredDate.getFullYear(),
          this._desiredDate.getMonth(),
          this._desiredDate.getDate(),
          this._desiredTimeTo.getHours(),
          this._desiredTimeTo.getMinutes()
        );
      } else {
        let today = new Date();
        this._desiredTimeTo = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          this._desiredTimeTo.getHours(),
          this._desiredTimeTo.getMinutes()
        );
      }
    }
  }

  changeDesiredTimeFrom(time) {
    let hours = time.split(":")[0];
    let minutes = time.split(":")[1];
    if (this._desiredDate) {
      this._desiredTimeFrom = new Date(
        this._desiredDate.getFullYear(),
        this._desiredDate.getMonth(),
        this._desiredDate.getDate(),
        hours,
        minutes
      );
    } else {
      let today = new Date();
      this._desiredTimeFrom = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes
      );
    }
  }

  changeDesiredTimeTo(time) {
    let hours = time.split(":")[0];
    let minutes = time.split(":")[1];
    if (this._desiredDate) {
      this._desiredTimeTo = new Date(
        this._desiredDate.getFullYear(),
        this._desiredDate.getMonth(),
        this._desiredDate.getDate(),
        hours,
        minutes
      );
    } else {
      let today = new Date();
      this._desiredTimeTo = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes
      );
    }
  }
  // ***

  // ***
  changeSenderName(name) {
    this._sender.name = name;
  }
  changeSenderSurname(surname) {
    this._sender.surname = surname;
  }
  changeSenderPhone(phone) {
    this._sender.phone = phone;
  }
  changeSenderAddress(fullAddress) {
    this._sender.address = fullAddress;
  }
  // ***

  // ***
  changeRecipientName(name) {
    this._recipient.name = name;
  }
  changeRecipientSurname(surname) {
    this._recipient.surname = surname;
  }
  changeRecipientPhone(phone) {
    this._recipient.phone = phone;
  }
  changeRecipientAddress(fullAddress) {
    this._recipient.address = fullAddress;
  }
  // ***

  // ***
  setPaymentToCourier() {
    this._prepaid = false;
    this._paymentType = 0;
  }
  setPaymentAcquiring() {
    this._prepaid = false;
    this._paymentType = 2;
  }
  // ***

  // ***
  print() {
    let dataPrint = {};
console.log("totalSum:", this._totalSum)
    if (this._cargos) {
      let cargoPrint = {
        name: "Расчет стоимости на перевозку груза по указанным габаритам",
        list: [],
      };
      this._cargos.forEach((cargo) => {
        let linePrint = {
          text: `Груз ${cargo.name}: ${cargo.length} × ${cargo.width} × ${cargo.height} см, ${cargo.weight} кг`,
        };
        cargoPrint.list.push(linePrint);
      });
      dataPrint.cargo = cargoPrint;
    }

    let addressPrint = {
      name: "Доставка",
      list: [],
    };
    let addressPrintLine = {
      text: `${this.billingRequest["fromCity"]} - ${this.billingRequest["toCity"]}`,
      price: `${this._priceDelivery}`,
    };
    addressPrint.list.push(addressPrintLine);
    dataPrint.delivery = addressPrint;

    let servicesPrint = {
      name: "Услуги",
      list: [],
    };

    let servicesPrintFunction = (servicesMap) => {
      if (servicesMap.size) {
        servicesMap.forEach((service) => {
          let linePrint = {
            text: `${service.fullName}`,
            price: `${service.price || ""}`,
          };
          servicesPrint.list.push(linePrint);
        });
      }
    };
    servicesPrintFunction(this._extraServices);
    servicesPrintFunction(this._derivalServices);
    servicesPrintFunction(this._taxiServices);
    dataPrint.services = servicesPrint;

    let form = document.createElement("form");
    form.setAttribute("action", myajax.printPage);
    form.setAttribute("target", "_blank");
    form.setAttribute("method", "post");

    let inputPrice = document.createElement("input");
    form.appendChild(inputPrice);
    inputPrice.setAttribute("type", "hidden");
    inputPrice.setAttribute("name", "price");
    inputPrice.setAttribute("value", this._totalSum);

    let inputData = document.createElement("input");
    form.appendChild(inputData);
    inputData.setAttribute("type", "hidden");
    inputData.setAttribute("name", "data");
    inputData.setAttribute("value", JSON.stringify(dataPrint));

    document.querySelector("body").appendChild(form);
    form.submit();
    form.remove();
  }

  checkPrint() {
    if (this.billingRequest["toCity"] && this.billingRequest["fromCity"]) {
      return true;
    } else {
      return false;
    }
  }
  // ***
}
