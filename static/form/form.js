document.addEventListener("DOMContentLoaded", async function () {
  // eslint-disable-next-line no-undef
  await turnstile.ready(function () {
    // eslint-disable-next-line no-undef
    turnstile.render("#cf-turnstile", {
      sitekey: "0x4AAAAAAAIhnuMlDKij3Qlp",
      //   callback: function (token) {
      //     console.log(`Challenge Success ${token}`);
      //   },
    });
  });
  var form = document.querySelector(".contact-form form");
  var submitButton = document.getElementById("submitButton");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitButton.value = "Submitting...";
    submitButton.disabled = true;

    // Create an object from the form data
    const formData = {
      name: form.elements["name"].value,
      email: form.elements["email"].value,
      phone: form.elements["phone"].value,
      subject: form.elements["subject"].value,
      message: form.elements["message"].value,
      "cf-turnstile-response": form.elements["cf-turnstile-response"].value,
    };

    // Use fetch API to send the data to the server
    fetch("/pform", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          submitButton.value = "Sent, Thank you!";
          form.reset();
          setTimeout(function () {
            submitButton.value = "Submit";
            submitButton.disabled = false;
          }, 10000); // Reset after 10 seconds
        } else {
          submitButton.value = "Error!";
          setTimeout(function () {
            submitButton.value = "Submit";
            submitButton.disabled = false;
          }, 5000); // Show error message for 5 seconds and then reset
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        submitButton.value = "Error! Try again!";
        setTimeout(function () {
          submitButton.value = "Submit";
          submitButton.disabled = false;
        }, 5000); // Show error message for 5 seconds and then reset
      });
  });
});
