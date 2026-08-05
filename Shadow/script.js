const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];let soundOn=true,timers=[];const scenes=$$('.scene'),status=$('#status');function clearT(){timers.forEach(clearTimeout);timers=[]}function later(f,m){timers.push(setTimeout(f,m))}function show(id){scenes.forEach(s=>s.classList.toggle('active',s.id===id))}function state(t,d=false){status.querySelector('em').textContent=t;status.classList.toggle('danger',d)}function tone(f=440,d=.08,type='sine'){if(!soundOn)return;try{const c=new(AudioContext||webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.024,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d)}catch(e){}}$('#sound').onclick=e=>{soundOn=!soundOn;e.target.textContent=soundOn?'sound on':'sound off';if(soundOn)tone(620,.07)};function reset(){clearT();show('ready');state('APP READY TO PUBLISH');$('#cracks').classList.remove('on');$('#heal').classList.remove('on');$('#walker').classList.remove('walk');$('#retry').classList.remove('move');$('#thoughts').innerHTML='';$$('.timeline button').forEach(b=>b.classList.remove('active'));$('#fill').style.width='0%';$('#cursor').style.opacity=0}$('#reset').onclick=reset;$('#restart').onclick=reset;$('#skip').onclick=attack;$('#publish').onclick=()=>{show('countdown');state('PUBLISHING');let n=10;const tick=()=>{$('#num').textContent=n;$('#prog').style.width=((10-n)/10*100)+'%';tone(260+n*20,.045,'triangle');if(n===7){later(interrupt,450);return}n--;later(tick,540)};tick()};function interrupt(){show('interrupt');state('UNKNOWN SESSION DETECTED',true);tone(120,.45,'sawtooth');const p=$('#prints');p.innerHTML='';for(let i=0;i<12;i++){const f=document.createElement('i');f.style.left=(i*7.5)+'%';f.style.animationDelay=(i*.23)+'s';p.appendChild(f)}later(()=>$('#walker').classList.add('walk'),350);later(attack,4600)}function attack(){show('attack');state('ADVERSARIAL SESSION ACTIVE',true);$('#thoughts').innerHTML='';runAttack()}const steps=[['New account. Lowest privilege. Let’s map what it can see.','28%','45%','61%'],['IDs are sequential. Objects are probably enumerable.','42%','53%','73%'],['Frontend hides the route. The API still accepts it.','55%','36%','81%'],['Identity checked. Ownership missing. That’s the crack.','67%','48%','92%'],['Got it.','75%','33%','100%']];function runAttack(){let i=0,c=$('#cursor');c.style.opacity=1;const go=()=>{if(i>=steps.length){later(freeze,900);return}const s=steps[i],t=document.createElement('div');t.className='thought';t.textContent=s[0];$('#thoughts').appendChild(t);c.style.left=s[1];c.style.top=s[2];$('#conf').textContent=s[3];$(`.timeline button[data-i="${i}"]`).classList.add('active');$('#fill').style.width=(i/4*100)+'%';tone(350+i*75,.07,'triangle');if(i===3)$('#cracks').classList.add('on');i++;later(go,1400)};go()}function freeze(){show('freeze');state('COMPROMISE REPRODUCED',true);tone(170,.4,'sawtooth')}$('#replayBtn').onclick=()=>{show('replay');state('ATTACK REPLAY');update(0)};const data=[['00:02 / 01:03','POST /api/accounts\nrole=user','201 Created\n{ "id": "user_841" }'],['00:18 / 01:03','GET /api/orders/1842\nAuthorization: user_token','200 OK\n{ "ownerId": "user_204" }'],['00:31 / 01:03','GET /api/orders/1843\nAuthorization: user_token','200 OK\n{ "ownerId": "user_207" }'],['00:46 / 01:03','GET /api/admin/orders/1843\nAuthorization: user_token','200 OK\n{ "customerEmail": "redacted" }'],['01:03 / 01:03','Evidence captured safely\nNo destructive action performed','Exploit reproducible\nImpact: cross tenant exposure']];function update(i){const d=data[i];$('#time').textContent=d[0];$('#req').textContent=d[1];$('#res').textContent=d[2];$('#slider').value=i;tone(420+i*80,.05)}$('#slider').oninput=e=>update(+e.target.value);$('#play').onclick=()=>{let i=0;const go=()=>{update(i);if(i++<4)later(go,760)};go()};$('#fixBtn').onclick=()=>{show('fix');state('SAFE REPAIR GENERATED')};$('#apply').onclick=()=>{show('healScene');state('PATCH APPLIED');$('#heal').classList.add('on');$('#cracks').classList.remove('on');tone(720,.22);later(()=>$('#retry').classList.add('move'),500);later(()=>{state('SECOND ATTACK BLOCKED');show('safe');tone(920,.35)},3800)};const cv=$('#field'),ctx=cv.getContext('2d');let objs=[];function resize(){cv.width=innerWidth;cv.height=innerHeight;objs=Array.from({length:90},(_,i)=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*5+1,v:Math.random()*.08+.015,a:Math.random()*.09+.02,t:i%4,rot:Math.random()*6.2}))}function draw(){ctx.clearRect(0,0,cv.width,cv.height);for(const o of objs){o.y+=o.v;o.rot+=.0015;if(o.y>innerHeight+15)o.y=-15;ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);ctx.strokeStyle=o.t===1?`rgba(126,199,211,${o.a*.9})`:o.t===2?`rgba(255,101,93,${o.a*.72})`:`rgba(243,239,231,${o.a*.62})`;ctx.lineWidth=.7;if(o.t===0)ctx.strokeRect(-o.r,-o.r,o.r*2,o.r*2);else if(o.t===1){ctx.beginPath();ctx.arc(0,0,o.r,0,Math.PI*2);ctx.stroke()}else if(o.t===2){ctx.beginPath();ctx.moveTo(-o.r,0);ctx.lineTo(o.r,0);ctx.moveTo(0,-o.r);ctx.lineTo(0,o.r);ctx.stroke()}else{ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;i?ctx.lineTo(Math.cos(a)*o.r,Math.sin(a)*o.r):ctx.moveTo(Math.cos(a)*o.r,Math.sin(a)*o.r)}ctx.closePath();ctx.stroke()}ctx.restore()}requestAnimationFrame(draw)}resize();addEventListener('resize',resize);draw();reset();


