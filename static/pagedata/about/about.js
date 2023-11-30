const carouselTrack = document.querySelector(".carousel-track");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");

let scrollTimeout;

carouselTrack.addEventListener("scroll", () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    let scrollLeft = carouselTrack.scrollLeft;
    const imgWidth = carouselTrack.clientWidth / 2;

    const activeIndex = Math.round(scrollLeft / imgWidth);
    carouselTrack.scrollLeft = activeIndex * imgWidth;
  }, 150);
});

leftArrow.addEventListener("click", () => {
  slide(-1);
});

rightArrow.addEventListener("click", () => {
  slide(1);
});

function slide(direction) {
  const imgWidth = carouselTrack.clientWidth / 2;
  let scrollLeft = carouselTrack.scrollLeft;
  carouselTrack.scrollLeft = scrollLeft + imgWidth * direction;
}
document.addEventListener("DOMContentLoaded", async function () {
  const lines = [
    "Crafting web wonders.",
    "From coffee to code.",
    "Bridging server to screen.",
    "Bilingual: Human & machine.",
    "Turning ideas to digital gold.",
    "Software symphonies.",
    "Designing digital dreams.",
    "Mastering bytes & servers.",
    "Weaving digital threads.",
    "Harmonizing code & design.",
    "Full stack, full flair.",
    "Backend brains, frontend finesse.",
    "Pixels to protocols perfection.",
    "Juggling JS to Java.",
    "Seamless screens to servers.",
    "Code craftsmen at every layer.",
    "Marrying markup with middleware.",
    "Data dynamos & design devotees.",
    "Synthesizing syntax & styles.",
    "Navigating nodes, nurturing networks.",
  ];

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i (inclusive)
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements at index i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  new Typewriter("quirk", shuffleArray(lines));
});
class Typewriter {
  constructor(elementId, phrases = null) {
    this.element = document.getElementById(elementId);
    this.phrases = phrases || [this.element.innerText];
    this.currentPhraseIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = 30; // Time in milliseconds between typing characters
    this.deleteSpeed = 15; // Time in milliseconds between deleting characters
    this.delayAfterTyping = 3000; // Time in milliseconds to delay after finishing typing before deleting
    this.setMinHeight();
    this.type();
  }

  setMinHeight() {
    // Set the min-height to the current height of the element to prevent it from collapsing
    this.element.style.minHeight = `${this.element.offsetHeight}px`;
  }

  type() {
    const currentPhrase = this.phrases[this.currentPhraseIndex];
    const fullTxt = this.isDeleting
      ? currentPhrase.substring(0, this.currentCharIndex)
      : currentPhrase.substring(0, this.currentCharIndex + 1);

    this.element.innerText = fullTxt;

    if (!this.isDeleting && this.currentCharIndex === currentPhrase.length) {
      setTimeout(() => {
        this.isDeleting = true;
        this.type();
      }, this.delayAfterTyping);
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentPhraseIndex =
        (this.currentPhraseIndex + 1) % this.phrases.length; // Cycle through phrases
      this.type();
    } else {
      this.currentCharIndex += this.isDeleting ? -1 : 1;
      setTimeout(
        () => this.type(),
        this.isDeleting ? this.deleteSpeed : this.typeSpeed
      );
    }
  }
}
