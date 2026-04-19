'use client'


import Link from 'next/link'

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111}
.layout{display:grid;grid-template-columns:260px 1fr;gap:0;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;min-height:600px}
.sidebar{background:#f8f8f7;border-right:1px solid #e5e5e5;padding:16px 0}
.sidebar-title{font-size:11px;font-weight:500;color:#888;letter-spacing:0.06em;text-transform:uppercase;padding:0 16px 10px}
.section-item{display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer;border-left:2px solid transparent}
.section-item:hover{background:#fff}
.section-item.active{background:#fff;border-left-color:#4F46E5}
.section-item .drag-handle{color:#aaa;font-size:12px;cursor:grab}
.section-item .label{flex:1;font-size:13px;color:#111}
.section-item .badge{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:500}
.badge-auto{background:#e0f2fe;color:#0369a1}
.badge-manual{background:#fef9c3;color:#92400e}
.toggle{width:32px;height:18px;border-radius:9px;border:none;cursor:pointer;position:relative;flex-shrink:0}
.toggle.on{background:#4F46E5}
.toggle.off{background:#d1d5db}
.toggle::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:2px;transition:left 0.15s}
.toggle.on::after{left:16px}
.toggle.off::after{left:2px}
.main{background:#fff;padding:24px}
.panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.panel-title{font-size:16px;font-weight:500}
.panel-subtitle{font-size:12px;color:#888;margin-top:2px}
.save-btn{padding:7px 16px;background:#4F46E5;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:500}
.panel-body{display:flex;flex-direction:column;gap:16px}
.field-group{display:flex;flex-direction:column;gap:5px}
.field-label{font-size:12px;font-weight:500;color:#888}
.field-input{padding:8px 10px;border:1px solid #e5e5e5;border-radius:8px;font-size:13px;background:#f8f8f7;color:#111;width:100%}
.field-input:focus{outline:none;border-color:#4F46E5}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mode-tabs{display:flex;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;width:fit-content}
.mode-tab{padding:6px 14px;font-size:12px;cursor:pointer;background:#f8f8f7;color:#888;border:none}
.mode-tab.active{background:#4F46E5;color:#fff}
.game-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:4px}
.game-card{border:1px solid #e5e5e5;border-radius:8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:9px;color:#888;background:#f8f8f7;cursor:pointer;position:relative}
.game-card.selected{border-color:#4F46E5;background:#fff}
.game-card.selected::after{content:'✓';position:absolute;top:2px;right:4px;font-size:10px;color:#4F46E5;font-weight:700}
.slide-list{display:flex;flex-direction:column;gap:8px}
.slide-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;background:#f8f8f7}
.slide-preview{width:48px;height:32px;border-radius:4px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:9px;color:#aaa;flex-shrink:0}
.slide-info{flex:1}
.slide-title{font-size:13px;font-weight:500}
.slide-meta{font-size:11px;color:#888}
.slide-actions{display:flex;gap:6px}
.btn-sm{padding:4px 10px;font-size:11px;border:1px solid #e5e5e5;border-radius:6px;background:transparent;color:#888;cursor:pointer}
.btn-sm:hover{background:#f8f8f7}
.btn-danger{color:#E24B4A;border-color:#fca5a5}
.add-slide-btn{padding:8px;border:1px dashed #d1d5db;border-radius:8px;text-align:center;font-size:12px;color:#888;cursor:pointer;background:transparent}
.seo-textarea{width:100%;padding:10px;border:1px solid #e5e5e5;border-radius:8px;font-size:13px;background:#f8f8f7;color:#111;resize:vertical;line-height:1.5}
.lang-tabs{display:flex;gap:6px;margin-bottom:12px}
.lang-tab{padding:4px 10px;font-size:11px;border:1px solid #e5e5e5;border-radius:6px;cursor:pointer;background:transparent;color:#888}
.lang-tab.active{background:#4F46E5;color:#fff;border-color:#4F46E5}
.stat-row{display:flex;gap:10px;margin-bottom:12px}
.stat-card{flex:1;background:#f8f8f7;border-radius:8px;padding:10px 12px}
.stat-val{font-size:20px;font-weight:500}
.stat-lbl{font-size:11px;color:#888;margin-top:2px}
.divider{height:1px;background:#e5e5e5;margin:4px 0}
.providers-grid{display:flex;flex-wrap:wrap;gap:8px}
.provider-chip{padding:6px 12px;border:1px solid #e5e5e5;border-radius:20px;font-size:12px;cursor:pointer;background:#f8f8f7}
.provider-chip.on{border-color:#4F46E5;background:#fff;color:#4F46E5}
.hidden{display:none}
</style>
</head>
<body>
<div class="layout">
  <div class="sidebar">
    <div class="sidebar-title">Page sections</div>
    <div id="s-banner" class="section-item active" onclick="showPanel('banner')">
      <span class="drag-handle">⠿</span><span class="label">Banner slider</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-categories" class="section-item" onclick="showPanel('categories')">
      <span class="drag-handle">⠿</span><span class="label">Game categories</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-top" class="section-item" onclick="showPanel('top')">
      <span class="drag-handle">⠿</span><span class="label">Top games</span>
      <span class="badge badge-auto">auto</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-editorial" class="section-item" onclick="showPanel('editorial')">
      <span class="drag-handle">⠿</span><span class="label">Editor's picks</span>
      <span class="badge badge-manual">manual</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-providers" class="section-item" onclick="showPanel('providers')">
      <span class="drag-handle">⠿</span><span class="label">Game providers</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-promos" class="section-item" onclick="showPanel('promos')">
      <span class="drag-handle">⠿</span><span class="label">Promo cards</span>
      <button class="toggle off" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-feed" class="section-item" onclick="showPanel('feed')">
      <span class="drag-handle">⠿</span><span class="label">Live bets feed</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
    <div id="s-seo" class="section-item" onclick="showPanel('seo')">
      <span class="drag-handle">⠿</span><span class="label">SEO text</span>
      <button class="toggle on" onclick="toggleSection(event)"></button>
    </div>
  </div>
  <div class="main">

    <!-- BANNER -->
    <div id="p-banner" class="panel">
      <div class="panel-header">
        <div><div class="panel-title">Banner slider</div><div class="panel-subtitle">Manage promotional banners</div></div>
        <button class="save-btn">Save changes</button>
      </div>
      <div class="panel-body">
        <div class="stat-row">
          <div class="stat-card"><div class="stat-val">3</div><div class="stat-lbl">Active slides</div></div>
          <div class="stat-card"><div class="stat-val">4.2s</div><div class="stat-lbl">Auto-rotate</div></div>
          <div class="stat-card"><div class="stat-val">12.4%</div><div class="stat-lbl">Avg CTR</div></div>
        </div>
        <div class="slide-list">
          <div class="slide-row"><div class="slide-preview">225%</div><div class="slide-info"><div class="slide-title">Welcome bonus package</div><div class="slide-meta">225% up to €2000 + 225FS · Guests only · Active</div></div><div class="slide-actions"><button class="btn-sm">Edit</button><button class="btn-sm btn-danger">×</button></div></div>
          <div class="slide-row"><div class="slide-preview">VIP</div><div class="slide-info"><div class="slide-title">VIP Reload bonus</div><div class="slide-meta">50% up to €500 · VIP only · Scheduled Apr 5</div></div><div class="slide-actions"><button class="btn-sm">Edit</button><button class="btn-sm btn-danger">×</button></div></div>
          <div class="slide-row"><div class="slide-preview">FS</div><div class="slide-info"><div class="slide-title">Friday free spins</div><div class="slide-meta">50 FS on Book of Dead · All users · Active</div></div><div class="slide-actions"><button class="btn-sm">Edit</button><button class="btn-sm btn-danger">×</button></div></div>
          <button class="add-slide-btn">+ Add slide</button>
        </div>
        <div class="row2">
          <div class="field-group"><div class="field-label">Auto-rotate interval</div><select class="field-input"><option>4 seconds</option><option>6 seconds</option><option>No rotation</option></select></div>
          <div class="field-group"><div class="field-label">Show to</div><select class="field-input"><option>All visitors</option><option>Guests only</option><option>Logged in only</option></select></div>
        </div>
      </div>
    </div>

    <!-- CATEGORIES -->
    <div id="p-categories" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">Game categories bar</div><div class="panel-subtitle">Toggle and reorder tabs</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="slide-list">
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">TOP</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">NEW</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">HOT</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">Slots</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">Live Casino</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">Crash Games</div></div><button class="toggle off"></button></div>
          <div class="slide-row"><span style="margin-right:6px;color:#aaa">⠿</span><div class="slide-info"><div class="slide-title">Table Games</div></div><button class="toggle on"></button></div>
        </div>
      </div>
    </div>

    <!-- TOP GAMES -->
    <div id="p-top" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">Top games</div><div class="panel-subtitle">Auto or manual game selection</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="row2">
          <div class="field-group"><div class="field-label">Section title</div><input class="field-input" type="text" value="Top games"></div>
          <div class="field-group"><div class="field-label">Max games</div><input class="field-input" type="number" value="14"></div>
        </div>
        <div class="field-group"><div class="field-label">Selection mode</div><div class="mode-tabs"><button class="mode-tab active">Auto</button><button class="mode-tab">Manual</button><button class="mode-tab">Mixed</button></div></div>
        <div class="field-group"><div class="field-label">Auto rule</div><select class="field-input"><option>Most sessions — last 7 days</option><option>Highest GGR — last 24h</option><option>Most unique players — last 30 days</option></select></div>
        <div class="row2">
          <div class="field-group"><div class="field-label">Refresh interval</div><select class="field-input"><option>Every hour</option><option>Every 6 hours</option><option>Daily</option></select></div>
          <div class="field-group"><div class="field-label">Link "All Games"</div><input class="field-input" type="text" value="/games"></div>
        </div>
      </div>
    </div>

    <!-- EDITORIAL -->
    <div id="p-editorial" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">Editor's picks</div><div class="panel-subtitle">Hand-pick games for this section</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="field-group"><div class="field-label">Section title</div><input class="field-input" type="text" value="Editor's picks"></div>
        <div class="field-group">
          <div class="field-label">Selected games — 7 of 14 slots</div>
          <div class="game-grid">
            <div class="game-card selected" style="background:#1a1a2e;color:#fff;font-size:8px">Olympus</div>
            <div class="game-card selected" style="background:#16213e;color:#fff;font-size:8px">Book Dead</div>
            <div class="game-card selected" style="background:#0f3460;color:#fff;font-size:8px">Dog House</div>
            <div class="game-card selected" style="background:#1a1a2e;color:#fff;font-size:8px">Sweet Bon.</div>
            <div class="game-card selected" style="background:#16213e;color:#fff;font-size:8px">Pharaoh</div>
            <div class="game-card selected" style="background:#0f3460;color:#fff;font-size:8px">Big Bass</div>
            <div class="game-card selected" style="background:#1a1a2e;color:#fff;font-size:8px">Starburst</div>
            <div class="game-card">+</div><div class="game-card">+</div><div class="game-card">+</div>
            <div class="game-card">+</div><div class="game-card">+</div><div class="game-card">+</div><div class="game-card">+</div>
          </div>
        </div>
        <div class="field-group"><div class="field-label">Search game catalog</div><input class="field-input" type="text" placeholder="Type game name or provider…"></div>
      </div>
    </div>

    <!-- PROVIDERS -->
    <div id="p-providers" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">Game providers</div><div class="panel-subtitle">Show/hide provider logos</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="field-group"><div class="field-label">Visible providers — click to toggle</div>
          <div class="providers-grid">
            <div class="provider-chip on" onclick="this.classList.toggle('on')">Ezugi</div>
            <div class="provider-chip on" onclick="this.classList.toggle('on')">Pragmatic Play</div>
            <div class="provider-chip on" onclick="this.classList.toggle('on')">Evolution</div>
            <div class="provider-chip on" onclick="this.classList.toggle('on')">Play'n GO</div>
            <div class="provider-chip on" onclick="this.classList.toggle('on')">NetEnt</div>
            <div class="provider-chip on" onclick="this.classList.toggle('on')">Amatic</div>
            <div class="provider-chip" onclick="this.classList.toggle('on')">Yggdrasil</div>
            <div class="provider-chip" onclick="this.classList.toggle('on')">Hacksaw</div>
            <div class="provider-chip" onclick="this.classList.toggle('on')">Push Gaming</div>
            <div class="provider-chip" onclick="this.classList.toggle('on')">Relax Gaming</div>
          </div>
        </div>
        <div class="field-group"><div class="field-label">Display limit</div><input class="field-input" type="number" value="8" min="4" max="20"></div>
      </div>
    </div>

    <!-- PROMOS -->
    <div id="p-promos" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">Promo cards</div><div class="panel-subtitle">Feature cards for missions, VIP, etc.</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="slide-list">
          <div class="slide-row"><div class="slide-info"><div class="slide-title">Daily missions</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><div class="slide-info"><div class="slide-title">VIP club</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><div class="slide-info"><div class="slide-title">Tournaments</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><div class="slide-info"><div class="slide-title">Lucky wheel</div></div><button class="toggle off"></button></div>
          <div class="slide-row"><div class="slide-info"><div class="slide-title">Prize shop</div></div><button class="toggle on"></button></div>
          <div class="slide-row"><div class="slide-info"><div class="slide-title">Cashback</div></div><button class="toggle on"></button></div>
        </div>
      </div>
    </div>

    <!-- FEED -->
    <div id="p-feed" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">Live bets feed</div><div class="panel-subtitle">Recent wins table</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="row2">
          <div class="field-group"><div class="field-label">Default tab</div><select class="field-input"><option>Casino</option><option>Sport</option></select></div>
          <div class="field-group"><div class="field-label">Rows visible</div><input class="field-input" type="number" value="10"></div>
        </div>
        <div class="field-group"><div class="field-label">Minimum payout to show (€)</div><input class="field-input" type="number" value="100"></div>
        <div class="field-group"><div class="field-label">Mask player names</div><select class="field-input"><option>Show partial (User4534***)</option><option>Show full username</option><option>Hide completely</option></select></div>
      </div>
    </div>

    <!-- SEO -->
    <div id="p-seo" class="panel hidden">
      <div class="panel-header"><div><div class="panel-title">SEO text block</div><div class="panel-subtitle">Displayed at bottom of homepage</div></div><button class="save-btn">Save changes</button></div>
      <div class="panel-body">
        <div class="lang-tabs"><button class="lang-tab active">EN</button><button class="lang-tab">DE</button><button class="lang-tab">UA</button></div>
        <div class="field-group"><div class="field-label">H1</div><input class="field-input" type="text" value="Online Casino — Slots, Live Casino & Sports Betting"></div>
        <div class="field-group"><div class="field-label">Meta title</div><input class="field-input" type="text" value="BetUp Casino — Play Slots, Live Games & Win Big"></div>
        <div class="field-group"><div class="field-label">Meta description</div><textarea class="seo-textarea" rows="2">Play 3000+ slots, live casino and sports betting at BetUp. Welcome bonus 225% up to €2000.</textarea></div>
        <div class="divider"></div>
        <div class="field-group"><div class="field-label">SEO body text (HTML)</div><textarea class="seo-textarea" rows="5">&lt;h2&gt;General Rules&lt;/h2&gt;\n&lt;p&gt;Lorem ipsum...&lt;/p&gt;</textarea></div>
        <div class="row2">
          <div class="field-group"><div class="field-label">"Show more" after (chars)</div><input class="field-input" type="number" value="400"></div>
          <div class="field-group"><div class="field-label">Collapse by default</div><select class="field-input"><option>Yes</option><option>No</option></select></div>
        </div>
      </div>
    </div>

  </div>
</div>
<script>
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
  document.querySelectorAll('.section-item').forEach(s=>s.classList.remove('active'));
  document.getElementById('p-'+id).classList.remove('hidden');
  document.getElementById('s-'+id).classList.add('active');
}
function toggleSection(e){
  e.stopPropagation();
  e.currentTarget.classList.toggle('on');
  e.currentTarget.classList.toggle('off');
}
</script>
</body>
</html>`;

export default function MockupHomepagePage() {
  return (
    <div className="sandbox-page">
      <div className="container">
        <div className="sandbox-header">
          <nav className="doc-breadcrumb" aria-label="Breadcrumb">
            <a className="doc-breadcrumb__link" href="/sandbox">Sandbox</a>
            <span className="doc-breadcrumb__sep">/</span>
            <span className="doc-breadcrumb__current">Homepage configurator</span>
          </nav>
          <span className="sandbox-card__tag" style={{ display: 'inline-block', marginBottom: 8 }}>iGaming Backoffice (mockup)</span>
          <h1 className="sandbox-header__title">Homepage configurator · BetUp</h1>
          <p className="sandbox-header__description">
            Interactive mockup of the backoffice homepage section manager. Click sections in the left panel to configure them.
          </p>
        </div>
        <div className="sandbox-section">
          <iframe
            srcDoc={html}
            style={{ width: '100%', height: 680, border: 'none', borderRadius: 12 }}
            title="Homepage configurator mockup"
          />
        </div>
      </div>
    </div>
  );
}