// =========================================================
// SHADOW FINAL POLISH LAYER
// Uses the actual current DOM and preserves the full flow.
// =========================================================
const previewWorlds=[
  {
    domain:"northstar-preview.local",
    name:"Northstar",
    category:"TEAM WORKSPACE",
    headline:"Everything your team is building, in one place.",
    description:"Track progress, collaborate, and launch faster.",
    nav:["Home","Projects","Billing"],
    action:"New project",
    primary:"Open workspace"
  },
  {
    domain:"atlas-market.local",
    name:"Atlas",
    category:"CREATOR MARKETPLACE",
    headline:"Find the right expert before the idea goes cold.",
    description:"Book trusted specialists and move from concept to delivery.",
    nav:["Explore","Bookings","Wallet"],
    action:"List a service",
    primary:"Browse experts"
  },
  {
    domain:"lumen-clinic.local",
    name:"Lumen",
    category:"PATIENT PORTAL",
    headline:"Care feels simpler when everything is in one calm place.",
    description:"Appointments, results, messages, and care plans without the noise.",
    nav:["Overview","Visits","Messages"],
    action:"Book visit",
    primary:"Open care plan"
  },
  {
    domain:"relay-agent.local",
    name:"Relay",
    category:"AI OPERATIONS",
    headline:"Give every workflow an agent that knows when to act.",
    description:"Coordinate tasks, tools, and approvals across your operation.",
    nav:["Agents","Runs","Memory"],
    action:"Create agent",
    primary:"Open control room"
  },
  {
    domain:"frame-finance.local",
    name:"Frame",
    category:"FINANCIAL OS",
    headline:"See where every decision moves the business.",
    description:"Planning, cash visibility, and scenario intelligence in one place.",
    nav:["Overview","Scenarios","Reports"],
    action:"New scenario",
    primary:"Open forecast"
  }
];

