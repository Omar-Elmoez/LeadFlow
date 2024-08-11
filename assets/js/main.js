const baseUrl = "https://elmadrasah-326ff588fbb4.herokuapp.com/";

// Get params from URL
const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get("subject");
console.log(subject);


const referrer = document.referrer;
console.log('User came from: ' + referrer);
const url = window.location.href;
console.log(url);

// Get user IP
fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    userIP = data.ip;
  })
  .catch((error) => {
    console.error("Error fetching user IP: ", error);
  });

let form_type, track_id, track_data;

// =============== Initialise IntlTelInput  ================
const input = document.querySelector("#phone");
const output = document.querySelector("#output");

const iti = window.intlTelInput(input, {
  nationalMode: true,
  initialCountry: "auto",
  separateDialCode: true,
  geoIpLookup: (callback) => {
    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data) => {
        callback(data.country_code);
      })
      .catch(() => callback("ae"));
  },
  utilsScript:
    "https://cdn.jsdelivr.net/npm/intl-tel-input@23.3.2/build/js/utils.js",
});

// ================ Activate Progress bar ================
const steps = document.querySelectorAll(".progress-steps > span");
const progressBar = document.querySelector(".progress-bar");
const nextBtn = document.getElementById("next-btn");

const oneSpan = steps[0];
let spanStyle = window.getComputedStyle(oneSpan);
const widthStep = parseInt(spanStyle.width);

progressBar.style.width = `${widthStep / 2}px`;

// ================= Validate Form =================
const forms = document.querySelectorAll(".contact_form");

