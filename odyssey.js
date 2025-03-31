const handleSurvey = ({ formId, locationId, captchaToken, submitFunction }) => {
  const fieldWrappers = document.querySelectorAll(".input-wrapper");
  window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = "";
  });
  document.querySelector("form").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      if (event.target.tagName === "TEXTAREA" && !event.shiftKey) {
        return;
      }
      event.preventDefault();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);

  const captchaScript = document.createElement("script");
  captchaScript.src = `https://www.google.com/recaptcha/enterprise.js?render=${captchaToken}`;
  captchaScript.async = true;
  captchaScript.type = "text/javascript";

  document.head.append(captchaScript);

  const turnInvalid = (input) => {
    input.style.backgroundColor = "#fff2f4";
    input.style.outlineColor = "#e30000";
    input.setAttribute("error", "error");
  };
  const showMessage = (message) => {
    if (!message) return;
    message.style.maxHeight = "15px";
    message.style.marginTop = "8px";
  };

  phoneFields = document.querySelectorAll("[type='tel']");
  const cookieConfig = `path=/; domain=${((d) => (d.match(/\.([a-z]{2,})\.([a-z]{2,})$/) ? `.${RegExp.$1}.${RegExp.$2}` : d))(window.location.hostname)}; max-age=3600`;
  const itiObj = {};
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

  const checkInputValidity = (input) => {
    const errorMessage = input.type === "tel" || input.type === "file" ? input.parentElement.parentElement.querySelector(".error-message") : input.parentElement.querySelector(".error-message");
    const emptyMessage = input.type === "tel" || input.type === "file" ? input.parentElement.parentElement.querySelector(".empty-message") : input.parentElement.querySelector(".empty-message");
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
    if (input.type === "file") {
      const allowedTypes = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"];
      if (!allowedTypes.includes(input.files[0].type)) {
        showMessage(errorMessage);
        return false;
      }
    }
    if (emptyMessage) emptyMessage.style = "";
    if (errorMessage) errorMessage.style = "";
    return true;
  };

  const handleInputValidity = (wrapper) => {
    const input = wrapper.querySelector(".input");
    if (!input) return;
    input.addEventListener("blur", () => {
      checkInputValidity(input);
    });
    input.addEventListener("focus", () => {
      input.style = "";
      input.removeAttribute("error");
    });
    if (input.type === "file") {
      input.addEventListener("change", () => {
        const fileName = document.querySelector("[file-name]");
        const fileImageWrapper = document.querySelector(".file-image-wrapper");
        const fileOk = document.querySelector(".file-ok");
        const maxAllowed = document.querySelector("[max-allowed]");
        if (checkInputValidity(input)) {
          input.style = "";
          input.removeAttribute("error");
          fileName.innerHTML = input.files[0].name;
          fileImageWrapper.style.display = "none";
          fileOk.style.display = "block";
          maxAllowed.style.display = "none";
        } else {
          fileName.innerHTML = "Click here to browse";
          fileImageWrapper.style = "";
          fileOk.style = "";
          maxAllowed.style = "";
        }
      });
    }
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
  const titleSteps = document.querySelectorAll(".step-descripion");
  let currentStep = 0;
  const nextStepButton = document.querySelector(".step-button.next");
  const prevStepButton = document.querySelector(".step-button.prev");

  addActive(steps);
  addActive(titleSteps);
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
      currentStep++;
      steps[currentStep].classList.add("active");
      titleSteps[currentStep].classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevStepButton.style.display = "flex";
    }
    if (currentStep === steps.length - 1) {
      nextStepButton.style.display = "none";
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
    nextStepButton.style = "";
    if (currentStep > 0) {
      steps[currentStep].classList.remove("active");
      titleSteps[currentStep].classList.remove("active");
      currentStep--;
      steps[currentStep].classList.add("active");
      titleSteps[currentStep].classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector(".step-buttons-wrapper").style.display = "flex";
    }
    if (currentStep === 0) prevStepButton.style.display = "none";
  });

  const formDone = document.querySelector(".w-form-done");

  const initObserver = () => {
    const targetElement = formDone;
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === "style") {
          const displayChanged = mutation.target.style.display !== mutation.oldValue;
          if (displayChanged) {
            submitFunction();
          }
        }
      }
    });
    observer.observe(targetElement, {
      attributes: true,
      attributeOldValue: true,
    });
  };

  const handleGHL = async () => {
    const body = {};
    const formData = new FormData();

    body.formId = formId;
    body.location_id = locationId;
    body.full_name = urlParams.get("full_name");
    body.email = urlParams.get("email");
    body.phone = decodeURI(urlParams.get("phone"));
    body.lqDWBsy2Hv79pSJuj8a8 = {
      "8a0e7343-f381-44c9-8df2-16f159d2aaa8": document.querySelector("[name='ref_1_name']").value,
      "82f4af17-4ad8-4abb-8d39-d60cea74d513": document.querySelector("[name='ref_1_email']").value,
      "e76a3cad-aecb-4be1-b287-8599b00a26ea": itiObj["ref_1_phone"].getNumber(),
      "b9396bf1-eeb6-4933-af7a-4f9a161fc881": document.querySelector("[name='ref_1_role']").value,
    };
    body.BkXm5I3CFYTq8HAsRT1u = {
      "68c77042-557c-4dba-8c2d-fd90db51f0fa": document.querySelector("[name='ref_2_name']").value,
      "2c5a3c8d-2b0b-4492-b599-28c36940e247": document.querySelector("[name='ref_2_email']").value,
      "df6e89fe-f844-4dd5-865c-1d98c85a1b70": itiObj["ref_2_phone"].getNumber(),
      "752f5849-36e6-4504-add8-f94489074daa": document.querySelector("[name='ref_2_role']").value,
    };
    body.PlADkuWsfrRQ5jxveWpg = document.querySelector("[name='recording']").value;
    body.eventData = {};
    body.eventData.url_params = Object.fromEntries(urlParams.entries());
    body.eventData.campaign = urlParams.get("utm_campaign");
    formData.append("auorD8X9lCv1b5pSUTyS", document.querySelector("[name='resume']").files[0]);
    formData.append("formData", JSON.stringify(body));
    formData.append("locationId", locationId);
    formData.append("formId", formId);

    try {
      const token = await grecaptcha.enterprise.execute(captchaToken, { action: "submit" });
      formData.append("captchaV3", token);
    } catch {
      return Promise.reject("recaptcha is not ok");
    }

    const response = await fetch("https://backend.leadconnectorhq.com/surveys/submit", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return Promise.reject("GHL response was not ok");
    }
  };

  const handleError = () => {
    const p = document.querySelector(".w-form-done div");
    if (p) p.innerHTML = "Oops! Something went wrong while submitting the form.";
  };

  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await handleGHL();
      if (formDone.style.display === "block") submitFunction();
      else initObserver();
    } catch (e) {
      handleError();
      console.error(e);
    }
  });
};
