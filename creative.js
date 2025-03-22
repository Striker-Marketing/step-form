const handleCreativeForm = () => {
  const fieldWrappers = document.querySelectorAll(".input-wrapper");

  const turnInvalid = (input) => {
    input.style.backgroundColor = "#fff2f4";
    input.style.outlineColor = "#e30000";
  };
  const showMessage = (message) => {
    if (!message) return;
    message.style.maxHeight = "15px";
    message.style.marginTop = "8px";
  };

  const steps = document.querySelectorAll("form-step");
  let currentStep = 0;
  const nextStepButton = document.querySelector(".step-button.next");
  const prevStepButton = document.querySelector(".step-button.prev");

  phoneField = document.querySelector("[name='phone_number']");
  if (phoneField) {
    const cookieConfig = `path=/; domain=${((d) =>
      d.match(/\.([a-z]{2,})\.([a-z]{2,})$/)
        ? `.${RegExp.$1}.${RegExp.$2}`
        : d)(window.location.hostname)}; max-age=3600`;
    phoneNumberIsNotValid = () => !iti.isValidNumber();

    iti = window.intlTelInput(phoneField, {
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@23.3.2/build/js/utils.js",
      autoPlaceholder: "aggressive",
      initialCountry: "auto",
      geoIpLookup: async (success, failure) => {
        try {
          const cookieCountry = document.cookie
            .split("user_country=")[1]
            ?.split(";")[0];
          if (cookieCountry) {
            success(cookieCountry);
            return;
          }
          const response = await fetch(
            "https://get.geojs.io/v1/ip/country.json"
          );
          const data = await response.json();
          if (response.ok) {
            document.cookie = `user_country=${data.country};${cookieConfig}`;
            success(data.country);
          } else throw new error("Error Fetching Ip", response, data);
        } catch (e) {
          console.warn(e);
          failure();
        }
      },
    });
  }

  const handleRadioWrapper = (wrapper) => {
    const inputs = wrapper.querySelectorAll("input");
    const other = wrapper.nextElementSibling;
    const otherInput = other.querySelector("input");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.value === "Other") {
          other.style.maxHeight = "20rem";
          other.style.marginTop = window.innerWidth < 768 ? "30px" : "45px";
          otherInput.setAttribute("required", "required");
          setTimeout(() => {
            other.style.overflow = "unset";
          }, 0.2);
        } else {
          other.style.maxHeight = "0";
          other.style.marginTop = "0";
          other.style.overflow = "hidden";
          otherInput.removeAttribute("required");
        }
      });
    });
  };

  const handleInputValidity = (wrapper) => {
    if (wrapper.classList.contains("radio-wrapper")) {
      handleRadioWrapper(wrapper);
      return;
    }

    const input = wrapper.querySelector(".input");
    const parent = input.parentNode.parentNode;
    if (parent.classList.contains("other-input")) {
      parent.style.maxHeight = "0";
      parent.style.overflow = "hidden";
    }
    if (!input) return;
    const errorMessage = wrapper.querySelector(".error-message");
    const emptyMessage = wrapper.querySelector(".empty-message");
    input.addEventListener("blur", () => {
      if (input.required && input.value.trim() === "") {
        turnInvalid(input);
        showMessage(emptyMessage);
        return;
      }
      if (
        input.required &&
        (!input.checkValidity() ||
          (input.name === "phone_number" && !iti.isValidNumber()))
      ) {
        turnInvalid(input);
        if (emptyMessage) emptyMessage.style = "";
        showMessage(errorMessage);
      } else {
        if (emptyMessage) emptyMessage.style = "";
        if (errorMessage) errorMessage.style = "";
      }
    });
    input.addEventListener("focus", () => {
      input.style = "";
    });
  };

  fieldWrappers.forEach((wrapper) => {
    handleInputValidity(wrapper);
  });
};
handleCreativeForm();