forms.forEach((form) => {
  const submit_btn = form.querySelector(".submit-btn");
  const stepNum = submit_btn.dataset.step;

  if (stepNum === "1") {
    // when use (data-) in HTML don't use one word like endPoint instead use end_point
    const endPoint = baseUrl + submit_btn.dataset.end_point;

    const identificationInputs = Array.from(
      document.querySelectorAll(".step__label--identification input")
    );

    const trackArticle = document.querySelector(".form__step--article.track");

    // const optionsDiv = form.querySelector(".step__options.track");

    const trackOptions = trackArticle.querySelector(".step__options");

    identificationInputs.map((input) => {
      input.addEventListener("click", () => {
        if (input.checked && trackOptions.innerHTML === "") {
          trackOptions.innerHTML = '<p class="loading">يرجي الانتظار...</p>';
          getDataFromApi(endPoint).then((data) => {
            trackOptions.innerHTML = "";

            const title = document.createElement("h2");
            title.classList.add("article__title");
            title.innerHTML = `
              حدد التراك الخاص بك<span class="label__asterisk">*</span>
              <span
                data-msg="برجاء تحديد التراك"
                class="error-msg"
                id="track__error-msg"
              ></span>
            `;
            trackArticle.insertBefore(title, trackArticle.firstChild);

            const hiddenInput = createHiddenInput("track");
            trackOptions.appendChild(hiddenInput);
            data.forEach((item) => {
              const label = document.createElement("label");
              label.setAttribute("for", `track${item.id}`);
              label.setAttribute("data-value", item.id);

              label.classList.add("step__label", "step__label--radio");
              label.style.flexDirection = 'column'

              label.innerHTML = `
                  <img src="./assets/images/correct-icon.svg" alt="correct icon" class="correct-icon">
                  <img src="${item.image}" alt="">
                  ${item.name_ar}
                  <input type="radio" id="track${item.id}" name="track" value="${item.id}" class="step__radio">
                `;
              trackOptions.appendChild(label);
              activateRadioOptions();
            });
          });
        }
      });
    });
  }

  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (validateStep(stepNum)) {
      if (stepNum === "1") {
        form_type = data.form_type;
        track_id = data.track;

        const endPoint = baseUrl + submit_btn.dataset.end_point + track_id;

        await getDataFromApi(endPoint).then((data) => (track_data = data));
      }

      if (stepNum === "2") {
        data["user_ip"] = userIP;
        data["form_type"] = form_type;
        data["track"] = track_id;
        data["subject"] = subject;

        data["whatsapp"] = iti.getNumber();

        const endPoint = baseUrl + submit_btn.dataset.end_point;
        const response = await sendDataToApi(data, endPoint);

        if (response.id && stepNum === "2") {
          document.getElementById("form-id").value = response.id;
        }

        createNextStepQuestions(+stepNum);
      }

      if (+stepNum > 2 && +stepNum <= 6) {
        createNextStepQuestions(+stepNum);

        data["form"] = document.getElementById("form-id").value;
        const checkedInputsIds = collectFormData(form);
        const groupId = track_data.track_group[+stepNum - 3].id;

        const writeInput = form.querySelector(`[data-type="write"]`);

        const formattedData = {
          form: data.form,
          group: groupId,
          choice: checkedInputsIds,
          write: "",
        };

        if (writeInput) {
          formattedData.write = writeInput.value;
        }

        const endPoint = baseUrl + submit_btn.dataset.end_point;

        if (validateStep(stepNum)) {
          await sendDataToApi(formattedData, endPoint);
        }
      }

      if (stepNum === "6") {
        const sessions = track_data.track_detail;

        const subscriptionOptions = document.querySelector(
          ".step__options--subscription"
        );

        classesNumberOptions = document.querySelector(
          ".step__options--classesNumber"
        );

        sessions.forEach((session) => {
          const subscriptionLabel = document.createElement("label");
          subscriptionLabel.setAttribute(
            "for",
            `subscription${session.session}`
          );
          subscriptionLabel.classList.add(
            "step__label-box",
            "step__label",
            "step__label--radio",
            "session_label"
          );
          subscriptionLabel.style.flexDirection = 'column'
          subscriptionLabel.dataset.value = session.session;
          subscriptionLabel.innerHTML = `
            <img src="./assets/images/correct-icon.svg" alt="correct icon" class="correct-icon">
            <p class="session_title">
              <span class="session_number">${session.session}</span>
              حصة
            </p>
            <span class="session_description">${session.description}</span>
            <input type="radio" id="session${session.session}" name="session" value="${session.session}" class="step__radio">
          `;

          classesNumberOptions.appendChild(subscriptionLabel);

          const subscriptionInputs = document.querySelectorAll(
            ".session_label input"
          );

          const subscriptionArticle = document.querySelector(
            ".form__step--article.subscription"
          );

          const subscriptionTitle = subscriptionArticle.querySelector(".article__title");

          const subscriptionOptions = subscriptionArticle.querySelector('.step__options');

          if (subscriptionInputs) {
            subscriptionInputs.forEach((input) => {
              input.addEventListener("click", () => {

                if (subscriptionTitle.innerHTML === "") {
                  subscriptionTitle.innerHTML = `
                    مدة الاشتراك<span class="label__asterisk">*</span>
                    <span
                      data-msg="برجاء تحديد مدة الاشتراك"
                      class="error-msg"
                      id="subscription__error-msg"
                    ></span>
                  `;
                }
                
                const inputValue = input.value;
                if (+inputValue === session.session) {
                  subscriptionOptions.innerHTML = "";

                  const hiddenInput = createHiddenInput("subscription");
                  subscriptionOptions.appendChild(hiddenInput);

                  session.sub_session.forEach((subscription) => {
                    const label = document.createElement("label");
                    label.setAttribute(
                      "for",
                      `${subscription.for_data}${subscription.id}`
                    );
                    if (subscription.is_best) {
                      label.classList.add("best-value");
                    }
                    label.classList.add(
                      "step__label-box",
                      "step__label",
                      "step__label--radio",
                      "subscription_label"
                    );

                    label.dataset.value = subscription.id;

                    label.innerHTML = `
                                  <img
                                    src="./assets/images/correct-icon.svg"
                                    alt="correct icon"
                                    class="correct-icon"
                                  />
                                  <section class="subscription__top-box">
                                    <div>
                                      <span class="subscription_title">${
                                        subscription.term_arabic
                                      }</span>
                                      <span class="subscription_duration">( ${
                                        subscription.period_arabic
                                      } )</span>
                                    </div>
                                    <span class="subscription_discount">خصم ${
                                      subscription.discount
                                    }%</span>
                                  </section>
                                  <section class="subscription__bottom-box">
                                  <div class="subscription_price--box">
                                      <p class="subscription_price--class">
                                        <span>${Number(
                                          subscription.period_price
                                        ).toFixed(0)} درهم</span> / للحصة
                                      </p>
                                      <span class="subscription_price--prev">${Number(
                                        subscription.old_period_price
                                      ).toFixed(0)} درهم</span>
                                    </div>
                                    <div class="subscription__bottom-box--right">
                                      <span class="subscription_price">${Number(
                                        subscription.total_price
                                      ).toFixed(0)} درهم</span>
                                      <span class="subscription_price--prev">${Number(
                                        subscription.total_old_price
                                      ).toFixed(0)} درهم</span>
                                    </div>
    
                                  </section>
                                  <input
                                    type="radio"
                                    id="${subscription.for_data}${
                      subscription.id
                    }"
                                    name="subscription"
                                    value="${subscription.id}"
                                    class="step__radio"
                                    data-payment_url="${subscription.link}"
                                  />
                              `;
                    subscriptionOptions.appendChild(label);
                    activateRadioOptions();
                  });
                }
              });
            });
          }
        });
      }

      if (stepNum === "7") {
        data["form"] = document.getElementById("form-id").value;

        const formattedData = {
          form: data.form,
          plan: Number(data.subscription),
        };

        const endPoint = baseUrl + submit_btn.dataset.end_point;

        submit_btn.textContent = "برجاء الانتظار...";

        updateProgressBar();

        await sendDataToApi(formattedData, endPoint).then(
          (data) => (window.location.href = data.link)
        );

        updateProgressBar();

        return;
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
function collectFormData(form) {
  const formInputs = Array.from(form.querySelectorAll("input"));

  const checkedInputsIds = formInputs
    .filter((input) => input.checked)
    .map((input) => +input.value);

  return checkedInputsIds;
}

function createNextStepQuestions(stepNum) {
  const groupOfQuestions = track_data.track_group;

  // Our dynamic form starts from div with id step3
  const nextStepDiv = document.getElementById(`step${stepNum + 1}`);

  const displayedQuestions = groupOfQuestions[stepNum - 2]?.question;

  if (!displayedQuestions) return;

  displayedQuestions.map((question) => {
    const questionBody = `
      <article class="form__step--article">
        <h2 class="article__title">
          ${question.question_ar}<span class="label__asterisk">*</span>
          <span
            data-msg="رجاءََ ${question.question_ar}${question.status === 'write' ? ' بحد اقصى 10' : ''}"
            class="error-msg"
            id="${question.status === 'write' ? `q-${question.id}` : question.id}__error-msg"
            ></span>
         </h2>
        <div class="step__options">
        <input
            type="text"
            id="${question.status === 'write' ? `q-${question.id}` : question.id}__hidden-input"
            class="hidden-input"
            hidden
          />
        ${
          question.status !== "write"
            ? `
          ${question.choices
            .map((choice) => {
              const choiceBody = `<label
                  for=q-${question.id}
                  class="step__label-box step__label ${
                    question.status === "multi_choice"
                      ? "step__label--checkbox"
                      : "step__label--radio"
                  }"
                  data-value=${choice.id}
                  style="flex-direction: ${choice.image ? "column" : "row"}"
                  >
                  <img
                    src="./assets/images/correct-icon.svg"
                    alt="correct icon"
                    class="correct-icon"
                  />
                  ${
                    choice.image
                      ? `<img src="${choice.image}" alt="${choice.name_en}" class="subject-img">`
                      : ""
                  }
                  ${choice.name_ar}
                  <input
                    type=${
                      question.status === "multi_choice" ? "checkbox" : "radio"
                    }
                    id=q-${question.id}
                    name=${question.id}
                    value=${choice.id}
                    class=${
                      question.status === "multi_choice"
                        ? "step__checkbox"
                        : "step__radio"
                    } />
                </label>`;
              return choiceBody;
              // without join(''), the answers will appear with , between them
            })
            .join("")}`
            : `
              <input
              type="number"
              class="step__label-box custom-count step__input"
              id=q-${question.id}
              name=q-${question.id}
              min="1"
              max="10"
              data-type="write"
              />`
        }
          </div>
        </article>`;
    nextStepDiv
      .querySelector(".fields").innerHTML += questionBody;
  });

  activateCheckboxOptions();
  activateRadioOptions();
  activeWriteFields();
}
function createHiddenInput(relatedName) {
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "text";
  hiddenInput.id = `${relatedName}__hidden-input`;
  hiddenInput.className = "hidden-input";
  hiddenInput.hidden = true;

  return hiddenInput;
}

function activateRadioOptions() {
  const radioOptions = document.querySelectorAll(".step__label--radio");
  radioOptions.forEach((item) => {
    item.addEventListener("click", () => {
      item.parentElement.querySelector(".hidden-input").value =
        item.dataset.value;
      item.parentElement.parentElement.querySelector(
        ".error-msg"
      ).style.display = "none";
    });
  });
}

function activateCheckboxOptions() {
  const checkboxOptions = document.querySelectorAll(".step__label--checkbox");
  checkboxOptions.forEach((item) => {
    item.addEventListener("click", () => {
      item.parentElement.parentElement.querySelector(
        ".error-msg"
      ).style.display = "none";
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
  let collectedData = {};
  let currentName;
  Array.from(fields)
    .filter((item) => item.type === "checkbox")
    .forEach((item) => {
      currentName = item.name;

      if (item.checked) {
        if (!collectedData[currentName]) {
          collectedData[currentName] = [];
        }
        collectedData[currentName].push(item.value);
      }
    });

  Object.keys(collectedData).forEach((key) => {
    if (!collectedData[key]) {
      showErrorMsg(key);
      isValid = false;
    } else {
      data[key] = collectedData[key];
    }
  });
}

function  isEmpty(value) {
  return value.trim() === "";
}

function addErrorClass(id) {
  if (id === "whatsapp") {
    const inputWithError = document.querySelector(`.iti`);
    inputWithError.classList.add("error");
    return;
  }

  const inputWithError = document.querySelector(
    `.step__input-container input#${id}`
  );
  inputWithError.classList.add("error");
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

function activeWriteFields () {
  const writeInputs = document.querySelectorAll('input[data-type="write"]');
  writeInputs.forEach(input => {
    input.addEventListener('input', () => {
      input.parentElement.querySelector(".hidden-input").value =
        input.value;
      input.parentElement.parentElement.querySelector(
        ".error-msg"
      ).style.display = "none";
    })
  });
}

// ================= Validate Step =================
function validateStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  const fields = getStepFields(stepNumber);

  let isValid = true;

  for (let item of fields) {
    switch (item.name) {
      case "first_name":
      case "last_name":
      case "email":
        if (isEmpty(item.value)) {
          addErrorClass(item.name);
          isValid = false;
        }
        break;

      case "whatsapp":
        if (isEmpty(item.value) || !iti.isValidNumber()) {
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

      // case "student_count":
      case "session":
      case "subscription":
      case "track":
      case "form_type":
        const hiddenInput = step.querySelector(`#${item.name}__hidden-input`);
        if (isEmpty(hiddenInput.value)) {
          showErrorMsg(item.name);
          isValid = false;
        }
        break;

      case "q-5":
        const writeHiddenInput = step.querySelector(`#${item.name}__hidden-input`);
        if (Number(writeHiddenInput.value) === 0 || Number(writeHiddenInput.value) > 10) {
          showErrorMsg(item.name);
          isValid = false;
        }
        break;

      case "1":
      case "2":
      case "3":
      case "4":
      case "6":
      case "7":
      case "8":
      case "9":
      case "10":
        const checkedFields = Array.from(fields).filter((item) => item.checked).map((item) => item.name);
        if (!checkedFields.includes(item.name)) {
          showErrorMsg(item.name);
          isValid = false;
        }
    }
  }

  return isValid;
}
activateCheckboxOptions();
activateRadioOptions();
activeWriteFields();
