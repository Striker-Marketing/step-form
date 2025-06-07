const handleOdysseyForm = ({ formId, locationId, captchaToken, submitFunction }) => {
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

  document.querySelector("[name='state_want']").innerHTML =
    '<option value="">State</option><option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AS">American Samoa</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="UM-81">Baker Island</option><option value="CA">California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="DC">District of Columbia</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="GU">Guam</option><option value="HI">Hawaii</option><option value="UM-84">Howland Island</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="UM-86">Jarvis Island</option><option value="UM-67">Johnston Atoll</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="UM-89">Kingman Reef</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="UM-71">Midway Atoll</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="UM-76">Navassa Island</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="MP">Northern Mariana Islands</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="UM-95">Palmyra Atoll</option><option value="PA">Pennsylvania</option><option value="PR">Puerto Rico</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UM">United States Minor Outlying Islands</option><option value="VI">United States Virgin Islands</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VA">Virginia</option><option value="UM-79">Wake Island</option><option value="WA">Washington</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option>';

  const urlParams = new URLSearchParams(window.location.search);

  const captchaScript = document.createElement("script");
  captchaScript.src = `https://www.google.com/recaptcha/enterprise.js?render=${captchaToken}`;
  captchaScript.async = true;
  captchaScript.type = "text/javascript";

  document.head.append(captchaScript);

  const handleTriggerWrapper = (wrapper) => {
    wrapper.style.maxHeight = "0";
    wrapper.style.marginTop = "-20px";
    wrapper.style.overflow = "hidden";
    const input = wrapper.querySelectorAll("input");
    input.forEach((input) => {
      input.removeAttribute("required");
    });
  };

  const triggers = document.querySelectorAll("[will-trigger]");
  triggers.forEach((trigger) => {
    const input = trigger.querySelector("input");
    const otherInputs = document.querySelectorAll(`[name='${input.name}']`);
    const triggeredWrappers = document.querySelectorAll(`[optional-triggered='${trigger.getAttribute("will-trigger")}']`);
    triggeredWrappers.forEach((wrapper) => handleTriggerWrapper(wrapper));
    input.addEventListener("change", () => {
      if (input.checked) {
        triggeredWrappers.forEach((wrapper) => {
          wrapper.style = "";
          const input = wrapper.querySelectorAll("input");
          input.forEach((input) => {
            input.setAttribute("required", "required");
          });
        });
      }
    });
    otherInputs.forEach((otherInput) => {
      if (otherInput.parentElement.getAttribute("will-trigger") === trigger.getAttribute("will-trigger")) return;
      otherInput.addEventListener("change", () => {
        if (otherInput.checked) triggeredWrappers.forEach((wrapper) => handleTriggerWrapper(wrapper));
      });
    });
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
    body.first_name = urlParams.get("first_name");
    body.last_name = urlParams.get("last_name");
    body.phone = decodeURI(urlParams.get("phone"));
    body.email = urlParams.get("email");

    body["T9jBS0PYbpM8pt6nbppG"] = document.querySelector("[name='best_describes']:checked")?.value || "";
    body["50veDLxzJJRuVQP5M62R"] = document.querySelector("[name='university']").value;
    body["D1vWf1jQo7QkDEMA04r1"] = document.querySelector("[name='major']").value;
    body["x4OarEuriLKiKhjDCkxM"] = document.querySelector("[name='sales_experience']:checked")?.value || "";
    body["9KQFvZvHlSCzScInHnT6"] = document.querySelector("[name='employers']").value;
    body["PtRX0GdJdp7183OxSZAn"] = document.querySelector("[name='has_leadership_experience']:checked")?.value || "";
    body["SDp5Cr5UNqcCZ02h8SN4"] = document.querySelector("[name='how_many_reps_managed']").value;
    body["fh6102xg6ZMxTjqOP7on"] = document.querySelector("[name='state_want']").value;
    body["0tQ3StRO5sVLBya9bnHk"] = document.querySelector("[name='city_want']").value;
    body["n5FMJkYt1dDKiXlX0bum"] = document.querySelector("[name='open_travel']:checked")?.value || "";
    body["qH5NNaTK5SkbGfq4vfeg"] = document.querySelector("[name='current_goals']").value;
    body["S1BunkdcDXtTjoAnLWgz"] = document.querySelector("[name='accomplishment']").value;

    body.eventData = {};
    body.eventData.url_params = Object.fromEntries(urlParams.entries());
    body.eventData.campaign = urlParams.get("utm_campaign") || urlParams.get("gad_campaignid");
    body.eventData.page = {};
    body.eventData.page.url = window.location.href;
    body.eventData.page.title = document.title;
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
      const formDone = document.querySelector(".w-form-done");
      if (formDone.style.display === "block") submitFunction();
      else initObserver();
    } catch (e) {
      handleError();
      console.error(e);
    }
  });
};
