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

  const handleUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    ["full_name", "email"].forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        document.querySelector(`input[name="${param}"]`).value = value;
      }
    });
    const phoneUrlParam = urlParams.get("phone_number");
    if(phoneUrlParam){
      itiObj.phone_number.setNumber(phoneUrlParam);
    }
  };
  handleUrlParams();

  const checkInputValidity = (input) => {
    const errorMessage = input.type === "tel" || input.type === "file" || input.type === "checkbox" ? input.parentElement.parentElement.querySelector(".error-message") : input.parentElement.querySelector(".error-message");
    const emptyMessage = input.type === "tel" || input.type === "file" || input.type === "checkbox" ? input.parentElement.parentElement.querySelector(".empty-message") : input.parentElement.querySelector(".empty-message");
    if ((input.required && input.value.trim() === "") || (input.type === "checkbox" && !input.checked)) {
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
  const titleSteps = document.querySelectorAll(".survey-title");
  const surveySteps = document.querySelectorAll(".survey-step");
  let currentStep = 0;
  const nextStepButton = document.querySelector(".step-button-v2.next");
  const prevStepButton = document.querySelector(".step-button-v2.prev");

  const progressBar = document.querySelector(".progress-progress");
  progressBar.style.width = `${(100 * (currentStep + 1)) / steps.length}%`;
  addActive(steps);
  addActive(titleSteps);
  addActive(surveySteps);
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
    const ownHome = document.querySelector("[name='own_home']:checked")?.value;
    if (ownHome && ownHome === "no") {
      alert("Sorry. In order to fill this form you need to own your home.");
      return;
    }
    if (isValid) {
      steps[currentStep].classList.remove("active");
      titleSteps[currentStep].classList.remove("active");
      currentStep++;
      steps[currentStep].classList.add("active");
      titleSteps[currentStep].classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevStepButton.style.display = "flex";
      progressBar.style.width = `${(100 * (currentStep + 1)) / steps.length}%`;
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
      progressBar.style.width = `${(100 * (currentStep + 1)) / steps.length}%`;
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

  document.querySelector("[name='country']").innerHTML =
    '<option value="">Your Country</option><option value="AF">Afghanistan</option><option value="AX">Åland Islands</option><option value="AL">Albania</option><option value="DZ">Algeria</option><option value="AS">American Samoa</option><option value="AD">Andorra</option><option value="AO">Angola</option><option value="AI">Anguilla</option><option value="AQ">Antarctica</option><option value="AG">Antigua and Barbuda</option><option value="AR">Argentina</option><option value="AM">Armenia</option><option value="AW">Aruba</option><option value="AU">Australia</option><option value="AT">Austria</option><option value="AZ">Azerbaijan</option><option value="BS">Bahamas</option><option value="BH">Bahrain</option><option value="BD">Bangladesh</option><option value="BB">Barbados</option><option value="BY">Belarus</option><option value="BE">Belgium</option><option value="BZ">Belize</option><option value="BJ">Benin</option><option value="BM">Bermuda</option><option value="BT">Bhutan</option><option value="BO">Bolivia</option><option value="BA">Bosnia and Herzegovina</option><option value="BW">Botswana</option><option value="BV">Bouvet Island</option><option value="BR">Brazil</option><option value="IO">British Indian Ocean Territory</option><option value="VG">British Virgin Islands</option><option value="BN">Brunei</option><option value="BG">Bulgaria</option><option value="BF">Burkina Faso</option><option value="BI">Burundi</option><option value="KH">Cambodia</option><option value="CM">Cameroon</option><option value="CA">Canada</option><option value="CV">Cape Verde</option><option value="BQ">Caribbean Netherlands</option><option value="KY">Cayman Islands</option><option value="CF">Central African Republic</option><option value="TD">Chad</option><option value="CL">Chile</option><option value="CN">China</option><option value="CX">Christmas Island</option><option value="CC">Cocos (Keeling) Islands</option><option value="CO">Colombia</option><option value="KM">Comoros</option><option value="CK">Cook Islands</option><option value="CR">Costa Rica</option><option value="HR">Croatia</option><option value="CU">Cuba</option><option value="CW">Curaçao</option><option value="CY">Cyprus</option><option value="CZ">Czechia</option><option value="DK">Denmark</option><option value="DJ">Djibouti</option><option value="DM">Dominica</option><option value="DO">Dominican Republic</option><option value="CD">DR Congo</option><option value="EC">Ecuador</option><option value="EG">Egypt</option><option value="SV">El Salvador</option><option value="GQ">Equatorial Guinea</option><option value="ER">Eritrea</option><option value="EE">Estonia</option><option value="SZ">Eswatini</option><option value="ET">Ethiopia</option><option value="FK">Falkland Islands</option><option value="FO">Faroe Islands</option><option value="FJ">Fiji</option><option value="FI">Finland</option><option value="FR">France</option><option value="GF">French Guiana</option><option value="PF">French Polynesia</option><option value="TF">French Southern and Antarctic Lands</option><option value="GA">Gabon</option><option value="GM">Gambia</option><option value="GE">Georgia</option><option value="DE">Germany</option><option value="GH">Ghana</option><option value="GI">Gibraltar</option><option value="GR">Greece</option><option value="GL">Greenland</option><option value="GD">Grenada</option><option value="GP">Guadeloupe</option><option value="GU">Guam</option><option value="GT">Guatemala</option><option value="GG">Guernsey</option><option value="GN">Guinea</option><option value="GW">Guinea-Bissau</option><option value="GY">Guyana</option><option value="HT">Haiti</option><option value="HM">Heard Island and McDonald Islands</option><option value="HN">Honduras</option><option value="HK">Hong Kong</option><option value="HU">Hungary</option><option value="IS">Iceland</option><option value="IN">India</option><option value="ID">Indonesia</option><option value="IR">Iran</option><option value="IQ">Iraq</option><option value="IE">Ireland</option><option value="IM">Isle of Man</option><option value="IL">Israel</option><option value="IT">Italy</option><option value="CI">Ivory Coast</option><option value="JM">Jamaica</option><option value="JP">Japan</option><option value="JE">Jersey</option><option value="JO">Jordan</option><option value="KZ">Kazakhstan</option><option value="KE">Kenya</option><option value="KI">Kiribati</option><option value="XK">Kosovo</option><option value="KW">Kuwait</option><option value="KG">Kyrgyzstan</option><option value="LA">Laos</option><option value="LV">Latvia</option><option value="LB">Lebanon</option><option value="LS">Lesotho</option><option value="LR">Liberia</option><option value="LY">Libya</option><option value="LI">Liechtenstein</option><option value="LT">Lithuania</option><option value="LU">Luxembourg</option><option value="MO">Macau</option><option value="MG">Madagascar</option><option value="MW">Malawi</option><option value="MY">Malaysia</option><option value="MV">Maldives</option><option value="ML">Mali</option><option value="MT">Malta</option><option value="MH">Marshall Islands</option><option value="MQ">Martinique</option><option value="MR">Mauritania</option><option value="MU">Mauritius</option><option value="YT">Mayotte</option><option value="MX">Mexico</option><option value="FM">Micronesia</option><option value="MD">Moldova</option><option value="MC">Monaco</option><option value="MN">Mongolia</option><option value="ME">Montenegro</option><option value="MS">Montserrat</option><option value="MA">Morocco</option><option value="MZ">Mozambique</option><option value="MM">Myanmar</option><option value="NA">Namibia</option><option value="NR">Nauru</option><option value="NP">Nepal</option><option value="NL">Netherlands</option><option value="NC">New Caledonia</option><option value="NZ">New Zealand</option><option value="NI">Nicaragua</option><option value="NE">Niger</option><option value="NG">Nigeria</option><option value="NU">Niue</option><option value="NF">Norfolk Island</option><option value="KP">North Korea</option><option value="MK">North Macedonia</option><option value="MP">Northern Mariana Islands</option><option value="NO">Norway</option><option value="OM">Oman</option><option value="PK">Pakistan</option><option value="PW">Palau</option><option value="PS">Palestine</option><option value="PA">Panama</option><option value="PG">Papua New Guinea</option><option value="PY">Paraguay</option><option value="PE">Peru</option><option value="PH">Philippines</option><option value="PN">Pitcairn Islands</option><option value="PL">Poland</option><option value="PT">Portugal</option><option value="PR">Puerto Rico</option><option value="QA">Qatar</option><option value="CG">Republic of the Congo</option><option value="RE">Réunion</option><option value="RO">Romania</option><option value="RU">Russia</option><option value="RW">Rwanda</option><option value="BL">Saint Barthélemy</option><option value="SH">Saint Helena, Ascension and Tristan da Cunha</option><option value="KN">Saint Kitts and Nevis</option><option value="LC">Saint Lucia</option><option value="MF">Saint Martin</option><option value="PM">Saint Pierre and Miquelon</option><option value="VC">Saint Vincent and the Grenadines</option><option value="WS">Samoa</option><option value="SM">San Marino</option><option value="ST">São Tomé and Príncipe</option><option value="SA">Saudi Arabia</option><option value="SN">Senegal</option><option value="RS">Serbia</option><option value="SC">Seychelles</option><option value="SL">Sierra Leone</option><option value="SG">Singapore</option><option value="SX">Sint Maarten</option><option value="SK">Slovakia</option><option value="SI">Slovenia</option><option value="SB">Solomon Islands</option><option value="SO">Somalia</option><option value="ZA">South Africa</option><option value="GS">South Georgia</option><option value="KR">South Korea</option><option value="SS">South Sudan</option><option value="ES">Spain</option><option value="LK">Sri Lanka</option><option value="SD">Sudan</option><option value="SR">Suriname</option><option value="SJ">Svalbard and Jan Mayen</option><option value="SE">Sweden</option><option value="CH">Switzerland</option><option value="SY">Syria</option><option value="TW">Taiwan</option><option value="TJ">Tajikistan</option><option value="TZ">Tanzania</option><option value="TH">Thailand</option><option value="TL">Timor-Leste</option><option value="TG">Togo</option><option value="TK">Tokelau</option><option value="TO">Tonga</option><option value="TT">Trinidad and Tobago</option><option value="TN">Tunisia</option><option value="TR">Turkey</option><option value="TM">Turkmenistan</option><option value="TC">Turks and Caicos Islands</option><option value="TV">Tuvalu</option><option value="UG">Uganda</option><option value="UA">Ukraine</option><option value="AE">United Arab Emirates</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="UM">United States Minor Outlying Islands</option><option value="VI">United States Virgin Islands</option><option value="UY">Uruguay</option><option value="UZ">Uzbekistan</option><option value="VU">Vanuatu</option><option value="VA">Vatican City</option><option value="VE">Venezuela</option><option value="VN">Vietnam</option><option value="WF">Wallis and Futuna</option><option value="EH">Western Sahara</option><option value="YE">Yemen</option><option value="ZM">Zambia</option><option value="ZW">Zimbabwe</option>';
  document.querySelector("[name='state']").innerHTML =
    '<option value="">Your State</option><option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AS">American Samoa</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="UM-81">Baker Island</option><option value="CA">California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="DC">District of Columbia</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="GU">Guam</option><option value="HI">Hawaii</option><option value="UM-84">Howland Island</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="UM-86">Jarvis Island</option><option value="UM-67">Johnston Atoll</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="UM-89">Kingman Reef</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="UM-71">Midway Atoll</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="UM-76">Navassa Island</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="MP">Northern Mariana Islands</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="UM-95">Palmyra Atoll</option><option value="PA">Pennsylvania</option><option value="PR">Puerto Rico</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UM">United States Minor Outlying Islands</option><option value="VI">United States Virgin Islands</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VA">Virginia</option><option value="UM-79">Wake Island</option><option value="WA">Washington</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option>';

  const handleMaps = () => {
    const address = document.querySelector("[name='address']");
    const city = document.querySelector("[name='city']");
    const state = document.querySelector("[name='state']");
    const postalCode = document.querySelector("[name='postal_code']");
    const country = document.querySelector("[name='country']");
    autocomplete = new google.maps.places.Autocomplete(address, {
      componentRestrictions: { country: ["us"] },
      fields: ["address_components", "geometry"],
      types: ["address"],
    });
    const fillInAddress = () => {
      const place = autocomplete.getPlace();
      let addressValue = "";
      let postalCodeValue = "";
      for (const component of place.address_components) {
        const componentType = component.types[0];
        switch (componentType) {
          case "street_number":
            addressValue = `${component.long_name} ${addressValue}`;
            break;
          case "route":
            addressValue += component.short_name;
            break;
          case "postal_code":
            postalCodeValue = `${component.long_name}${postalCodeValue}`;
            break;
          case "postal_code_suffix":
            postalCodeValue = `${postalCodeValue}-${component.long_name}`;
            break;
          case "locality":
            city.value = component.long_name;
            break;
          case "administrative_area_level_1":
            state.value = component.short_name;
            break;
          case "country":
            country.value = component.short_name;
            break;
        }
      }
      address.value = addressValue;
      postalCode.value = postalCodeValue;
    };
    autocomplete.addListener("place_changed", fillInAddress);
  };

  window.initAutocomplete = handleMaps;

  const handleGHL = async () => {
    const body = {};
    const formData = new FormData();

    body.formId = formId;
    body.location_id = locationId;

    body.full_name = document.querySelector("[name='full_name']").value;
    body.email = document.querySelector("[name='email']").value;
    body.phone = itiObj.phone_number.getNumber();
    body.terms_and_conditions = "I Consent to Receive SMS Notifications, Alerts & Occasional Marketing Communication from company. Message frequency varies. Message & data rates may apply. Text HELP to (XXX) XXX-XXXX for assistance. You can reply STOP to unsubscribe at any time";
    body["6LKd0CCay1lh2Mpcxy0C"] = document.querySelector("[name='own_home']:checked").value;
    body.address = document.querySelector("[name='address']").value;
    body.city = document.querySelector("[name='city']").value;
    body.state = document.querySelector("[name='state']").value;
    body.postal_code = document.querySelector("[name='postal_code']").value;
    body.country = document.querySelector("[name='country']").value;
    const howMuchBill = document.querySelector("[name='how_much_bill']");
    if (howMuchBill) body["1gr35I8U3RlLu8Flb8m5"] = howMuchBill.value;
    else {
      body["w9OtcvFQSnB8fBGjhfAO"] = document.querySelector("[name='bill_usd']").value;
      body["ybjGnskWGCvYMblMtxp3"] = document.querySelector("[name='bill_kwh']").value;
      body["6LKd0CCay1lh2Mpcxy0C"] = document.querySelector("[name='roof_type']:checked").value;
    }

    body.eventData = {};
    body.eventData.url_params = Object.fromEntries(urlParams.entries());
    body.eventData.campaign = urlParams.get("utm_campaign");
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
      if (formDone.style.display === "block") submitFunction();
      else initObserver();
    } catch (e) {
      handleError();
      console.error(e);
    }
  });
};
