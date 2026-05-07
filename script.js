let notes = {};

// ---------- NORMALIZATION ----------
function normalizeGreek(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // αφαιρεί τόνους
    .replace(/[\u0300-\u036f]/g, "") // diacritics
    .replace(/[;,.!?]/g, "")
    .trim();
}

// ---------- LOAD NOTES ----------
fetch("notes.json")
  .then((response) => response.json())
  .then((data) => {
    notes = data;
    console.log("Notes loaded successfully");
  })
  .catch((error) => {
    console.error("Error loading notes:", error);
  });

// ---------- SEND MESSAGE ----------
function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();

  if (!msg) return;

  addMessage("You", msg, "user");

  let reply = getBotReply(msg);

  setTimeout(() => {
    addMessage("Bot", reply, "bot");
  }, 400);

  input.value = "";
}

// ---------- ADD MESSAGE TO CHAT ----------
function addMessage(sender, text, className) {
  let chatbox = document.getElementById("chatbox");

  let div = document.createElement("div");
  div.className = "message " + className;
  div.innerHTML = `<b>${sender}:</b> ${text}`;

  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// ---------- BOT LOGIC ----------
function getBotReply(msg) {
  msg = normalizeGreek(msg);

  // safety check
  if (!notes || Object.keys(notes).length === 0) {
    return "Φόρτωση σημειώσεων... δοκίμασε ξανά σε λίγο.";
  }

  let bestMatch = null;
  let bestScore = 0;

  const msgWords = msg.split(" ");

  for (const question in notes) {
    const normalizedQuestion = normalizeGreek(question);
    const questionWords = normalizedQuestion.split(" ");

    let score = 0;

    // scoring based on word overlap
    for (const w of questionWords) {
      if (msgWords.includes(w)) {
        score++;
      }
    }

    // bonus: substring match (ελαφρύ boost)
    if (normalizedQuestion.includes(msg)) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = question;
    }
  }

  // ---------- RESPONSE ----------
  if (bestScore > 0 && bestMatch) {
    return notes[bestMatch];
  }

  return `Δεν βρήκα σχετική απάντηση στις σημειώσεις.

Δοκίμασε:
- πιο απλή ερώτηση
- λέξεις όπως "τι είναι", "εξήγησε", "ορισμός"`;
}

// ---------- OPTIONAL: ENTER KEY SUPPORT ----------
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userInput");

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
