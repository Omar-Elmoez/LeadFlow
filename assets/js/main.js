// ================ Open and Close Mobile Menu ================
document.querySelector(".mobile-menu__close").addEventListener("click", () => {
  document.querySelector(".mobile-menu").classList.toggle("toggle");
  document.querySelector(".overlay").classList.toggle("show");
});

document.querySelectorAll(".header__menu-toggle").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector(".mobile-menu").classList.toggle("toggle");
    document.querySelector(".overlay").classList.toggle("show");
  });
});

// ================ Open and Close Mobile Submenu ================
document.querySelector(".mobile__expand-icon").addEventListener("click", () => {
  document.querySelector(".mobile__submenu").classList.toggle("open");
});

// ================ Get The Current Year ================
const currentYear = new Date().getFullYear();
document.getElementById("current-year").innerHTML = currentYear;

// ================ Activate Progress bar ================
const steps = document.querySelectorAll(".steps-names > span");
const progressBar = document.querySelector(".progress-bar");
const nextBtn = document.getElementById("next-btn");

const oneSpan = steps[0];
let spanStyle = window.getComputedStyle(oneSpan);
const widthStep = parseInt(spanStyle.width);

progressBar.style.width = `${widthStep / 2}px`;

// ================= Hide Input Label =================
const inputFields = document.querySelectorAll(".step__input");

inputFields.forEach((item) => {
  item.addEventListener("input", () => {
    if (item.value.trim() !== "") {
      item.parentElement.classList.remove("error");
      item.parentElement.querySelector(".step__label--one").style.visibility =
        "hidden";
    } else {
      item.parentElement.querySelector(".step__label--one").style.visibility =
        "visible";
    }
  });
});

// ================= Open & Close Step Menu =================
const selectContainers = document.querySelectorAll(
  ".step__input-container--select"
);
const options = document.querySelectorAll(".step__menu-option");

for (let i = 0; i < selectContainers.length; i++) {
  const selectContainer = selectContainers[i];
  selectContainer.addEventListener("click", () => {
    selectContainer.querySelector(".step__menu").classList.toggle("show");
    selectContainer.querySelector(".step__icon").classList.toggle("rotate");
  });
}

for (let i = 0; i < options.length; i++) {
  const option = options[i];
  const optionsList = option.parentElement;

  option.addEventListener("click", (e) => {
    e.stopPropagation();
    if (optionsList.classList.contains("show")) {
      option.parentElement.classList.remove("show");
      optionsList.parentElement
        .querySelector(".step__icon")
        .classList.remove("rotate");

      optionsList.parentElement.querySelector(".step__hidden-input").value =
        option.dataset.value;
      optionsList.parentElement.querySelector(".step__label--one").innerHTML =
        option.textContent;
      optionsList.parentElement.querySelector(".step__label--one").style.color =
        "var(--primary-color)";
      optionsList.parentElement.classList.remove("error");
    }
  });
}

const paymentFields = document.querySelectorAll(".payment__input-field");

paymentFields.forEach((item) => {
  item.addEventListener("input", () => {
    if (!isEmpty(item.value)) {
      item.parentElement.classList.remove("error");
    }
  });
});
// ================= Validate Form =================
const forms = document.querySelectorAll(".contact_form");

forms.forEach((form) => {
  const submit_btn = form.querySelector(".submit-btn");
  const stepNum = submit_btn.dataset.step;

  if (["3", "4", "5", "6"].includes(stepNum)) {
    const endPoint = submit_btn.dataset.api;
    getDataFromApi(endPoint).then((data) => {
      let stepOptions;

      if (stepNum === "3") {
        stepOptions = form.querySelector(".step__options");
      } else if (stepNum === "6") {
        stepOptions = form.querySelector(".step__options--radio");
      }
       else {
        stepOptions = form.querySelector(".step__options--checkbox");
      }

      data.forEach((item) => {
        const label = document.createElement("label");
        label.setAttribute("for", `${item.for_data}${item.id}`);

        if (stepNum !== "6") {
          label.classList.add(
            "step__label-box",
            "step__label",
            "step__label--checkbox"
          );
          label.innerHTML = `
            <img src="./assets/images/correct-icon.svg" alt="correct icon" class="correct-icon">
            ${
              stepNum === "3"
                ? `<img src="./assets/images/ch-subject.webp" alt="${item.course}" class="subject-img">`
                : ""
            }
            ${item.arabic_data}
            <input type="checkbox" id="${item.for_data}${item.id}" name="${
            item.for_data
          }" value="${item.id}" class="step__checkbox">
          `;
          activateCheckboxOptions();
        } else {
          label.classList.add(
            "step__label-box",
            "step__label",
            "step__label--radio", 
            "subscription_label"
          );

          label.dataset.value = item.id;

          label.innerHTML = `
              <img
                src="./assets/images/correct-icon.svg"
                alt="correct icon"
                class="correct-icon"
              />
              <span class="subscription_discount">خصم ${item.discount}%</span>
              <span>${item.term_arabic}</span>
              <span class="subscription_duration">${item.period_arabic}</span>
              <span class="subscription_price">${item.price} درهم</span>
              <input
                type="radio"
                id="${item.for_data}${item.id}"
                name="subscription"
                value="${item.id}"
                class="step__radio"
              />
          `;
          activateRadioOptions();
        }

        stepOptions.appendChild(label);
      });
    });
  }

  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (validateStep(stepNum)) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      if (stepNum !== "1") {
        data["form"] = document.getElementById("form-id").value;
      }

      if (["3", "4", "5"].includes(stepNum)) {
        updateFormData(stepNum, data);
      }

      console.log(data);

      const endPoint = submit_btn.dataset.url;
      const response = await sendDataToApi(data, endPoint);

      if (response.id && stepNum === "1") {
        document.getElementById("form-id").value = response.id;
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      updateProgressBar();

      goToNextStep(stepNum);
    }
  });
});

