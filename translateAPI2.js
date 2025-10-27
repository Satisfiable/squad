const https = require("https");
const querystring = require("querystring");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://satisfying432:Rd9hhfaS47tvRaAM@cluster.5yvkpu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
const DB_NAME = "userdata";
const COLLECTION_NAME = "vocablist";

const API_KEY = "d881c7f0-3617-42c3-8028-d15bd93ff265:fx";

const words = [
  { word: "Doctor", definitionTR: "Doktor" },
  { word: "Dentist", definitionTR: "Dişçi" },
  { word: "Nurse", definitionTR: "Hemşire" },
  { word: "Vet", definitionTR: "Veteriner" },
  { word: "Teacher", definitionTR: "Öğretmen" },
  { word: "Cook", definitionTR: "Aşçı" },
  { word: "Painter", definitionTR: "Boyacı" },
  { word: "Secretary", definitionTR: "Sekreter" },
  { word: "Singer", definitionTR: "Şarkıcı" },
  { word: "Butcher", definitionTR: "Kasap" },
  { word: "Farmer", definitionTR: "Çiftçi" },
  { word: "Engineer", definitionTR: "Mühendis" },
  { word: "Tailor", definitionTR: "Terzi" },
  { word: "Baker", definitionTR: "Fırıncı" },
  { word: "Pilot", definitionTR: "Pilot" },
  { word: "Hairdresser", definitionTR: "Berber" },
  { word: "Dancer", definitionTR: "Dansçı" },
  { word: "Gardener", definitionTR: "Bahçıvan" },
  { word: "Florist", definitionTR: "Çiçekçi" },
  { word: "Magician", definitionTR: "Sihirbaz" },
  { word: "Cashier", definitionTR: "Kasiyer" },
  { word: "Reporter", definitionTR: "Muhabir" },
  { word: "Artist", definitionTR: "Sanatçı" },
  { word: "Astronaut", definitionTR: "Astronot" },
  { word: "Barber", definitionTR: "Berber" },
  { word: "Soldier", definitionTR: "Asker" },
  { word: "Photographer", definitionTR: "Fotoğrafçı" },
  { word: "Postman", definitionTR: "Postacı" },
  { word: "Waiter", definitionTR: "Garson" },
  { word: "Firefighter", definitionTR: "İtfaiyeci" },
  { word: "Student", definitionTR: "Öğrenci" },
];

function translateWord(text) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      auth_key: API_KEY,
      text,
      target_lang: "DE",
    });

    const options = {
      hostname: "api-free.deepl.com",
      path: "/v2/translate",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const translated = parsed.translations?.[0]?.text;
          resolve(translated);
        } catch (error) {
          reject("Failed to parse response: " + error);
        }
      });
    });

    req.on("error", (error) => {
      reject("Request failed: " + error);
    });

    req.write(postData);
    req.end();
  });
}

(async () => {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    for (const x of words) {
      const { word, definitionTR } = x;
      const definitionGE = await translateWord(word);

      await collection.insertOne({
        word,
        definitionTR,
        definitionGE,
        pushedDate: new Date(),
      });

      console.log(`Inserted: ${word}`);
    }

    console.log("All words translated and inserted into MongoDB!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
})();
