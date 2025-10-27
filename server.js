const express = require("express");
const http = require("http");
const cors = require("cors");
const WebSocket = require("ws");
const { MongoClient } = require("mongodb");
const path = require("path");
const { type } = require("os");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://satisfying432:Rd9hhfaS47tvRaAM@cluster.5yvkpu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";

// Middleware
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB setup
let db;
let usersCollection;
let vocabCollection;
let questionCollection;
let irregularCollection;
let irPatternCollection;
let createdSentencesCollection;

MongoClient.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("✅ Connected to MongoDB");
    db = client.db("userdata");
    usersCollection = db.collection("data");
    vocabCollection = db.collection("vocablist");
    questionCollection = db.collection("questionlist");
    irregularCollection = db.collection("irregularlist");
    irPatternCollection = db.collection("irregular-pattern-list");
    createdSentencesCollection = db.collection("createdsentences");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes

// User data
app.get("/userdata", async (req, res) => {
  try {
    const data = await usersCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching userdata:", err);
    res.status(500).send("Server error");
  }
});

// Vocab list
app.get("/vocablist", async (req, res) => {
  try {
    const data = await vocabCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching vocablist:", err);
    res.status(500).send("Server error");
  }
});

// Question list
app.get("/questionlist", async (req, res) => {
  try {
    const data = await questionCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching questionlist:", err);
    res.status(500).send("Server error");
  }
});

app.post("/questionlist", async (req, res) => {
  try {
    let {
      keyword,
      correctChoice,
      selectedChoice,
      type,
      username,
      lastSignIn,
      terminal,
    } = req.body;

    const result = await questionCollection.insertOne({
      keyword,
      correctChoice,
      selectedChoice,
      type,
    });

    updateUserStats(username, lastSignIn, terminal, "question");

    res
      .status(201)
      .json({ message: "Question added", insertedId: result.insertedId });
  } catch (err) {
    console.error("Error adding question:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const { translateWord } = require("./translateAPI");
const { memo } = require("react");

app.post("/translate", async (req, res) => {
  const { language, text, targetLang } = req.body;

  try {
    const translatedText = await translateWord(text, language, targetLang);

    res.send(translatedText);
  } catch (error) {
    console.error(error);
    res.status(500).send("Translation failed: " + error.message);
  }
});

app.post("/saveInfoVocablist", async (req, res) => {
  try {
    const data = req.body;

    const result = await vocabCollection.insertOne(data);

    res.status(201).json({
      message: "Saved successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/createdsentences", async (req, res) => {
  try {
    const data = await createdSentencesCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching vocablist:", err);
    res.status(500).send("Server error");
  }
});

app.post("/createdsentences", async (req, res) => {
  try {
    const { word, sentence, pushedDate } = req.body;

    const result = await createdSentencesCollection.insertOne({
      word,
      sentence,
      pushedDate,
    });

    res
      .status(201)
      .json({ message: "Question added", insertedId: result.insertedId });
  } catch (err) {
    console.error("Error adding question:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.put("/irregularlist/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const result = await irregularCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No document found to update" });
    }

    res.json({ message: "Update successful", result });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Irregular list
app.get("/irregularlist", async (req, res) => {
  try {
    const data = await irregularCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching irregularlist:", err);
    res.status(500).send("Server error");
  }
});

app.get("/irregularPattern", async (req, res) => {
  try {
    const data = await irPatternCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching questionlist:", err);
    res.status(500).send("Server error");
  }
});

// WebSocket setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    try {
      const { action, username, lastSignIn, terminal } = JSON.parse(
        msg.toString()
      );
      if (action === "disconnect") {
        await updateUserStats(username, lastSignIn, terminal, "signout");
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });
});

async function updateUserStats(username, lastSignIn, terminal, type) {
  const user = await usersCollection.findOne({ username });

  function formatSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return [hours, minutes, remainingSeconds]
      .map((v) => String(v).padStart(2, "0"))
      .join(":");
  }

  function getISOWeekNumber(date = new Date()) {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    );
  }

  lastSignIn = new Date(lastSignIn);
  terminal = new Date(terminal);
  const summary = Math.floor((terminal - lastSignIn) / 1000);

  const updates = { $set: {} };

  if (user["total-time-spent-day"][0] === lastSignIn.getDate()) {
    const [h, m, s] = user["total-time-spent-day"][1].split(":").map(Number);
    updates.$set["total-time-spent-day.1"] = formatSecondsToTime(
      h * 3600 + m * 60 + s + summary
    );

    if (type === "question") {
      const question_count_already = user["question-solved-day"];
      updates.$set["question-solved-day"] = question_count_already + 1;
    }
  } else {
    updates.$set["total-time-spent-previous-day.0"] = lastSignIn.getDate() - 1;
    updates.$set["total-time-spent-previous-day.1"] =
      user["total-time-spent-day"][1];
    updates.$set["total-time-spent-day.0"] = lastSignIn.getDate();
    updates.$set["total-time-spent-day.1"] = formatSecondsToTime(summary);

    if (type === "question") {
      updates.$set["question-solved-day"] = 1;
    }
  }

  const week = getISOWeekNumber();
  if (user["total-time-spent-week"][0] === week) {
    const [h, m, s] = user["total-time-spent-week"][1].split(":").map(Number);
    updates.$set["total-time-spent-week.1"] = formatSecondsToTime(
      h * 3600 + m * 60 + s + summary
    );
    if (type === "question") {
      const question_count_already = user["question-solved-week"];
      updates.$set["question-solved-week"] = question_count_already + 1;
    }
  } else {
    updates.$set["total-time-spent-previous-week.0"] = week - 1;
    updates.$set["total-time-spent-previous-week.1"] =
      user["total-time-spent-week"][1];
    updates.$set["total-time-spent-week.0"] = week;
    updates.$set["total-time-spent-week.1"] = formatSecondsToTime(summary);
    if (type === "question") {
      updates.$set["question-solved-week"] = 1;
    }
  }

  if (user["total-time-spent-month"][0] === lastSignIn.getMonth() + 1) {
    const [h, m, s] = user["total-time-spent-month"][1].split(":").map(Number);
    updates.$set["total-time-spent-month.1"] = formatSecondsToTime(
      h * 3600 + m * 60 + s + summary
    );
    if (type === "question") {
      const question_count_already = user["question-solved-month"];
      updates.$set["question-solved-month"] = question_count_already + 1;
    }
  } else {
    updates.$set["total-time-spent-previous-month.0"] = lastSignIn.getMonth();
    updates.$set["total-time-spent-previous-month.1"] =
      user["total-time-spent-month"][1];
    updates.$set["total-time-spent-month.0"] = lastSignIn.getMonth() + 1;
    updates.$set["total-time-spent-month.1"] = formatSecondsToTime(summary);
    if (type === "question") {
      updates.$set["question-solved-month"] = 1;
    }
  }

  const [h, m, s] = user["total-time-spent"].split(":").map(Number);
  updates.$set["total-time-spent"] = formatSecondsToTime(
    h * 3600 + m * 60 + s + summary
  );
  updates.$set["last-sign-in-time"] = lastSignIn;

  await usersCollection.updateOne({ username }, updates);
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
