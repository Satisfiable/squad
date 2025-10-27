document
  .getElementById("quiz-main-panel-button")
  .addEventListener("click", () => {
    const panelbtn = document.getElementById("quiz-main-panel-button");
    panelbtn.style.pointerEvents = "none";
    panelbtn.style.cursor = "auto";
    panelbtn.classList.add("clicked");
    panelbtn.textContent = "NEXT QUESTION";

    let randomNum = Math.random();
    let question_count = 0;

    if (randomNum < 0.5) {
      fetch("https://ibrahimingilizceogreniyor.online/irregularlist")
        .then((response) => response.json())
        .then((vocabs) => {
          let randomIndexAnswer = Math.floor(Math.random() * vocabs.length);
          const word = vocabs[randomIndexAnswer];
          let optionList = [vocabs[randomIndexAnswer].v2];
          let storedIndexes = [];
          let query;

          if (word.v1.endsWith("e")) {
            optionList.push(vocabs[randomIndexAnswer].v1 + "d");
          } else {
            optionList.push(vocabs[randomIndexAnswer].v1 + "ed");
          }

          if (word.v2.endsWith("ed")) {
            query = 2;
          } else if (word.v2.endsWith("e")) {
            query = 1;
            optionList.push(vocabs[randomIndexAnswer].v2 + "d");
          } else {
            query = 1;
            optionList.push(vocabs[randomIndexAnswer].v2 + "ed");
          }

          for (let i = 0; i < query; i++) {
            let randomIndexOption = Math.floor(Math.random() * vocabs.length);
            if (randomIndexOption === randomIndexAnswer) {
              i--;
            } else if (storedIndexes.includes(randomIndexOption)) {
              i--;
            } else {
              optionList.push(vocabs[randomIndexOption].v2);
              storedIndexes.push(randomIndexOption);
            }
          }

          function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1)); // random index
              [array[i], array[j]] = [array[j], array[i]]; // swap
            }
            return array;
          }

          optionList = shuffle(optionList);

          const html = `<h3 class="quiz-main-question-stem">
          What is the past tense form of <span class="quiz-main-question-stem-keyword">${word.v1}</span>?
        </h3>
        <div class="quiz-main-question-optionlist">
          <label for="quiz-main-question-optionlist-option-a"
            ><input
              value="0"
              type="checkbox"
              id="quiz-main-question-optionlist-option-a"
              class="quiz-main-question-optionlist-option"
            />${optionList[0]}</label
          >

          <label for="quiz-main-question-optionlist-option-b"
            ><input
              value="1"
              type="checkbox"
              id="quiz-main-question-optionlist-option-b"
              class="quiz-main-question-optionlist-option"
            />${optionList[1]}</label
          >
          <label for="quiz-main-question-optionlist-option-c"
            ><input
              value="2"
              type="checkbox"
              id="quiz-main-question-optionlist-option-c"
              class="quiz-main-question-optionlist-option"
            />${optionList[2]}</label
          >
          <label for="quiz-main-question-optionlist-option-d"
            ><input
              value="3"
              type="checkbox"
              id="quiz-main-question-optionlist-option-d"
              class="quiz-main-question-optionlist-option"
            />${optionList[3]}</label
          >
        </div>`;

          document.querySelectorAll(".quiz-main-question")[0].innerHTML = html;

          const options = document.querySelectorAll(
            ".quiz-main-question-optionlist-option"
          );

          options.forEach((option) => {
            option.addEventListener("change", async () => {
              options.forEach((x) => {
                x.style.pointerEvents = "none";
                x.disabled = true;
                document
                  .querySelectorAll(".quiz-main-question-optionlist label")
                  .forEach((element) => {
                    element.classList.add("selected");
                    element.style.cursor = "auto";
                  });
              });

              const selectedOptionIndex = Array.from(options).findIndex(
                (opt) => opt.checked
              );

              let correctIndex = optionList.findIndex((x) => x === word.v2);

              if (optionList[selectedOptionIndex] === word.v2) {
                document
                  .querySelectorAll(".quiz-main-question-optionlist label")
                  [selectedOptionIndex].classList.add("correct");
                document.querySelectorAll(
                  ".quiz-main-question-optionlist label"
                )[correctIndex].style.color = "#9cc771";
              } else {
                document
                  .querySelectorAll(".quiz-main-question-optionlist label")
                  [correctIndex].classList.add("correct");
                document.querySelectorAll(
                  ".quiz-main-question-optionlist label"
                )[correctIndex].style.color = "#9cc771";

                document
                  .querySelectorAll(".quiz-main-question-optionlist label")
                  [selectedOptionIndex].classList.add("wrong");
                document.querySelectorAll(
                  ".quiz-main-question-optionlist label"
                )[selectedOptionIndex].style.color = "#fa7070";
              }

              const html = `<a href="irregular-pattern.html"><div class="quiz-main-question-irregular">
          <div class="quiz-main-question-irregular-line">${word.v1}</div>
          <div class="quiz-main-question-irregular-line">${word.v2}</div>
          <div class="quiz-main-question-irregular-line">${word.v3}</div>
        </div></a>`;

              document.querySelectorAll(".quiz-main-question")[0].innerHTML +=
                html;

              question_count++;

              const data = {
                keyword: word.v1,
                correctChoice: word.v2,
                selectedChoice: optionList[selectedOptionIndex],
                type: "irregular",
                username: localStorage.getItem("username"),
                lastSignIn: localStorage.getItem("lastSignIn"),
                terminal: new Date().toISOString(),
              };

              console.log("Sending data:", data); // Log the data being sent

              try {
                const response = await fetch(
                  "https://ibrahimingilizceogreniyor.online/questionlist",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  }
                );

                const result = await response.json();
                console.log("Server response:", result); // Log the server response

                panelbtn.style.pointerEvents = "auto";
                panelbtn.style.cursor = "pointer";
              } catch (error) {
                console.error("Error:", error);
              }
            });
          });
        });
    } else {
      fetch("https://ibrahimingilizceogreniyor.online/vocablist")
        .then((response) => response.json())
        .then((vocabs) => {
          fetch("https://ibrahimingilizceogreniyor.online/irregularlist")
            .then((response) => response.json())
            .then((x) => {
              vocabs = vocabs.concat(x);
              let randomIndexAnswer = Math.floor(Math.random() * vocabs.length);
              const word = vocabs[randomIndexAnswer];
              let optionList = [vocabs[randomIndexAnswer].definitionTR];
              let storedIndexes = [];

              for (let i = 0; i < 3; i++) {
                let randomIndexOption = Math.floor(
                  Math.random() * vocabs.length
                );
                if (randomIndexOption === randomIndexAnswer) {
                  i--;
                } else if (storedIndexes.includes(randomIndexOption)) {
                  i--;
                } else {
                  optionList.push(vocabs[randomIndexOption].definitionTR);
                  storedIndexes.push(randomIndexOption);
                }
              }

              function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1)); // random index
                  [array[i], array[j]] = [array[j], array[i]]; // swap
                }
                return array;
              }

              optionList = shuffle(optionList);

              const html = `<h3 class="quiz-main-question-stem">
          What does
          <span class="quiz-main-question-stem-keyword">${
            word.word || word.v1
          }</span> mean?
        </h3>
        <div class="quiz-main-question-optionlist">
          <label for="quiz-main-question-optionlist-option-a"
            ><input
              value="0"
              type="checkbox"
              id="quiz-main-question-optionlist-option-a"
              class="quiz-main-question-optionlist-option"
            />${optionList[0]}</label
          >

          <label for="quiz-main-question-optionlist-option-b"
            ><input
              value="1"
              type="checkbox"
              id="quiz-main-question-optionlist-option-b"
              class="quiz-main-question-optionlist-option"
            />${optionList[1]}</label
          >
          <label for="quiz-main-question-optionlist-option-c"
            ><input
              value="2"
              type="checkbox"
              id="quiz-main-question-optionlist-option-c"
              class="quiz-main-question-optionlist-option"
            />${optionList[2]}</label
          >
          <label for="quiz-main-question-optionlist-option-d"
            ><input
              value="3"
              type="checkbox"
              id="quiz-main-question-optionlist-option-d"
              class="quiz-main-question-optionlist-option"
            />${optionList[3]}</label
          >
        </div>`;

              document.querySelectorAll(".quiz-main-question")[0].innerHTML =
                html;

              const options = document.querySelectorAll(
                ".quiz-main-question-optionlist-option"
              );

              options.forEach((option) => {
                option.addEventListener("change", async () => {
                  options.forEach((x) => {
                    x.style.pointerEvents = "none";
                    x.disabled = true;
                    document
                      .querySelectorAll(".quiz-main-question-optionlist label")
                      .forEach((element) => {
                        element.classList.add("selected");
                        element.style.cursor = "auto";
                      });
                  });

                  const selectedOptionIndex = Array.from(options).findIndex(
                    (opt) => opt.checked
                  );

                  let correctIndex = optionList.findIndex(
                    (x) => x === word.definitionTR
                  );

                  if (optionList[selectedOptionIndex] === word.definitionTR) {
                    document
                      .querySelectorAll(".quiz-main-question-optionlist label")
                      [selectedOptionIndex].classList.add("correct");
                    document.querySelectorAll(
                      ".quiz-main-question-optionlist label"
                    )[correctIndex].style.color = "#9cc771";
                  } else {
                    document
                      .querySelectorAll(".quiz-main-question-optionlist label")
                      [correctIndex].classList.add("correct");
                    document.querySelectorAll(
                      ".quiz-main-question-optionlist label"
                    )[correctIndex].style.color = "#9cc771";

                    document
                      .querySelectorAll(".quiz-main-question-optionlist label")
                      [selectedOptionIndex].classList.add("wrong");
                    document.querySelectorAll(
                      ".quiz-main-question-optionlist label"
                    )[selectedOptionIndex].style.color = "#fa7070";
                  }

                  question_count++;

                  const data = {
                    keyword: word.word || word.v1,
                    correctChoice: word.definitionTR,
                    selectedChoice: optionList[selectedOptionIndex],
                    type: "vocab",
                  };

                  console.log("Sending data:", data); // Log the data being sent

                  try {
                    const response = await fetch(
                      "https://ibrahimingilizceogreniyor.online/questionlist",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                      }
                    );

                    const result = await response.json();
                    console.log("Server response:", result); // Log the server response

                    panelbtn.style.pointerEvents = "auto";
                    panelbtn.style.cursor = "pointer";
                  } catch (error) {
                    console.error("Error:", error);
                  }
                });
              });
            });
        });
    }

    fetch("https://ibrahimingilizceogreniyor.online/questionlist")
      .then((response) => response.json())
      .then((questions) => {
        document.querySelector(".quiz-main-nav div").innerHTML = `<p>
          Answered questions so far:
          <span class="quiz-main-nav-count">${questions.length}</span>
      </p><a href="/main.html">Vocablist!</a><a href="irregular-pattern.html" style="margin-left: 10px; color: #00558c">PATTERNS..!</a>
`;

        document.querySelector(".quiz-main-dashboard-container").style.display =
          "block";

        let x = 0;
        let y = 0;

        for (let i = 0; x + y < questions.length; i++) {
          if (questions[i].correctChoice === questions[i].selectedChoice) {
            x++;
          } else {
            y++;
          }
          document.querySelector(
            ".quiz-main-dashboard-container"
          ).innerHTML = `<div class="quiz-main-dashboard">
            <p>Number of <span>correct</span> answers: <span>${x}</span></p>
            <p>Number of <span>wrong</span> answers: <span>${y}</span></p>
        </div>`;
        }

        const quizSide = document.querySelector(".quiz-side");
        quizSide.innerHTML = `<div class="quiz-side-nav"><h2>Latest Questions</h2></div>
`;
        document.querySelector(".quiz-side-nav").style.display = "flex";

        for (let i = questions.length - 1; i > questions.length - 5; i--) {
          if (i < 0) break; // Safety check

          // Check question type
          const questionType = questions[i].type;
          const isVocabQuestion = questionType === "vocab";

          if (isVocabQuestion) {
            if (questions[i].correctChoice === questions[i].selectedChoice) {
              let html = `<div class="quiz-side-question"><div class="quiz-side-question-stem-container">
        <h3 class="quiz-side-question-stem">
          What does
          <span class="quiz-side-question-stem-keyword">${questions[i].keyword}</span> mean?
        </h3></div>
        <div class="quiz-side-question-optionlist">
          <p class="correct">${questions[i].correctChoice}</p>
        </div>
      </div>`;
              quizSide.innerHTML += html;

              const questionIndex = questions.length - i - 1;
              const optionList = document.querySelectorAll(
                ".quiz-side-question-optionlist"
              )[questionIndex];
              if (optionList) {
                optionList.style.gridTemplateColumns = "1fr";

                const firstOption = document.querySelectorAll(
                  ".quiz-side-question-optionlist p:nth-of-type(1)"
                )[questionIndex];

                if (firstOption) {
                  firstOption.style.margin = "0";
                  firstOption.style.textAlign = "center";
                }
              }
            } else {
              let html = `<div class="quiz-side-question">
        <div class="quiz-side-question-stem-container"><h3 class="quiz-side-question-stem">
          What does
          <span class="quiz-side-question-stem-keyword">${questions[i].keyword}</span> mean?
        </h3></div>
        <div class="quiz-side-question-optionlist">
          <p class="correct">${questions[i].correctChoice}</p>
          <p class="wrong">${questions[i].selectedChoice}</p>
        </div>
      </div>`;
              quizSide.innerHTML += html;
            }
          } else {
            // This is an irregular verb question
            if (questions[i].correctChoice === questions[i].selectedChoice) {
              let html = `<div class="quiz-side-question">
              <div class="quiz-side-question-stem-container"><h3 class="quiz-side-question-stem">
                What is the past form of <span class="quiz-side-question-stem-keyword">${questions[i].keyword}</span>?
              </h3></div>
              <div class="quiz-side-question-optionlist">
                <p class="correct">${questions[i].correctChoice}</p>
              </div>
            </div>`;
              quizSide.innerHTML += html;

              const questionIndex = questions.length - i - 1;
              const optionList = document.querySelectorAll(
                ".quiz-side-question-optionlist"
              )[questionIndex];
              if (optionList) {
                optionList.style.gridTemplateColumns = "1fr";

                const firstOption = document.querySelectorAll(
                  ".quiz-side-question-optionlist p:nth-of-type(1)"
                )[questionIndex];

                if (firstOption) {
                  firstOption.style.margin = "0";
                  firstOption.style.textAlign = "center";
                }
              }
            } else {
              let html = `<div class="quiz-side-question">
        <div class="quiz-side-question-stem-container"><h3 class="quiz-side-question-stem">
          What is the past tense form of <span class="quiz-side-question-stem-keyword">${questions[i].keyword}</span>?
        </h3></div>
        <div class="quiz-side-question-optionlist">
          <p class="correct">${questions[i].correctChoice}</p>
          <p class="wrong">${questions[i].selectedChoice}</p>
        </div>
      </div>`;
              quizSide.innerHTML += html;
            }
          }
        }
      });
  });
