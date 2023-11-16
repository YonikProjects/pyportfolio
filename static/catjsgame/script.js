/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function ezRand(min, max) {
  //making random easier
  return Math.floor(Math.random() * (max - min + 1)) + min;
} // ezRand(0, 100) will provide a value 0-100

function dqs(input) {
  return document.querySelector(input);
}

function dce(input) {
  return document.createElement(input);
}

function buildElem(parent, child, body) {
  //Make it easier to build an element
  let node = dce(child);
  if (body !== "" && body !== null) {
    let textnode = document.createTextNode(body);
    node.appendChild(textnode);
  }
  parent.appendChild(node);
  return node;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function genCats(catAmount) {
  let catObj = [];
  let min = 10000;
  let max = 2000000;
  for (let i = 0; i < catAmount; i++) {
    if (i % 2 === 0) {
      seed = ezRand(min, max);
    }
    catObj[i] = {
      id: ezRand(min, max),
      seed: seed,
      isFlipped: false,
      isVisible: true,
      isDone: false,
      imglnk: `https://robohash.org/${seed}?set=set4`,
    };
  }
  return shuffle(catObj);
}

function areCatsHidden() {
  if (dqs("#hideCatsBttn").getAttribute("disabled")) return true;
  else false;
}

function hideCats() {
  let field = document.querySelectorAll(".aCat");
  for (let i = 0; i < field.length; i++) {
    field[i].setAttribute(
      "src",
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Solid_white.svg"
    );
    field[i].setAttribute("style", "background-color: white");
  }
  dqs("#hideCatsBttn").setAttribute("disabled", "true");
  dqs("#scoreBoard").setAttribute("style", "visibility: visible");
  dqs("#gameInfo").setAttribute("style", "visibility: hidden");
  tick(true);
  score = 0;
}

function revealCats() {
  let field = document.querySelectorAll(".aCat");
  for (let i = 0; i < field.length; i++) {
    let img = getCatObj(["id", field[i].getAttribute("id")]).imglnk;
    field[i].setAttribute("src", img);
  }
  dqs("#hideCatsBttn").setAttribute("disabled", "true");
  dqs("#scoreBoard").setAttribute("style", "visibility: visible");
  dqs("#gameInfo").setAttribute("style", "visibility: hidden");
}

function buildCatsField(catObj) {
  dqs("#CatField").innerHTML = "";
  for (let i = 0; i < catObj.length / 5; i++) {
    let lineDiv = buildElem(dqs("#CatField"), "div", "");
    lineDiv.setAttribute("id", `divLine${i}`);
    lineDiv.setAttribute("class", "catFieldLine");
    for (let j = 0; j < 5 && j + i * 5 < catObj.length; j++) {
      let catImg = buildElem(lineDiv, "img", "");
      let currObj = catObj[j + i * 5];
      catImg.setAttribute("src", currObj.imglnk);
      catImg.setAttribute("class", "aCat");
      catImg.setAttribute("id", currObj.id);
      catImg.setAttribute("value", currObj.seed);
      catImg.setAttribute("onclick", "clickCat(event)");
    }
  }
}

function getCatObj([key, value]) {
  for (let i = 0; i < catsMainObj.length; i++) {
    if (catsMainObj[i][key] == value) return catsMainObj[i];
  }
}

function winCheck() {
  dqs("#score").innerHTML = score;
  let fields = document.querySelectorAll(".aCat");
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].getAttribute("value") !== "won") return false;
  }
  return true;
}

function clickCat(event) {
  if (
    areCatsHidden() &&
    event.target.getAttribute("style") !== "background-color: red"
  ) {
    let nowClick = event.target;
    let img = getCatObj(["id", nowClick.getAttribute("id")]).imglnk;
    nowClick.setAttribute("src", img);
    let oldClick = moveStateObj.firstCatElement;
    let catClickSeed = event.target.getAttribute("value");
    if (moveStateObj.counter === 0 && catClickSeed !== "won") {
      nowClick.setAttribute("style", "background-color: yellow");
      moveStateObj.firstCatSeed = catClickSeed;
      moveStateObj.firstCatElement = nowClick;
      moveStateObj.counter = 1;
    } else {
      if (
        moveStateObj.counter === 1 &&
        catClickSeed !== "won" &&
        nowClick.getAttribute("id") !== oldClick.getAttribute("id")
      ) {
        if (moveStateObj.firstCatSeed === catClickSeed) {
          oldClick.setAttribute("style", "background-color: green");
          oldClick.setAttribute("value", "won");
          nowClick.setAttribute("style", "background-color: green");
          nowClick.setAttribute("value", "won");
          score++;
          if (winCheck()) winEvent();
          moveStateObj.counter = 0;
        } else {
          oldClick.setAttribute("style", "background-color: red");
          nowClick.setAttribute("style", "background-color: red");
          setTimeout(function () {
            oldClick.setAttribute(
              "src",
              "https://upload.wikimedia.org/wikipedia/commons/7/70/Solid_white.svg"
            );
            nowClick.setAttribute(
              "src",
              "https://upload.wikimedia.org/wikipedia/commons/7/70/Solid_white.svg"
            );
            oldClick.setAttribute("style", "background-color: white");
            nowClick.setAttribute("style", "background-color: white");
          }, 1000);
          moveStateObj.counter = 0;
        }
      }
    }
  }
}

function winEvent() {
  dqs("#CatField").innerHTML = "";
  dqs(
    "#winMsg"
  ).innerHTML = `<h1>You Win! Final Score: ${score}, Total Time: ${time}`;
  dqs("#scoreBoard").setAttribute("style", "visibility: hidden");
}

function spawnCats() {
  spawnAmount = dqs("#spawnAmnt").value;
  if (spawnAmount % 2 !== 0) {
    spawnAmount++;
  }
  catsMainObj = genCats(spawnAmount);
  buildCatsField(catsMainObj);
  dqs("#hideCatsBttn").removeAttribute("disabled");
  dqs("#winMsg").innerHTML = ``;
  dqs("#scoreBoard").setAttribute("style", "visibility: hidden");
  dqs("#hideCatsBttn").removeAttribute(disabled);
  dqs("#gameInfo").setAttribute("style", "visibility: visible");
}
let score = 0;
let spawnAmount = dqs("#spawnAmnt").value;
if (spawnAmount % 2 !== 0) spawnAmount++;
let catsMainObj = genCats(spawnAmount);
let moveStateObj = {
  counter: 0, // may only be 0,1,2
  firstCatSeed: "nothing",
  firstCatElement: null,
};
let time = 0;

function tick(reset) {
  if (reset) {
    time = 0;
  }
  time++;
  dqs("#timer").innerHTML = time;
}
let timer = setInterval(tick, 1000);
