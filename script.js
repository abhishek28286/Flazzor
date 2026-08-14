
const WA="919828028286";
const CALL1="919828028286";
const CALL2="917425061880";
let cats=[], current=[], currentIndex=0;

function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

async function loadData(){
  const r=await fetch("data.json"); cats=await r.json(); return cats;
}
function categoryCard(c){
  const first=c.images?.[0]?.src;
  const img=first ? `<img class="card-img" src="${first}" alt="${esc(c.title)}">` :
    `<div class="card-img" style="display:grid;place-items:center;background:#ececf5;color:#17105f;font-weight:800">Gallery coming soon</div>`;
  return `<article class="card">${img}<div class="card-body"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><a class="more" href="gallery.html?cat=${encodeURIComponent(c.slug)}">View Gallery →</a></div></article>`;
}
async function initHome(){
  const data=await loadData();
  document.getElementById("categoryGrid").innerHTML=data.map(categoryCard).join("");
  const hero=data.find(c=>c.slug==="wardrobe") || data.find(c=>c.images?.length);
  if(hero?.images?.[0]) document.getElementById("heroImage").src=hero.images[0].src;
}
async function initGallery(){
  const data=await loadData();
  const slug=new URLSearchParams(location.search).get("cat") || "wardrobe";
  const c=data.find(x=>x.slug===slug) || data[0];
  document.title=`${c.title} | Flazzor Interiors`;
  document.getElementById("gTitle").textContent=c.title;
  document.getElementById("gDesc").textContent=c.desc;
  if(!c.images?.length){
    document.getElementById("photoGrid").innerHTML=`<div class="empty">Photos for this category will be added here.</div>`;
    return;
  }
  current=c.images;
  document.getElementById("photoGrid").innerHTML=c.images.map((im,i)=>`
    <article class="photo" onclick="openLightbox(${i})">
      <img loading="lazy" src="${im.src}" alt="${esc(c.title)} design ${i+1}">
      <div class="cap">${esc(c.title)} Design ${i+1}</div>
    </article>`).join("");
}
function openLightbox(i){currentIndex=i;document.getElementById("lbImg").src=current[i].src;document.getElementById("lightbox").classList.add("show")}
function closeLightbox(){document.getElementById("lightbox").classList.remove("show")}
function nextImg(){if(!current.length)return;currentIndex=(currentIndex+1)%current.length;document.getElementById("lbImg").src=current[currentIndex].src}
function prevImg(){if(!current.length)return;currentIndex=(currentIndex-1+current.length)%current.length;document.getElementById("lbImg").src=current[currentIndex].src}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox();if(e.key==="ArrowRight")nextImg();if(e.key==="ArrowLeft")prevImg()});
document.addEventListener("contextmenu",e=>{if(e.target.tagName==="IMG")e.preventDefault()});
document.addEventListener("dragstart",e=>{if(e.target.tagName==="IMG")e.preventDefault()});
