import {
  RequestErrorProvider,
  ApiErrorProvider,
  TrackingOrderProvider,
} from "../../data/tracking_order_provider/tracking-order-provider.js";

export class TrackingOrderState {
  constructor({ form, submitBtn, errorBlock }) {
    this._form = form;
    this._submitBtn = submitBtn;
    this._errorBlock = errorBlock;
    this._shipmentNumber;
    this._provider = new TrackingOrderProvider();
    this._orderStateListBlock;
  }

  async getHistoryStatusChanges() {
    this._clearError();
    this._setLoading();

    if (this._shipmentNumber) {
      try {
        let response = await this._provider.getHistoryStatusChanges({
          shipmentNumber: this._shipmentNumber,
        });

        let orderStateListBlock = this._generateOrderStateListBlock(
          response.list[0].History
        );

        this._clearOrderStateListBlock();
        this._orderStateListBlock = orderStateListBlock;
        this._form.appendChild(this._orderStateListBlock);
      } catch (error) {
        this._clearOrderStateListBlock();
        if (error instanceof RequestErrorProvider) {
          this._setError("danger", error.message);
        } else if (error instanceof ApiErrorProvider) {
          this._setError(
            "danger",
            "Произошла непредвиденная ошибка. Попробуйте позже"
          );
        }
        console.log(error);
      } finally {
        this._removeLoading();
      }
    } else {
      this._setError("warning", "Номер заказа — обязательное поле");
    }
  }

  _setLoading() {
    this._submitBtn.classList.add("button_loading");
    if (this._orderStateListBlock) {
      this._orderStateListBlock.classList.add("loading");
    }
  }

  _removeLoading() {
    this._submitBtn.classList.remove("button_loading");
    if (this._orderStateListBlock) {
      this._orderStateListBlock.classList.remove("loading");
    }
  }

  _setError(type, message) {
    let error = document.createElement("div");
    error.classList.add("alert", `alert_${type}`);
    error.innerHTML = message;
    this._errorBlock.appendChild(error);
  }

  _clearError() {
    let alertBlock = this._errorBlock.querySelector(".alert");
    if (alertBlock) {
      alertBlock.remove();
    }
  }

  _generateOrderStateListBlock(history) {
    let orderStateListBlock = document.createElement("div");
    orderStateListBlock.classList.add("order-history");

    let table = document.createElement("table");
    orderStateListBlock.appendChild(table);
    table.classList.add("order-history__table");

    let tableBody = document.createElement("tbody");
    table.appendChild(tableBody);

    let headerLine = document.createElement("tr");
    tableBody.appendChild(headerLine);

    let headerDate = document.createElement("th");
    headerLine.appendChild(headerDate);
    headerDate.innerHTML = "Дата";

    let headerStatus = document.createElement("th");
    headerLine.appendChild(headerStatus);
    headerStatus.innerHTML = "Статус";

    history.forEach((status) => {
      let statusLine = document.createElement("tr");

      let date = new Date(status.Date);
      let formattedDate =
        $.datepicker.formatDate("dd-mm-yy", date) +
        " " +
        this._formatHoursMinutes(date.getHours()) +
        ":" +
        this._formatHoursMinutes(date.getMinutes());

      let dateBlock = document.createElement("td");
      statusLine.appendChild(dateBlock);
      dateBlock.innerHTML = formattedDate;

      let statusBlock = document.createElement("td");
      statusLine.appendChild(statusBlock);
      statusBlock.innerHTML = status.Is_delivered;

      tableBody.appendChild(statusLine);
    });

    return orderStateListBlock;
  }

  _formatHoursMinutes(number) {
    number = number.toString();
    if (number.length == 1) {
      return "0" + number;
    }
    return number;
  }

  _clearOrderStateListBlock() {
    if (this._orderStateListBlock) {
      this._orderStateListBlock.remove();
    }
  }

  setShipmentNumber(shipmentNumber) {
    this._shipmentNumber = shipmentNumber;
  }
}
