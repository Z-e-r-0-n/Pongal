/* ================================
   CONFIG: QUESTIONS & ANSWERS
   ================================ */

const STEPS = [
  {
    question: "Pongal is celebrated to thank which natural source?",
    answer: "sun"
  },
  {
    question: "What is the Tamil name for Pongal month?",
    answer: "thai"
  },
  {
    question: "What overflows during Pongal symbolizing prosperity?",
    answer: "rice"
  },
  {
    question: "You have reached the end. See you at Pongal.",
    answer: "__no_answer__" // intentionally impossible
  }
];

/* ================================
   STATE
   ================================ */

let currentStep = 0;

/* ================================
   INIT
   ================================ */

document.getElementById("question").innerText = STEPS[0].question;

/* ================================
   HASH FUNCTION
   ================================ */

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ================================
   SUBMIT HANDLER
   ================================ */

async function submitAnswer() {
  const input = document.getElementById("answer").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");

  if (!input) {
    feedback.innerText = "Enter something.";
    return;
  }

  const expected = STEPS[currentStep].answer;

  if (expected === "__no_answer__") {
    feedback.innerText = "The journey ends here.";
    return;
  }

  const inputHash = await sha256(input);
  const expectedHash = await sha256(expected);

  if (inputHash === expectedHash) {
    currentStep++;
    document.getElementById("question").innerText =
      STEPS[currentStep].question;
    document.getElementById("answer").value = "";
    feedback.innerText = "Correct.";
  } else {
    feedback.innerText = "Not quite. Try again.";
  }
}


