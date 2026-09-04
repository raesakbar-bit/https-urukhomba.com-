
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


// National Anthem lyrics modal
const anthemLyricsModal=document.getElementById('anthemLyricsModal');
const openAnthemLyrics=document.getElementById('openAnthemLyrics');
const closeAnthemLyrics=document.getElementById('closeAnthemLyrics');

function showAnthemLyrics(){
  if(!anthemLyricsModal)return;
  anthemLyricsModal.classList.add('show');
  anthemLyricsModal.setAttribute('aria-hidden','false');
  document.body.classList.add('anthem-lyrics-open');
  history.replaceState(null,'','#anthem-lyrics');
}
function hideAnthemLyrics(){
  if(!anthemLyricsModal)return;
  anthemLyricsModal.classList.remove('show');
  anthemLyricsModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('anthem-lyrics-open');
  if(location.hash==='#anthem-lyrics')history.replaceState(null,'',location.pathname+location.search);
}

openAnthemLyrics?.addEventListener('click',e=>{
  e.preventDefault();
  showAnthemLyrics();
});
closeAnthemLyrics?.addEventListener('click',hideAnthemLyrics);
anthemLyricsModal?.addEventListener('click',e=>{
  if(e.target===anthemLyricsModal)hideAnthemLyrics();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && anthemLyricsModal?.classList.contains('show'))hideAnthemLyrics();
});
if(location.hash==='#anthem-lyrics'){
  setTimeout(showAnthemLyrics,0);
}


// Urukhomba world-folder reader
const URUKHOMBA_WORLD_DETAILS={"The First Story": "Urukhomba did not begin with a map. It began with a name — a place that sounded as if it had always existed somewhere beyond the mountains.\n\nAt first, Urukhomba was only a private imaginary country: a flag, a capital, a few stories and the feeling of a homeland that belonged to anyone willing to imagine it. Over time the idea grew into a republic of stories, symbols, languages, invented geography and impossible creatures.\n\nThere is no single founder inside the fiction. Urukhomban tradition says that every person who adds a sincere story discovers a small piece of the country that had been waiting to be found.\n\nThe First Principle of Urukhomba is simple:\n\n“Territory ends at the border. Imagination does not.”", "National Symbols": "The national symbols of Urukhomba were designed to represent a country built from imagination rather than ancestry.\n\nThe flag carries dark green, cream, navy and gold. Green represents life, curiosity and imagination. Cream represents peace and openness. Navy represents depth, memory and the unknown. Gold represents aspiration — the light people carry toward places that do not yet exist.\n\nThe emblem combines mountains, waves and a rising golden form. The mountains stand for difficult journeys. The waves stand for movement between peoples and languages. The open horizon represents a future that is never completely written.\n\nThe national motto is:\n\n“Imagination Is Our Greatest Territory.”", "Myths & Legends": "Urukhomban folklore treats imagination as a force of nature. Old tales describe valleys that remember footsteps, lakes that reflect forgotten skies, and animals that live on things no ordinary creature could eat.\n\nOne legend tells of the Lantern Walker, a traveller who appears on mountain roads whenever someone has lost the reason for their journey. He never gives directions. He simply walks beside the traveller until they remember where they wanted to go.\n\nAnother story speaks of the Valley of Second Names. Anyone who sleeps there dreams of a name they might have carried in another life.\n\nUrukhomban legends are not treated as historical facts. They are preserved as symbolic stories — ways of talking about memory, identity, fear, hope and the unknown.", "The Flag": "The flag of Urukhomba is divided into three horizontal fields: dark green, cream and navy, centred by the golden national emblem.\n\nDark green represents imagination as something alive — growing, changing and impossible to completely contain.\n\nCream represents peace between different peoples, languages and stories. It is the open space in which differences can exist without becoming enemies.\n\nNavy represents depth: the sea, the night sky, memory and everything still unknown.\n\nGold is used for the central emblem because Urukhomba treats aspiration as its civic light. The mountains and waves connect the imagined interior of the country with the wider world.\n\nThe flag is not tied to blood, ethnicity or religion. Within the fiction, anyone who respects the ideals of Urukhomba may stand beneath it.", "The Emblem": "The national emblem is built around three images: mountains, waves and light.\n\nThe mountains represent effort. Urukhomban tradition says that a worthy horizon should require a climb.\n\nThe waves represent movement. Citizens may come from different lands, speak different languages and carry different histories, yet still meet in the same imagined country.\n\nThe golden rays suggest dawn rather than conquest. They represent beginnings, learning and the possibility that something new can be created without erasing what came before.\n\nThe circular form represents continuity: every traveller eventually returns to the questions that first sent them on the road.", "Impossible Fauna": "Urukhomba's “Impossible Fauna” are creatures that deliberately violate ordinary biology. They belong to folklore, speculative natural history and citizen-created stories.\n\nVelorix — a pale mountain creature said to feed on echoes. Villagers claim that valleys become unnaturally silent after it passes.\n\nXal'zoryv — a deep-water creature believed to sense unrealised possibilities rather than movement. Sailors say it follows ships whose passengers are about to make life-changing decisions.\n\nNyrithil — a translucent drifting animal sometimes called the Memory Jelly. It is said to glow more brightly near places where something important has been forgotten.\n\nGorvanth — a stone-backed forest giant associated with patience and ancient trees.\n\nEclyshon — a winged nocturnal creature whose feathers are described as holding fragments of moonlight.\n\nThalassorin — a legendary ocean wanderer said to migrate between seas that do not physically connect.\n\nNew species may be added as Urukhomba's mythology grows.", "Khombasa": "Khombasa is the fictional capital of Urukhomba, built in a high mountain basin where several old roads meet.\n\nThe city is imagined as a mixture of stone terraces, libraries, gardens, narrow markets and public courtyards. Its most important building is not a palace but the House of Archives, where stories, maps and citizen-created legends are preserved.\n\nAt the centre of Khombasa stands Horizon Square. No statue occupies the middle. Instead, the square contains an empty circular platform, symbolising the belief that no single person should permanently occupy the centre of a country built by many imaginations.\n\nThe old saying of Khombasa is:\n\n“A city is not its walls. It is what strangers are allowed to become inside them.”", "Lake Navar": "Lake Navar lies beyond the northern mountain roads in Urukhomban geography.\n\nAccording to legend, the lake does not reflect the sky above it. Instead, each visitor sees the sky they remember most strongly. One person may see a childhood evening, another a storm from years ago, and another a sky from a place they have never actually visited.\n\nBecause of this, Navar is sometimes called the Lake of Returning Skies.\n\nTravellers traditionally remain silent for one minute before touching the water. The custom is not religious; it is a gesture of respect toward memory.\n\nUrukhomban writers often use Lake Navar as a symbol for the idea that two people can stand in the same place and still inhabit different inner worlds.", "The Shifting Lands": "The Shifting Lands are a fictional region in western Urukhomba where maps are considered temporary documents.\n\nRivers alter course overnight. Valleys appear where plateaus were recorded the previous year. Roads sometimes return travellers to villages they were certain they had already passed.\n\nCartographers of Urukhomba therefore mark the region with dotted lines and the phrase “true at the time of seeing.”\n\nFolklore says the land moves because it dislikes ownership. Scholars inside the fictional world offer more elaborate explanations involving magnetic stone, unusual geology and unreliable perception.\n\nThe Shifting Lands represent one of Urukhomba's central ideas: knowing a place does not mean possessing it."};
const worldFolderModal=document.getElementById('worldFolderModal');
const worldFolderTitle=document.getElementById('worldFolderTitle');
const worldFolderEyebrow=document.getElementById('worldFolderEyebrow');
const worldFolderBody=document.getElementById('worldFolderBody');
const closeWorldFolder=document.getElementById('closeWorldFolder');

