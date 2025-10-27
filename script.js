"use strict";

let socket;
let reconnectInterval = 2000;
const baseUrl = location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://ibrahimingilizceogreniyor.online";

function connectWebSocket() {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    return;
  }

  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}`);

  socket.addEventListener("open", () => {
    console.log("✅ WebSocket connected");
    socket.send(JSON.stringify({ type: "user_connected" }));
  });

  socket.addEventListener("close", () => {
    console.warn("⚠️ WebSocket disconnected. Reconnecting in 2 seconds...");
    setTimeout(connectWebSocket, reconnectInterval);
  });

  socket.addEventListener("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
    socket.close();
  });

  window.addEventListener("beforeunload", () => {
    socket.send(JSON.stringify({ type: "user_disconnected" }));
    socket.close();
  });
}

connectWebSocket();

fetch(`${baseUrl}/userdata`)
  .then((response) => response.json())
  .then((users) => {
    const username = localStorage.getItem("username");
    const matchedUser = users.find((visitor) => visitor.username === username);

    if (matchedUser) {
      let html = `
        <form id="splash-screen-form">
          <div class="splash-screen-form-item splash-screen-form-item-formatted">
            <h2>Welcome back,<br>${username}!</h2>
          </div>

          <div class="splash-screen-form-item">
            <label for="password">
              <img src="img/fish.png" alt="icon" style="transform: rotate(15deg)" />
            </label>
            <input type="password" id="password" name="password" placeholder="şifre" required />
          </div>

          <button class="splash-screen-form-item" type="submit">Giriş Yap</button>
        </form>
      `;

      let splashForm = document.getElementById("splash-screen-form-container");
      splashForm.innerHTML = html;

      document.getElementById("password").focus();

      window.localStorage.setItem("username-available", "1");

      addFormListener();
    } else {
      window.localStorage.setItem("username-available", "0");
      document.getElementById("username").focus();

      addFormListener();
    }
  })
  .catch((err) => {
    console.error("Error loading user data:", err);
  });

function addFormListener() {
  const form = document.getElementById("splash-screen-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const passwordInput = document.getElementById("password");
    const password = passwordInput?.value.trim();
    const storedUsername = localStorage.getItem("username");
    const usernameAvailable =
      localStorage.getItem("username-available") === "1";

    fetch(`${baseUrl}/userdata`)
      .then((response) => response.json())
      .then((users) => {
        let matchedUser;

        if (usernameAvailable) {
          matchedUser = users.find(
            (visitor) =>
              visitor.username === storedUsername &&
              visitor.password === password
          );
        } else {
          const usernameInput = document.getElementById("username");
          const username = usernameInput?.value.trim();
          matchedUser = users.find(
            (visitor) =>
              visitor.username === username && visitor.password === password
          );
        }

        if (matchedUser) {
          if (!usernameAvailable) {
            localStorage.setItem("username", matchedUser.username);
          }

          sessionStorage.setItem("isLoggedIn", true);

          if (matchedUser.username === "yavuz") {
            window.location.href = "FR_main.html";
          } else {
            window.location.href = "main.html";
          }
        } else {
          // Handle incorrect login
          document
            .querySelectorAll(".splash-screen-form-item label")
            .forEach((x) => {
              x.style.backgroundColor = "#b7410e";
            });
          document
            .querySelectorAll(".splash-screen-form-item label img")
            .forEach((x) => {
              x.style.filter = "brightness(0) invert(1)";
            });
          document
            .querySelectorAll(".splash-screen-form-item")
            .forEach((item) => {
              item.classList.add("error");
            });

          document.getElementById("password").value = "";
        }
      })
      .catch((err) => {
        console.error("Error loading user data:", err);
      });
  });
}

document
  .querySelector(".splash-screen-form-preliminary h3")
  .addEventListener("click", () => {
    document.querySelector("#splash-screen-title h1").style.display = "flex";
    document.querySelector("#splash-screen-form").style.display = "flex";
    document.querySelector(".splash-screen-dashboard").style.display = "none";
  });

document
  .querySelectorAll(".splash-screen-dashboard-menu-option")
  .forEach((x) => {
    x.addEventListener("click", () => {
      document
        .querySelector(".splash-screen-dashboard-menu-option-selected")
        .classList.remove("splash-screen-dashboard-menu-option-selected");
      x.classList.add("splash-screen-dashboard-menu-option-selected");

      fetch("https://undefined-xxrn.onrender.com/userdata")
        .then((response) => response.json())
        .then((users) => {
          const user = users.find((u) => u.username === "ibrahim");
          let timespentday = user["total-time-spent-day"][1];
          let timespentweek = user["total-time-spent-week"][1];
          let timespentmonth = user["total-time-spent-month"][1];
          let questionsday = user["question-solved-day"];
          let questionsweek = user["question-solved-week"];
          let questionsmonth = user["question-solved-month"];

          let homework_approval = 100;
          let timespentdayValue = Number(timespentday.split(":")[1]) || 0;
          let timespentweekValue = Number(timespentweek.split(":")[1]) || 0;
          let timespentmonthValue = Number(timespentmonth.split(":")[1]) || 0;

          let dashboard = document.querySelector(
            ".splash-screen-dashboard-data"
          );

          if (x.textContent.replace(/\s+/g, "") === "BUGÜN") {
            dashboard.innerHTML = `
        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#fff"
            stroke-width="1"
            class="circle-bg"
          />
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${timespentdayValue * 5}, 100"
            class="circle"
          />
          <text x="18" y="20.35" class="percentage">${
            timespentdayValue * 5
          }%</text>
          <text x="18" y="45" class="percentage-dc">${timespentdayValue} dk</text>
          <text x="18" y="53" class="percentage-dc">çalıştı.</text>
        </svg>

        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="#9cc771"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${homework_approval}, 100"
            class="circle"
          />
          <text x="18" y="27.35" class="percentage-appr">✔</text>
          <text x="18" y="45" class="percentage-dc">Ödevini</text>
          <text x="18" y="53" class="percentage-dc">yaptı.</text>
        </svg>

        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#fff"
            stroke-width="1"
            class="circle-bg"
          />
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${questionsday * 5}, 100"
            class="circle"
          />
          <text x="18" y="20.35" class="percentage">${questionsday * 5}%</text>
          <text x="18" y="45" class="percentage-dc">${questionsday} soru</text>
          <text x="18" y="53" class="percentage-dc">çözdü.</text>
        </svg>
        `;
          } else if (x.textContent === "BU HAFTA") {
            dashboard.innerHTML = `
        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#fff"
            stroke-width="1"
            class="circle-bg"
          />
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${(timespentweekValue * 5) / 7}, 100"
            class="circle"
          />
          <text x="18" y="20.35" class="percentage">${
            ((timespentweekValue * 5) / 7).toString().split(".")[0]
          }%</text>
          <text x="18" y="45" class="percentage-dc">${timespentweekValue} dk</text>
          <text x="18" y="53" class="percentage-dc">çalıştı.</text>        
        </svg>

        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="#9cc771"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${homework_approval}, 100"
            class="circle"
          />
          <text x="18" y="27.35" class="percentage-appr">✔</text>
          <text x="18" y="45" class="percentage-dc">Ödevini</text>
          <text x="18" y="53" class="percentage-dc">yaptı.</text>        
        </svg>

        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#fff"
            stroke-width="1"
            class="circle-bg"
          />
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${(questionsweek * 5) / 7}, 100"
            class="circle"
          />
          <text x="18" y="20.35" class="percentage">${
            ((questionsweek * 5) / 7).toString().split(".")[0]
          }%</text>
          <text x="18" y="45" class="percentage-dc">${questionsweek} soru</text>
          <text x="18" y="53" class="percentage-dc">çözdü.</text>
        </svg>
        `;
          } else if (x.textContent === "BU AY") {
            dashboard.innerHTML = `
        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#fff"
            stroke-width="1"
            class="circle-bg"
          />
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${(timespentmonthValue * 5) / 30}, 100"
            class="circle"
          />
          <text x="18" y="20.35" class="percentage">${
            ((timespentweekValue * 5) / 30).toString().split(".")[0]
          }%</text>
          <text x="18" y="45" class="percentage-dc">${timespentmonthValue} dk</text>
          <text x="18" y="53" class="percentage-dc">çalıştı.</text>          
        </svg>

        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="#9cc771"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${homework_approval}, 100"
            class="circle"
          />
          <text x="18" y="27.35" class="percentage-appr">✔</text>
          <text x="18" y="45" class="percentage-dc">Ödevini</text>
          <text x="18" y="53" class="percentage-dc">yaptı.</text>
        </svg>

        <svg class="circular-chart" viewBox="0 0 36 46">
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#fff"
            stroke-width="1"
            class="circle-bg"
          />
          <path
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#9cc771"
            stroke-width="1"
            stroke-dasharray="${(questionsmonth * 5) / 30}, 100"
            class="circle"
          />
          <text x="18" y="20.35" class="percentage">${
            ((questionsmonth * 5) / 30).toString().split(".")[0]
          }%</text>
          <text x="18" y="45" class="percentage-dc">${questionsmonth} soru</text>
          <text x="18" y="53" class="percentage-dc">çözdü.</text>
        </svg>
        `;
          }
        });
    });
  });

document.querySelector(".splash-screen-dashboard-menu-option-selected").click();
