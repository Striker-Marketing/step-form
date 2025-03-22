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

  const handleInputValidity = (wrapper) => {
    if (wrapper.classList.contains("radio-wrapper")) {
      const inputs = wrapper.querySelectorAll("input");
      const other = wrapper.nextElementSibling;
      const otherInput = other.querySelector("input");
      inputs.forEach((input) => {
        input.addEventListener("change", () => {
          if (input.value === "Other") {
            other.style.maxHeight = "20rem";
            other.style.marginTop = window.innerWidth < 768 ? "30px" : "45px";
            otherInput.setAttribute("required","required")
            setTimeout(() => {
              other.style.overflow = "unset";
            }, 0.2);
          } else {
            other.style.maxHeight = "0";
            other.style.marginTop = "0";
            other.style.overflow = "hidden";
            otherInput.removeAttribute("required")
          }
        });
      });
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
      if (input.required && !input.checkValidity()) {
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