function openWorldFolder(card){
  const title=card.dataset.worldTitle;
  if(!title || !URUKHOMBA_WORLD_DETAILS[title])return;
  worldFolderTitle.textContent=title;
  worldFolderEyebrow.textContent=card.dataset.worldEyebrow || 'URUKHOMBA';
  worldFolderBody.textContent=URUKHOMBA_WORLD_DETAILS[title];
  worldFolderModal.classList.add('show');
  worldFolderModal.setAttribute('aria-hidden','false');
  document.body.classList.add('world-folder-open');
}

function hideWorldFolder(){
  worldFolderModal?.classList.remove('show');
  worldFolderModal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('world-folder-open');
}

document.querySelectorAll('.world-folder').forEach(card=>{
  card.addEventListener('click',()=>openWorldFolder(card));
  card.addEventListener('keydown',e=>{
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      openWorldFolder(card);
    }
  });
});
closeWorldFolder?.addEventListener('click',hideWorldFolder);
worldFolderModal?.addEventListener('click',e=>{
  if(e.target===worldFolderModal)hideWorldFolder();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && worldFolderModal?.classList.contains('show'))hideWorldFolder();
});


// TRUE TERRAIN MASKS — selections follow the actual map pixels
const FIX_PLACES={"Khombasa": {"subtitle": "The Heart", "text": "Khombasa is the capital of Urukhomba on the eastern coast, where desert routes meet the sea. It is the political, cultural and economic heart of the republic.", "meta": [["Type", "★ Capital City"], ["Region", "Eastern Urukhomba"], ["Population", "≈ 1,250,000"], ["Major Port", "Yes"], ["Known For", "Trade · Culture · Diversity"]]}, "Northridge": {"subtitle": "Snow, Stone, Strength", "text": "The northern mountain region of snowfields, alpine passes and Urukhomba's highest peaks.", "meta": [["Type", "Region"], ["Landscape", "Snow mountains"], ["Climate", "Cold alpine"]]}, "Verdan": {"subtitle": "Forests of Life", "text": "The great western forest region, crossed by rivers, woodland roads and steep coastal valleys.", "meta": [["Type", "Region"], ["Landscape", "Forest"], ["Water", "River network"]]}, "Navar Basin": {"subtitle": "Rivers, Fields, People", "text": "The fertile central basin surrounding Lake Navar, where the major rivers converge.", "meta": [["Type", "Region"], ["Landscape", "Basin"], ["Water", "Lake Navar"]]}, "Lake Navar": {"subtitle": "The Still Waters", "text": "Lake Navar is the large blue inland lake at the centre of Urukhomba, surrounded by fertile lowlands and small islands.", "meta": [["Type", "Lake"], ["Region", "Navar Basin"], ["Known For", "Islands · Reflection"]]}, "Zahir Desert": {"subtitle": "Sands of Time", "text": "The great eastern desert of dunes, rocky ridges and long-distance routes.", "meta": [["Type", "Region"], ["Landscape", "Desert"], ["Climate", "Arid"]]}, "Silk Coast": {"subtitle": "Trade, Tides, Tomorrow", "text": "The southeastern maritime belt of ports, lagoons and island routes.", "meta": [["Type", "Region"], ["Landscape", "Coast"], ["Role", "Trade · Ports"]]}, "Thalassorin": {"subtitle": "Cliffs, Depths, Mystery", "text": "The rugged southwestern coast of cliffs, waterfalls and isolated valleys.", "meta": [["Type", "Region"], ["Landscape", "Cliffs"], ["Coast", "Western"]]}, "Aridan": {"subtitle": "Wild Beauty", "text": "The southern highlands of dry valleys, broken ridges and dramatic shores.", "meta": [["Type", "Region"], ["Landscape", "Highlands"], ["Character", "Wild · Dry"]]}};
const FIX_FEATURES={"Capital City": {"subtitle": "Map Symbol", "text": "The gold star marks the national capital.", "meta": [["Symbol", "★"], ["Example", "Khombasa"]]}, "Major City": {"subtitle": "Map Symbol", "text": "Open circles identify major cities.", "meta": [["Symbol", "○"]]}, "City / Town": {"subtitle": "Map Symbol", "text": "Small points identify local settlements.", "meta": [["Symbol", "•"]]}, "Region Border": {"subtitle": "Map Symbol", "text": "Region borders divide the major geographical territories.", "meta": [["Symbol", "Dashed line"]]}, "River": {"subtitle": "Map Symbol", "text": "Blue lines show major rivers.", "meta": [["Symbol", "Blue line"]]}, "Lake": {"subtitle": "Map Symbol", "text": "Blue water bodies show lakes.", "meta": [["Example", "Lake Navar"]]}, "Mountain Peak": {"subtitle": "Map Symbol", "text": "Triangles identify major peaks.", "meta": [["Symbol", "▲"]]}, "Forest": {"subtitle": "Map Symbol", "text": "Tree symbols identify forested terrain.", "meta": [["Primary Region", "Verdan"]]}, "Desert": {"subtitle": "Map Symbol", "text": "Desert symbols identify arid terrain.", "meta": [["Primary Region", "Zahir Desert"]]}, "Coastline": {"subtitle": "Map Symbol", "text": "The coastline marks cliffs, beaches and ports.", "meta": []}, "Road": {"subtitle": "Map Symbol", "text": "Road lines connect inland regions and Khombasa.", "meta": []}, "Trade Route": {"subtitle": "Map Symbol", "text": "Trade routes connect the Silk Coast and capital with the interior.", "meta": []}, "Port": {"subtitle": "Map Symbol", "text": "Anchor symbols identify important ports.", "meta": [["Primary Coast", "Silk Coast"]]}, "Ruins / Landmark": {"subtitle": "Map Symbol", "text": "Landmark symbols identify notable sites.", "meta": []}};
const TERRAIN_CONTOURS={"Northridge": [[534, 236], [542, 245], [544, 254], [563, 260], [565, 267], [573, 267], [573, 253], [582, 254], [582, 265], [588, 275], [581, 285], [597, 289], [600, 293], [618, 290], [630, 308], [664, 317], [678, 333], [697, 335], [705, 332], [699, 304], [704, 303], [710, 310], [710, 316], [732, 318], [736, 322], [745, 321], [750, 316], [762, 316], [772, 309], [822, 304], [823, 309], [816, 310], [811, 318], [817, 326], [812, 333], [814, 339], [841, 341], [859, 332], [879, 334], [879, 330], [868, 326], [867, 321], [880, 315], [880, 309], [886, 303], [900, 304], [900, 298], [890, 285], [892, 277], [912, 285], [915, 282], [925, 284], [929, 278], [939, 275], [942, 265], [955, 262], [954, 247], [975, 242], [975, 236], [986, 230], [979, 207], [980, 198], [986, 197], [986, 193], [982, 193], [981, 188], [987, 180], [987, 173], [1000, 162], [988, 150], [991, 142], [998, 141], [1008, 146], [1008, 139], [1016, 129], [1022, 128], [1023, 133], [1019, 137], [1028, 139], [1035, 137], [1038, 127], [1048, 130], [1046, 141], [1054, 141], [1059, 138], [1057, 108], [1071, 105], [1076, 97], [1092, 92], [1087, 91], [1082, 83], [1079, 88], [1071, 88], [1071, 75], [1056, 77], [1057, 63], [1047, 58], [1043, 64], [1051, 65], [1051, 73], [1042, 74], [1041, 64], [1032, 61], [1031, 50], [1011, 47], [1001, 49], [1000, 53], [978, 49], [980, 68], [962, 63], [941, 67], [931, 62], [922, 46], [910, 43], [908, 51], [898, 59], [870, 60], [862, 55], [852, 65], [830, 65], [807, 45], [784, 52], [774, 44], [758, 47], [754, 40], [745, 40], [738, 34], [720, 39], [711, 28], [695, 29], [671, 14], [666, 24], [660, 24], [659, 32], [635, 35], [630, 46], [611, 44], [610, 40], [592, 40], [585, 54], [568, 52], [566, 57], [558, 57], [557, 61], [574, 62], [575, 68], [584, 68], [585, 77], [567, 79], [555, 96], [544, 96], [543, 92], [538, 92], [527, 100], [530, 110], [539, 111], [542, 115], [537, 122], [540, 130], [548, 135], [546, 143], [556, 148], [556, 157], [549, 165], [553, 177], [560, 183], [545, 214], [556, 217], [556, 227], [547, 228], [544, 221], [534, 222]], "Verdan": [[540, 90], [522, 82], [485, 87], [481, 80], [465, 73], [450, 78], [448, 86], [431, 91], [420, 91], [409, 86], [408, 81], [395, 80], [394, 83], [404, 84], [404, 93], [397, 100], [386, 100], [380, 96], [373, 108], [364, 113], [393, 119], [404, 117], [405, 105], [413, 105], [417, 111], [434, 111], [433, 125], [419, 127], [417, 123], [405, 120], [408, 139], [405, 142], [391, 140], [391, 145], [414, 154], [414, 167], [397, 174], [381, 174], [372, 166], [353, 166], [350, 162], [351, 149], [338, 144], [327, 149], [334, 152], [333, 161], [311, 163], [310, 154], [304, 147], [292, 142], [292, 149], [283, 150], [282, 154], [260, 149], [238, 165], [237, 171], [245, 172], [250, 178], [248, 192], [261, 199], [261, 208], [256, 215], [242, 217], [233, 223], [238, 228], [238, 236], [220, 241], [217, 236], [197, 229], [192, 242], [178, 247], [175, 280], [163, 281], [157, 298], [136, 292], [121, 316], [105, 314], [100, 317], [98, 325], [106, 326], [106, 336], [119, 337], [118, 358], [135, 363], [133, 378], [137, 383], [141, 383], [144, 374], [153, 368], [156, 332], [165, 331], [167, 322], [177, 323], [176, 340], [185, 340], [189, 328], [202, 329], [202, 371], [186, 372], [182, 380], [169, 378], [171, 403], [178, 404], [177, 413], [166, 413], [165, 405], [158, 405], [156, 421], [145, 422], [144, 403], [133, 413], [119, 409], [118, 414], [113, 415], [110, 430], [97, 438], [64, 440], [64, 446], [57, 448], [52, 459], [66, 463], [73, 477], [76, 477], [76, 460], [86, 459], [88, 472], [94, 473], [91, 497], [81, 500], [90, 500], [92, 507], [102, 505], [101, 485], [111, 485], [114, 500], [123, 500], [126, 491], [119, 490], [113, 483], [113, 474], [119, 463], [127, 463], [131, 471], [130, 488], [145, 486], [144, 503], [150, 508], [160, 501], [160, 493], [154, 490], [154, 486], [162, 482], [164, 460], [177, 461], [178, 472], [185, 467], [192, 467], [195, 457], [219, 447], [228, 450], [226, 464], [232, 470], [238, 467], [239, 462], [254, 464], [254, 471], [245, 473], [251, 491], [276, 491], [277, 496], [270, 501], [280, 500], [291, 477], [300, 476], [310, 485], [307, 498], [311, 498], [314, 505], [322, 504], [330, 511], [347, 508], [358, 522], [367, 523], [369, 518], [381, 520], [382, 527], [411, 524], [415, 531], [422, 531], [423, 523], [429, 522], [445, 531], [471, 531], [478, 550], [471, 555], [484, 557], [489, 549], [494, 548], [494, 540], [504, 534], [504, 524], [500, 519], [503, 500], [497, 497], [497, 492], [512, 485], [514, 472], [518, 471], [503, 462], [498, 453], [490, 453], [486, 443], [497, 438], [499, 431], [509, 431], [511, 424], [524, 430], [542, 423], [536, 402], [530, 397], [529, 385], [532, 377], [543, 367], [522, 353], [525, 337], [510, 328], [514, 308], [528, 307], [531, 298], [543, 297], [546, 300], [552, 297], [551, 287], [561, 285], [564, 276], [563, 261], [542, 249], [542, 244], [534, 236], [532, 222], [527, 221], [530, 201], [539, 200], [540, 206], [546, 207], [560, 187], [553, 177], [549, 161], [538, 160], [539, 151], [548, 151], [549, 159], [555, 157], [555, 147], [547, 142], [547, 135], [541, 128], [544, 118], [529, 103], [529, 99]], "Navar Basin": [[566, 268], [562, 285], [546, 289], [552, 297], [544, 302], [544, 306], [568, 316], [567, 327], [561, 334], [569, 342], [569, 351], [555, 359], [537, 360], [543, 371], [532, 377], [528, 386], [540, 418], [526, 430], [516, 425], [509, 426], [508, 432], [500, 429], [498, 438], [486, 445], [490, 452], [498, 452], [503, 461], [509, 463], [514, 474], [513, 485], [506, 486], [497, 494], [503, 501], [499, 520], [505, 524], [505, 534], [494, 541], [494, 550], [510, 558], [512, 569], [502, 570], [502, 578], [510, 591], [519, 592], [518, 600], [510, 605], [498, 605], [486, 623], [512, 627], [517, 634], [526, 637], [533, 648], [541, 648], [540, 670], [547, 681], [615, 672], [616, 675], [638, 680], [650, 689], [682, 692], [685, 697], [692, 697], [690, 686], [676, 669], [676, 664], [688, 650], [681, 650], [678, 643], [672, 641], [664, 648], [649, 646], [646, 637], [640, 634], [644, 620], [634, 613], [637, 600], [622, 590], [609, 588], [608, 577], [620, 570], [623, 556], [638, 549], [661, 552], [669, 541], [677, 540], [677, 532], [686, 527], [694, 527], [699, 536], [705, 536], [708, 533], [707, 516], [726, 516], [731, 523], [732, 538], [742, 540], [750, 550], [767, 548], [774, 556], [781, 549], [799, 546], [799, 538], [805, 536], [832, 538], [852, 546], [852, 558], [859, 567], [873, 571], [872, 583], [858, 591], [857, 604], [841, 605], [836, 613], [826, 614], [826, 617], [832, 619], [848, 637], [865, 639], [867, 632], [885, 629], [876, 624], [876, 617], [870, 617], [869, 611], [894, 592], [895, 583], [892, 575], [886, 573], [883, 554], [891, 552], [899, 539], [896, 533], [891, 532], [891, 524], [879, 507], [882, 494], [889, 492], [891, 484], [878, 468], [874, 444], [870, 443], [869, 420], [866, 415], [852, 410], [848, 396], [848, 383], [859, 374], [859, 364], [845, 364], [830, 357], [829, 349], [834, 347], [834, 342], [816, 340], [815, 335], [820, 329], [818, 322], [811, 321], [818, 309], [829, 306], [835, 316], [844, 312], [841, 306], [834, 301], [824, 301], [821, 305], [801, 305], [787, 311], [772, 309], [762, 317], [753, 316], [743, 322], [734, 322], [731, 318], [719, 320], [710, 316], [702, 302], [700, 309], [705, 333], [678, 334], [664, 318], [642, 309], [632, 309], [617, 290], [598, 293], [584, 287], [582, 278], [589, 270], [584, 270], [581, 265]], "Zahir Desert": [[1209, 139], [1155, 112], [1150, 112], [1145, 118], [1132, 115], [1130, 121], [1122, 121], [1121, 114], [1118, 120], [1099, 117], [1101, 105], [1115, 102], [1101, 100], [1095, 93], [1071, 99], [1058, 108], [1060, 138], [1055, 141], [1045, 140], [1047, 130], [1041, 125], [1037, 135], [1030, 136], [1028, 140], [1020, 138], [1022, 129], [1002, 142], [985, 139], [983, 143], [999, 157], [995, 170], [985, 171], [987, 180], [981, 188], [979, 205], [986, 231], [964, 246], [948, 247], [956, 253], [955, 260], [942, 266], [940, 275], [928, 278], [925, 285], [891, 278], [890, 283], [895, 287], [900, 303], [885, 304], [879, 315], [866, 324], [879, 329], [880, 334], [859, 333], [835, 341], [835, 347], [827, 351], [827, 357], [834, 357], [843, 365], [855, 364], [857, 378], [847, 383], [849, 390], [846, 393], [852, 399], [852, 410], [857, 411], [858, 416], [867, 415], [871, 443], [875, 444], [879, 472], [885, 473], [891, 485], [889, 492], [882, 495], [879, 507], [886, 512], [886, 519], [891, 523], [889, 530], [897, 533], [898, 542], [892, 552], [886, 552], [877, 561], [881, 561], [884, 571], [892, 575], [894, 593], [889, 594], [877, 609], [871, 609], [869, 616], [873, 617], [873, 631], [866, 633], [868, 647], [880, 652], [882, 657], [891, 657], [901, 651], [921, 653], [924, 648], [929, 648], [936, 655], [950, 654], [956, 658], [965, 641], [970, 640], [971, 630], [995, 635], [993, 622], [1003, 621], [1005, 609], [1033, 605], [1029, 594], [1034, 593], [1030, 582], [1033, 571], [1025, 570], [1027, 563], [1032, 564], [1032, 569], [1050, 574], [1053, 563], [1058, 562], [1065, 581], [1071, 581], [1073, 588], [1096, 595], [1108, 580], [1109, 566], [1118, 558], [1117, 542], [1122, 541], [1125, 547], [1136, 542], [1182, 497], [1191, 499], [1205, 486], [1216, 493], [1235, 491], [1243, 487], [1243, 478], [1252, 472], [1259, 474], [1265, 483], [1278, 483], [1283, 472], [1288, 476], [1294, 473], [1298, 462], [1291, 460], [1289, 447], [1284, 446], [1279, 433], [1281, 418], [1277, 416], [1277, 405], [1291, 392], [1308, 390], [1307, 376], [1314, 370], [1329, 370], [1330, 363], [1323, 355], [1308, 355], [1307, 343], [1311, 339], [1299, 325], [1295, 324], [1290, 329], [1278, 328], [1277, 312], [1270, 303], [1261, 303], [1257, 296], [1238, 300], [1236, 291], [1227, 291], [1226, 285], [1213, 276], [1207, 276], [1206, 267], [1200, 265], [1199, 253], [1214, 249], [1210, 237], [1201, 233], [1201, 213], [1216, 209], [1221, 216], [1230, 218], [1234, 211], [1226, 207], [1224, 192], [1251, 194]], "Silk Coast": [[1011, 655], [1011, 679], [1013, 682], [1019, 682], [1022, 692], [1029, 696], [1029, 701], [1020, 703], [1015, 711], [1016, 723], [1026, 731], [1030, 731], [1035, 724], [1036, 729], [1045, 732], [1042, 719], [1045, 718], [1049, 725], [1057, 725], [1059, 722], [1072, 724], [1075, 731], [1093, 745], [1104, 746], [1112, 744], [1112, 732], [1126, 728], [1128, 719], [1122, 712], [1122, 706], [1130, 691], [1138, 688], [1141, 683], [1141, 655], [1127, 663], [1110, 679], [1100, 698], [1097, 715], [1081, 702], [1061, 700], [1052, 695], [1049, 684], [1035, 665]], "Thalassorin": [[163, 472], [162, 482], [153, 488], [160, 492], [159, 502], [144, 507], [144, 514], [140, 516], [139, 524], [152, 524], [152, 534], [145, 535], [137, 556], [100, 559], [90, 566], [90, 571], [108, 569], [109, 581], [117, 583], [117, 573], [122, 569], [141, 568], [139, 592], [149, 588], [151, 580], [171, 580], [168, 606], [172, 622], [175, 620], [174, 604], [179, 603], [180, 594], [197, 593], [196, 625], [202, 625], [202, 601], [209, 600], [209, 585], [214, 580], [238, 586], [238, 604], [227, 606], [229, 617], [236, 621], [237, 639], [224, 643], [222, 662], [228, 656], [237, 657], [237, 675], [227, 676], [224, 697], [241, 693], [241, 690], [233, 689], [234, 680], [242, 680], [243, 687], [247, 687], [255, 676], [269, 678], [271, 672], [279, 672], [280, 666], [285, 665], [285, 657], [291, 652], [301, 653], [295, 684], [316, 681], [316, 675], [311, 673], [311, 661], [333, 659], [336, 664], [336, 690], [340, 690], [346, 681], [364, 680], [365, 694], [360, 695], [358, 701], [348, 710], [333, 710], [335, 717], [338, 713], [347, 714], [347, 723], [337, 724], [338, 741], [357, 739], [357, 770], [360, 771], [371, 762], [372, 735], [380, 735], [382, 745], [410, 745], [413, 765], [405, 777], [413, 778], [413, 788], [408, 793], [408, 805], [403, 806], [404, 811], [420, 811], [421, 801], [443, 800], [445, 775], [455, 768], [458, 761], [469, 762], [472, 757], [480, 757], [483, 762], [483, 756], [489, 750], [491, 729], [497, 726], [497, 717], [501, 715], [500, 706], [505, 705], [508, 712], [509, 704], [496, 689], [485, 686], [478, 677], [479, 668], [488, 668], [496, 676], [506, 676], [515, 690], [522, 692], [546, 683], [543, 672], [539, 670], [541, 648], [533, 649], [526, 638], [512, 628], [486, 623], [486, 618], [492, 617], [497, 605], [507, 606], [519, 598], [520, 591], [510, 592], [502, 580], [502, 570], [511, 569], [508, 555], [489, 550], [486, 556], [480, 556], [471, 532], [435, 529], [423, 522], [422, 529], [396, 523], [383, 524], [376, 519], [359, 522], [346, 508], [327, 511], [321, 503], [307, 499], [310, 485], [306, 478], [292, 474], [282, 493], [251, 490], [245, 473], [255, 471], [253, 464], [239, 462], [235, 470], [230, 470], [225, 464], [229, 451], [226, 446], [207, 449], [200, 458], [195, 458], [192, 466], [182, 468], [182, 472], [192, 475], [191, 484], [178, 484], [176, 473]], "Aridan": [[466, 787], [474, 795], [477, 812], [471, 831], [463, 835], [473, 835], [484, 840], [479, 812], [484, 807], [494, 807], [500, 819], [512, 792], [522, 791], [523, 802], [520, 811], [516, 812], [512, 836], [509, 837], [517, 841], [523, 836], [522, 814], [527, 808], [532, 808], [533, 795], [541, 794], [548, 785], [557, 785], [570, 801], [571, 829], [562, 831], [560, 854], [556, 859], [572, 859], [584, 844], [592, 842], [595, 820], [603, 820], [605, 826], [614, 826], [615, 835], [608, 845], [608, 852], [625, 851], [629, 869], [615, 875], [613, 885], [629, 885], [636, 890], [644, 924], [634, 928], [633, 934], [648, 936], [648, 955], [660, 955], [666, 963], [687, 960], [687, 944], [708, 948], [710, 941], [722, 941], [724, 937], [718, 928], [718, 920], [725, 913], [737, 913], [739, 902], [756, 900], [758, 904], [764, 904], [778, 892], [787, 892], [789, 897], [805, 895], [806, 914], [813, 914], [813, 910], [821, 906], [831, 906], [832, 920], [844, 922], [844, 930], [830, 937], [832, 947], [846, 948], [853, 943], [861, 943], [866, 955], [884, 953], [885, 938], [905, 935], [911, 922], [921, 923], [921, 935], [931, 937], [931, 932], [936, 931], [936, 920], [927, 920], [925, 908], [917, 907], [918, 893], [924, 892], [925, 876], [933, 876], [936, 901], [928, 904], [928, 908], [931, 904], [943, 904], [945, 920], [960, 908], [988, 910], [992, 901], [1002, 901], [1003, 894], [1010, 894], [1011, 886], [1020, 886], [1021, 897], [1017, 898], [1016, 907], [1008, 908], [1008, 924], [1002, 925], [1002, 930], [1020, 927], [1021, 934], [1030, 933], [1034, 924], [1047, 918], [1051, 902], [1075, 905], [1076, 914], [1088, 911], [1090, 906], [1085, 898], [1085, 889], [1070, 884], [1070, 865], [1090, 862], [1090, 855], [1085, 852], [1086, 837], [1075, 831], [1057, 833], [1055, 826], [1040, 817], [1039, 812], [1032, 815], [1012, 812], [1008, 808], [1008, 799], [991, 796], [982, 788], [987, 769], [972, 772], [970, 779], [961, 778], [961, 768], [974, 753], [973, 728], [962, 711], [961, 681], [951, 678], [950, 673], [940, 666], [939, 659], [944, 656], [924, 649], [882, 657], [869, 648], [867, 640], [846, 636], [830, 619], [826, 619], [826, 625], [818, 631], [808, 632], [807, 614], [811, 611], [791, 599], [775, 595], [755, 610], [764, 614], [764, 623], [783, 626], [784, 637], [764, 637], [758, 631], [748, 631], [746, 627], [731, 622], [728, 628], [718, 630], [716, 639], [697, 640], [695, 647], [677, 664], [677, 672], [690, 685], [691, 698], [685, 698], [682, 693], [650, 690], [638, 681], [610, 672], [548, 681], [528, 691], [526, 702], [499, 705], [502, 714], [511, 715], [511, 723], [493, 727], [491, 740], [507, 743], [508, 762], [487, 766], [487, 778]], "Lake Navar": [[560, 529], [560, 555], [588, 561], [585, 585], [580, 586], [578, 594], [571, 594], [568, 600], [560, 600], [569, 632], [575, 635], [577, 662], [560, 683], [567, 683], [578, 664], [586, 663], [586, 658], [580, 656], [580, 647], [589, 646], [583, 644], [583, 636], [592, 633], [607, 635], [608, 643], [618, 644], [619, 650], [628, 650], [630, 638], [647, 638], [648, 645], [661, 649], [661, 657], [631, 657], [631, 663], [653, 665], [659, 670], [663, 668], [664, 660], [671, 659], [671, 646], [679, 646], [686, 651], [686, 659], [692, 659], [697, 642], [720, 639], [735, 643], [733, 627], [747, 627], [749, 633], [769, 637], [772, 656], [781, 657], [782, 663], [789, 663], [794, 657], [787, 649], [782, 655], [774, 655], [772, 639], [783, 638], [786, 632], [817, 631], [828, 624], [829, 615], [845, 616], [845, 624], [836, 625], [843, 627], [844, 641], [836, 642], [836, 648], [831, 649], [836, 661], [836, 652], [840, 648], [849, 648], [852, 636], [860, 636], [863, 645], [865, 631], [875, 628], [900, 630], [890, 623], [890, 610], [899, 609], [889, 606], [889, 595], [899, 592], [893, 576], [893, 567], [900, 564], [898, 550], [886, 553], [883, 559], [876, 559], [870, 568], [860, 568], [854, 561], [854, 546], [877, 537], [870, 535], [867, 528], [854, 529], [852, 523], [845, 520], [831, 522], [833, 537], [799, 537], [795, 549], [782, 548], [779, 555], [770, 555], [767, 552], [768, 542], [781, 538], [780, 522], [795, 512], [788, 512], [783, 503], [782, 507], [771, 507], [770, 503], [768, 507], [759, 507], [751, 499], [745, 499], [743, 505], [736, 505], [735, 518], [722, 514], [709, 516], [683, 490], [685, 474], [703, 473], [702, 463], [691, 461], [686, 450], [682, 450], [685, 466], [678, 471], [678, 488], [669, 489], [669, 495], [658, 503], [656, 511], [669, 508], [672, 495], [681, 495], [692, 504], [697, 520], [680, 530], [664, 551], [643, 548], [624, 556], [619, 561], [619, 571], [608, 578], [609, 597], [600, 597], [595, 586], [589, 584], [591, 566], [598, 564], [595, 556], [576, 559], [564, 555]], "Khombasa": [[1395, 482], [1386, 482], [1371, 489], [1365, 481], [1372, 477], [1372, 473], [1365, 466], [1359, 465], [1357, 470], [1349, 470], [1348, 476], [1355, 479], [1363, 488], [1361, 498], [1355, 491], [1331, 490], [1324, 486], [1322, 475], [1316, 471], [1315, 465], [1302, 462], [1300, 466], [1295, 464], [1284, 451], [1283, 441], [1276, 440], [1276, 445], [1271, 447], [1269, 467], [1275, 473], [1275, 488], [1305, 488], [1306, 497], [1282, 500], [1282, 516], [1278, 518], [1278, 525], [1267, 526], [1264, 530], [1253, 530], [1252, 546], [1247, 548], [1246, 555], [1239, 555], [1238, 564], [1232, 564], [1230, 579], [1218, 579], [1217, 574], [1202, 574], [1202, 587], [1194, 589], [1193, 620], [1185, 621], [1185, 634], [1191, 635], [1191, 645], [1180, 649], [1179, 653], [1157, 653], [1154, 646], [1142, 646], [1141, 680], [1157, 672], [1167, 671], [1170, 661], [1178, 670], [1183, 670], [1191, 663], [1189, 656], [1197, 655], [1201, 664], [1209, 662], [1208, 686], [1219, 686], [1223, 680], [1223, 673], [1215, 663], [1226, 654], [1228, 639], [1232, 633], [1246, 627], [1246, 612], [1243, 608], [1248, 605], [1248, 601], [1241, 600], [1240, 595], [1247, 587], [1267, 585], [1273, 589], [1274, 596], [1280, 594], [1283, 600], [1296, 608], [1315, 610], [1321, 604], [1324, 620], [1341, 616], [1341, 607], [1354, 610], [1356, 603], [1366, 602], [1362, 583], [1364, 569], [1385, 562], [1389, 558], [1389, 554], [1378, 546], [1376, 538], [1378, 533], [1380, 539], [1384, 539], [1385, 536], [1392, 538], [1391, 524], [1387, 519], [1393, 517], [1394, 513], [1390, 512], [1390, 502], [1399, 494]]};
const TERRAIN_MASK_FILES={"Northridge": "assets/map-masks/northridge.png", "Verdan": "assets/map-masks/verdan.png", "Navar Basin": "assets/map-masks/navar-basin.png", "Zahir Desert": "assets/map-masks/zahir-desert.png", "Silk Coast": "assets/map-masks/silk-coast.png", "Thalassorin": "assets/map-masks/thalassorin.png", "Aridan": "assets/map-masks/aridan.png", "Lake Navar": "assets/map-masks/lake-navar.png", "Khombasa": "assets/map-masks/khombasa.png"};
const FIX_REGION_CENTERS_PX={"Northridge": [780, 165], "Verdan": [335, 400], "Navar Basin": [705, 475], "Zahir Desert": [1045, 430], "Silk Coast": [1235, 745], "Thalassorin": [315, 675], "Aridan": [700, 860]};
const FIX_LOCATIONS_PX={"Khombasa": [1280, 566, "capital"], "Lake Navar": [705, 570, "lake"]};

