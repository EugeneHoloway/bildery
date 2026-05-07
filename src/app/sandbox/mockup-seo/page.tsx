'use client'



const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111}
.wrap{border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;min-height:560px}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #e5e5e5}
.page-title{font-size:15px;font-weight:500}
.page-url{font-size:12px;color:#888;margin-top:1px}
.topbar-right{display:flex;gap:8px;align-items:center}
.btn{padding:6px 13px;font-size:12px;border:1px solid #e5e5e5;border-radius:8px;background:transparent;color:#111;cursor:pointer}
.btn:hover{background:#f8f8f7}
.btn-primary{background:#4F46E5;color:#fff;border-color:#4F46E5}
.tabs{display:flex;border-bottom:1px solid #e5e5e5}
.tab{padding:10px 18px;font-size:13px;cursor:pointer;color:#888;border-bottom:2px solid transparent;margin-bottom:-1px}
.tab:hover{color:#111}
.tab.active{color:#4F46E5;border-bottom-color:#4F46E5}
.body{padding:20px;display:flex;flex-direction:column;gap:16px}
.hidden{display:none}
.field-group{display:flex;flex-direction:column;gap:5px}
.field-label{font-size:12px;font-weight:500;color:#888;display:flex;justify-content:space-between}
.field-hint{font-size:11px;color:#aaa;font-weight:400}
.field-input{padding:8px 10px;border:1px solid #e5e5e5;border-radius:8px;font-size:13px;background:#f8f8f7;color:#111;width:100%}
.field-input:focus{outline:none;border-color:#4F46E5}
.textarea{width:100%;padding:8px 10px;border:1px solid #e5e5e5;border-radius:8px;font-size:13px;background:#f8f8f7;color:#111;resize:vertical;line-height:1.5}
.textarea:focus{outline:none;border-color:#4F46E5}
.char-bar-wrap{height:3px;border-radius:2px;background:#e5e5e5;margin-top:4px}
.char-bar{height:3px;border-radius:2px;transition:width 0.2s,background 0.2s}
.char-count{font-size:11px;color:#888;margin-top:3px}
.serp-preview{border:1px solid #e5e5e5;border-radius:12px;padding:16px;background:#f8f8f7}
.serp-label{font-size:11px;font-weight:500;color:#888;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em}
.serp-url{font-size:12px;color:#1a7f4b;margin-bottom:2px}
.serp-title{font-size:18px;color:#1558d6;font-weight:400;margin-bottom:3px;line-height:1.3}
.serp-desc{font-size:13px;color:#555;line-height:1.5}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.divider{height:1px;background:#e5e5e5}
.lang-tabs{display:flex;gap:6px}
.lang-tab{padding:4px 10px;font-size:11px;border:1px solid #e5e5e5;border-radius:6px;cursor:pointer;background:transparent;color:#888}
.lang-tab.active{background:#4F46E5;color:#fff;border-color:#4F46E5}
.og-preview{border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}
.og-img{width:100%;height:80px;background:#f1f1f1;display:flex;align-items:center;justify-content:center;font-size:12px;color:#888;cursor:pointer}
.og-meta{padding:10px 12px;background:#f8f8f7}
.og-domain{font-size:10px;color:#888;text-transform:uppercase}
.og-title{font-size:13px;font-weight:500}
.og-desc{font-size:12px;color:#888}
.checklist{display:flex;flex-direction:column;gap:8px;padding:12px;background:#f8f8f7;border-radius:8px}
.status-row{display:flex;align-items:center;gap:8px}
.status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot-ok{background:#22c55e}
.dot-warn{background:#f59e0b}
.dot-err{background:#E24B4A}
.status-text{font-size:12px;color:#555}
/* WYSIWYG */
.wysiwyg{border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}
.wysiwyg-toolbar{display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid #e5e5e5;background:#f8f8f7;align-items:center;flex-wrap:wrap}
.tb{min-width:26px;height:26px;border:none;background:transparent;border-radius:4px;cursor:pointer;font-size:12px;color:#555;display:inline-flex;align-items:center;justify-content:center;padding:0 6px;font-family:inherit}
.tb:hover{background:#e5e5e5;color:#111}
.tb.active{background:#e0e7ff;color:#4F46E5}
.tb-b{font-weight:700}
.tb-i{font-style:italic}
.tb-sep{width:1px;height:18px;background:#e5e5e5;margin:0 4px;flex-shrink:0}
.wysiwyg-body{padding:12px 14px;min-height:160px;font-size:13px;line-height:1.7;outline:none;color:#111}
.wysiwyg-body:focus{outline:none}
.wysiwyg-body h2{font-size:15px;font-weight:600;margin-bottom:4px;margin-top:2px}
.wysiwyg-body p{margin-bottom:6px}
.wysiwyg-body ul,.wysiwyg-body ol{padding-left:20px;margin-bottom:6px}
.wysiwyg-body a{color:#4F46E5;text-decoration:underline}
.word-count{font-size:11px;color:#aaa;margin-top:4px;text-align:right}
/* Game selector */
.games-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.games-search-input{flex:1;padding:7px 10px;border:1px solid #e5e5e5;border-radius:8px;font-size:12px;background:#f8f8f7;color:#111;outline:none}
.games-search-input:focus{border-color:#4F46E5}
.games-count{font-size:11px;color:#888;white-space:nowrap}
.games-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.game-card{border:1px solid #e5e5e5;border-radius:8px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;position:relative;background:#f8f8f7}
.game-card.on{border-color:#4F46E5;background:#fff}
.game-card:hover{border-color:#c7c5f4}
.game-card.on:hover{border-color:#4F46E5}
.game-thumb{width:100%;height:38px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,0.85);font-weight:600;letter-spacing:0.03em}
.game-name{font-size:10px;font-weight:500;text-align:center;line-height:1.3;color:#111}
.game-prov{font-size:9px;color:#aaa;text-align:center}
.game-check{position:absolute;top:4px;right:5px;font-size:10px;color:#4F46E5;font-weight:700}
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <div><div class="page-title">Game providers</div><div class="page-url">betup.com/providers</div></div>
    <div class="topbar-right"><button class="btn">Content</button><button class="btn btn-primary">Save SEO</button></div>
  </div>
  <div class="tabs">
    <div class="tab active" onclick="switchTab('basic',this)">Basic SEO</div>
    <div class="tab" onclick="switchTab('content',this)">Content</div>
    <div class="tab" onclick="switchTab('og',this)">Social / OG</div>
    <div class="tab" onclick="switchTab('advanced',this)">Advanced</div>
    <div class="tab" onclick="switchTab('audit',this)">SEO audit</div>
  </div>

  <!-- BASIC SEO -->
  <div id="t-basic" class="body">
    <div class="lang-tabs">
      <button class="lang-tab active" onclick="setLang(this)">EN</button>
      <button class="lang-tab" onclick="setLang(this)">DE</button>
      <button class="lang-tab" onclick="setLang(this)">UA</button>
    </div>
    <div class="field-group">
      <div class="field-label">H1 — page heading <span class="field-hint">shown on the page, 1 per page</span></div>
      <input id="h1" class="field-input" type="text" value="Game providers at BetUp Casino" oninput="updateSerp()">
    </div>
    <div class="field-group">
      <div class="field-label">Title tag <span class="field-hint">shown in browser tab and Google</span></div>
      <input id="meta-title" class="field-input" type="text" value="Game Providers — BetUp Casino | Slots & Live Games" oninput="updateBars();updateSerp()">
      <div class="char-bar-wrap"><div id="bar-title" class="char-bar"></div></div>
      <div id="cnt-title" class="char-count"></div>
    </div>
    <div class="field-group">
      <div class="field-label">Meta description <span class="field-hint">shown under title in Google</span></div>
      <textarea id="meta-desc" class="textarea" rows="3" oninput="updateBars();updateSerp()">Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.</textarea>
      <div class="char-bar-wrap"><div id="bar-desc" class="char-bar"></div></div>
      <div id="cnt-desc" class="char-count"></div>
    </div>
    <div class="divider"></div>
    <div class="field-group">
      <div class="field-label">SERP preview</div>
      <div class="serp-preview">
        <div class="serp-label">Google search result</div>
        <div class="serp-url">betup.com › providers</div>
        <div id="serp-title" class="serp-title">Game Providers — BetUp Casino | Slots & Live Games</div>
        <div id="serp-desc" class="serp-desc">Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.</div>
      </div>
    </div>
  </div>

  <!-- OG -->
  <div id="t-og" class="body hidden">
    <div class="field-group"><div class="field-label">OG title <span class="field-hint">shown when sharing link on social</span></div><input class="field-input" type="text" value="Game Providers — BetUp Casino"></div>
    <div class="field-group"><div class="field-label">OG description</div><textarea class="textarea" rows="2">Discover all game providers at BetUp. Slots, live casino and more from the world's top studios.</textarea></div>
    <div class="field-group">
      <div class="field-label">OG image <span class="field-hint">recommended 1200×630px</span></div>
      <div class="og-preview">
        <div class="og-img">Click to upload OG image (1200×630)</div>
        <div class="og-meta"><div class="og-domain">BETUP.COM</div><div class="og-title">Game Providers — BetUp Casino</div><div class="og-desc">Discover all game providers at BetUp.</div></div>
      </div>
    </div>
    <div class="row2">
      <div class="field-group"><div class="field-label">Twitter card type</div><select class="field-input"><option>summary_large_image</option><option>summary</option></select></div>
      <div class="field-group"><div class="field-label">Twitter site handle</div><input class="field-input" type="text" value="@betup"></div>
    </div>
  </div>

  <!-- ADVANCED -->
  <div id="t-advanced" class="body hidden">
    <div class="row2">
      <div class="field-group"><div class="field-label">Canonical URL <span class="field-hint">leave blank = self</span></div><input class="field-input" type="text" placeholder="https://betup.com/providers"></div>
      <div class="field-group"><div class="field-label">Robots</div><select class="field-input"><option>index, follow</option><option>noindex, follow</option><option>noindex, nofollow</option></select></div>
    </div>
    <div class="row2">
      <div class="field-group"><div class="field-label">Include in sitemap</div><select class="field-input"><option>Yes</option><option>No</option></select></div>
      <div class="field-group"><div class="field-label">Sitemap priority</div><select class="field-input"><option>0.8 — high</option><option>0.5 — normal</option><option>0.3 — low</option></select></div>
    </div>
    <div class="divider"></div>
    <div class="field-group"><div class="field-label">Structured data (JSON-LD)</div><textarea class="textarea" rows="5" style="font-family:monospace;font-size:12px">{\n  "@context": "https://schema.org",\n  "@type": "ItemList",\n  "name": "Game providers at BetUp Casino"\n}</textarea></div>
    <div class="field-group"><div class="field-label">Hreflang</div><select class="field-input"><option>Auto — generate from active languages</option><option>Manual</option><option>Disabled</option></select></div>
  </div>

  <!-- CONTENT -->
  <div id="t-content" class="body hidden">

    <!-- WYSIWYG -->
    <div class="field-group">
      <div class="field-label">Page text <span class="field-hint">shown on the page below the provider grid</span></div>
      <div class="wysiwyg">
        <div class="wysiwyg-toolbar">
          <button class="tb tb-b" title="Bold" onclick="fmt('bold')">B</button>
          <button class="tb tb-i" title="Italic" onclick="fmt('italic')">I</button>
          <button class="tb" title="Underline" onclick="fmt('underline')" style="text-decoration:underline">U</button>
          <span class="tb-sep"></span>
          <button class="tb" title="Heading 2" onclick="fmt('formatBlock','h2')" style="font-size:11px;font-weight:600">H2</button>
          <button class="tb" title="Paragraph" onclick="fmt('formatBlock','p')" style="font-size:11px">¶</button>
          <span class="tb-sep"></span>
          <button class="tb" title="Bullet list" onclick="fmt('insertUnorderedList')">• list</button>
          <button class="tb" title="Numbered list" onclick="fmt('insertOrderedList')">1. list</button>
          <span class="tb-sep"></span>
          <button class="tb" title="Insert link" onclick="insertLink()" style="color:#4F46E5">⌘ link</button>
        </div>
        <div id="wysiwyg-body" class="wysiwyg-body" contenteditable="true" oninput="updateWordCount()"><h2>Top Game Providers at BetUp Casino</h2><p>BetUp Casino partners with 12 of the world's leading game studios, delivering over 2,000 slots, live casino tables, and crash games. From <strong>Pragmatic Play's</strong> iconic Sweet Bonanza to <strong>Evolution's</strong> live Lightning Roulette — every title is hand-picked for quality.</p><p>All providers are licensed, regularly audited for fairness, and offer games optimised for desktop and mobile.</p></div>
      </div>
      <div id="word-count" class="word-count"></div>
    </div>

    <div class="divider"></div>

    <!-- GAME SELECTOR -->
    <div class="field-group">
      <div class="field-label">Featured games <span class="field-hint" id="sel-count">4 selected</span></div>
      <div class="games-top">
        <input class="games-search-input" type="text" placeholder="Search games…" oninput="filterGames(this.value)">
        <span class="games-count" id="games-visible-count">12 games</span>
      </div>
      <div class="games-grid" id="games-grid">
        <div class="game-card on" onclick="toggleGame(this)" data-name="sweet bonanza"><div class="game-check">✓</div><div class="game-thumb" style="background:linear-gradient(135deg,#e879a0,#f87171)">PP</div><div class="game-name">Sweet Bonanza</div><div class="game-prov">Pragmatic Play</div></div>
        <div class="game-card on" onclick="toggleGame(this)" data-name="gates of olympus"><div class="game-check">✓</div><div class="game-thumb" style="background:linear-gradient(135deg,#7c3aed,#6366f1)">PP</div><div class="game-name">Gates of Olympus</div><div class="game-prov">Pragmatic Play</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="big bass bonanza"><div class="game-thumb" style="background:linear-gradient(135deg,#0ea5e9,#22d3ee)">PP</div><div class="game-name">Big Bass Bonanza</div><div class="game-prov">Pragmatic Play</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="wolf gold"><div class="game-thumb" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">PP</div><div class="game-name">Wolf Gold</div><div class="game-prov">Pragmatic Play</div></div>
        <div class="game-card on" onclick="toggleGame(this)" data-name="lightning roulette"><div class="game-check">✓</div><div class="game-thumb" style="background:linear-gradient(135deg,#d97706,#fbbf24)">EVO</div><div class="game-name">Lightning Roulette</div><div class="game-prov">Evolution</div></div>
        <div class="game-card on" onclick="toggleGame(this)" data-name="crazy time"><div class="game-check">✓</div><div class="game-thumb" style="background:linear-gradient(135deg,#dc2626,#f97316)">EVO</div><div class="game-name">Crazy Time</div><div class="game-prov">Evolution</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="monopoly live"><div class="game-thumb" style="background:linear-gradient(135deg,#15803d,#4ade80)">EVO</div><div class="game-name">Monopoly Live</div><div class="game-prov">Evolution</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="starburst"><div class="game-thumb" style="background:linear-gradient(135deg,#7e22ce,#c026d3)">NET</div><div class="game-name">Starburst</div><div class="game-prov">NetEnt</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="gonzo's quest"><div class="game-thumb" style="background:linear-gradient(135deg,#854d0e,#eab308)">NET</div><div class="game-name">Gonzo's Quest</div><div class="game-prov">NetEnt</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="book of dead"><div class="game-thumb" style="background:linear-gradient(135deg,#78350f,#d97706)">PNG</div><div class="game-name">Book of Dead</div><div class="game-prov">Play'n GO</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="reactoonz"><div class="game-thumb" style="background:linear-gradient(135deg,#065f46,#10b981)">PNG</div><div class="game-name">Reactoonz</div><div class="game-prov">Play'n GO</div></div>
        <div class="game-card" onclick="toggleGame(this)" data-name="jammin jars"><div class="game-thumb" style="background:linear-gradient(135deg,#9f1239,#fb7185)">PNG</div><div class="game-name">Jammin' Jars</div><div class="game-prov">Play'n GO</div></div>
      </div>
    </div>
  </div>

  <!-- AUDIT -->
  <div id="t-audit" class="body hidden">
    <div class="checklist">
      <div class="status-row"><span class="status-dot dot-ok"></span><span class="status-text">H1 present and unique</span></div>
      <div class="status-row"><span class="status-dot dot-ok"></span><span class="status-text">Title tag: 50 characters — good length</span></div>
      <div class="status-row"><span class="status-dot dot-ok"></span><span class="status-text">Meta description: 148 characters — good length</span></div>
      <div class="status-row"><span class="status-dot dot-warn"></span><span class="status-text">OG image not set — social shares will use fallback</span></div>
      <div class="status-row"><span class="status-dot dot-ok"></span><span class="status-text">Page is indexable (robots: index, follow)</span></div>
      <div class="status-row"><span class="status-dot dot-ok"></span><span class="status-text">Page included in sitemap</span></div>
      <div class="status-row"><span class="status-dot dot-warn"></span><span class="status-text">No structured data — consider adding JSON-LD</span></div>
      <div class="status-row"><span class="status-dot dot-ok"></span><span class="status-text">Canonical URL: self-referencing (correct)</span></div>
      <div class="status-row"><span class="status-dot dot-err"></span><span class="status-text">DE and UA translations missing</span></div>
    </div>
  </div>
</div>
<script>
function switchTab(id,el){
  ['basic','og','advanced','audit','content'].forEach(t=>document.getElementById('t-'+t).classList.toggle('hidden',t!==id));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}
function fmt(cmd,val){document.getElementById('wysiwyg-body').focus();document.execCommand(cmd,false,val||null);}
function insertLink(){const url=prompt('URL:','https://');if(url)document.execCommand('createLink',false,url);}
function updateWordCount(){
  const text=document.getElementById('wysiwyg-body').innerText||'';
  const words=text.trim().split(/\s+/).filter(Boolean).length;
  document.getElementById('word-count').textContent=words+' words';
}
function toggleGame(el){
  el.classList.toggle('on');
  const chk=el.querySelector('.game-check');
  if(el.classList.contains('on')){if(!chk){const c=document.createElement('div');c.className='game-check';c.textContent='✓';el.prepend(c);}else chk.style.display='';}
  else{if(chk)chk.style.display='none';}
  const total=document.querySelectorAll('.game-card.on').length;
  document.getElementById('sel-count').textContent=total+' selected';
}
function filterGames(q){
  const cards=document.querySelectorAll('#games-grid .game-card');
  let visible=0;
  cards.forEach(c=>{const match=c.dataset.name.includes(q.toLowerCase());c.style.display=match?'':'none';if(match)visible++;});
  document.getElementById('games-visible-count').textContent=visible+' games';
}
updateWordCount();
function setLang(el){document.querySelectorAll('.lang-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');}
function updateBars(){
  const title=document.getElementById('meta-title').value;
  const desc=document.getElementById('meta-desc').value;
  const tLen=title.length,dLen=desc.length;
  const tMax=60,dMax=160;
  const tPct=Math.min(tLen/tMax*100,100);
  const dPct=Math.min(dLen/dMax*100,100);
  const tColor=tLen>tMax?'#E24B4A':tLen>50?'#22c55e':'#f59e0b';
  const dColor=dLen>dMax?'#E24B4A':dLen>120?'#22c55e':'#f59e0b';
  const bt=document.getElementById('bar-title');const bd=document.getElementById('bar-desc');
  bt.style.width=tPct+'%';bt.style.background=tColor;
  bd.style.width=dPct+'%';bd.style.background=dColor;
  document.getElementById('cnt-title').textContent=tLen+' / '+tMax+' characters';
  document.getElementById('cnt-desc').textContent=dLen+' / '+dMax+' characters';
}
function updateSerp(){
  const t=document.getElementById('meta-title').value;
  const d=document.getElementById('meta-desc').value;
  document.getElementById('serp-title').textContent=t.length>60?t.slice(0,57)+'…':t;
  document.getElementById('serp-desc').textContent=d.length>160?d.slice(0,157)+'…':d;
}
updateBars();updateSerp();
</script>
</body>
</html>`;

export default function MockupSeoPage() {
  return (
    <div className="sandbox-page">
      <div className="container">
        <div className="sandbox-header">
          <nav className="doc-breadcrumb" aria-label="Breadcrumb">
            <a className="doc-breadcrumb__link" href="/sandbox">Sandbox</a>
            <span className="doc-breadcrumb__sep">/</span>
            <span className="doc-breadcrumb__current">SEO editor</span>
          </nav>
          <span className="sandbox-card__tag" style={{ display: 'inline-block', marginBottom: 8 }}>iGaming Backoffice (mockup)</span>
          <h1 className="sandbox-header__title">SEO editor · BetUp</h1>
          <p className="sandbox-header__description">
            Per-page SEO panel with H1, title, meta description, live SERP preview, Open Graph, advanced settings and audit.
          </p>
        </div>
        <div className="sandbox-section">
          <iframe
            srcDoc={html}
            style={{ width: '100%', height: 720, border: 'none', borderRadius: 12 }}
            title="SEO editor mockup"
          />
        </div>
      </div>
    </div>
  );
}
