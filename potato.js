/* =========================
   Helpers
========================= */

const enc = new TextEncoder();
const dec = new TextDecoder();

function normalize(s) {
  return s.trim().toLowerCase();
}

function buildKey(answer) {
  let k = answer;
  while (k.length < 16) k += "-";
  return k.slice(0, 16);
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function importKey(answer) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(buildKey(answer)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
}

async function decrypt(dataB64, ivB64, answer) {
  const key = await importKey(answer);
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    data
  );

  return dec.decode(plain);
}

/* =========================
   LocalStorage (Option 2)
========================= */

function saveStep() {
  localStorage.setItem("pongal_step", step.toString());
}

function loadStep() {
  const s = localStorage.getItem("pongal_step");
  return s ? parseInt(s, 10) : 0;
}

function resetProgress() {
  localStorage.removeItem("pongal_step");
}

/* =========================
   DATA (PLACEHOLDER)
========================= */

const STEPS = [
  
  {
    question: "PLACEHOLDER QUESTION 1",
    hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
  },

  
  {
    hash: "06d4d6e9d447d29e531ca78bcd7b8770db4b3ce449ec8278aaf24350ebbcc2ed",
    data: "KQ8wMIu8SjaVguGbc73dgZDvY70Ctwmq",
    iv: "9Kc2aQYqYg7py56P"
  },

  {
    hash: "8a798890fe93817163b10b5f7bd2ca4d25d84c52739a645a889c173eee7d9d3d",
    data: "/rpikqNioMrU61Wy300Z4SCrXDKIhyc1huB2kIgO2vxCLvbwL4R+tVc=",
    iv: "0RT/XvUmI8JwCFFN"
  },

  
  {
    final: true,
    data: "2F83UY9K++XlHW1uSqpvVvbXWFOynSQtWIJeZ4cKRG/Onr0fVkCd",
    iv: "3OVGWOBY6tUjzPI8"
  }
];


/* =========================
   State
========================= */

let step = loadStep();
let lastAnswer = null;

const qa = document.getElementById("qa");
const input = document.getElementById("answer");
const feedback = document.getElementById("feedback");

/* =========================
   Init
========================= */

appendQuestion(STEPS[0].question);

for (let i = 1; i <= step; i++) {
  appendQuestion("✔ Completed");
}

/* =========================
   UI
========================= */

function appendQuestion(text) {
  const div = document.createElement("div");
  div.className = "question";
  div.innerText = text;
  qa.appendChild(div);
}

/* =========================
   Submit
========================= */

async function submitAnswer() {
  const ans = normalize(input.value);
  if (!ans) return;

  const expectedHash = STEPS[step].hash;
  const actualHash = await sha256Hex(ans);

  if (actualHash !== expectedHash) {
    feedback.innerText = "Wrong.";
    return;
  }

  feedback.innerText = "Correct.";
  input.value = "";

  lastAnswer = ans;
  step++;
  saveStep();

  const next = STEPS[step];

  try {
    if (next.final) {
      const reveal = await decrypt(next.data, next.iv, lastAnswer);
      appendQuestion(reveal);
      resetProgress();
      input.remove();
      document.querySelector("button").remove();
      return;
    }

    const q = await decrypt(next.data, next.iv, lastAnswer);
    appendQuestion(q);

  } catch (e) {
    console.error(e);
    feedback.innerText = "Decryption failed.";
  }
}
