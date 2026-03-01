(function () {
  function initQuoteForm() {
    const form = document.getElementById("quote-form") || document.getElementById("quoteForm");
    if (!form) return;
    if (!document.body.classList.contains("page-quote")) return;
    if (form.dataset.initialized === "true") return;
    form.dataset.initialized = "true";

    const stepPanels = {
      1: form.querySelector('[data-step-panel="1"]'),
      2: form.querySelector('[data-step-panel="2"]'),
    };
    if (!stepPanels[1] || !stepPanels[2]) return;

    const requiredStep1 = Array.from(
      stepPanels[1].querySelectorAll("input[required], select[required], textarea[required]")
    );
    const requiredAll = Array.from(
      form.querySelectorAll("input[required], select[required], textarea[required]")
    );
    const touchedFields = new WeakSet();
    const stepLabel = document.getElementById("quote-step-label");
    const stepBar = document.getElementById("quote-step-bar");
    const status = document.getElementById("quote-status");
    const nextBtn = document.getElementById("quote-next");
    const backBtn = document.getElementById("quote-back");
    const step2Heading = document.getElementById("project-details-title");

    function getFieldWrap(field) {
      return field.closest(".field");
    }

    function showFieldValidity(field, shouldShow) {
      const wrapper = getFieldWrap(field);
      if (!wrapper) return;
      const invalid = shouldShow && !field.checkValidity();
      wrapper.classList.toggle("is-invalid", invalid);
    }

    function validateField(field, force) {
      const touched = force || touchedFields.has(field);
      showFieldValidity(field, touched);
      return field.checkValidity();
    }

    function validateList(fields, force) {
      let isValid = true;
      fields.forEach((field) => {
        if (!validateField(field, force)) isValid = false;
      });
      return isValid;
    }

    function setStep(step) {
      stepPanels[1].hidden = step !== 1;
      stepPanels[2].hidden = step !== 2;
      if (stepLabel) stepLabel.textContent = `Step ${step} of 2`;
      if (stepBar) stepBar.dataset.step = String(step);
      if (step === 2 && step2Heading) {
        step2Heading.focus();
      }
    }

    requiredAll.forEach((field) => {
      const markTouched = () => {
        touchedFields.add(field);
        validateField(field, true);
      };
      field.addEventListener("blur", markTouched);
      field.addEventListener("input", () => validateField(field, false));
      field.addEventListener("change", () => validateField(field, false));
    });

    if (nextBtn) {
      nextBtn.type = "button";
      nextBtn.addEventListener("click", function () {
        if (!validateList(requiredStep1, true)) return;
        setStep(2);
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", function () {
        setStep(1);
      });
    }

    stepPanels[1].addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.tagName === "TEXTAREA") return;
      event.preventDefault();
      nextBtn?.click();
    });

    stepPanels[2].addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.tagName === "TEXTAREA" || target.id === "quote-submit") return;
      event.preventDefault();
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (status) status.textContent = "";

      if (!validateList(requiredAll, true)) {
        const firstInvalid = form.querySelector(
          ".field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea"
        );
        firstInvalid?.focus();
        return;
      }

      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Submission failed");

        const parent = form.parentElement;
        form.remove();
        const success = document.createElement("div");
        success.className = "form-success";
        success.setAttribute("aria-live", "polite");
        success.textContent = "Thanks — we got your request. We’ll respond as soon as possible.";
        parent?.appendChild(success);
        success.focus?.();
      } catch (error) {
        if (status) status.textContent = "Something went wrong. Please call 904.537.5000.";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initQuoteForm);
  document.addEventListener("page:load", initQuoteForm);
  document.addEventListener("includes:ready", initQuoteForm);
})();
