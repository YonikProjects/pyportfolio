document.body.addEventListener("htmx:trigger", async function (event) {
  if (event.target.id != "") {
    mediumZoom("[data-zoomable]");
    history.pushState({}, "", `${event.target.id}`);
  }
});
document.addEventListener("DOMContentLoaded", async function () {
  await getNextPost(nextPost.pop());

  document.body.addEventListener("htmx:afterSettle", async function () {
    if (nextPost.length > 0) {
      await getNextPost(nextPost.pop());
    }
  });
});

async function getNextPost(json) {
  try {
    const response = await fetch("/projects/nextpost/", {
      method: "POST",
      // Add any necessary headers or body for the POST request
      headers: {
        "Content-Type": "application/json", // Change content type if needed
      },
      body: JSON.stringify(json), // Include any POST data here
    });

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const htmlContent = await response.text();
    // Append the fetched HTML content to the .single-post-container element
    const singlePostContainer = document.querySelector(
      ".single-post-container"
    );
    singlePostContainer.insertAdjacentHTML("beforeend", htmlContent);
    htmx.process(document.body);
  } catch (error) {
    console.error("Error fetching or appending HTML:", error);
  }
}
