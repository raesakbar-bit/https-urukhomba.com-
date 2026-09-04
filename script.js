
const hamb=document.getElementById('hamb'), nav=document.getElementById('nav');
hamb?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const play=document.getElementById('play');
const progress=document.getElementById('progress');
const time=document.getElementById('time');
const anthemAudio=document.getElementById('anthemAudio');

function formatTime(seconds){
  if(!Number.isFinite(seconds)) return '00:00';
  const mins=Math.floor(seconds/60);
  const secs=Math.floor(seconds%60);
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}
if(anthemAudio){
  anthemAudio.addEventListener('loadedmetadata',()=>time.textContent=`00:00 / ${formatTime(anthemAudio.duration)}`);
  play?.addEventListener('click',()=>{
    if(anthemAudio.paused){anthemAudio.play();play.textContent='❚❚';}
    else{anthemAudio.pause();play.textContent='▶';}
  });
  anthemAudio.addEventListener('timeupdate',()=>{
    if(!anthemAudio.duration)return;
    progress.style.width=`${(anthemAudio.currentTime/anthemAudio.duration)*100}%`;
    time.textContent=`${formatTime(anthemAudio.currentTime)} / ${formatTime(anthemAudio.duration)}`;
  });
  anthemAudio.addEventListener('ended',()=>{play.textContent='▶';progress.style.width='0%';});
}

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

// === Archives ===
const URUKHOMBA_SUPABASE_URL='https://wlbicofocjuelbmrnhqy.supabase.co';
const URUKHOMBA_SUPABASE_KEY='sb_publishable_nlzCirPPFgcSZTPqDri-uw_aTPSVIS4';

const archiveSampleStories=[
{lang:'Urdu',title:'وہ شہر جہاں خواب دفن کیے جاتے تھے',author:'Anonymous',cat:'Dream',date:'3 Sep 2026',excerpt:'پہاڑوں کے درمیان ایک شہر تھا جہاں لوگ اپنے خواب زمین میں دفن کر دیتے تھے۔',body:'پہاڑوں کے درمیان ایک شہر تھا جہاں لوگ صبح اپنے خواب یاد رکھنے کے بجائے انہیں زمین میں دفن کر دیتے تھے۔\n\nکہتے ہیں ہر گھر کے پیچھے ایک چھوٹا سا قبرستان تھا، مگر ان قبروں میں لوگ نہیں، خواب سویا کرتے تھے۔'},
{lang:'English',title:'The Lighthouse That Remembered Everyone',author:'Mara V.',cat:'Lost Place',date:'2 Sep 2026',excerpt:'The lighthouse had no sea around it, yet every midnight its beam crossed an invisible ocean.',body:'The lighthouse had no sea around it, yet every midnight its beam swept across an invisible ocean.\n\nTravelers claimed that if the light touched you, it showed you the face of someone who still remembered you.'},
{lang:'Arabic',title:'القرية التي لم يكن لها ظل',author:'ابن الطريق',cat:'Legend',date:'1 Sep 2026',excerpt:'كانت القرية تظهر للمسافرين عند الغروب فقط، لكن لا شيء فيها كان يلقي ظلاً.',body:'كانت القرية تظهر للمسافرين عند الغروب فقط، لكن لا شيء فيها كان يلقي ظلاً.\n\nقال الشيخ إن أهلها باعوا ظلالهم قبل مئة عام مقابل ألا يشيخوا.'},
{lang:'Spanish',title:'La estación del último tren',author:'Lucía N.',cat:'Strange Encounter',date:'31 Aug 2026',excerpt:'Cada noche llegaba un tren vacío a una estación que no figuraba en ningún mapa.',body:'Cada noche llegaba un tren vacío a una estación que no figuraba en ningún mapa.\n\nUna madrugada, Tomás subió. En cada vagón encontró una vida distinta.'},
{lang:'Filipino',title:'Ang Ilog na Umaakyat sa Bundok',author:'M. Santos',cat:'Legend',date:'29 Aug 2026',excerpt:'May ilog sa Urukhomba na hindi bumababa mula sa bundok—umaakyat ito patungo sa mga ulap.',body:'May ilog sa Urukhomba na hindi bumababa mula sa bundok—umaakyat ito patungo sa mga ulap.\n\nSabi ng matatanda, dinadala ng ilog ang mga salitang hindi natin nasabi.'},
{lang:'Hindi',title:'वह दरवाज़ा जो केवल बारिश में खुलता था',author:'अनाम',cat:'Mystery',date:'27 Aug 2026',excerpt:'पुराने मकान की दीवार में एक दरवाज़ा केवल बारिश में दिखाई देता था।',body:'पुराने मकान की दीवार में कोई दरवाज़ा नहीं था, सिवाय उन रातों के जब बारिश लगातार तीन घंटे गिरती थी।'},
{lang:'Chinese',title:'没有名字的山',author:'无名者',cat:'Philosophy',date:'24 Aug 2026',excerpt:'乌鲁洪巴北方有一座山，从来没有名字。人们说，一旦给它命名，它就会消失。',body:'乌鲁洪巴北方有一座山，从来没有名字。人们说，一旦给它命名，它就会消失。\n\n也许存在并不需要名字。'}
];
let archiveCurrent='all';
const archiveGrid=document.getElementById('archiveGrid');
const archiveSearch=document.getElementById('archiveSearch');


