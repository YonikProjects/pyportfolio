document.addEventListener("DOMContentLoaded", async function () {
  const icons = document.querySelectorAll(".navbarAction");
  const topnav = document.getElementById("myTopnav");
  icons.forEach((icon) => {
    icon.addEventListener("click", function (event) {
      if (
        topnav.classList.contains("topnav") &&
        !topnav.classList.contains("responsive")
      ) {
        topnav.classList.add("responsive");
        // Add the document click listener when the menu is opened
        document.addEventListener("click", outsideClickListener);
      } else {
        topnav.classList.remove("responsive");
        // Remove the document click listener when the menu is closed
        document.removeEventListener("click", outsideClickListener);
      }
      event.stopPropagation(); // Prevent this click from being propagated to document
    });
  });

  function outsideClickListener(event) {
    // Check if the clicked element is neither the menu nor the icons
    if (!topnav.contains(event.target) && !isClickOnIcons(event.target)) {
      topnav.classList.remove("responsive"); // Close the menu
      // Remove the document click listener since the menu is now closed
      document.removeEventListener("click", outsideClickListener);
    }
  }

  function isClickOnIcons(target) {
    return Array.from(icons).some((icon) => icon.contains(target));
  }
});
