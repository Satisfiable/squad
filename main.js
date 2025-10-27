"use strict";

const isMobile = window.matchMedia("(max-width: 768px)");
let irregularOn = false;

if (isMobile.matches) {
  let item1 = document.querySelectorAll(".container .item")[0];

  item1.style.pointerEvents = "none";
  item1.style.display = "none";
  let item2 = document.querySelectorAll(".container .item")[1];
  item2.style.gridColumn = "1 / 17";
}

function textToSpeech(text) {
  responsiveVoice.speak(text, "Turkish Female");
}

function getUserData() {
  return fetch("https://undefined-xxrn.onrender.com/userdata")
    .then((response) => response.json())
    .then((users) => {
      return users.find(
        (user) => user.username === localStorage.getItem("username")
      );
    });
}

function getRandomColor() {
  // Generate a random hue value between 0 and 360 degrees
  const hue = Math.floor(Math.random() * 360);

  // Set saturation to a higher value for vibrant pastel effect (between 50% and 70%)
  const saturation = Math.floor(Math.random() * 21) + 50; // Between 50% and 70%

  // Set lightness to a moderate value for pastel effect (between 60% and 80%)
  const lightness = Math.floor(Math.random() * 21) + 60; // Between 60% and 80%

  // Return the vibrant pastel color in HSL format
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getVocabList(order) {
  fetch("https://undefined-xxrn.onrender.com/vocablist")
    .then((response) => response.json())
    .then((vocabs) => {
      if (order === "recent") {
        vocabs.sort((a, b) => new Date(b.pushedDate) - new Date(a.pushedDate));
      } else if (order === "latest") {
        vocabs.sort((a, b) => new Date(a.pushedDate) - new Date(b.pushedDate));
      } else if (order === "az") {
        vocabs.sort((a, b) => a.word.localeCompare(b.word));
      } else if (order === "za") {
        vocabs.sort((a, b) => b.word.localeCompare(a.word));
      } else if (order === "mix") {
        vocabs.sort(() => Math.random() - 0.5);
      }

      let container = document.getElementsByClassName("container")[0];
      const vocabCards = container.querySelectorAll(".item-card");
      vocabCards.forEach((card) => card.remove());

      vocabs.forEach(({ word, definitionTR, definitionGE }) => {
        const randomColor = getRandomColor();
        const html = `
          <div class="item item-card">
            <div class="item-front" style="background-color: ${randomColor}"><h3>${word}</h3></div>
            <div class="item-back">
              <div class="item-vocab"><h3>${word}</h3><button class="item-vocab-speech"><i class="fa-solid fa-volume-high"></i></button></div>
              <div class="item-vocab"><p>${definitionTR}</p></div>
              <div class="item-vocab"><p>${definitionGE}</p></div>
            </div>  
          </div>
        `;
        container.insertAdjacentHTML("beforeend", html);
      });

      if (
        document
          .querySelector(".item-panel-switch-bar")
          .classList.contains("checked")
      ) {
        document.querySelectorAll(".item-card .item-front").forEach((el) => {
          el.style.opacity = "1";
        });

        document.querySelectorAll(".item-card .item-back").forEach((el) => {
          document.querySelectorAll(".item-card").forEach((m) => {
            if (m.classList.contains("flipped")) {
              m.classList.remove("flipped");
            }
          });
          el.style.transform = "rotateY(180deg)";
        });

        if (isMobile.matches) {
          document.querySelector(".container").style.perspective = "70000px";
        }

        document.querySelectorAll(".item-card").forEach((el) => {
          el.style.pointerEvents = "all";
        });
      }

      const cards = document.querySelectorAll(".item-card");
      cards.forEach((card) => {
        card.addEventListener("click", function () {
          card.classList.toggle("flipped");
        });
        if (isMobile.matches) {
          card.style.gridColumn = "span 16";
        }
      });
      document
        .querySelectorAll(".item-card .item-vocab .item-vocab-speech")
        .forEach((x) => {
          x.addEventListener("click", () => {
            const card = x.closest(".item-card");
            if (card) {
              card.classList.toggle("flipped");
            }
            textToSpeech(x.parentElement.querySelector("h3").textContent);
          });
        });
    });
}

function getIrregularVerbs(order) {
  fetch("https://undefined-xxrn.onrender.com/irregularlist")
    .then((response) => response.json())
    .then((vocabs) => {
      if (order === "recent") {
        vocabs.sort((a, b) => new Date(b.pushedDate) - new Date(a.pushedDate));
      } else if (order === "latest") {
        vocabs.sort((a, b) => new Date(a.pushedDate) - new Date(b.pushedDate));
      } else if (order === "az") {
        vocabs.sort((a, b) => a.v1.localeCompare(b.v1));
      } else if (order === "za") {
        vocabs.sort((a, b) => b.v1.localeCompare(a.v1));
      } else if (order === "mix") {
        vocabs.sort(() => Math.random() - 0.5);
      }

      let container = document.getElementsByClassName("container")[0];
      const vocabCards = container.querySelectorAll(".item-card");
      vocabCards.forEach((card) => card.remove());

      vocabs.forEach(({ v1, v2, v3, definitionTR }) => {
        const html = `
      <div class="item item-card item-irregular">
        <div class="item-front"><h3>${definitionTR}</h3></div>
        <div class="item-back">
          <div class="item-vocab-ir"><p>${v1}</p></div>
          <div class="item-vocab-ir"><p>${v2}</p></div>
          <div class="item-vocab-ir"><p>${v3}</p></div>
        </div>  
      </div>
    `;
        container.insertAdjacentHTML("beforeend", html);
      });

      if (isMobile.matches) {
        document.querySelector(".container").style.perspective = "70000px";
      }

      document.querySelectorAll(".item-card").forEach((el) => {
        el.style.pointerEvents = "all";
      });

      const cards = document.querySelectorAll(".item-card");
      cards.forEach((card) => {
        card.addEventListener("click", function () {
          let front = card.querySelector(".item-front");
          let back = card.querySelector(".item-back");

          if (front.style.opacity === "1") {
            front.style.opacity = "0";
            document.querySelectorAll(".item-card").forEach((m) => {
              if (m.classList.contains("flipped")) {
                m.classList.remove("flipped");
              }
            });
            back.style.transform = "rotateY(0deg)";
          } else {
            front.style.opacity = "1";
            document.querySelectorAll(".item-card").forEach((m) => {
              if (m.classList.contains("flipped")) {
                m.classList.remove("flipped");
              }
            });
            back.style.transform = "rotateY(180deg)";
          }
        });
        if (isMobile.matches) {
          card.style.gridColumn = "span 16";
        }
      });
    });
}

// Fetch and display user data (time spent)
getUserData().then((data) => {
  let timespentday = data["total-time-spent-day"][1];
  let timespentweek = data["total-time-spent-week"][1];
  let timespentmonth = data["total-time-spent-month"][1];

  let statTable = document.querySelectorAll(".container .item")[1];

  statTable.innerHTML += `
    <div class="item-profile">
      <div class="item-profile-name"><h2>${data.username}</h2></div>
    </div>
    <div class="item-inner-container">
      <label class="item-inner-container-switch">        
        <input type="checkbox">
        <span class="item-inner-container-switch-bar"></span>
      </label>
      <div class="item-stats">
        <div class="item-stats-timespent">
          <div class="item-stats-timespent-day"><h4>Time Spent Today</h4><p>${timespentday}</p></div>
          <div class="item-stats-timespent-week"><h4>Time Spent This Week</h4><p>${timespentweek}</p></div>
          <div class="item-stats-timespent-month"><h4>Time Spent This Month</h4><p>${timespentmonth}</p></div>
        </div>
      </div>
      <div class="item-panel">
        <div>
          <label class="item-panel-switch">        
            <input type="checkbox">
            <span class="item-panel-switch-bar"></span>
          </label>
          <a href="/homework.html" class="item-panel-button">All Homeworks</a>
          <a href="/quiz.html" class="item-panel-button">QUIZ</a>
          <a href="/creating-sentences.html" class="item-panel-button">Sentences</a>
        </div>
        <div class="item-panel-order">
          <button id="item-panel-order-recent">En yakın zaman</button>
          <button id="item-panel-order-latest">En uzak zaman</button>
          <button id="item-panel-order-az">A-Z Sıralama</button>
          <button id="item-panel-order-za">Z-A Sıralama</button>
          <button id="item-panel-order-mix">MIX</button>
          <div class="ir-container" style="display: flex;">
            <button id="item-panel-order-irregular">IRREGULAR</button>
            <button id="item-panel-order-pattern"><a href="irregular-pattern.html">P!</a></button>
          </div>
        </div>
      </div>
    </div>`;

  let checkbox = document.querySelector(".item-inner-container-switch input");

  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      document
        .querySelector(".item-inner-container-switch-bar")
        .classList.add("checked");
      document.querySelector(".item .item-panel").style.display = "flex";
      document.querySelector(".item .item-stats").style.display = "none";
      document.querySelector(".item .item-profile-name").style.display = "none";

      document.querySelector(".item:nth-child(2)").style.paddingTop = "3rem";

      let checkbox = document.querySelector(".item-panel-switch input");
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          document
            .querySelector(".item-panel-switch-bar")
            .classList.add("checked");

          document.querySelectorAll(".item-card .item-front").forEach((el) => {
            el.style.opacity = "1";
          });

          document.querySelectorAll(".item-card .item-back").forEach((el) => {
            document.querySelectorAll(".item-card").forEach((m) => {
              if (m.classList.contains("flipped")) {
                m.classList.remove("flipped");
              }
            });
            el.style.transform = "rotateY(180deg)";
          });

          if (isMobile.matches) {
            document.querySelector(".container").style.perspective = "70000px";
          }

          document.querySelectorAll(".item-card").forEach((el) => {
            el.style.pointerEvents = "all";
          });
        } else {
          document
            .querySelector(".item-panel-switch-bar")
            .classList.remove("checked");

          document.querySelectorAll(".item-card").forEach((el) => {
            el.style.pointerEvents = "none";

            if (el.classList.contains("flipped")) {
              el.classList.remove("flipped");
            }
          });

          document.querySelectorAll(".item-card .item-front").forEach((el) => {
            el.style.opacity = "0";
          });

          document.querySelectorAll(".item-card .item-back").forEach((el) => {
            el.style.transform = "rotateY(0deg)";
          });
        }
      });

      let btn1 = document.getElementById("item-panel-order-recent");
      btn1.addEventListener("click", () => {
        if (irregularOn) {
          getIrregularVerbs("recent");
        } else {
          getVocabList("recent");
        }
      });
      let btn2 = document.getElementById("item-panel-order-latest");
      btn2.addEventListener("click", () => {
        if (irregularOn) {
          getIrregularVerbs("latest");
        } else {
          getVocabList("latest");
        }
      });
      let btn3 = document.getElementById("item-panel-order-az");
      btn3.addEventListener("click", () => {
        if (irregularOn) {
          getIrregularVerbs("az");
        } else {
          getVocabList("az");
        }
      });
      let btn4 = document.getElementById("item-panel-order-za");
      btn4.addEventListener("click", () => {
        if (irregularOn) {
          getIrregularVerbs("za");
        } else {
          getVocabList("za");
        }
      });
      let btn5 = document.getElementById("item-panel-order-mix");
      btn5.addEventListener("click", () => {
        if (irregularOn) {
          getIrregularVerbs("mix");
        } else {
          getVocabList("mix");
        }
      });
      let btn6 = document.getElementById("item-panel-order-irregular");
      btn6.addEventListener("click", () => {
        if (irregularOn) {
          irregularOn = false;
        } else {
          irregularOn = true;
          getIrregularVerbs("az");
        }
      });
    } else {
      document.querySelector(".item:nth-child(2)").style.paddingTop = "5rem";

      document
        .querySelector(".item-inner-container-switch-bar")
        .classList.remove("checked");
      document.querySelector(".item .item-stats").style.display = "block";
      document.querySelector(".item .item-panel").style.display = "none";
      document.querySelector(".item .item-profile-name").style.display =
        "block";
    }
  });
});