const shiftingMapModal=document.getElementById('shiftingMapModal');
const closeShiftingMap=document.getElementById('closeShiftingMap');
const mapPlaceTitle=document.getElementById('mapPlaceTitle');
const mapPlaceText=document.getElementById('mapPlaceText');
const mapPlaceMeta=document.getElementById('mapPlaceMeta');
const atlasPlaceSubtitle=document.getElementById('atlasPlaceSubtitle');
const atlasPlaceImage=document.getElementById('atlasPlaceImage');
const atlasCompass=document.getElementById('atlasCompass');

let urukhombaMap=null;
let activeTerrainOverlay=null;
const MAP_W=1536, MAP_H=1024;
let mapBounds=null;

function pxToLeaflet(x,yTop){ return [MAP_H-yTop,x]; }
function contourToLeaflet(points){ return points.map(([x,y])=>pxToLeaflet(x,y)); }

function showTerrainInfo(name,source){
  const d=source[name];
  if(!d)return;

  mapPlaceTitle.textContent=name;
  atlasPlaceSubtitle.textContent=d.subtitle||'';
  mapPlaceText.textContent=d.text;
  mapPlaceMeta.innerHTML=d.meta.map(([k,v]) =>
    `<div class="map-meta-row"><small>${k}</small><strong>${v}</strong></div>`
  ).join('');

  const pos={
    "Khombasa":"86% 57%","Northridge":"51% 13%","Verdan":"22% 39%",
    "Navar Basin":"48% 48%","Lake Navar":"48% 58%","Zahir Desert":"70% 42%",
    "Silk Coast":"82% 72%","Thalassorin":"20% 66%","Aridan":"52% 86%"
  };
  atlasPlaceImage.style.backgroundImage=
    `linear-gradient(180deg,rgba(3,25,21,.04),rgba(3,25,21,.17)),url('assets/shifting-lands-map.png')`;
  atlasPlaceImage.style.backgroundSize='260%';
  atlasPlaceImage.style.backgroundPosition=pos[name]||'center';

  selectTerrainMask(name);
}

