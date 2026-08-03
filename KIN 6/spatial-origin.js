(() => {
  const scenes=[...document.querySelectorAll(".spatial-scene")];
  const canvas=document.getElementById("spatialCanvas");
  const ctx=canvas.getContext("2d");
  const readout=document.getElementById("systemReadout");
  const readoutText=readout.querySelector("span");
  const cursor=document.getElementById("cursorField");
  const toast=document.getElementById("spatialToast");
  let soundOn=true;
  let stars=[];
  let clusters=[];
  let mouse={x:innerWidth/2,y:innerHeight/2,nx:0,ny:0};
  let mode="seed";
  let activeCluster="marketplaces";
  let animationScale=1;

  const palette={
    healthcare:"#3DDC97",
    agents:"#FFB86B",
    fintech:"#48C9FF",
    education:"#FFC857",
    games:"#FF7A8A",
    marketplaces:"#59E3C2"
  };

  function show(id){
    scenes.forEach(scene=>scene.classList.toggle("is-active",scene.id===id));
  }

  function notify(message){
    toast.textContent=message;
    toast.classList.add("show");
    clearTimeout(window.__spatialToast);
    window.__spatialToast=setTimeout(()=>toast.classList.remove("show"),2200);
  }

  function tone(freq=440,duration=.08,type="sine"){
    if(!soundOn)return;
    try{
      const audio=new (window.AudioContext||window.webkitAudioContext)();
      const oscillator=audio.createOscillator();
      const gain=audio.createGain();
      oscillator.type=type;
      oscillator.frequency.value=freq;
      gain.gain.setValueAtTime(.022,audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);
      oscillator.connect(gain);gain.connect(audio.destination);
      oscillator.start();oscillator.stop(audio.currentTime+duration);
    }catch(error){}
  }

  function resize(){
    canvas.width=innerWidth*devicePixelRatio;
    canvas.height=innerHeight*devicePixelRatio;
    canvas.style.width=innerWidth+"px";
    canvas.style.height=innerHeight+"px";
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);

    const centers=[
      {name:"healthcare",x:.18,y:.25},
      {name:"agents",x:.78,y:.22},
      {name:"fintech",x:.23,y:.72},
      {name:"education",x:.77,y:.72},
      {name:"games",x:.49,y:.18},
      {name:"marketplaces",x:.52,y:.70}
    ];
    clusters=centers.map((center,index)=>({
      ...center,
      points:Array.from({length:58},()=>({
        ox:(Math.random()-.5)*(170+index*7),
        oy:(Math.random()-.5)*(130+index*6),
        r:Math.random()*2.5+.45,
        a:Math.random()*.62+.18,
        phase:Math.random()*Math.PI*2
      }))
    }));
    stars=Array.from({length:135},(_,i)=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*5+1.5,a:Math.random()*.28+.05,
      vx:(Math.random()-.5)*.065,vy:(Math.random()-.5)*.065,
      type:i%6,rotation:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.005
    }));
  }

  function drawBackground(){
    stars.forEach(star=>{
      star.x+=star.vx+mouse.nx*.035*star.r;
      star.y+=star.vy+mouse.ny*.035*star.r;
      star.rotation+=star.spin;
      if(star.x<0)star.x=innerWidth;if(star.x>innerWidth)star.x=0;
      if(star.y<0)star.y=innerHeight;if(star.y>innerHeight)star.y=0;

      ctx.save();
      ctx.translate(star.x,star.y);
      ctx.rotate(star.rotation);
      ctx.lineWidth=.8;

      const teal=`rgba(89,227,194,${star.a})`;
      const cyan=`rgba(72,201,255,${star.a})`;
      const amber=`rgba(255,200,87,${star.a*.78})`;

      if(star.type===0){
        ctx.strokeStyle=teal;
        ctx.strokeRect(-star.r/2,-star.r/2,star.r,star.r);
        ctx.beginPath();ctx.moveTo(-star.r/2,-star.r/2);ctx.lineTo(0,-star.r);ctx.lineTo(star.r/2,-star.r/2);ctx.stroke();
      }else if(star.type===1){
        ctx.fillStyle=cyan;
        ctx.beginPath();ctx.arc(0,0,Math.max(1,star.r*.16),0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=cyan;ctx.beginPath();ctx.arc(0,0,star.r*.72,0,Math.PI*2);ctx.stroke();
      }else if(star.type===2){
        ctx.strokeStyle=amber;
        ctx.beginPath();ctx.moveTo(-star.r,0);ctx.lineTo(star.r,0);ctx.moveTo(0,-star.r);ctx.lineTo(0,star.r);ctx.stroke();
      }else if(star.type===3){
        ctx.strokeStyle=teal;
        ctx.beginPath();
        for(let i=0;i<6;i++){
          const angle=Math.PI/3*i-Math.PI/6;
          const x=Math.cos(angle)*star.r*.7,y=Math.sin(angle)*star.r*.7;
          i?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.closePath();ctx.stroke();
      }else if(star.type===4){
        ctx.strokeStyle=cyan;
        ctx.beginPath();ctx.moveTo(-star.r,0);ctx.bezierCurveTo(-star.r*.25,-star.r,star.r*.25,star.r,star.r,0);ctx.stroke();
      }else{
        ctx.fillStyle=teal;ctx.fillRect(-star.r*.75,-1,star.r*1.5,2);
        ctx.fillStyle=amber;ctx.beginPath();ctx.arc(star.r*.75,0,1.2,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawClusters(time){
    const visibility=mode==="seed"||mode==="loading"?0:1;
    clusters.forEach((cluster,index)=>{
      const centerX=cluster.x*innerWidth+mouse.nx*(18+index*2);
      const centerY=cluster.y*innerHeight+mouse.ny*(18+index*2);
      const color=palette[cluster.name];
      cluster.points.forEach((point,pointIndex)=>{
        const bend=cluster.name===activeCluster?1.16:1;
        const pulse=1+Math.sin(time/800+point.phase)*.14;
        const x=centerX+point.ox*bend;
        const y=centerY+point.oy*bend;
        ctx.beginPath();
        ctx.fillStyle=color+Math.floor(point.a*255*visibility).toString(16).padStart(2,"0");
        ctx.arc(x,y,point.r*pulse*(cluster.name===activeCluster?1.25:1),0,Math.PI*2);
        ctx.fill();

        if(pointIndex%8===0){
          const next=cluster.points[(pointIndex+7)%cluster.points.length];
          const nx=centerX+next.ox*bend,ny=centerY+next.oy*bend;
          ctx.beginPath();ctx.strokeStyle=color+"18";ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();
        }
      });
    });
  }

  function render(time=0){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    drawBackground();
    drawClusters(time);
    requestAnimationFrame(render);
  }

  function countJourneys(){
    const counter=document.getElementById("journeyCounter");
    const target=8421992;
    const start=performance.now();
    function tick(now){
      const progress=Math.min(1,(now-start)/2800);
      counter.textContent=Math.floor(target*(1-Math.pow(1-progress,3))).toLocaleString();
      if(progress<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function begin(){
    mode="loading";
    readout.classList.add("awake");
    readoutText.textContent="loading creation memory";
    show("sceneLoading");
    countJourneys();
    tone(230,.18,"triangle");

    const lines=[
      "awakening creation memory…",
      "anonymous journeys verified…",
      "behavioral fingerprints separated from identity…",
      "new builder species detected…",
      "creation universe online."
    ];
    let i=0;
    const line=document.getElementById("terminalLine");
    const interval=setInterval(()=>{
      line.textContent=lines[i++];
      tone(320+i*70,.06,"triangle");
      if(i===lines.length){
        clearInterval(interval);
        setTimeout(()=>{
          mode="constellations";
          readoutText.textContent="creation universe online";
          show("sceneConstellations");
          tone(820,.25);
          setTimeout(showLocation,3100);
        },600);
      }
    },630);
  }

  function showLocation(){
    mode="location";
    show("sceneLocation");
    readoutText.textContent="project located";
    tone(900,.2);
    setTimeout(()=>{
      mode="instrument";
      show("sceneInstrument");
      readoutText.textContent="software intuition active";
    },3200);
  }

  function dive(){
    mode="dive";
    show("sceneDive");
    readoutText.textContent="creation memory open";
    tone(270,.25,"sawtooth");
  }

  document.getElementById("seedHeartbeat").addEventListener("click",begin);
  document.getElementById("skipIntro").addEventListener("click",()=>{
    mode="instrument";
    readout.classList.add("awake");
    readoutText.textContent="software intuition active";
    show("sceneInstrument");
  });
  document.getElementById("spatialSound").addEventListener("click",event=>{
    soundOn=!soundOn;
    event.currentTarget.textContent=soundOn?"sound on":"sound off";
    if(soundOn)tone(620,.07);
  });
  document.getElementById("exitMemory").addEventListener("click",()=>{
    mode="instrument";show("sceneInstrument");readoutText.textContent="software intuition active";tone(620,.08);
  });

  document.addEventListener("mousemove",event=>{
    mouse.x=event.clientX;mouse.y=event.clientY;
    mouse.nx=(event.clientX-innerWidth/2)/(innerWidth/2);
    mouse.ny=(event.clientY-innerHeight/2)/(innerHeight/2);
    cursor.style.left=event.clientX+"px";
    cursor.style.top=event.clientY+"px";
  });

  canvas.addEventListener("click",event=>{
    if(mode!=="instrument")return;
    const nearest=clusters
      .map(cluster=>({cluster,distance:Math.hypot(event.clientX-cluster.x*innerWidth,event.clientY-cluster.y*innerHeight)}))
      .sort((a,b)=>a.distance-b.distance)[0];
    if(nearest.distance<180){
      activeCluster=nearest.cluster.name;
      notify(nearest.cluster.name.toUpperCase()+" creation memory selected");
      setTimeout(dive,450);
    }
  });

  document.querySelectorAll(".constellation-label").forEach(label=>label.addEventListener("click",()=>{
    activeCluster=label.dataset.cluster;
    notify(label.textContent+" constellation selected");
    setTimeout(dive,450);
  }));

  const insights={
    marketplace:"Authentication before billing produced 48,000 successful marketplace products.",
    healthcare:"Trust and consent before clinical depth produced the strongest healthcare launches.",
    fintech:"Stable ledger states before payments reduced transaction rework across successful fintech paths.",
    agents:"Narrow evaluation loops before tool expansion created the most reliable AI agent launches.",
    education:"Progress feedback before content scale produced stronger repeat learning behavior.",
    games:"Core replay value before progression systems produced the healthiest game launches."
  };

  document.getElementById("spatialSearchButton").addEventListener("click",()=>{
    const value=document.getElementById("spatialSearch").value.toLowerCase();
    const key=Object.keys(insights).find(name=>value.includes(name.replace("marketplace","market")))||"marketplace";
    activeCluster=key==="marketplace"?"marketplaces":key;
    document.getElementById("spatialInsight").textContent=insights[key];
    notify("universe reshaped around "+key);
    tone(670,.09);
  });

  document.querySelectorAll(".spatial-dock a").forEach(link=>link.addEventListener("mouseenter",()=>tone(420+Math.random()*160,.04)));

  resize();
  addEventListener("resize",resize);
  render();
})();