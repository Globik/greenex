class FormHandler {
  constructor(form, options) {
    const FormClass = this;
    const maxSeats = 3;
    this.form = typeof form === "string" ? document.querySelector(form) : form;
    if (options.priceField) {
      this._priceField =
        typeof options.priceField === "string"
          ? document.querySelector(options.priceField)
          : options.priceField;
    }
    if (options.priceInput) {
      this._priceInput =
        typeof options.priceInput === "string"
          ? document.querySelector(options.priceInput)
          : options.priceInput;
    }
    this.price = 0;

    this._extraServicesPrice = 0;
    this._derivalServicesPrice = 0;

    this._derivalAddress = "";
    this._derivalTerminalAddress = "";
    this._derivalDeliveryType = "Д";
    this._arrivalAddress = "";
    this._arrivalTerminalAddress = "";
    this._arrivalDeliveryType = "Д";

    this.form.querySelectorAll("input[type=number]").forEach((element) => {
      element.addEventListener("change", valueWatcher);
    });

    this.dataCalc = {
      icn: "НФ-000003",
      typeDelivery: "Т-Т",
      urgent: 0,
      B2B: "false",
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      amount: 0,
      COD: 0,
      services: [
        // {
        //   tag: "service-delivery",
        //   code: "Д-0",
        //   count: 1,
        // },
      ],
      // toAdress: null,
      // fromAdress: null,
      toRegion: null,
      toCity: null,
      fromRegion: null,
      fromCity: null,
    };

    // *********
    // Addresses
    // *********
    function join(arr /*, separator */) {
      var separator = arguments.length > 1 ? arguments[1] : ", ";
      return arr
        .filter(function (n) {
          return n;
        })
        .join(separator);
    }
    function makeTownAddressString(address) {
      if (address.city === address.region) {
        return join([address.city, address.settlement]);
      } else {
        return join([
          address.city,
          address.settlement,
          address.region_with_type,
          address.area_with_type,
        ]);
      }
    }
    function makeStreetAddressString(address) {
      if (address.city === address.region) {
        return join([
          address.street_with_type,
          join(
            [
              address.house_type,
              address.house,
              address.block_type,
              address.block,
            ],
            " "
          ),
        ]);
      } else {
        return join([
          address.street_with_type,
          join(
            [
              address.house_type,
              address.house,
              address.block_type,
              address.block,
            ],
            " "
          ),
          join([address.flat_type, address.flat], " "),
        ]);
      }
    }
    function formatTownResult(value, currentValue, suggestion) {
      var addressValue = makeTownAddressString(suggestion.data);
      suggestion.value = addressValue;
      return addressValue;
    }
    function formatTownSelected(suggestion) {
      var addressValue = makeTownAddressString(suggestion.data);
      return addressValue;
    }
    function formatStreetResult(value, currentValue, suggestion) {
      var addressValue = makeStreetAddressString(suggestion.data);
      suggestion.value = addressValue;
      return addressValue;
    }
    function formatStreetSelected(suggestion) {
      var addressValue = makeStreetAddressString(suggestion.data);
      return addressValue;
    }

    $(this.form.querySelector("input[name=derival-address]")).suggestions({
      token: token,
      type: "ADDRESS",
      hint: false,
      bounds: "city-settlement",
      count: 5,
      formatResult: formatTownResult,
      formatSelected: formatTownSelected,
      onSelect: function (suggestion) {
        FormClass.dataCalc.fromRegion = suggestion.data.region;
        FormClass.dataCalc.fromCity = suggestion.data.city;
        // FormClass.dataCalc.fromAdress = suggestion.unrestricted_value;
        /// PodachaAvto Service
        // $(FormClass.form)
        //   .find("input[name=derival-point]")
        //   .val(suggestion.unrestricted_value);
        // let code = "ПА-";
        // let city = suggestion.data.settlement
        //   ? suggestion.data.settlement
        //   : suggestion.data.city;
        // code += city;
        // let service = {
        //   name: "Подача авто - " + city,
        //   tag: "car-supply",
        //   code: code,
        //   count: 1,
        // };
        // FormClass.servicePush(service);
        FormClass.getTarifDist();
      },
      onSelectNothing: function () {
        $(this).val("");
      },
    });
    if (this.form.querySelector("input[name=derival-address]")) {
      this.form
        .querySelector("input[name=derival-address]")
        .setAttribute("autocomplete", "off");
    }
    $(this.form.querySelector("input[name=arrival-address]")).suggestions({
      token: token,
      type: "ADDRESS",
      hint: false,
      bounds: "city-settlement",
      count: 5,
      formatResult: formatTownResult,
      formatSelected: formatTownSelected,
      onSelect: function (suggestion) {
        FormClass.dataCalc.toRegion = suggestion.data.region;
        FormClass.dataCalc.toCity = suggestion.data.city;
        // FormClass.dataCalc.toAdress = suggestion.unrestricted_value;
        $(FormClass.form)
          .find("input[name=arrival-point]")
          .val(suggestion.unrestricted_value);
        FormClass.getTarifDist();
      },
      onSelectNothing: function () {
        $(this).val("");
      },
    });
    if (this.form.querySelector("input[name=arrival-address]")) {
      this.form
        .querySelector("input[name=arrival-address]")
        .setAttribute("autocomplete", "off");
    }

    if (
      this.form.querySelector("input[name=derival-address-town]") &&
      this.form.querySelector("input[name=derival-address-street]")
    ) {
      $(
        this.form.querySelector("input[name=derival-address-town]")
      ).suggestions({
        token: token,
        type: "ADDRESS",
        hint: false,
        bounds: "city-settlement",
        count: 8,
        formatResult: formatTownResult,
        formatSelected: formatTownSelected,
        onSelect: function (suggestion) {
          FormClass.getTerminals(
            suggestion.data.city,
            "select[name=derival-terminal]"
          );
        },
        onSelectNothing: function () {
          $(this).val("");
          FormClass.clearSelectOption("select[name=derival-terminal]");
        },
      });
      var sugestionDerivalAddress = $(
        this.form.querySelector("input[name=derival-address-street]")
      )
        .suggestions({
          token: token,
          type: "ADDRESS",
          hint: false,
          bounds: "street-house",
          formatResult: formatStreetResult,
          formatSelected: formatStreetSelected,
          constraints: $(
            this.form.querySelector("input[name=derival-address-town]")
          ),
          count: 8,
          onSelect: function (suggestion) {
            FormClass.dataCalc.fromRegion = suggestion.data.region;
            FormClass.dataCalc.fromCity = suggestion.data.city;
            FormClass.dataCalc.fromAdress = suggestion.unrestricted_value;
            FormClass._derivalAddress = suggestion.unrestricted_value;
            let code = "ПА-";
            let city = suggestion.data.settlement
              ? suggestion.data.settlement
              : suggestion.data.city;
            code += city;
            /// PodachaAvto Service
            // let service = {
            //   name: "Подача авто - " + city,
            //   tag: "car-supply",
            //   code: code,
            //   count: 1,
            // };
            // FormClass.servicePush(service);
            ///
            // FormClass.dataCalc.typeDelivery = FormClass._derivalDeliveryType + "-" + FormClass._arrivalDeliveryType;
            // FormClass.getTerminals(
            //   suggestion.data.city,
            //   "select[name=derival-terminal]"
            // );
            FormClass.getTarifDist();
          },
          onSelectNothing: function () {
            $(this).val("");
          },
        })
        .suggestions();
      sugestionDerivalAddress.fixData();
      $(this.form.querySelector("input[name=derival-address-street]")).on(
        "suggestions-fixdata",
        function (event, suggestion) {
          FormClass.dataCalc.fromAdress = suggestion.unrestricted_value;
          FormClass._derivalAddress = suggestion.unrestricted_value;
          FormClass.getTarifDist();
        }
      );
    }
    // ******
    if (
      this.form.querySelector("input[name=arrival-address-town]") &&
      this.form.querySelector("input[name=arrival-address-street]")
    ) {
      $(
        this.form.querySelector("input[name=arrival-address-town]")
      ).suggestions({
        token: token,
        type: "ADDRESS",
        hint: false,
        bounds: "city-settlement",
        count: 8,
        formatResult: formatTownResult,
        formatSelected: formatTownSelected,
        onSelect: function (suggestion) {
          FormClass.getTerminals(
            suggestion.data.city,
            "select[name=arrival-terminal]"
          );
        },
        onSelectNothing: function () {
          $(this).val("");
        },
      });
      var sugestionArrivalAddress = $(
        this.form.querySelector("input[name=arrival-address-street]")
      )
        .suggestions({
          token: token,
          type: "ADDRESS",
          hint: false,
          bounds: "street-house",
          formatResult: formatStreetResult,
          formatSelected: formatStreetSelected,
          constraints: $(
            this.form.querySelector("input[name=arrival-address-town]")
          ),
          count: 8,
          onSelect: function (suggestion) {
            FormClass.dataCalc.toRegion = suggestion.data.region;
            FormClass.dataCalc.toCity = suggestion.data.city;
            FormClass.dataCalc.toAdress = suggestion.unrestricted_value;
            FormClass._arrivalAddress = suggestion.unrestricted_value;
            // FormClass.dataCalc.typeDelivery = FormClass._derivalDeliveryType + "-" + FormClass._arrivalDeliveryType;
            FormClass.getTarifDist();
          },
          onSelectNothing: function () {
            $(this).val("");
            FormClass.clearSelectOption("select[name=arrival-terminal]");
          },
        })
        .suggestions();
      sugestionArrivalAddress.fixData();
      $(this.form.querySelector("input[name=arrival-address-street]")).on(
        "suggestions-fixdata",
        function (event, suggestion) {
          FormClass.dataCalc.toAdress = suggestion.unrestricted_value;
          FormClass._arrivalAddress = suggestion.unrestricted_value;
          FormClass.getTarifDist();
        }
      );
    }

    // *****
    // Cargo
    // *****
    if (this.form.querySelector("input[name=cargo-weight]")) {
      const input = this.form.querySelector("input[name=cargo-weight]");
      if (input.value) {
        this.dataCalc.weight = input.value;
      }
      input.addEventListener("change", (event) => {
        this.dataCalc.weight = input.value;
        this.getTarifDist();
      });
    }
    if (this.form.querySelector("input[name=cargo-length]")) {
      const input = this.form.querySelector("input[name=cargo-length]");
      if (input.value) {
        this.dataCalc.length = input.value;
      }
      input.addEventListener("change", (event) => {
        this.dataCalc.length = input.value;
        this.getTarifDist();
      });
    }
    if (this.form.querySelector("input[name=cargo-width]")) {
      const input = this.form.querySelector("input[name=cargo-width]");
      if (input.value) {
        this.dataCalc.width = input.value;
      }
      input.addEventListener("change", (event) => {
        this.dataCalc.width = input.value;
        this.getTarifDist();
      });
    }
    if (this.form.querySelector("input[name=cargo-height]")) {
      const input = this.form.querySelector("input[name=cargo-height]");
      if (input.value) {
        this.dataCalc.height = input.value;
      }
      input.addEventListener("change", (event) => {
        this.dataCalc.height = input.value;
        this.getTarifDist();
      });
    }
    this._cargoArr = [];
    if (this.form.querySelector("#add-cargo")) {
      this.form
        .querySelector("#add-cargo")
        .addEventListener("click", (event) => {
          if (!this.form.querySelector("input[name=multi-cargo-name]").value) {
            this.form.querySelector("input[name=multi-cargo-name]").focus();
            return;
          }
          if (
            !this.form.querySelector("input[name=multi-cargo-weight]").value
          ) {
            this.form.querySelector("input[name=multi-cargo-weight]").focus();
            return;
          }
          if (
            !this.form.querySelector("input[name=multi-cargo-length]").value
          ) {
            this.form.querySelector("input[name=multi-cargo-length]").focus();
            return;
          }
          if (!this.form.querySelector("input[name=multi-cargo-width]").value) {
            this.form.querySelector("input[name=multi-cargo-width]").focus();
            return;
          }
          if (
            !this.form.querySelector("input[name=multi-cargo-height]").value
          ) {
            this.form.querySelector("input[name=multi-cargo-height]").focus();
            return;
          }
          let cargo = {
            isService: false,
            article: "",
            name: this.form.querySelector("input[name=multi-cargo-name]").value,
            barCode: "",
            count: 1,
            price: 0,
            discount: 0,
            VAT: "",
            VATSum: 0,
            COD: 0,
            amount: 0,
            weight: parseInt(
              this.form.querySelector("input[name=multi-cargo-weight]").value
            ),
            length: parseInt(
              this.form.querySelector("input[name=multi-cargo-length]").value
            ),
            width: parseInt(
              this.form.querySelector("input[name=multi-cargo-width]").value
            ),
            height: parseInt(
              this.form.querySelector("input[name=multi-cargo-height]").value
            ),
          };
          this._cargoArr.push(cargo);
          this.form.querySelector("input[name=multi-cargo-name]").value = "";
          this.form.querySelector("input[name=multi-cargo-weight]").value = "";
          this.form.querySelector("input[name=multi-cargo-length]").value = "";
          this.form.querySelector("input[name=multi-cargo-width]").value = "";
          this.form.querySelector("input[name=multi-cargo-height]").value = "";
          this.cargoListValidationHandler();
          this.cargoListDraw();
          this.getTarifDist();
        });
    }
    function multiCargoChangeHandler(cargoSelector, name) {
      let input = this.form.querySelector(cargoSelector);
      if (input) {
        if (input.value) {
          this.dataCalc[name] = input.value;
        }
        input.addEventListener("change", (event) => {
          if (!this._cargoArr.length) {
            this.dataCalc[name] = input.value;
            this.getTarifDist();
          }
        });
      }
    }
    multiCargoChangeHandler.call(
      this,
      "input[name=multi-cargo-weight]",
      "weight"
    );
    multiCargoChangeHandler.call(
      this,
      "input[name=multi-cargo-length]",
      "length"
    );
    multiCargoChangeHandler.call(
      this,
      "input[name=multi-cargo-width]",
      "width"
    );
    multiCargoChangeHandler.call(
      this,
      "input[name=multi-cargo-height]",
      "height"
    );

    // ********
    // Services
    // ********
    function valueWatcher(event) {
      const input = event.target ? event.target : event;
      if (
        parseInt(input.value) < parseInt(input.min) &&
        typeof input.min !== "undefined"
      ) {
        input.value = input.min;
      } else {
        if (
          parseInt(input.value) > parseInt(input.max) &&
          typeof input.max !== "undefined"
        ) {
          input.value = input.max;
        }
      }
    }
    if (this.form.querySelector("input[name=service-workers]")) {
      this.form
        .querySelector("input[name=service-workers]")
        .addEventListener("change", (event) => {
          if (event.target.value >= maxSeats) {
            this.form.querySelector("input[name=service-passengers]").value =
              "";
            this.form.querySelector(
              "input[name=service-passengers]"
            ).disabled = true;
          } else {
            this.form.querySelector(
              "input[name=service-passengers]"
            ).disabled = false;
            this.form.querySelector("input[name=service-passengers]").max =
              maxSeats - event.target.value;
            valueWatcher(
              this.form.querySelector("input[name=service-passengers]")
            );
          }
        });
    }
    if (this.form.querySelector("input[name=service-workers]")) {
      function serviceHandler() {
        const serviceWorkers = FormClass.form.querySelector(
          "input[name=service-workers]"
        );
        const serviceDuration = FormClass.form.querySelector(
          "input[name=service-duration]"
        );
        if (parseInt(serviceWorkers.value)) {
          let service = {
            name: "Грузчики и длительность работ",
            tag: "service-workers-duration",
            code:
              serviceDuration.value && parseInt(serviceDuration.value) !== 0
                ? "Г" + serviceWorkers.value + "-Ч" + serviceDuration.value
                : "Г" + serviceWorkers.value,
            count: 1,
          };
          FormClass.servicePush(service);
        } else {
          if (parseInt(serviceDuration.value)) {
            let service = {
              name: "Грузчики и длительность работ",
              tag: "service-workers-duration",
              code: "Ч" + serviceDuration.value,
              count: 1,
            };
            FormClass.servicePush(service);
          } else {
            FormClass.serviceDelete("service-workers-duration");
          }
        }
      }
      if (typeof SERVICE_WORKERS !== "undefined") {
        this.form.querySelector("input[name=service-workers]").value =
          SERVICE_WORKERS;
        serviceHandler();
      }
      this.form
        .querySelector("input[name=service-workers]")
        .addEventListener("change", serviceHandler);
    }
    if (this.form.querySelector("input[name=service-duration]")) {
      function serviceHandler() {
        const serviceDuration = FormClass.form.querySelector(
          "input[name=service-duration]"
        );
        const serviceWorkers = FormClass.form.querySelector(
          "input[name=service-workers]"
        );
        if (parseInt(serviceDuration.value)) {
          let service = {
            name: "Грузчики и длительность работ",
            tag: "service-workers-duration",
            code:
              serviceWorkers.value && parseInt(serviceWorkers.value) !== 0
                ? "Г" + serviceWorkers.value + "-Ч" + serviceDuration.value
                : "Ч" + serviceDuration.value,
            count: 1,
          };
          FormClass.servicePush(service);
        } else {
          if (parseInt(serviceWorkers.value)) {
            let service = {
              name: "Грузчики и длительность работ",
              tag: "service-workers-duration",
              code: "Г" + serviceWorkers.value,
              count: 1,
            };
            FormClass.servicePush(service);
          } else {
            FormClass.serviceDelete("service-workers-duration");
          }
        }
      }
      if (typeof SERVICE_DURATION !== "undefined") {
        this.form.querySelector("input[name=service-duration]").value =
          SERVICE_DURATION;
        serviceHandler();
      }
      this.form
        .querySelector("input[name=service-duration]")
        .addEventListener("change", serviceHandler);
    }
    if (this.form.querySelector("input[name=service-passengers]")) {
      const servicePassengers = this.form.querySelector(
        "input[name=service-passengers]"
      );
      function serviceHandler() {
        if (parseInt(servicePassengers.value)) {
          let service = {
            name: "Перевозка пассажиров",
            tag: "service-passengers",
            code: "П" + servicePassengers.value,
            count: 1,
          };
          FormClass.servicePush(service);
        } else {
          FormClass.serviceDelete("service-passengers");
        }
      }
      if (typeof SERVICE_PASSENGERS !== "undefined") {
        servicePassengers.value = SERVICE_PASSENGERS;
        serviceHandler();
      }
      servicePassengers.addEventListener("change", serviceHandler);
    }
    this._extraServicesArr = [];
    this._derivalServicesArr = [];
    function servicesCheckboxHandler(arrayName, inputSelector) {
      this.form.querySelectorAll(inputSelector).forEach((input) => {
        input.addEventListener("click", (event) => {
          if (input.checked) {
            let service = {
              name: input.getAttribute("data-full-name"),
              tag: input.value,
              code: input.value,
              count: 1,
            };
            this.servicePush(service);
            service = {
              code: input.value,
              name: input.getAttribute("data-short-name"),
            };
            this[arrayName].push(service);
          } else {
            this.serviceDelete(input.value);
            this[arrayName] = this[arrayName].filter(
              (item) => item.code != input.value
            );
          }
        });
      });
    }
    servicesCheckboxHandler.call(
      this,
      "_extraServicesArr",
      "input[name=service-extra]"
    );
    servicesCheckboxHandler.call(
      this,
      "_derivalServicesArr",
      "input[name=service-derival]"
    );
    // this.form.querySelectorAll("input[name=service-extra]").forEach(input => {
    //     input.addEventListener("click", (event) => {
    //         if (input.checked) {
    //             let service = {
    //                 "tag": input.value,
    //                 "code": input.value,
    //                 "count": 1,
    //             }
    //             this.servicePush(service);
    //             service = {
    //                 code: input.value,
    //                 name: input.getAttribute("data-short-name"),
    //             }
    //             this._extraServicesArr.push(service);
    //         } else {
    //             this.serviceDelete(input.value);
    //             this._extraServicesArr = this._extraServicesArr.filter(item => item.code != input.value);
    //         }
    //     })
    // });

    // ****
    // Date
    // ****
    $(this.form).find("input[name=date]").datepicker({
      minDate: new Date(),
      dateFormat: "yy-mm-dd",
    });

    // *******
    // Payment
    // *******
    $(this.form)
      .find("input[name=payment-type]")
      .each(function (index) {
        $(this).click(function () {
          FormClass.billDraw();
          // if ($("#bill-row-payment").length == 0) {
          //     $("#bill").prepend($('<div class="bill__row" id="bill-row-payment" style="order:90;"><div class="bill__title">Способ оплаты:</div><div class="bill__line bill__line_only-name"><div class="bill__name-line" id="bill-row-payment-type">' + this.getAttribute("data-name") + '</div></div></div>').hide().fadeIn());
          // } else {
          //     $("#bill-row-payment-type").html(this.getAttribute("data-name"));
          // }
        });
      });

    // ********
    // Delivery
    // ********
    function deliveryCheckboxesHandler(selector, deliveryType) {
      this.form.querySelectorAll(selector).forEach((input) => {
        input.addEventListener("click", (event) => {
          if (input.checked) {
            this.form.querySelectorAll(selector).forEach((input) => {
              input.checked = false;
              let instertedItem = input
                .closest("li")
                .querySelector(".form__inserted-item");
              $(instertedItem).find("input, select").prop("required", false);
              $(instertedItem).hide();
            });

            input.checked = true;
            let instertedItem = input
              .closest("li")
              .querySelector(".form__inserted-item");
            $(instertedItem).find("input, select").prop("required", true);
            $(instertedItem).show();
          } else {
            this[deliveryType] = "Д";

            let instertedItem = input
              .closest("li")
              .querySelector(".form__inserted-item");
            $(instertedItem).find("input, select").prop("required", false);
            $(instertedItem).hide();
          }
          // FormClass.dataCalc.typeDelivery = FormClass._derivalDeliveryType + "-" + FormClass._arrivalDeliveryType;
        });
      });
    }
    function terminalDeliveryTypeHandler(selector, deliveryType) {
      let input = this.form.querySelector(selector);
      if (input) {
        input.addEventListener("click", (event) => {
          // if (input.checked) {
          //     switch (deliveryType) {
          //         case "derival":
          //             this._derivalDeliveryType = "Т";
          //             break;
          //         case "arrival":
          //             this._arrivalDeliveryType = "Т";
          //             break;
          //         default:
          //             break;
          //     }
          // } else {
          //     switch (deliveryType) {
          //         case "derival":
          //             this._derivalDeliveryType = "Д";
          //             break;
          //         case "arrival":
          //             this._arrivalDeliveryType = "Д";
          //             break;
          //         default:
          //             break;
          //     }
          // }
          // switch (deliveryType) {
          //     case "derival":
          //         this.dataCalc.fromAdress = this._derivalAddress;
          //         break;
          //     case "arrival":
          //         this.dataCalc.toAdress = this._arrivalAddress;
          //         break;
          //     default:
          //         break;
          // }
          // FormClass.dataCalc.typeDelivery = FormClass._derivalDeliveryType + "-" + FormClass._arrivalDeliveryType;
        });
      }
    }
    deliveryCheckboxesHandler.call(this, "input[name=derival-delivery-type]");
    deliveryCheckboxesHandler.call(this, "input[name=arrival-delivery-type]");
    terminalDeliveryTypeHandler.call(
      this,
      "input[name=derival-delivery-type]",
      "derival"
    );
    terminalDeliveryTypeHandler.call(
      this,
      "input[name=arrival-delivery-type]",
      "arrival"
    );
    // this.form.querySelectorAll("input[name=derival-delivery-type]").forEach(input => {
    //     input.addEventListener("click", (event) => {
    //         if (input.checked) {
    //             this.form.querySelectorAll("input[name=derival-delivery-type]").forEach(input => {
    //                 input.checked = false;
    //                 let instertedItem = input.closest("li").querySelector(".form__inserted-item");
    //                 $(instertedItem).find("input, select").prop('required', false);
    //                 $(instertedItem).hide();
    //             })

    //             input.checked = true;
    //             let instertedItem = input.closest("li").querySelector(".form__inserted-item");
    //             $(instertedItem).find("input, select").prop('required', true);
    //             $(instertedItem).show();
    //         } else {
    //             let instertedItem = input.closest("li").querySelector(".form__inserted-item");
    //             $(instertedItem).find("input, select").prop('required', false);
    //             $(instertedItem).hide();
    //         }
    //     })
    // })

    // ******
    // Select
    // ******
    $(this.form)
      .find("select")
      .selectmenu({
        classes: {
          "ui-selectmenu-menu": "form-select__list",
          "ui-selectmenu-button": "form-select",
          "ui-selectmenu-text": "form-select__text",
        },
      });
    // function selectTerminalHandler(select, deliveryType) {
    //     function onSelect(event) {
    //         FormClass.dataCalc[deliveryType] = $(select).find("option:selected").text();
    //         FormClass.getTarifDist();
    //     }
    //     $(select).change(onSelect);
    //     $(select).on("selectmenuselect", onSelect);
    // }
    // selectTerminalHandler.call(this, this.form.querySelector("select[name=derival-terminal]"), "fromAdress");
    // selectTerminalHandler.call(this, this.form.querySelector("select[name=arrival-terminal]"), "toAdress");

    // ******
    // Submit
    // ******
    if (this.form.getAttribute("action") == "#") {
      this.form.addEventListener("submit", (event) => {
        event.preventDefault();

        let data = {
          icn: "НФ-000005",
          urgent: 0,
          typeDelivery: "Д-Д",
          shipmentNumber: "",
          clientShipmentNumber: "",
          desiredDate: $(this.form).find("input[name=date]").val(),
          desiredTimeFrom:
            $(this.form).find("input[name=date]").val() +
            ":" +
            $(this.form).find("input[name=datetime-from]").val(),
          desiredTimeTo:
            $(this.form).find("input[name=date]").val() +
            ":" +
            $(this.form).find("input[name=datetime-to]").val(),
          prepaid:
            this.form.querySelector("input[name=payment-type]:checked").value ==
            "to-courier"
              ? false
              : true,
          paymentType:
            this.form.querySelector("input[name=payment-type]:checked").value ==
            "to-courier"
              ? "offline"
              : "online",
          payer: 0,
          sender: {
            desiredDate: $(this.form).find("input[name=date]").val(),
            desiredTimeFrom:
              $(this.form).find("input[name=date]").val() +
              ":" +
              $(this.form).find("input[name=datetime-from]").val(),
            desiredTimeTo:
              $(this.form).find("input[name=date]").val() +
              ":" +
              $(this.form).find("input[name=datetime-to]").val(),
            address: {
              fullAddress: this.dataCalc.fromAdress,
            },
            companyName: "",
            name:
              $(this.form).find("input[name=derival-name]").val() +
              " " +
              $(this.form).find("input[name=derival-last-name]").val(),
            phone: String($(this.form).find("input[name=derival-tel]").val()),
            email: "",
            comment: "",
          },
          recipient: {
            withoutDelivery: false,
            address: {
              fullAddress: this.dataCalc.toAdress,
            },
            companyName: "",
            name:
              $(this.form).find("input[name=arrival-name]").val() +
              " " +
              $(this.form).find("input[name=arrival-last-name]").val(),
            phone: String($(this.form).find("input[name=arrival-tel]").val()),
            email: "",
            comment: "",
          },
          items: [
            {
              isService: false,
              article: "",
              name: this.form.querySelector("input[name=cargo-name]")
                ? this.form.querySelector("input[name=cargo-name]").value
                : this.form.querySelector("input[name=multi-cargo-name]").value,
              barCode: "",
              count: 1,
              price: 0,
              discount: 0,
              VAT: "",
              VATSum: 0,
              COD: 0,
              amount: 0,
              weight: parseInt(this.dataCalc.weight),
              length: parseInt(this.dataCalc.length),
              width: parseInt(this.dataCalc.width),
              height: parseInt(this.dataCalc.height),
            },
          ],
          weight: parseInt(this.dataCalc.weight),
          length: parseInt(this.dataCalc.length),
          width: parseInt(this.dataCalc.width),
          height: parseInt(this.dataCalc.height),
          COD: 0,
          amount: 0,
          services: this.dataCalc.services,
        };

        // let derivalTypeDelivery;
        // if (
        //   this.form.querySelector(
        //     "input[name=derival-delivery-type][value=from-terminal]:checked"
        //   )
        // ) {
        //   data.terminalSender = this.form.querySelector(
        //     "select[name=derival-terminal]"
        //   ).value;
        //   derivalTypeDelivery = "Т";
        // } else {
        //   derivalTypeDelivery = "Д";
        // }

        // let arrivalTypeDelivery;
        // if (
        //   this.form.querySelector(
        //     "input[name=arrival-delivery-type][value=from-terminal]:checked"
        //   )
        // ) {
        //   data.terminalRecipient = this.form.querySelector(
        //     "select[name=arrival-terminal]"
        //   ).value;
        //   arrivalTypeDelivery = "Т";
        // } else {
        //   arrivalTypeDelivery = "Д";
        // }

        // data.typeDelivery = derivalTypeDelivery + "-" + arrivalTypeDelivery;

        if (this._cargoArr.length) {
          data.items = this._cargoArr;
        }

        switch (
          this.form.querySelector("input[name=payment-type]:checked").value
        ) {
          case "to-courier":
            async function cashFunc() {
              if (typeof URL_SUCCESS_PAGE !== "undefined") {
                document.location.href = URL_SUCCESS_PAGE;
              }
            }
            this.shipmentCreate(data, cashFunc);
            break;
          case "credit-card":
            async function creditCardFunc(response) {
              FormClass.getTarifDist();
              sberPay({
                amount: FormClass.price,
                orderNumber: response.shipmentNumber,
                // fun: {
                //     errorFunc: errorHandler,
                // }
              });
            }
            this.shipmentCreate(data, creditCardFunc);
          default:
            break;
        }
      });
    }

    // *****
    // Print
    // *****
    if (document.getElementById("print-order")) {
      document
        .getElementById("print-order")
        .addEventListener("click", function (event) {
          event.preventDefault();
          if (!FormClass.form.checkValidity()) {
            FormClass.form.reportValidity();
            return;
          }

          let data = {
            action: "get_tarif_calc",
            "data-calc": FormClass.dataCalc,
            "session-id": Cookies.get("sessionId"),
          };

          $.ajax({
            type: "POST",
            url: myajax.url,
            data: data,
            context: FormClass,
            success: function (response) {
              response = $.parseJSON(response);

              let dataPrint = {
                cargo: {
                  name: "Расчет стоимости на перевозку груза по указанным габаритам",
                  list: [
                    {
                      text: `Груз: ${FormClass.dataCalc.length} × ${FormClass.dataCalc.width} × ${FormClass.dataCalc.height} см, ${FormClass.dataCalc.weight} кг`,
                    },
                  ],
                },
                delivery: {
                  name: "Доставка",
                  list: [
                    {
                      text: `${FormClass.dataCalc.fromAdress} - ${FormClass.dataCalc.toAdress}`,
                      price: Math.round(response.priceDelivery),
                    },
                  ],
                },
                services: {
                  name: "Услуги",
                  list: [],
                },
              };

              if (FormClass._cargoArr.length) {
                dataPrint.cargo.list = [];
                FormClass._cargoArr.forEach((element) => {
                  let data = {};
                  data.text = `Груз ${element.name}: ${element.length} × ${element.width} × ${element.height} см, ${element.weight} кг`;
                  dataPrint.cargo.list.push(data);
                });
              }

              for (let i = 0; i < this.dataCalc.services.length; i++) {
                const element = this.dataCalc.services[i];
                let price = 0;
                for (let j = 0; j < response.services.length; j++) {
                  if (element.code == response.services[j].code) {
                    price = response.services[j].price;
                    break;
                  }
                }
                let currentService = {
                  text: element.name,
                  price: price,
                };
                if (element.name) {
                  dataPrint.services.list.push(currentService);
                }
              }

              let form = $(
                '<form action="' +
                  URL_PRINT_PAGE +
                  '" method="post" target="_blank" style="display:none">' +
                  `<input type="hidden" name="price" value="${Math.round(
                    response.totalSum
                  )}" />` +
                  '<input type="hidden" name="data" />' +
                  "</form>"
              );
              $("body").append(form);
              $(form).find("input[name=data]").val(JSON.stringify(dataPrint));
              form.submit();
              $(form).remove();
            },
          });

          return false;
        });
    }
  }

  cargoListValidationHandler() {
    if (this._cargoArr.length) {
      this.form.querySelector("input[name=multi-cargo-name]").required = false;
      this.form.querySelector(
        "input[name=multi-cargo-weight]"
      ).required = false;
      this.form.querySelector(
        "input[name=multi-cargo-length]"
      ).required = false;
      this.form.querySelector("input[name=multi-cargo-width]").required = false;
      this.form.querySelector(
        "input[name=multi-cargo-height]"
      ).required = false;
    } else {
      this.form.querySelector("input[name=multi-cargo-name]").required = true;
      this.form.querySelector("input[name=multi-cargo-weight]").required = true;
      this.form.querySelector("input[name=multi-cargo-length]").required = true;
      this.form.querySelector("input[name=multi-cargo-width]").required = true;
      this.form.querySelector("input[name=multi-cargo-height]").required = true;
    }
    this.cargoListVolumeSetter();
  }

  cargoListVolumeSetter() {
    if (this._cargoArr.length) {
      let weightSum = 0;
      let maxLength = 0;
      let maxWidth = 0;
      let maxHeight = 0;
      this._cargoArr.forEach((element) => {
        weightSum += element.weight;
        function maxVolumeFinder(max, param) {
          if (element[param] > max) {
            return (max = element[param]);
          }
          return max;
        }
        maxLength = maxVolumeFinder(maxLength, "length");
        maxWidth = maxVolumeFinder(maxWidth, "width");
        maxHeight = maxVolumeFinder(maxHeight, "height");
      });
      this.dataCalc.weight = parseInt(weightSum);
      this.dataCalc.length = parseInt(maxLength);
      this.dataCalc.width = parseInt(maxWidth);
      this.dataCalc.height = parseInt(maxHeight);
    } else {
      function volumeSetter(selector) {
        if (this.form.querySelector(selector).value) {
          return parseInt(this.form.querySelector(selector).value);
        } else {
          return 0;
        }
      }
      this.dataCalc.weight = volumeSetter.call(
        this,
        "input[name=multi-cargo-weight]"
      );
      this.dataCalc.length = volumeSetter.call(
        this,
        "input[name=multi-cargo-length]"
      );
      this.dataCalc.width = volumeSetter.call(
        this,
        "input[name=multi-cargo-width]"
      );
      this.dataCalc.height = volumeSetter.call(
        this,
        "input[name=multi-cargo-height]"
      );
    }
  }

  cargoListDraw() {
    document.getElementById("list-cargo").innerHTML = "";
    this._cargoArr.forEach((element, key) => {
      let html = '<li class="added-list__item">';
      html += '<div class="added-list__text">';
      html +=
        element.name +
        ", " +
        element.weight +
        "кг, " +
        element.length +
        "x" +
        element.width +
        "x" +
        element.height;
      html += "</div>";
      html += `<button class="added-list__btn" data-index="${key}"></button>`;
      html += "</li>";
      $("#list-cargo").append($(html).hide().fadeIn());
      let btn = document
        .getElementById("list-cargo")
        .querySelector(`button[data-index="${key}"]`);
      btn.addEventListener("click", (event) => {
        this._cargoArr.splice(key, 1);
        this.cargoListDraw();
        this.cargoListValidationHandler();
        this.getTarifDist();
      });
    });
  }

  getTerminals(town, select) {
    let data = {
      action: "get_terminals",
      town: town,
      "session-id": Cookies.get("sessionId"),
    };
    select =
      typeof select == "string" ? this.form.querySelector(select) : select;
    $.ajax({
      type: "POST",
      url: myajax.url,
      data: data,
      context: this,
      success: function (response) {
        response = $.parseJSON(response);
        if (response.success) {
          this.addSelectOption(select, response.listTerminal);
        }
      },
    });
  }

  getTarifDist() {
    if (this.dataCalc.fromCity != null && this.dataCalc.toCity != null) {
      // console.log(this.dataCalc);
      let data = {
        action: "get_tarif_calc",
        "data-calc": this.dataCalc,
        "session-id": Cookies.get("sessionId"),
      };
      $.ajax({
        type: "POST",
        url: myajax.url,
        data: data,
        context: this,
        success: function (response) {
          response = $.parseJSON(response);

          console.log(response);

          if (response.success) {
            this.price = response.totalSum;

            if (this._priceField) {
              $(this._priceField).unmask();
              $(this._priceField).html(Math.trunc(response.totalSum));
              $(this._priceField).mask("### ##0", {
                reverse: true,
              });
              if (this._priceInput) {
                $(this._priceInput).val($(this._priceField).html());
              }
            }

            function servicesPriceSeter(array, priceVar) {
              if (array.length) {
                let sum = 0;
                array.forEach((service) => {
                  response.services.forEach((responseService) => {
                    if (service.code == responseService.code) {
                      sum += responseService.price;
                    }
                  });
                });
                this[priceVar] = Math.trunc(sum);
              }
            }

            servicesPriceSeter.call(
              this,
              this._extraServicesArr,
              "_extraServicesPrice"
            );
            servicesPriceSeter.call(
              this,
              this._derivalServicesArr,
              "_derivalServicesPrice"
            );

            // if (this._extraServicesArr.length) {
            //     let sum = 0;
            //     this._extraServicesArr.forEach(service => {
            //         response.services.forEach(responseService => {
            //             if (service.code == responseService.code) {
            //                 sum += responseService.price;
            //             }
            //         });
            //     });
            //     this._extraServicesPrice = Math.trunc(sum);
            // }

            this.billDraw();
          } else {
            if (response.errorMessage.includes("Сессия не активна")) {
              refreshCookie();
            } else if (
              response.errorMessage.includes("Направление не определено")
            ) {
              this._formError(
                "По данному направлению стандартная доставка не выполняется"
              );
            }
            //  else if (
            //   response.errorMessage.includes("Не найдена услуга, артикул(ПА")
            // ) {
            //   this._derivalError("Не обслуживается данное направление");
            // }
          }
        },
      });
    }
  }

  _formError(message) {
    let $btns = $(this.form).find("button[type=submit]");
    $btns.prop("disabled", true);

    const ERROR_BLOCK = this.form.querySelector(".form__error");

    const INPUT_DERIVAL = this.form.querySelector("input[name=derival-address]")
      ? this.form.querySelector("input[name=derival-address]")
      : this.form.querySelector("input[name=derival-address-town]");
    const INPUT_ARRIVAL = this.form.querySelector("input[name=arrival-address]")
      ? this.form.querySelector("input[name=arrival-address]")
      : this.form.querySelector("input[name=arrival-address-town]");

    if (ERROR_BLOCK && !ERROR_BLOCK.innerHTML) {
      let alert = document.createElement("div");
      alert.classList.add("alert", "alert_danger");
      alert.innerHTML = message;
      ERROR_BLOCK.append(alert);
      function inputChange() {
        ERROR_BLOCK.innerHTML = "";
        $btns.prop("disabled", false);
      }
      INPUT_DERIVAL.addEventListener("input", inputChange, {
        once: true,
      });
      INPUT_ARRIVAL.addEventListener("input", inputChange, {
        once: true,
      });
    }
  }

  _derivalError(message) {
    const $btns = $(this.form).find("button[type=submit]");
    $btns.prop("disabled", true);

    function removeAlert(block) {
      if (block.querySelector(".alert")) {
        block.removeChild(block.querySelector(".alert"));
      }
    }

    // const INPUT_BLOCK = this.form.querySelector(
    //   "input[name=derival-address-town]"
    // ) ? ;
    const INPUT_BLOCK = this.form.querySelector("input[name=derival-address]")
      ? this.form.querySelector("input[name=derival-address]").parentNode
      : this.form.querySelector("input[name=derival-address-town]").parentNode;
    const INPUT = this.form.querySelector("input[name=derival-address]")
      ? this.form.querySelector("input[name=derival-address]")
      : this.form.querySelector("input[name=derival-address-town]");
    removeAlert(INPUT_BLOCK);

    let alert = document.createElement("div");
    alert.classList.add("alert", "alert_danger");
    alert.innerHTML = message;
    INPUT_BLOCK.append(alert);

    function inputChange() {
      removeAlert(INPUT_BLOCK);
      $btns.prop("disabled", false);
      INPUT.removeEventListener("input", inputChange);
    }

    INPUT.addEventListener("input", inputChange);
  }

  formError(type, message) {
    const errorBlock = this.form.querySelector("#form-error");
    if (errorBlock) {
      $(errorBlock).removeClass();
      $(errorBlock).addClass(`alert alert_${type}`);
      $(errorBlock).html(message);
    } else {
      let output = `<div class="alert alert_${type}" id="form-error">`;
      output += `${message}`;
      output += `</div>`;
      $(this.form).append(output);
    }
  }

  shipmentCreate(sendData, func) {
    const errorBlock = this.form.querySelector("#form-error");
    const $btns = $(this.form).find("button[type=submit]");
    $btns.addClass("load");
    $btns.prop("disabled", true);
    const data = {
      action: "shipment_create",
      data: sendData,
      "session-id": Cookies.get("sessionId"),
    };
    $.ajax({
      type: "POST",
      url: myajax.url,
      data: data,
      context: this,
      success: function (response) {
        response = $.parseJSON(response);
        if (errorBlock) {
          $(errorBlock).remove();
        }
        if (response.success) {
          if (func) {
            func(response).then(() => {
              $btns.removeClass("load");
              $btns.prop("disabled", false);
            });
          } else {
            $btns.removeClass("load");
            $btns.prop("disabled", false);
          }
        } else {
          $btns.removeClass("load");
          $btns.prop("disabled", false);
        }
      },
    });
  }

  servicePush(service) {
    for (let index = 0; index < this.dataCalc.services.length; index++) {
      const element = this.dataCalc.services[index];
      if (element.tag == service.tag) {
        this.dataCalc.services.splice(index, 1);
        break;
      }
    }
    this.dataCalc.services.push(service);
    this.getTarifDist();
  }

  serviceDelete(serviceTag) {
    for (let index = 0; index < this.dataCalc.services.length; index++) {
      const element = this.dataCalc.services[index];
      if (element.tag == serviceTag) {
        this.dataCalc.services.splice(index, 1);
        break;
      }
    }
    this.getTarifDist();
  }

  billDraw() {
    if (document.getElementById("bill-info")) {
      document.getElementById("bill-info").innerHTML = "";

      if (this.form.querySelector("input[name=payment-type]:checked")) {
        let inputRadio = this.form.querySelector(
          "input[name=payment-type]:checked"
        );
        $("#bill-info").prepend(
          $(
            '<div class="bill__row" id="bill-row-payment" style="order:90;"><div class="bill__title">Способ оплаты:</div><div class="bill__line bill__line_only-name"><div class="bill__name-line" id="bill-row-payment-type">' +
              inputRadio.getAttribute("data-name") +
              "</div></div></div>"
          )
        );
      }

      function serviceRowDrawer(array, price, id, title) {
        if (array.length) {
          let html = '<div class="bill__row">';
          html += `<div class="bill__title">${title}</div>`;
          html += '<div class="bill__line">';
          html += `<div class="bill__name-line" id="${id}-name"></div>`;
          html += `<div class="bill__value-line"><span id="${id}-price"></span> ₽</div>`;
          html += "</div>";
          html += "</div>";
          $("#bill-info").prepend($(html));

          let outputArray = array.filter((item, index) => {
            function getObjectIndexByName(param) {
              for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (element.name === item.name) {
                  return index;
                }
              }
            }
            return getObjectIndexByName(item.name) === index;
          });
          outputArray.forEach((element) => {
            document.getElementById(id + "-name").innerHTML +=
              element.name + "; ";
          });
          document.getElementById(id + "-name").innerHTML = document
            .getElementById(id + "-name")
            .innerHTML.slice(0, -2);

          $(`#${id}-price`).unmask();
          $(`#${id}-price`).html(price);
          $(`#${id}-price`).mask("### ##0", {
            reverse: true,
          });
        }
      }

      serviceRowDrawer(
        this._extraServicesArr,
        this._extraServicesPrice,
        "bill-extra-services",
        "Дополнительные услуги"
      );

      serviceRowDrawer(
        this._derivalServicesArr,
        this._derivalServicesPrice,
        "bill-extra-services",
        "Услуги на терминале отправителе"
      );

      $("#bill").hide().fadeIn();
    }
  }

  addSelectOption(select, options) {
    if ($(select).length) {
      $(select).empty();
      options.forEach((option) => {
        $(select).append(
          `<option value="${option.GUIDTerminal}">${option.address}</option>`
        );
      });
      $(select).selectmenu("refresh");
    }
  }

  clearSelectOption(select) {
    if ($(select).length) {
      $(select).empty();
      $(select).selectmenu("refresh");
    }
  }
}
