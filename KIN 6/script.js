
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(window.__t);window.__t=setTimeout(()=>t.classList.remove("show"),2200)};
const pth=location.pathname.split("/").pop()||"index.html";$$(".nav a").forEach(a=>{if(a.getAttribute("href")===pth)a.classList.add("active")});
let soundOn=localStorage.getItem("creation-sound")!=="off";const sb=$("#soundBtn");
function syncSound(){if(!sb)return;sb.classList.toggle("on",soundOn);sb.querySelector("span").textContent=soundOn?"Sound on":"Sound off"}syncSound();
sb?.addEventListener("click",()=>{soundOn=!soundOn;localStorage.setItem("creation-sound",soundOn?"on":"off");syncSound();tone(620,.07)});
function tone(f=440,d=.08,t="sine"){if(!soundOn)return;try{const c=new(AudioContext||webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(.024,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d)}catch(e){}}
const canvas=$("#space");if(canvas){
  const c=canvas.getContext("2d");
  let objects=[],mx=0,my=0;

  function resize(){
    canvas.width=innerWidth;
    canvas.height=innerHeight;
    const count=Math.min(125,Math.max(65,Math.floor(innerWidth/11)));
    objects=Array.from({length:count},(_,i)=>({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      size:Math.random()*7+2,
      speed:Math.random()*.10+.025,
      alpha:Math.random()*.26+.055,
      type:i%6,
      rotation:Math.random()*Math.PI*2,
      spin:(Math.random()-.5)*.006,
      phase:Math.random()*Math.PI*2
    }));
  }

  addEventListener("mousemove",e=>{
    mx=(e.clientX-innerWidth/2)*.00045;
    my=(e.clientY-innerHeight/2)*.00045;
  });

  function drawHexagon(x,y,r,color){
    c.beginPath();
    for(let i=0;i<6;i++){
      const a=Math.PI/3*i-Math.PI/6;
      const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
      i?c.lineTo(px,py):c.moveTo(px,py);
    }
    c.closePath();c.strokeStyle=color;c.stroke();
  }

  function draw(){
    c.clearRect(0,0,canvas.width,canvas.height);
    for(const o of objects){
      o.x+=mx*o.size;
      o.y+=o.speed+my*o.size;
      o.rotation+=o.spin;
      if(o.y>canvas.height+20)o.y=-20;
      if(o.x<-20)o.x=canvas.width+20;
      if(o.x>canvas.width+20)o.x=-20;

      const pulse=.72+Math.sin(Date.now()/1300+o.phase)*.20;
      const teal=`rgba(89,227,194,${o.alpha*pulse})`;
      const cyan=`rgba(72,201,255,${o.alpha*pulse})`;
      const amber=`rgba(255,200,87,${o.alpha*.75*pulse})`;

      c.save();
      c.translate(o.x,o.y);
      c.rotate(o.rotation);
      c.lineWidth=.8;

      if(o.type===0){
        c.strokeStyle=teal;
        c.strokeRect(-o.size/2,-o.size/2,o.size,o.size);
        c.beginPath();c.moveTo(-o.size/2,-o.size/2);c.lineTo(0,-o.size);c.lineTo(o.size/2,-o.size/2);c.stroke();
      }else if(o.type===1){
        c.fillStyle=cyan;
        c.beginPath();c.arc(0,0,Math.max(1,o.size*.18),0,Math.PI*2);c.fill();
        c.strokeStyle=cyan;c.beginPath();c.arc(0,0,o.size*.7,0,Math.PI*2);c.stroke();
      }else if(o.type===2){
        c.strokeStyle=amber;
        c.beginPath();c.moveTo(-o.size,0);c.lineTo(o.size,0);c.moveTo(0,-o.size);c.lineTo(0,o.size);c.stroke();
      }else if(o.type===3){
        c.restore();
        drawHexagon(o.x,o.y,o.size*.65,teal);
        c.save();c.translate(o.x,o.y);
      }else if(o.type===4){
        c.strokeStyle=cyan;
        c.beginPath();c.moveTo(-o.size,0);c.bezierCurveTo(-o.size*.25,-o.size,o.size*.25,o.size,o.size,0);c.stroke();
      }else{
        c.fillStyle=teal;
        c.fillRect(-o.size*.75,-1,o.size*1.5,2);
        c.fillStyle=amber;
        c.beginPath();c.arc(o.size*.75,0,1.3,0,Math.PI*2);c.fill();
      }
      c.restore();
    }
    requestAnimationFrame(draw);
  }

  resize();
  addEventListener("resize",resize);
  draw();
}
