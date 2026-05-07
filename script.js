function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[;,.!?]/g, "")
    .trim();
}

function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (!msg) return;

  addMessage("You", msg, "user");

  let reply = getBotReply(msg.toLowerCase());

  setTimeout(() => {
    addMessage("Bot", reply, "bot");
  }, 500);

  input.value = "";
}

function addMessage(sender, text, className) {
  let chatbox = document.getElementById("chatbox");
  let div = document.createElement("div");
  div.className = "message " + className;
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

let notes = {};

// Φόρτωση αρχείου notes.json (ή notes-part2.json)
fetch("notes.json")
  .then((response) => response.json())
  .then((data) => {
    notes = data;
  })
  .catch((error) => console.error("Σφάλμα φόρτωσης των σημειώσεων:", error));

function getBotReply(msg) {
  msg = normalizeGreek(msg);
  let bestMatch = "";
  let bestScore = 0;

  // Αναζήτηση μέσα στις ερωτήσεις από το notes.json
  for (const question in notes) {
    const words = normalize(question).split(" ");
    let score = 0;

    for (const w of words) {
      if (msg.includes(w)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = question;
    }
  }

  if (bestScore > 0) {
    return notes[bestMatch];
  } else {
    return "Δεν βρήκα σχετική απάντηση στις σημειώσεις. Δοκίμασε άλλη διατύπωση 🙂";
  }
}
