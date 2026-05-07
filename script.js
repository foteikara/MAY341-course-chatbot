let notes = [];
let fuse = null;

// ---------------- LOAD CHAPTER ----------------

async function loadChapter() {
  const chapterSelect = document.getElementById("chapterSelect");
  const chapterPath = chapterSelect.value;
  const chatbox = document.getElementById("chatbox");

  chatbox.innerHTML = "";

  try {
    const response = await fetch(chapterPath);

    if (!response.ok) {
      throw new Error("Could not load notes file");
    }

    notes = await response.json();

    fuse = new Fuse(notes, {
      keys: [
        "question",
        "aliases",
        "keywords",
        "answer",
        "hint"
      ],
      threshold: 0.65,
      includeScore: true
    });

    addMessage(
      "Bot",
      "Φορτώθηκε το κεφάλαιο. Ρώτησέ με κάτι 😊",
      "bot"
    );

  } catch (error) {
    console.error(error);

    addMessage(
      "Bot",
      "Δεν μπόρεσα να φορτώσω τις σημειώσεις. Έλεγξε ότι υπάρχει το αρχείο notes/chapter_rounding.json.",
      "bot"
    );
  }
}

// ---------------- SEND MESSAGE ----------------

function sendMessage(mode = "answer") {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();

  if (!msg) return;

  addMessage("You", msg, "user");

  const reply = getBotReply(msg, mode);

  addMessage("Bot", reply, "bot");

  input.value = "";
}

// ---------------- BOT LOGIC ----------------

function getBotReply(msg, mode = "answer") {
  if (!fuse) {
    return "Οι σημειώσεις δεν έχουν φορτωθεί ακόμα.";
  }

  const results = fuse.search(msg);

  if (results.length === 0) {
    return `
      Δεν βρήκα σχετική απάντηση.<br><br>
      Δοκίμασε λέξεις όπως:
      <ul>
        <li>σφάλμα</li>
        <li>στρογγύλευση</li>
        <li>αριθμός μηχανής</li>
        <li>ευστάθεια</li>
        <li>cancellation</li>
      </ul>
    `;
  }

  const best = results[0].item;

  if (mode === "hint") {
    return `
      <b>Hint:</b><br><br>
      ${best.hint || "Σκέψου τον βασικό ορισμό της έννοιας."}
    `;
  }

  if (mode === "steps") {
    if (!best.steps || best.steps.length === 0) {
      return best.answer;
    }

    return `
      <b>Βήμα-βήμα:</b>
      <ol>
        ${best.steps.map(step => `<li>${step}</li>`).join("")}
      </ol>
    `;
  }

  return `
    <b>${best.question}</b><br><br>
    ${best.answer}<br><br>
    <i>${best.feedback || ""}</i>
  `;
}

// ---------------- ADD MESSAGE ----------------

function addMessage(sender, text, className) {
  const chatbox = document.getElementById("chatbox");

  const div = document.createElement("div");
  div.className = "message " + className;

  div.innerHTML = `<b>${sender}:</b> ${text}`;

  chatbox.appendChild(div);

  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise([div]);
  }

  chatbox.scrollTop = chatbox.scrollHeight;
}

// ---------------- ENTER KEY ----------------

document.addEventListener("DOMContentLoaded", () => {
  loadChapter();

  const input = document.getElementById("userInput");

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage("answer");
    }
  });
});
