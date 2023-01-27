// function modalSend(form) {
//   $(form).find(".alert").remove();
//   let formData = $(form).serializeArray();
//   formData.push({ name: "action", value: "send_email" });
//   return $.ajax({
//     type: "POST",
//     url: myajax.url,
//     data: formData,
//     context: form,
//     success: function (response) {
//       response = $.parseJSON(response);
//       if (response.success) {
//         $(this).append(
//           $(
//             `<div class="alert alert_success" style="display:none">${response.successMessage}</div>`
//           )
//         );
//         $(this).find("*[name]:not([name=theme])").val("");
//       } else {
//         $(this).append(
//           $(
//             `<div class="alert alert_error" style="display:none">${response.errorMessage}</div>`
//           )
//         );
//       }
//       $(this).find(".alert").fadeIn();
//     },
//   });
// }

function generatePDF() {
  const element = document.getElementById("bill-pdf");
  html2pdf()
    .set({
      margin: 10,
    })
    .from(element)
    .save();
}

$(document).ready(function () {
  /* Локализация datepicker */
  $.datepicker.regional["ru"] = {
    closeText: "Закрыть",
    prevText: "Предыдущий",
    nextText: "Следующий",
    currentText: "Сегодня",
    monthNames: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    monthNamesShort: [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ],
    dayNames: [
      "воскресенье",
      "понедельник",
      "вторник",
      "среда",
      "четверг",
      "пятница",
      "суббота",
    ],
    dayNamesShort: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
    dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    weekHeader: "Не",
    dateFormat: "dd.mm.yy",
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: "",
  };
  $.datepicker.setDefaults($.datepicker.regional["ru"]);

  // Маски телефонов
  $("input[type=tel]").mask("+7 (000)-000-00-00", {
    placeholder: "+7 (___) ___-__-__",
  });
	
    $('.faq-sect__item-title').on('click', f_acc);

    function f_acc() {
        // $('.faq-sect__item-text').not($(this).next()).stop().slideUp(300);
        // $('.faq-sect__item-title').not($(this)).removeClass('active');
        $(this).toggleClass('active');
        $(this).next().slideToggle(300);
    }
	
  // Калькулятор
  $('#intercity-form input').on('change', function () {

    var reqField = new Array("derival-address", "arrival-address", "cargo-weight", "cargo-length", "cargo-width", "cargo-height");
    var reqFieldEmpty = 0;
    $("#intercity-form").find("input").each(function () {
      for (var i = 0; i < reqField.length; i++) {
        if ($(this).attr("name") == reqField[i]) {
          if (!$(this).val()) reqFieldEmpty++;
        }
      }
    })
    if (reqFieldEmpty > 0) return false;

    var intercityFormPrice = $('#intercity-form-price');
    $(intercityFormPrice).html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    $(intercityFormPrice).css({ 'position': 'relative' });
    $(intercityFormPrice).addClass('button_loading');
    $(".calculation div.col-12:has(.price-line_white)").find('.alert_warning').remove();
    $('.form_slider').find("input[name=price]").val('');

    var dataSend = $('.form_slider').serialize();

    $.ajax({
      url: "/wp-content/themes/greenEx/php/calc.php",
      method: 'get',
      dataType: "html",
      data: dataSend,
      success: function (data) {
        if (!data) return false;
        var newarr = $.parseJSON(data);
        console.log(newarr);

        if (newarr.error.length == 0) {
          $('.form_slider').find("input[name=price]").val(newarr.amount);
          $(intercityFormPrice).removeClass('button_loading');
          $(intercityFormPrice).html(newarr.amount);
        } else {
          $(intercityFormPrice).removeClass('button_loading');
          for (var i = 0; i < newarr.error.length; i++) {
            $(".calculation div.col-12:has(.price-line_white)").append('<div class="alert alert_warning">' + newarr.error[i] + '</div>');
          }
        }

      }
    });

  });
	
	
});