async function loadApprovedArchiveStories(){
  try{
    const response=await fetch(
      `${URUKHOMBA_SUPABASE_URL}/rest/v1/stories?select=id,title,author,language,tags,story,created_at&status=eq.approved&order=created_at.desc`,
      {
        headers:{
          'apikey':URUKHOMBA_SUPABASE_KEY
        }
      }
    );

    if(!response.ok){
      const detail=await response.text();
      throw new Error(detail || 'Could not load approved stories');
    }

    const rows=await response.json();

    archiveStories=rows.map(row=>({
      id:String(row.id),
      title:row.title,
      author:row.author || 'Anonymous',
      lang:row.language,
      cat:row.tags || 'Story',
      createdAt:row.created_at,
      date:row.created_at
        ? new Date(row.created_at).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})
        : '',
      excerpt:(row.story || '').length > 180 ? row.story.slice(0,180)+'…' : (row.story || ''),
      body:row.story || ''
    }));

    filteredStories=[...archiveStories];
    renderArchiveStats();
    renderLanguageFolders();
    renderArchive();
  }catch(error){
    console.error('Could not load Urukhomba Archives:', error);
    archiveStories=[];
    filteredStories=[];
    renderArchiveStats();
    renderLanguageFolders();
    renderArchive();
  }
}

