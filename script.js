
const hamb=document.getElementById('hamb'), nav=document.getElementById('nav');
hamb?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const play = document.getElementById('play');
const progress = document.getElementById('progress');
const time = document.getElementById('time');
const anthemAudio = document.getElementById('anthemAudio');

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

play.addEventListener('click', () => {
  if (anthemAudio.paused) {
    anthemAudio.play();
    play.textContent = '❚❚';
  } else {
    anthemAudio.pause();
    play.textContent = '▶';
  }
});

anthemAudio.addEventListener('timeupdate', () => {
  if (!anthemAudio.duration) return;

  const percent = (anthemAudio.currentTime / anthemAudio.duration) * 100;
  progress.style.width = `${percent}%`;

  time.textContent =
    `${formatTime(anthemAudio.currentTime)} / ${formatTime(anthemAudio.duration)}`;
});

anthemAudio.addEventListener('ended', () => {
  play.textContent = '▶';
  progress.style.width = '0%';
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
