const handleCreativeForm = () => {
  const fieldWrappers = document.querySelectorAll(".input-wrapper");
  window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = "";
  });
  document.querySelector("form").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      if (event.target.tagName === "TEXTAREA" && !e.shiftKey) {
        return;
      }
      event.preventDefault();
    }
  });

  const turnInvalid = (input) => {
    input.style.backgroundColor = "#fff2f4";
    input.style.outlineColor = "#e30000";
  };
  const showMessage = (message) => {
    if (!message) return;
    message.style.maxHeight = "15px";
    message.style.marginTop = "8px";
  };

  phoneFields = document.querySelectorAll("[type='tel']");
  const cookieConfig = `path=/; domain=${((d) => (d.match(/\.([a-z]{2,})\.([a-z]{2,})$/) ? `.${RegExp.$1}.${RegExp.$2}` : d))(window.location.hostname)}; max-age=3600`;
  const itiObj = {}
  phoneFields.forEach((phoneField) => {
    const iti = window.intlTelInput(phoneField, {
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.3.2/build/js/utils.js",
      autoPlaceholder: "aggressive",
      initialCountry: "auto",
      geoIpLookup: async (success, failure) => {
        try {
          const cookieCountry = document.cookie.split("user_country=")[1]?.split(";")[0];
          if (cookieCountry) {
            success(cookieCountry);
            return;
          }
          const response = await fetch("https://get.geojs.io/v1/ip/country.json");
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
    itiObj[phoneField.name] = iti;
  });

  const handleRadioWrapper = (wrapper) => {
    const inputs = wrapper.querySelectorAll("input");
    const other = wrapper.nextElementSibling;
    const otherInput = other.querySelector("input");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.value === "Other" || input.value === "yes") {
          other.style.maxHeight = "20rem";
          other.style.marginTop = window.innerWidth < 768 ? "30px" : "30px";
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

  const checkInputValidity = (input) => {
    const errorMessage = input.type === "tel" ? input.parentElement.parentElement.querySelector(".error-message") : input.parentElement.querySelector(".error-message");
    const emptyMessage = input.type === "tel" ? input.parentElement.parentElement.querySelector(".empty-message") : input.parentElement.querySelector(".empty-message");
    if (input.required && input.value.trim() === "") {
      turnInvalid(input);
      showMessage(emptyMessage);
      return false;
    }
    if (input.required && (!input.checkValidity() || (input.type === "tel" && !itiObj[input.name].isValidNumber()))) {
      turnInvalid(input);
      if (emptyMessage) emptyMessage.style = "";
      showMessage(errorMessage);
      return false;
    }
    if (emptyMessage) emptyMessage.style = "";
    if (errorMessage) errorMessage.style = "";
    return true;
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
    input.addEventListener("blur", () => {
      checkInputValidity(input);
    });
    input.addEventListener("focus", () => {
      input.style = "";
    });
  };

  fieldWrappers.forEach((wrapper) => {
    handleInputValidity(wrapper);
  });

  const addActive = (array) => {
    array.forEach((item) => {
      item.classList.remove("active");
    });
    array[0].classList.add("active");
  };
  const steps = document.querySelectorAll(".form-step");
  const titleSteps = document.querySelectorAll(".step-title");
  const listSteps = document.querySelectorAll(".step-list");
  let currentStep = 0;
  const nextStepButton = document.querySelector(".step-button-v2.next");
  const prevStepButton = document.querySelector(".step-button-v2.prev");

  if (nextStepButton) {
    addActive(steps);
    addActive(titleSteps);
    listSteps.forEach((step) => step.classList.remove("active"));
    const checkStepValidity = () => {
      const step = steps[currentStep];
      const inputs = step.querySelectorAll("input[required]");
      let stepIsValid = true;
      let hasScrolled = false;
      inputs.forEach((input) => {
        const isValid = checkInputValidity(input);
        if (!isValid) {
          stepIsValid = false;
          if (!hasScrolled) {
            hasScrolled = true;
            window.scrollTo({
              top: input.getBoundingClientRect().top + window.pageYOffset - 100,
              behavior: "smooth",
            });
          }
        }
      });
      return stepIsValid;
    };

    const handleNextStep = () => {
      const isValid = checkStepValidity();
      if (isValid) {
        steps[currentStep].classList.remove("active");
        titleSteps[currentStep].classList.remove("active");
        listSteps[currentStep - 4]?.classList.remove("active");
        currentStep++;
        steps[currentStep].classList.add("active");
        titleSteps[currentStep].classList.add("active");
        listSteps[currentStep - 4]?.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
        prevStepButton.style.display = "flex";
      }
      if (currentStep === steps.length - 1) {
        document.querySelector(".step-buttons-wrapper").style.display = "none";
      }
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (e.target.tagName === "TEXTAREA" && !e.shiftKey) {
          return;
        }
        e.preventDefault();
        handleNextStep();
      }
    });

    nextStepButton.addEventListener("click", () => {
      handleNextStep();
    });
    prevStepButton.addEventListener("click", () => {
      if (currentStep > 0) {
        steps[currentStep].classList.remove("active");
        titleSteps[currentStep].classList.remove("active");
        listSteps[currentStep - 4]?.classList.remove("active");
        currentStep--;
        steps[currentStep].classList.add("active");
        titleSteps[currentStep].classList.add("active");
        listSteps[currentStep - 4]?.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.querySelector(".step-buttons-wrapper").style.display = "flex";
      }
      if (currentStep === 0) prevStepButton.style.display = "none";
    });
  }
};
handleCreativeForm();
