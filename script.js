
const hamb=document.getElementById('hamb'), nav=document.getElementById('nav');
hamb?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const play=document.getElementById('play'), progress=document.getElementById('progress'), time=document.getElementById('time');
let playing=false, sec=0, timer=null;
play?.addEventListener('click',()=>{
  playing=!playing; play.textContent=playing?'❚❚':'▶';
  if(playing){
    timer=setInterval(()=>{sec=(sec+1)%166; progress.style.width=((sec/165)*100)+'%';
      const m=String(Math.floor(sec/60)).padStart(2,'0'), s=String(sec%60).padStart(2,'0'); time.textContent=`${m}:${s} / 02:45`;},1000);
  } else clearInterval(timer);
});

document.getElementById('citizenForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const n=document.getElementById('name').value.trim()||'Citizen';
  const p=document.getElementById('place').value.trim();
  const card=document.getElementById('card');
  card.innerHTML=`<strong style="font-family:Georgia,serif;color:#efc26d;font-size:21px">REPUBLIC OF URUKHOMBA</strong><br>
  This certifies that <b>${n}</b>${p?` of ${p}`:''} is recognized as a fictional citizen of Urukhomba.<br>
  <small>Souvenir only — no legal or governmental status.</small>`;
  card.style.display='block';
});