function escapeArchiveHTML(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function renderArchiveStats(){
  const storyEl=document.getElementById('archiveStatStories');
  const langEl=document.getElementById('archiveStatLanguages');
  const weekEl=document.getElementById('archiveStatWeek');

  if(storyEl) storyEl.textContent=archiveStories.length;

  const languages=new Set(
    archiveStories.map(s=>(s.lang||'Other').trim()||'Other')
  );
  if(langEl) langEl.textContent=languages.size;

  const now=Date.now();
  const sevenDays=7*24*60*60*1000;
  const recent=archiveStories.filter(s=>{
    const t=s.createdAt ? new Date(s.createdAt).getTime() : NaN;
    return Number.isFinite(t) && now-t <= sevenDays;
  }).length;
  if(weekEl) weekEl.textContent=recent;
}

function renderLanguageFolders(){
  const box=document.getElementById('archiveLanguageFolders');
  if(!box)return;

  const counts={};
  archiveStories.forEach(s=>{
    const lang=(s.lang||'Other').trim()||'Other';
    counts[lang]=(counts[lang]||0)+1;
  });

  box.innerHTML=
    `<button class="archive-lang ${archiveCurrent==='all'?'active':''}" data-lang="all"><span>🌐 All Stories</span><b>${archiveStories.length}</b></button>`+
    Object.keys(counts).sort((a,b)=>a.localeCompare(b)).map(lang=>
      `<button class="archive-lang ${archiveCurrent===lang?'active':''}" data-lang="${escapeArchiveHTML(lang)}"><span>${escapeArchiveHTML(lang)}</span><b>${counts[lang]}</b></button>`
    ).join('')+
    `<div class="archive-more">More language folders appear automatically as approved stories are added.</div>`;

  box.querySelectorAll('.archive-lang').forEach(b=>b.onclick=()=>{
    archiveCurrent=b.dataset.lang;
    renderLanguageFolders();
    renderArchive();
  });
}

function renderArchive(){
  if(!archiveGrid)return;
  const q=(archiveSearch?.value||'').toLowerCase();
  archiveGrid.innerHTML='';
  archiveStories.filter(s=>(archiveCurrent==='all'||s.lang===archiveCurrent)&&(`${s.title} ${s.author} ${s.cat} ${s.excerpt}`.toLowerCase().includes(q))).forEach(s=>{
    const el=document.createElement('article');
    el.className='archive-story';
    el.innerHTML=`<div class="archive-story-cover"><span>${s.lang}</span><h3>${s.title}</h3></div><div class="archive-story-body"><div class="archive-story-meta">${s.cat||'Story'} · ${s.date} · ${s.author}</div><p>${s.excerpt}</p><span class="archive-read">READ STORY →</span></div>`;
    el.onclick=()=>openArchiveReader(s);
    archiveGrid.appendChild(el);
  });
}
archiveSearch?.addEventListener('input',renderArchive);
loadApprovedArchiveStories();

const archiveSubmitModal=document.getElementById('archiveSubmitModal');
const archiveReaderModal=document.getElementById('archiveReaderModal');

function openArchiveSubmit(){archiveSubmitModal?.classList.add('show');}
document.getElementById('archiveSubmit')?.addEventListener('click',openArchiveSubmit);
document.getElementById('archiveSubmitBottom')?.addEventListener('click',openArchiveSubmit);
document.querySelectorAll('[data-archive-close]').forEach(b=>b.onclick=()=>{archiveSubmitModal?.classList.remove('show');archiveReaderModal?.classList.remove('show');});
[archiveSubmitModal,archiveReaderModal].forEach(m=>m?.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');}));

function openArchiveReader(s){
  document.getElementById('archiveReaderLang').textContent=`${s.lang.toUpperCase()} · ${(s.cat||'STORY').toUpperCase()}`;
  document.getElementById('archiveReaderTitle').textContent=s.title;
  document.getElementById('archiveReaderMeta').textContent=`By ${s.author} · ${s.date}`;
  document.getElementById('archiveReaderText').textContent=s.body;
  archiveReaderModal?.classList.add('show');
}
document.getElementById('archiveStoryForm')?.addEventListener('submit', async e=>{
  e.preventDefault();

  const form=e.currentTarget;
  const submitButton=form.querySelector('button[type="submit"]');
  const originalText=submitButton.textContent;

  const payload={
    title:document.getElementById('archiveTitle').value.trim(),
    author:document.getElementById('archiveAuthor').value.trim()||'Anonymous',
    language:document.getElementById('archiveLanguage').value.trim(),
    tags:document.getElementById('archiveCategory').value.trim()||null,
    story:document.getElementById('archiveBody').value.trim(),
    status:'pending'
  };

  if(!payload.title || !payload.language || !payload.story){
    alert('Please complete the story title, language and story.');
    return;
  }

  submitButton.disabled=true;
  submitButton.textContent='SUBMITTING...';

  try {
    const response=await fetch(`${URUKHOMBA_SUPABASE_URL}/rest/v1/stories`,{
      method:'POST',
      headers:{
        'apikey':URUKHOMBA_SUPABASE_KEY,
        'Content-Type':'application/json',
        'Prefer':'return=minimal'
      },
      body:JSON.stringify(payload)
    });

    if(!response.ok){
      const detail=await response.text();
      throw new Error(detail || 'Submission failed');
    }

    form.reset();
    archiveSubmitModal?.classList.remove('show');
    alert('Your story has been submitted to the Urukhomba Archives. It is now awaiting review.');
  } catch(error) {
    console.error(error);
    alert('The story could not be submitted. Please try again.');
  } finally {
    submitButton.disabled=false;
    submitButton.textContent=originalText;
  }
});
