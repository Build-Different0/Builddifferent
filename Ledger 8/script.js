const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let soundOn=true;
const toast=msg=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)};
function tone(f=520,d=.06,type="sine"){if(!soundOn)return;try{const c=new(AudioContext||webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.018,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d)}catch(e){}}

function setView(name){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
  $$(".view-tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  tone(520,.05);
  scrollTo({top:0,behavior:"smooth"});
}
$$(".view-tab").forEach(b=>b.onclick=()=>setView(b.dataset.view));

$("#toggleSound").onclick=()=>{soundOn=!soundOn;$("#toggleSound").textContent=soundOn?"◌":"○";if(soundOn)tone(700,.08)};
$$(".expand-btn").forEach(btn=>btn.onclick=()=>{const event=btn.closest(".event");event.classList.toggle("expanded");tone(event.classList.contains("expanded")?610:420,.05)});
$$(".filter").forEach(btn=>btn.onclick=()=>{
  $$(".filter").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  const f=btn.dataset.filter;
  $$(".event").forEach(e=>e.classList.toggle("hidden-filter",f!=="all"&&!e.classList.contains(f)));
});
$$(".complete-focus").forEach(btn=>btn.onclick=()=>{btn.closest(".focus-item").classList.add("done");btn.textContent="Done";toast("Action completed");tone(820,.12)});
$("#createRequest").onclick=()=>toast("Contextual evidence request created for Maya");
$("#acceptRisk").onclick=()=>toast("Exception workflow opened");
$$(".sendRequest").forEach(b=>b.onclick=()=>toast("Evidence request sent with current population"));
$("#enableAutomation").onclick=()=>{toast("Continuous API collection enabled");$("#enableAutomation").textContent="Automation enabled ✓";tone(860,.15)};
$("#newControl").onclick=()=>toast("New control workflow opened");

const controls={
  cc61:{title:"CC6.1 · Logical access",objective:"Restrict logical access through identity, authentication, authorization, and periodic review.",expected:"All administrators use MFA.",actual:"14 of 15 comply."},
  cc62:{title:"CC6.2 · User provisioning",objective:"Authorize, provision, modify, and remove access based on approved business need.",expected:"All access requests are approved before provisioning.",actual:"47 of 47 sampled requests contain approval."},
  cc72:{title:"CC7.2 · Incident monitoring",objective:"Monitor systems and investigate anomalies that may indicate security incidents.",expected:"High severity alerts are triaged within 30 minutes.",actual:"Median triage time is 18 minutes."},
  cc81:{title:"CC8.1 · Change management",objective:"Authorize, test, approve, and track changes before production deployment.",expected:"All production changes have approval and test evidence.",actual:"98.7% of changes meet the expected state."}
};
$$(".control-row").forEach(row=>row.onclick=()=>{
  const d=controls[row.dataset.control];
  $("#drawerTitle").textContent=d.title;$("#drawerObjective").textContent=d.objective;$("#drawerExpected").textContent=d.expected;$("#drawerActual").textContent=d.actual;
  $("#controlDrawer").classList.add("open");tone(580,.06)
});
$("#closeDrawer").onclick=()=>$("#controlDrawer").classList.remove("open");
$("#openException").onclick=()=>toast("Exception and compensating control workflow opened");
$("#exportOscal").onclick=()=>toast("OSCAL package generated");

const replayData=[
  {date:"JAN 15",ready:"89.4%",type:"CREATED",title:"Control graph established",desc:"Okta, GitHub, AWS, and policy evidence were connected to CC6.1.",scores:[89,92,94,85]},
  {date:"MAR 31",ready:"93.1%",type:"VALIDATED",title:"Quarterly access review passed",desc:"The complete administrator population was reviewed and signed by the control owner.",scores:[94,94,95,88]},
  {date:"JUN 18",ready:"91.8%",type:"CHANGED",title:"Okta policy changed",desc:"MFA configuration changed and LEDGER automatically reran the control test.",scores:[86,95,96,89]},
  {date:"SEP 26",ready:"84.7%",type:"EXPIRED",title:"Evidence freshness collapsed",desc:"The quarterly administrator review expired and dependent framework mappings lost confidence.",scores:[61,90,95,87]},
  {date:"OCT 02",ready:"95.6%",type:"RECOVERED",title:"Fresh evidence restored the control",desc:"New population evidence was collected, reviewed, and sealed into the assurance history.",scores:[96,96,96,90]},
  {date:"DEC 12",ready:"98.4%",type:"AUDIT READY",title:"Annual assurance complete",desc:"The control operated consistently with sufficient evidence across the full audit period.",scores:[98,98,97,94]}
];
function updateReplay(i){
  const d=replayData[i];
  $("#replayDate").textContent=d.date;$("#replayReadiness").textContent=d.ready;$("#replayType").textContent=d.type;$("#replayTitle").textContent=d.title;$("#replayDescription").textContent=d.desc;
  d.scores.forEach((s,n)=>{$(`#track${n+1}`).style.width=s+"%";$(`#track${n+1}Label`).textContent=s+"%"});
  $$(".year-events button").forEach((b,n)=>b.classList.toggle("active",n===i));
  $("#readinessValue").textContent=d.ready;$("#readinessBar").style.width=d.ready;tone(430+i*60,.05)
}
$("#replaySlider").oninput=e=>updateReplay(+e.target.value);
$$(".year-events button").forEach(b=>b.onclick=()=>{$("#replaySlider").value=b.dataset.step;updateReplay(+b.dataset.step)});

const answers={
  "Why was CC6.1 compliant in May?":"CC6.1 was operating effectively in May because all 14 administrators were covered by enforced MFA, the quarterly review remained current, and source-derived evidence had 100% population coverage.",
  "Show every failed access review.":"Two access reviews failed during the period. One involved a transferred administrator with stale access. The second involved a missing approval for a temporary production role. Both were remediated within their target dates.",
  "Which evidence came directly from Okta?":"Okta supplied MFA policy configuration, active administrator membership, authentication policy assignments, and account status through the connected API."
};
function addChat(question){
  const log=$("#chatLog");const u=document.createElement("div");u.className="user-message";u.innerHTML=`<p>${question}</p>`;log.appendChild(u);
  const a=document.createElement("div");a.className="assistant-message";a.innerHTML=`<span>LEDGER</span><p>${answers[question]||"The evidence indicates that this control remained within the approved assurance threshold. I can expand the population, lineage, exceptions, or historical decisions behind that conclusion."}</p>`;setTimeout(()=>{log.appendChild(a);log.scrollTop=log.scrollHeight;tone(720,.06)},350)
}
$$(".ask-suggestion").forEach(b=>b.onclick=()=>addChat(b.textContent));
$("#auditorForm").onsubmit=e=>{e.preventDefault();const q=$("#auditorInput").value.trim();if(!q)return;addChat(q);$("#auditorInput").value=""};
$("#generateReport").onclick=()=>toast("Evidence narrative generated with lineage and exceptions");

const backdrop=$("#commandBackdrop");
function openCommand(){backdrop.classList.add("open");setTimeout(()=>$("#commandInput").focus(),50)}
function closeCommand(){backdrop.classList.remove("open");$("#commandInput").value="";$$(".command-results button").forEach(b=>b.style.display="grid")}
$("#openCommand").onclick=openCommand;
backdrop.onclick=e=>{if(e.target===backdrop)closeCommand()};
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();backdrop.classList.contains("open")?closeCommand():openCommand()}
  if(e.key==="Escape")closeCommand()
});
$("#commandInput").oninput=e=>{const q=e.target.value.toLowerCase();$$(".command-results button").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"grid":"none")};
$$(".command-results button").forEach(b=>b.onclick=()=>{const c=b.dataset.command;closeCommand();if(c==="controls"){setView("controls");setTimeout(()=>$$(".control-row")[0].click(),200)}else setView(c)});
updateReplay(0);