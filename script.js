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

function getBotReply(msg) {
  if (msg.includes("hello")) return "Hello! 👋 How can I help you with the course?";
  if (msg.includes("exam")) return "The exam schedule will be announced in class.";
  if (msg.includes("lecture")) return "Lectures are uploaded weekly on Moodle.";
  if (msg.includes("assignment")) return "Assignments are due every Friday.";
  if (msg.includes("teacher")) return "Your instructor will answer questions during office hours.";
  
  return "Sorry, I don't understand. Try asking about lectures, exams, or assignments.";
}