function selectTerrainMask(name){
  if(activeTerrainOverlay){
    urukhombaMap.removeLayer(activeTerrainOverlay);
    activeTerrainOverlay=null;
  }
  const file=TERRAIN_MASK_FILES[name];
  if(!file)return;

  activeTerrainOverlay=L.imageOverlay(file+'?naturalfix=5',mapBounds,{
    opacity:1,
    interactive:false,
    pane:'overlayPane'
  }).addTo(urukhombaMap);
}

function makeLabel(name,type='region'){
  let cls='map-region-label';
  if(type==='capital')cls='map-place-label capital';
  if(type==='lake')cls='map-place-label lake';
  return L.divIcon({className:cls,html:`<div>${name}</div>`,iconSize:null});
}

function makeSymbol(symbol,type='normal'){
  return L.divIcon({
    className:`map-symbol-icon ${type}`,
    html:`<div class="symbol">${symbol}</div>`,
    iconSize:type==='capital'?[30,30]:[22,22],
    iconAnchor:type==='capital'?[15,15]:[11,11]
  });
}

function buildTerrainAtlas(){
  if(urukhombaMap || !window.L)return;

  mapBounds=L.latLngBounds([[0,0],[MAP_H,MAP_W]]);
  urukhombaMap=L.map('urukhombaLeafletMap',{
    crs:L.CRS.Simple,
    minZoom:-0.25,
    maxZoom:3,
    zoomSnap:.25,
    zoomDelta:.5,
    maxBounds:mapBounds,
    maxBoundsViscosity:1.0,
    inertia:false,
    attributionControl:false,
    zoomControl:true
  });

  L.imageOverlay('assets/shifting-lands-map.png',mapBounds,{
    opacity:1,
    interactive:false
  }).addTo(urukhombaMap);

  // Invisible hit areas. The visible highlight comes from exact raster masks.
  Object.entries(TERRAIN_CONTOURS).forEach(([name,points])=>{
    if(!points || points.length<3)return;
    const hit=L.polygon(contourToLeaflet(points),{
      color:'transparent',
      weight:0,
      fillColor:'transparent',
      fillOpacity:0,
      interactive:true
    }).addTo(urukhombaMap);
    hit.on('click',()=>showTerrainInfo(name,FIX_PLACES));
  });

  Object.entries(FIX_REGION_CENTERS_PX).forEach(([name,[x,y]])=>{
    const marker=L.marker(pxToLeaflet(x,y),{
      icon:makeLabel(name,'region'),
      interactive:true
    }).addTo(urukhombaMap);
    marker.on('click',()=>showTerrainInfo(name,FIX_PLACES));
  });

  Object.entries(FIX_LOCATIONS_PX).forEach(([name,[x,y,type]])=>{
    const symbol=type==='capital'?'★':'◉';
    const point=L.marker(pxToLeaflet(x,y),{
      icon:makeSymbol(symbol,type==='capital'?'capital':'normal'),
      interactive:true
    }).addTo(urukhombaMap);
    point.on('click',()=>showTerrainInfo(name,FIX_PLACES));

    const label=L.marker(pxToLeaflet(x+38,y),{
      icon:makeLabel(name,type),
      interactive:true
    }).addTo(urukhombaMap);
    label.on('click',()=>showTerrainInfo(name,FIX_PLACES));
  });

  urukhombaMap.fitBounds(mapBounds,{padding:[0,0],animate:false});
  urukhombaMap.setMaxBounds(mapBounds);

  const needle=atlasCompass?.querySelector('.compass-needle');
  if(needle)needle.style.transform='rotate(0deg)';

  showTerrainInfo('Khombasa',FIX_PLACES);
}