fetch("https://undefined-xxrn.onrender.com/vocablist")
  .then((response) => response.json())
  .then((vocabs) => {
    vocabs.sort((a, b) => new Date(b.pushedDate) - new Date(a.pushedDate));
    vocabs.forEach(({ word, definitionTR, definitionGE }) => {
      const randomColor = getRandomColor();
      const html = `
        <div class="item item-card">
          <div class="item-front" style="background-color: ${randomColor}"><h3>${word}</h3></div>
          <div class="item-back">
            <div class="item-vocab"><h3>${word}</h3><button class="item-vocab-speech"><i class="fa-solid fa-volume-high"></i></button></div>
            <div class="item-vocab"><p>${definitionTR}</p></div>
            <div class="item-vocab"><p>${definitionGE}</p></div>
          </div>  
        </div>
      `;
      let container = document.getElementsByClassName("container")[0];
      container.insertAdjacentHTML("beforeend", html);
    });

    const cards = document.querySelectorAll(".item-card");
    cards.forEach((card) => {
      card.addEventListener("click", function () {
        card.classList.toggle("flipped");
      });
      if (isMobile.matches) {
        card.style.gridColumn = "span 16";
      }
    });
    document
      .querySelectorAll(".item-card .item-vocab .item-vocab-speech")
      .forEach((x) => {
        x.addEventListener("click", () => {
          const card = x.closest(".item-card");
          if (card) {
            card.classList.toggle("flipped");
          }
          textToSpeech(x.parentElement.querySelector("h3").textContent);
        });
      });
  });
