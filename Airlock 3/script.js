
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)};
const path=location.pathname.split("/").pop()||"index.html";
$$(".navlinks a").forEach(a=>{if(a.getAttribute("href")===path)a.classList.add("active")});

let audioOn=localStorage.getItem("airlock-audio")!=="off";
const soundBtn=$("#soundBtn");
function syncSound(){if(!soundBtn)return;soundBtn.classList.toggle("on",audioOn);soundBtn.querySelector("span").textContent=audioOn?"Sound on":"Sound off"}
syncSound();
soundBtn?.addEventListener("click",()=>{audioOn=!audioOn;localStorage.setItem("airlock-audio",audioOn?"on":"off");syncSound();tone(520,.08)});
function tone(freq=440,dur=.08,type="sine"){
  if(!audioOn)return;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);
    o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur);
  }catch(e){}
}

$$("[data-toast]").forEach(b=>b.addEventListener("click",()=>{toast(b.dataset.toast);tone(600,.06)}));

const saved=JSON.parse(localStorage.getItem("airlock-state")||'{"processed":0,"time":0,"items":[]}');
$$("[data-processed]").forEach(el=>el.textContent=saved.processed||0);
$$("[data-saved-time]").forEach(el=>el.textContent=(saved.time||0)+"m");
