let notes = [];
let fuse;

// ---------------- LOAD CHAPTER ----------------

async function loadChapter() {

  const chapterPath =
    document.getElementById(
      "chapterSelect"
    ).value;

  try {

    const response =
      await fetch(chapterPath);

    notes = await response.json();

    fuse = new Fuse(notes, {
      keys: ["question", "answer"],
      threshold: 0.45,
      includeScore: true,
    });

    document.getElementById(
      "chatbox"
    ).innerHTML = "";

    addMessage(
      "Bot",
      "Φορτώθηκε το κεφάλαιο. Ρώτησέ με κάτι 😊",
      "bot"
    );

  } catch (error) {

    console.error(error);

    addMessage(
      "Bot",
      "Σφάλμα φόρτωσης σημειώσεων.",
      "bot"
    );
  }
}

// ---------------- SEND MESSAGE ----------------

function sendMessage(mode = "answer") {

  const input =
    document.getElementById(
      "userInput"
    );

  const msg = input.value.trim();

  if (!msg) return;

  addMessage("You", msg, "user");

  const reply =
    getBotReply(msg, mode);

  setTimeout(() => {

    addMessage(
      "Bot",
      reply,
      "bot"
    );

  }, 300);

  input.value = "";
}

// ---------------- BOT LOGIC ----------------

function getBotReply(
  msg,
  mode = "answer"
) {

  if (!fuse) {

    return `
      Δεν έχουν φορτωθεί
      οι σημειώσεις.
    `;
  }

  const results =
    fuse.search(msg);

  if (results.length === 0) {

    return `
      Δεν βρήκα σχετική απάντηση.

      Δοκίμασε λέξεις όπως:
      - σφάλμα
      - ευστάθεια
      - cancellation
      - αριθμός μηχανής
    `;
  }

  const best =
    results[0].item;

  // ---------- HINT ----------

  if (mode === "hint") {

    return `
      <b>Hint:</b><br><br>
      ${best.hint}
    `;
  }

  // ---------- STEPS ----------

  if (mode === "steps") {

    return `
      <b>Βήμα-βήμα:</b>

      <ol>
        ${best.steps
          .map(
            step =>
            `<li>${step}</li>`
          )
          .join("")}
      </ol>
    `;
  }

  // ---------- ANSWER ----------

  return `
    <b>${best.question}</b>

    <br><br>

    ${best.answer}

    <br><br>

    <i>${best.feedback}</i>
  `;
}

// ---------------- ADD MESSAGE ----------------

function addMessage(
  sender,
  text,
  className
) {

  const chatbox =
    document.getElementById(
      "chatbox"
    );

  const div =
    document.createElement("div");

  div.className =
    "message " + className;

  div.innerHTML =
    `<b>${sender}:</b> ${text}`;

  chatbox.appendChild(div);

  // MathJax rendering
  if (window.MathJax) {
    MathJax.typesetPromise([div]);
  }

  chatbox.scrollTop =
    chatbox.scrollHeight;
}
// ---------------- ENTER KEY ----------------

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadChapter();

    const input =
      document.getElementById(
        "userInput"
      );

    input.addEventListener(
      "keypress",
      function (e) {

        if (e.key === "Enter") {

          sendMessage();
        }
      }
    );
  }
);