// ================= Utility Functions =================
function activateRadioOptions() {
  const radioOptions = document.querySelectorAll(".step__label--radio");
  radioOptions.forEach((item) => {
    item.addEventListener("click", () => {
      item.parentElement.parentElement.querySelector(".error-msg").style.display =
        "none";
      item.parentElement.querySelector(".hidden-input").value =
        item.dataset.value;
    });
  });
}

function activateCheckboxOptions() {
  const checkboxOptions = document.querySelectorAll(".step__label--checkbox");
  checkboxOptions.forEach((item) => {
    item.addEventListener("click", () => {
      item.parentElement.parentElement.querySelector(".error-msg").style.display =
        "none";
    });
  });
}
async function sendDataToApi(data, endPoint) {
  try {
    const response = await fetch(endPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error(
      "There was a problem with the fetch operation: ",
      error.message
    );
    throw error;
  }
}

async function getDataFromApi(endPoint) {
  try {
    const response = await fetch(endPoint);

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    throw error;
  }
}

function getStepFields(num) {
  const step = document.getElementById(`step${num}`);

  let fields = step.querySelectorAll(
    ".step__input, .step__hidden-input, .step__radio, .step__checkbox, .payment__input-field"
  );
  return fields;
}

function updateProgressBar() {
  progressBar.style.width = `${
    parseInt(progressBar.style.width) + widthStep + 3
  }px`;
}

function showErrorMsg(name) {
  const errorMsg = document.getElementById(`${name}__error-msg`);
  errorMsg.textContent = errorMsg.dataset.msg;
  errorMsg.style.display = "block";
}

function updateFormData(stepNumber, data) {
  const fields = getStepFields(stepNumber);
  let collectedData = [];
  let currentName;
  Array.from(fields).filter((item) => item.type === "checkbox").forEach((item) => {
      currentName = item.name;
      if (item.checked === true) {
        collectedData.push(item.value);
      }
  });
  console.log(`collectedData for step ${stepNumber}`, collectedData);
    if (collectedData.length === 0) {
      showErrorMsg(currentName);
      isValid = false;
    } else {
      data[currentName] = collectedData;
    }
}

function isEmpty(value) {
  return value.trim() === "";
}

function addErrorClass(id) {
  const containerWithError = document.querySelector(
    `.step__input-container input#${id}`
  ).parentElement;
  containerWithError.classList.add("error");
}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function goToNextStep(currentStep) {
  const currentStepElement = document.getElementById(`step${currentStep}`);
  const nextStepElement = document.getElementById(`step${+currentStep + 1}`);

  currentStepElement.style.display = "none";
  nextStepElement.style.display = "flex";
}

// ================= Validate Step =================
function validateStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  const fields = getStepFields(stepNumber);

  let isValid = true;

  for (let item of fields) {
    switch (item.name) {
      case "first_name":
      case "family_name":
      case "age":
      case "gender":
      case "nationality":
      case "whatsapp":
      case "email":
      case "difficulties":
        if (isEmpty(item.value)) {
          addErrorClass(item.name);
          isValid = false;
        }
        break;

      case "email":
        if (!validateEmail(item.value)) {
          addErrorClass(item.name);
          isValid = false;
        }
        break;

      case "stage":
      case "classroom":
      case "course_study":
      case "student_count":
      case "time":
      case "shift":
      case "session":
      case "hour":
      case "subscription":
        const hiddenInput = step.querySelector(`#${item.name}__hidden-input`);
        if (isEmpty(hiddenInput.value)) {
          showErrorMsg(item.name);
          isValid = false;
        }
        break;

      case "purposes":
      case "day":
      case "materials":
        const checkedFields = Array.from(fields).filter((item) => item.checked);
        if (checkedFields.length === 0) {
          showErrorMsg(item.name);
          isValid = false;
        }
    }
  }

  return isValid;
}

activateCheckboxOptions();
activateRadioOptions();