function setPreviewWorld(){
  const world=previewWorlds[Math.floor(Math.random()*previewWorlds.length)];
  const screen=$(".screen");
  screen.classList.add("world-changing");
  setTimeout(()=>{
    $("#appDomain").textContent=world.domain;
    $("#appName").textContent=world.name;
    $("#appCategory").textContent=world.category;
    $("#appHeadline").textContent=world.headline;
    $("#appDescription").textContent=world.description;
    $("#navOne").textContent=world.nav[0];
    $("#navTwo").textContent=world.nav[1];
    $("#navThree").textContent=world.nav[2];
    $("#navAction").textContent=world.action;
    $("#appPrimaryAction").textContent=world.primary;
    screen.classList.remove("world-changing");
  },180);
}

// Parallax remains subtle and is disabled after leaving the hero.
const readyScene=$("#ready");
const previewApp=$("#app");
readyScene.addEventListener("pointermove",event=>{
  if(!readyScene.classList.contains("active") || innerWidth<851)return;
  const rect=readyScene.getBoundingClientRect();
  const dx=(event.clientX-(rect.left+rect.width/2))/rect.width;
  const dy=(event.clientY-(rect.top+rect.height/2))/rect.height;
  previewApp.style.setProperty("--parallax-x",`${dx*10}px`);
  previewApp.style.setProperty("--parallax-y",`${-30+dy*7}px`);
});
readyScene.addEventListener("pointerleave",()=>{
  previewApp.style.setProperty("--parallax-x","0px");
  previewApp.style.setProperty("--parallax-y","-30px");
});

// Randomize on each restart while retaining the original reset logic.
const stableReset=reset;
reset=function(){
  stableReset();
  setPreviewWorld();
  previewApp.style.setProperty("--parallax-x","0px");
  previewApp.style.setProperty("--parallax-y","-30px");
};
$("#reset").onclick=reset;
$("#restart").onclick=reset;

// Add a little more cinematic personality while preserving the same attack sequence.
const premiumSteps=[
  ["Let's not rush. First, I want to see what the smallest account can touch.","27%","44%","54%"],
  ["No. Too obvious. That route is probably watched.","36%","31%","59%"],
  ["Interesting… the interface hides the records, but the IDs keep counting.","44%","53%","72%"],
  ["Locked. Fine. Doors are rarely the only way in.","39%","61%","77%"],
  ["The frontend is careful. The API is trusting.","58%","36%","85%"],
  ["They checked who I am. They never checked whether this belongs to me.","68%","48%","96%"],
  ["Got it.","76%","33%","100%"]
];

runAttack=function(){
  let i=0;
  const cursor=$("#cursor");
  cursor.style.opacity=1;
  const go=()=>{
    if(i>=premiumSteps.length){
      later(freeze,900);
      return;
    }
    const s=premiumSteps[i];
    const thought=document.createElement("div");
    thought.className="thought";
    thought.textContent=s[0];
    $("#thoughts").appendChild(thought);
    cursor.style.left=s[1];
    cursor.style.top=s[2];
    $("#conf").textContent=s[3];

    const normalized=Math.min(4,Math.floor(i/(premiumSteps.length-1)*5));
    const button=$(`.timeline button[data-i="${normalized}"]`);
    if(button)button.classList.add("active");
    $("#fill").style.width=(i/(premiumSteps.length-1)*100)+"%";

    tone(i===1||i===3?270:360+i*55,.07,"triangle");
    if(i===5){
      $("#cracks").classList.add("on");
      previewApp.animate(
        [
          {transform:"translateX(0)"},
          {transform:"translateX(-6px)"},
          {transform:"translateX(5px)"},
          {transform:"translateX(-2px)"},
          {transform:"translateX(0)"}
        ],
        {duration:420,easing:"ease-out"}
      );
    }
    i++;
    later(go,i===2||i===4?1120:1380);
  };
  go();
};

setPreviewWorld();
