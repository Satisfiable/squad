const https = require("https");
const querystring = require("querystring");

const API_KEY = "d881c7f0-3617-42c3-8028-d15bd93ff265:fx";

function translateWord(text, sourceLang, targetLang) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      auth_key: API_KEY,
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
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

module.exports = { translateWord };
