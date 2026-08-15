const WA = "919828028286";
const CALL1 = "919828028286";
const CALL2 = "917425061880";

let cats = [];
let current = [];
let currentIndex = 0;

const REPO_API =
  "https://api.github.com/repos/abhishek28286/Flazzor/contents/";

const modularFolders = [
  {
    folder: "Accessories",
    title: "Accessories",
    desc: "Modular kitchen accessories and storage solutions."
  },
  {
    folder: "acrylic",
    title: "Acrylic Kitchen",
    desc: "Modern acrylic finish modular kitchen designs."
  },
  {
    folder: "laminated",
    title: "Laminated Kitchen",
    desc: "Practical and elegant laminated modular kitchen designs."
  }
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

async function loadData() {
  const r = await fetch("data.json");
  cats = await r.json();
  return cats;
}

/* Read all images directly from a GitHub folder */
async function getFolderImages(folder) {
  try {
    const url = REPO_API +
      "images/modular-kitchen/" +
      encodeURIComponent(folder);

    const r = await fetch(url);

    if (!r.ok) return [];

    const files = await r.json();

    return files
      .filter(f =>
        f.type === "file" &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base"
        })
      )
      .map(f => ({
        src: f.download_url,
        original: f.name,
        caption: f.name
      }));

  } catch (e) {
    console.error("Folder loading error:", e);
    return [];
  }
}

/* Normal category card */
function normalCategoryCard(c) {
  const first = c.images?.[0]?.src;

  const img = first
    ? `<img class="card-img" src="${first}" alt="${esc(c.title)}">`
    : `<div class="card-img" style="display:grid;place-items:center;background:#ececf5;">
         <span>No preview</span>
       </div>`;

  return `
    <article class="card"
      onclick="location.href='gallery.html?cat=${encodeURIComponent(c.slug)}'">
      ${img}
      <div class="card-body">
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.desc || "")}</p>
      </div>
    </article>
  `;
}

/* Modular Kitchen main card */
async function modularCategoryCard() {
  let first = "";

  for (const item of modularFolders) {
    const imgs = await getFolderImages(item.folder);
    if (imgs.length) {
      first = imgs[0].src;
      break;
    }
  }

  const img = first
    ? `<img class="card-img" src="${first}" alt="Modular Kitchen">`
    : `<div class="card-img" style="display:grid;place-items:center;background:#ececf5;">
         <span>Modular Kitchen</span>
       </div>`;

  return `
    <article class="card"
      onclick="location.href='gallery.html?cat=modular-kitchen'">
      ${img}
      <div class="card-body">
        <h3>Modular Kitchen</h3>
        <p>Explore Acrylic, Laminated Kitchen and Accessories.</p>
      </div>
    </article>
  `;
}

async function initHome() {
  const data = await loadData();

  const cards = [];

  for (const c of data) {
    if (c.slug === "modular-kitchen") {
      cards.push(await modularCategoryCard());
    } else {
      cards.push(normalCategoryCard(c));
    }
  }

  document.getElementById("categoryGrid").innerHTML = cards.join("");


}

/* Create a sub-category card */
async function modularSubCard(item) {
  const imgs = await getFolderImages(item.folder);
  const first = imgs[0]?.src;

  const img = first
    ? `<img class="card-img" src="${first}" alt="${esc(item.title)}">`
    : `<div class="card-img" style="display:grid;place-items:center;background:#ececf5;">
         <span>${esc(item.title)}</span>
       </div>`;

  return `
    <article class="card"
      onclick="location.href='gallery.html?cat=${encodeURIComponent(
        "modular-kitchen/" + item.folder
      )}'">
      ${img}
      <div class="card-body">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.desc)}</p>
      </div>
    </article>
  `;
}

/* Show Modular Kitchen sub-categories */
async function showModularCategories() {
  const cards = [];

  for (const item of modularFolders) {
    cards.push(await modularSubCard(item));
  }

  document.getElementById("photoGrid").innerHTML =
    `<div class="grid">${cards.join("")}</div>`;
}

/* Gallery */
async function initGallery() {
  const data = await loadData();

  const params = new URLSearchParams(location.search);
  const slug = params.get("cat") || "wardrobe";

  /* Modular Kitchen main page */
  if (slug === "modular-kitchen") {
    document.title = "Modular Kitchen | Flazzor Interiors";

    document.getElementById("gTitle").textContent =
      "Modular Kitchen";

    document.getElementById("gDesc").textContent =
      "Choose your preferred kitchen finish or explore our accessories.";

    await showModularCategories();
    return;
  }

  /* Individual Modular Kitchen folder */
  if (slug.startsWith("modular-kitchen/")) {
    const folder = slug.split("/")[1];

    const item = modularFolders.find(
      x => x.folder === folder
    );

    if (!item) {
      document.getElementById("gTitle").textContent =
        "Gallery";
      document.getElementById("gDesc").textContent =
        "Category not found.";
      return;
    }

    const images = await getFolderImages(folder);

    document.title =
      `${item.title} | Flazzor Interiors`;

    document.getElementById("gTitle").textContent =
      item.title;

    document.getElementById("gDesc").textContent =
      item.desc;

    if (!images.length) {
      document.getElementById("photoGrid").innerHTML =
        `<div class="empty">Photos for this category are coming soon.</div>`;
      return;
    }

    current = images;

    document.getElementById("photoGrid").innerHTML =
      images.map((im, i) => `
        <article class="photo"
          onclick="openLightbox(${i})">
          <img loading="lazy"
            src="${im.src}"
            alt="${esc(item.title)} Design ${i + 1}">
          <div class="cap">
            ${esc(item.title)} Design ${i + 1}
          </div>
        </article>
      `).join("");

    return;
  }

  /* Existing data.json galleries */
  const c =
    data.find(x => x.slug === slug) ||
    data[0];

  document.title = `${c.title} | Flazzor Interiors`;

  document.getElementById("gTitle").textContent =
    c.title;

  document.getElementById("gDesc").textContent =
    c.desc || "";

  if (!c.images?.length) {
    document.getElementById("photoGrid").innerHTML =
      `<div class="empty">Photos for this category are coming soon.</div>`;
    return;
  }

  current = c.images;

  document.getElementById("photoGrid").innerHTML =
    c.images.map((im, i) => `
      <article class="photo"
        onclick="openLightbox(${i})">
        <img loading="lazy"
          src="${im.src}"
          alt="${esc(c.title)} Design ${i + 1}">
        <div class="cap">
          ${esc(im.caption || c.title + " Design " + (i + 1))}
        </div>
      </article>
    `).join("");
}

/* Lightbox */
function openLightbox(i) {
  currentIndex = i;

  const img = document.getElementById("lbImg");

  img.src = current[i].src;

  const lightbox =
    document.getElementById("lightbox");

  lightbox.classList.add("show");
}

function closeLightbox() {
  document
    .getElementById("lightbox")
    .classList.remove("show");
}

function nextImg() {
  if (!current.length) return;

  currentIndex =
    (currentIndex + 1) % current.length;

  document.getElementById("lbImg").src =
    current[currentIndex].src;
}

function prevImg() {
  if (!current.length) return;

  currentIndex =
    (currentIndex - 1 + current.length) %
    current.length;

  document.getElementById("lbImg").src =
    current[currentIndex].src;
}

/* Keyboard controls */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextImg();
  if (e.key === "ArrowLeft") prevImg();
});

/* Prevent direct image saving */
document.addEventListener("contextmenu", e => {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});

document.addEventListener("dragstart", e => {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});
