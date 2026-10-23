const projects = [
  {
    title: "Python Programs Collection",
    description: "A set of Python programs covering factorial, Fibonacci, and converting a structure to a dictionary.",
    tech: ["Python"],
    github: "https://github.com/asharma22739-commits/python-programs",
    live: "",
  },
  {
    title: "Messy Python Code Improvement",
    description: "A messy Python script refactored and cleaned up with AI assistance.",
    tech: ["Python", "AI"],
    github: "https://github.com/asharma22739-commits/messy-code-improvement",
    live: "",
  },
  {
    title: "Bug Fixing Using Cursor AI",
    description: "A buggy program diagnosed and fixed using Cursor AI.",
    tech: ["Python", "Cursor AI"],
    github: "https://github.com/asharma22739-commits/bug-fixing-cursor",
    live: "",
  },
  {
    title: "Interactive Quiz Application",
    description: "An interactive quiz built with HTML, CSS, and JavaScript.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/asharma22739-commits",
    live: "https://quiz-6ensgl1b5-ayush-kr1.vercel.app/",
  },
  {
    title: "Book Reading List Application",
    description: "A book reading app where you can add books to a reading list.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/asharma22739-commits",
    live: "https://reading-list-app-ten.vercel.app/",
  },
];

const projectList = document.getElementById("project-list");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("theme-toggle");
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.querySelector(".nav-links");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderProjects(list) {
  if (!list.length) {
    projectList.innerHTML = "<p>No projects found</p>";
    return;
  }

  projectList.innerHTML = list
    .map((project) => {
      const tech = project.tech.map((item) => `<span>${escapeHtml(item)}</span>`).join(" ");
      const liveButton = project.live
        ? `<a href="${escapeHtml(project.live)}" target="_blank" rel="noopener">Live</a>`
        : "";

      return `
        <article>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <p>${tech}</p>
          <p>
            <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener">GitHub</a>
            ${liveButton}
          </p>
        </article>
      `;
    })
    .join("");
}

function filterProjects(query) {
  const term = query.trim().toLowerCase();
  if (!term) return projects;

  return projects.filter((project) => {
    const haystack = [project.title, project.description, ...project.tech]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "Light" : "Dark";
}

function addChatMessage(text, className) {
  const bubble = document.createElement("div");
  bubble.className = className;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

async function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage(message, "user");
  chatInput.value = "";

  const typing = addChatMessage("typing...", "bot");
  chatSend.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();
    typing.textContent = data.reply;
  } catch (error) {
    typing.textContent = "Sorry, something went wrong. Please try again later.";
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
}

searchInput.addEventListener("input", () => {
  renderProjects(filterProjects(searchInput.value));
});

themeToggle.addEventListener("click", () => {
  applyTheme(!document.body.classList.contains("dark"));
});

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

chatSend.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendChatMessage();
});

applyTheme(localStorage.getItem("theme") === "dark");
renderProjects(projects);