function openTerrainAtlas(){
  shiftingMapModal?.classList.add('show');
  shiftingMapModal?.setAttribute('aria-hidden','false');
  document.body.classList.add('shifting-map-open');

  requestAnimationFrame(()=>{
    buildTerrainAtlas();
    setTimeout(()=>{
      urukhombaMap?.invalidateSize();
      urukhombaMap?.fitBounds(mapBounds,{padding:[0,0],animate:false});
    },90);
  });
}

function closeTerrainAtlas(){
  shiftingMapModal?.classList.remove('show');
  shiftingMapModal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('shifting-map-open');
}

document.querySelectorAll('.world-folder-shifting').forEach(card=>{
  card.addEventListener('click',e=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    openTerrainAtlas();
  });
  card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      e.stopImmediatePropagation();
      openTerrainAtlas();
    }
  });
});

document.querySelectorAll('#fixedMapLegend button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('#fixedMapLegend button').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    showTerrainInfo(btn.dataset.feature,FIX_FEATURES);
  });
});

closeShiftingMap?.addEventListener('click',closeTerrainAtlas);
shiftingMapModal?.addEventListener('click',e=>{
  if(e.target===shiftingMapModal)closeTerrainAtlas();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&shiftingMapModal?.classList.contains('show'))closeTerrainAtlas();
});
