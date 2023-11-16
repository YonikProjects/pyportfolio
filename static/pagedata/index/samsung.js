document.addEventListener("DOMContentLoaded", async function () {
  if (/SamsungBrowser/i.test(navigator.userAgent)) {
    document.body.classList.add("samsung-browser");
  }
});
