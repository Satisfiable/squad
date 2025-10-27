const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fetch = require("node-fetch");
const schedule = require("node-schedule"); // ← add this

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ WhatsApp client is ready!");

  const groupName = "emirhan and yavuz speak english";

  // Schedule job at 23:55 every day
  schedule.scheduleJob("55 23 * * *", async () => {
    try {
      const chats = await client.getChats();
      const group = chats.find(
        (chat) => chat.isGroup && chat.name === groupName
      );

      const response = await fetch(
        "https://undefined-xxrn.onrender.com/userdata"
      );
      const userdata = await response.json();

      const user = userdata.find((u) => u.username === "ibrahim");
      if (!user) {
        console.log("User not found in API data");
        return;
      }

      const timespentday = user["total-time-spent-day"]?.[1] ?? 0;
      const questionsolvedday = user["question-solved-day"] ?? 0;
      const timespentdayFinal = Number(timespentday.split(":")[1]) || 0;
      const percentage = (
        (timespentdayFinal * 5 + questionsolvedday * 5) /
        2
      ).toFixed(1); // fixed to 1 decimal

      let message;

      if (timespentdayFinal >= 15) {
        message = `Bu bir otomatik mesajdır! 
İbrahim bugün verimli bir gün geçirdi! 😄
İbrahim bugün ${timespentdayFinal} dakika İngilizce çalıştı ve ${questionsolvedday} soru çözdü!
Başarı oranı: %${percentage}`;
      } else if (timespentdayFinal >= 10) {
        message = `Bu bir otomatik mesajdır! 
İbrahim bugün ortalama bir gün geçirdi! 😐
İbrahim bugün ${timespentdayFinal} dakika İngilizce çalıştı ve ${questionsolvedday} soru çözdü!
Başarı oranı: %${percentage}`;
      } else {
        message = `Bu bir otomatik mesajdır! 
İbrahim bugün verimsiz bir gün geçirdi! 😞
İbrahim bugün ${timespentdayFinal} dakika İngilizce çalıştı ve ${questionsolvedday} soru çözdü!
Başarı oranı: %${percentage}`;
      }

      if (group) {
        await group.sendMessage(message);
        console.log("✅ Message sent to group:", groupName);
      } else {
        console.log("❌ Group not found:", groupName);
      }
    } catch (err) {
      console.error("⚠️ Error:", err);
    }
  });
});

client.initialize();
