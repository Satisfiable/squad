"use strict";

function getSentences() {
  fetch("https://undefined-xxrn.onrender.com/createdsentences")
    .then((response) => response.json())
    .then((sentences) => {
      sentences.sort((a, b) => new Date(b.pushedDate) - new Date(a.pushedDate));

      let html = "";
      sentences.forEach((x) => {
        const component = `<div class="sentence"><h4>${x.word}</h4><p>${x.sentence}</p></div>`;
        html += component;
      });

      let section = document.querySelector(".sentences-section-1");
      section.innerHTML = `<div class="sentence-input-box"></div>${html}`;
    });
}

async function getWordBase() {
  fetch("https://undefined-xxrn.onrender.com/irregularlist")
    .then((response) => response.json())
    .then((vocabs) => {
      let groupSize;
      for (let i = 0; i < Math.ceil(vocabs.length / 12); i++) {
        let deed = 0;

        if (i === Math.floor(vocabs.length / 12)) {
          groupSize = vocabs.length % 12;
        } else {
          groupSize = 12;
        }

        for (let count = i * groupSize; count < (i + 1) * groupSize; count++) {
          if (vocabs[count].status === "done") {
            deed++;
          }
        }

        if (deed !== groupSize) {
          document.querySelector(".word-database").innerHTML = "";
          for (let x = i * groupSize; x < (i + 1) * groupSize; x++) {
            document.querySelector(
              ".word-database"
            ).innerHTML += `<h4 class="wordie ${vocabs[x].status}">${vocabs[x].v1}</h4>`;
          }
          break;
        } else if (deed === groupSize && groupSize < 12) {
          document.querySelector(
            ".word-database"
          ).innerHTML = `<h3 style="color: #9cc771; font-size: 1.5rem;">You have finished!</h3>`;
        }
      }

      const wordlist = document.querySelectorAll(".word-database .wordie");

      wordlist.forEach((wordie) => {
        wordie.addEventListener("click", () => {
          let selectedBoolean = false;
          for (let i = 0; i < wordlist.length; i++) {
            if (wordlist[i].classList.contains("selected")) {
              wordlist[i].classList.remove("selected");
              wordie.classList.add("selected");
              selectedBoolean = true;
            }
          }

          if (!selectedBoolean) wordie.classList.add("selected");

          const isMobile = window.matchMedia("(max-width: 768px)");

          const selectedWordie = wordie.textContent;
          let inputSection = document.querySelector(".sentence-input-box");
          inputSection.style.marginBottom = "2.25rem";

          if (isMobile.matches) {
            inputSection.innerHTML = `<form>
              <input type="text" placeholder="${selectedWordie}" />
              <span class="sentence-input-border"></span>
              <label for="snt-btn"><span>SEND</span><input type="submit" name="snt-btn" id="snt-btn"/></label>
            </form>`;
          } else {
            inputSection.innerHTML = `<h4>${selectedWordie}</h4>
            <form>
              <input type="text" placeholder="enter your sentence here" />
              <span class="sentence-input-border"></span>
              <label for="snt-btn"><span>SEND</span><input type="submit" name="snt-btn" id="snt-btn"/></label>
            </form>`;
          }

          inputSection
            .querySelector("form")
            .addEventListener("submit", async function (event) {
              event.preventDefault();

              const sentenceEntered = inputSection.querySelector("input").value;
              let fakeWordie = vocabs.find((x) => x.v1 === selectedWordie);

              if (sentenceEntered.trim() === "") {
                if (isMobile.matches) {
                  inputSection.querySelector("input").placeholder =
                    "Empty entry!";
                } else {
                  inputSection.querySelector("input").placeholder =
                    "You can not send an empty entry!";
                }
                inputSection.querySelector("input").focus();
                document.querySelector(
                  ".sentence-input-border"
                ).style.backgroundColor = "#b7410e";
              } else if (
                !sentenceEntered.includes(fakeWordie.v2) &&
                !sentenceEntered.includes("was") &&
                !sentenceEntered.includes("were")
              ) {
                if (isMobile.matches) {
                  inputSection.querySelector(
                    "input"
                  ).placeholder = `Wrong v2 of ${selectedWordie}!`;
                } else {
                  inputSection.querySelector(
                    "input"
                  ).placeholder = `The v2 of ${selectedWordie} is wrong!`;
                }
                inputSection.querySelector("input").value = "";
                inputSection.querySelector("input").focus();
                document.querySelector(
                  ".sentence-input-border"
                ).style.backgroundColor = "#b7410e";
              } else {
                const data = {
                  word: selectedWordie,
                  sentence: sentenceEntered,
                  pushedDate: new Date().toISOString(),
                };

                console.log("Sending data:", data);

                try {
                  const response = await fetch(
                    "https://undefined-xxrn.onrender.com/createdsentences",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    }
                  );

                  const result = await response.json();
                  console.log("Server response:", result);

                  fetch("/irregularlist/" + fakeWordie._id, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      status: "done",
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => console.log("Update response:", data))
                    .catch((err) => console.error("Error:", err));

                  await getWordBase();
                  inputSection.innerHTML = "";
                  getSentences();
                } catch (error) {
                  console.error("Error:", error);
                }
              }
            });
        });
      });
    });
}

getWordBase();

getSentences();

const radios = document.querySelectorAll('input[name="language"]');

radios.forEach((radio) => {
  radio.addEventListener("change", function () {
    document.querySelector(".dropdown-menu-selected span").textContent =
      this.classList[0];
  });
});

document
  .querySelector(".translate-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const text = document.getElementById("text").value;
      const language = Array.from(radios).find((radio) => radio.checked)?.value;
      const targetLang = "EN";

      const response = await fetch("/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language, targetLang }),
      });

      const translatedText = await response.text();
      let languageStr;
      let definitionTR;
      let definitionGE;

      if (language === "TR") {
        languageStr = "Turkish";
        definitionTR = text;
        definitionGE = "";
      } else {
        languageStr = "German";
        definitionTR = "";
        definitionGE = text;
      }

      document.querySelector(
        ".translate-results"
      ).innerHTML = `<div style="box-shadow: rgba(0, 0, 0, 0.2) 0px 60px 40px -7px;"><h4>The word <span style="color: #b8daff">${text}</span> is translated from <span style="color: #eef5ff">${languageStr}</span> to <span style="color: #b8daff">English</span> and It means <span style="color: #fa7070">${translatedText}</span>.</h4><button>Save the word</button></div>`;

      document.getElementById("text").value = "";

      const isMobile = window.matchMedia("(max-width: 768px)");

      if (isMobile.matches) {
        document.querySelector(".app-panel").style.gridTemplateRows =
          "repeat(3, 1fr)";
        document.querySelector(".word-container").style.gridRow = "3 / 4";
      }

      const data = {
        word: translatedText,
        definitionTR: definitionTR,
        definitionGE: definitionGE,
        pushedDate: new Date(),
      };

      let rsltBtn = document.querySelector(".translate-results button");

      rsltBtn.addEventListener("click", () => {
        fetch("/saveInfoVocablist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        rsltBtn.style.pointerEvents = "none";
        rsltBtn.style.backgroundColor = "#9cc771";
      });
    } catch (error) {
      console.error("Error:", error);
      document.querySelector(".translate-results").innerHTML =
        "<p>Error: Translation failed. Please try again.</p>";
    }
  });
