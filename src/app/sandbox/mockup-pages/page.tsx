'use client'



const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111}
.wrap{display:grid;grid-template-columns:220px 1fr;gap:0;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;min-height:640px}
.nav{background:#f8f8f7;border-right:1px solid #e5e5e5;display:flex;flex-direction:column}
.nav-top{padding:14px 16px 10px;border-bottom:1px solid #e5e5e5}
.nav-label{font-size:11px;font-weight:500;color:#888;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px}
.add-btn{width:100%;padding:7px 10px;background:#4F46E5;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;font-weight:500;text-align:left}
.nav-section{padding:10px 0}
.nav-group-label{font-size:10px;font-weight:500;color:#888;letter-spacing:0.07em;text-transform:uppercase;padding:4px 16px 6px}
.nav-item{display:flex;align-items:center;gap:8px;padding:8px 16px;cursor:pointer;border-left:2px solid transparent}
.nav-item:hover{background:#fff}
.nav-item.active{background:#fff;border-left-color:#4F46E5}
.nav-item .page-label{flex:1;font-size:13px}
.nav-item .page-label.muted{color:#aaa}
.status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.dot-live{background:#22c55e}
.dot-hidden{background:#d1d5db}
.dot-new{background:#f59e0b}
.badge-sys{font-size:9px;padding:2px 5px;border-radius:3px;background:#f1f1f1;color:#888}
.main{background:#fff;display:flex;flex-direction:column}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e5e5}
.topbar-left{display:flex;flex-direction:column;gap:2px}
.page-title{font-size:16px;font-weight:500}
.page-url{font-size:12px;color:#888}
.topbar-right{display:flex;gap:8px;align-items:center}
.btn{padding:6px 13px;font-size:12px;border:1px solid #e5e5e5;border-radius:8px;background:transparent;color:#111;cursor:pointer}
.btn:hover{background:#f8f8f7}
.btn-primary{background:#4F46E5;color:#fff;border-color:#4F46E5}
.btn-danger{color:#E24B4A;border-color:#fca5a5}
.status-badge{font-size:11px;padding:3px 8px;border-radius:20px;font-weight:500}
.sb-live{background:#dcfce7;color:#15803d}
.sb-hidden{background:#f1f1f1;color:#888}
.sb-new{background:#fef9c3;color:#92400e}
.content{padding:20px;flex:1;display:flex;flex-direction:column;gap:16px}
.field-group{display:flex;flex-direction:column;gap:5px}
.field-label{font-size:12px;font-weight:500;color:#888}
.field-input{padding:8px 10px;border:1px solid #e5e5e5;border-radius:8px;font-size:13px;background:#f8f8f7;color:#111;width:100%}
.field-input:focus{outline:none;border-color:#4F46E5}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.divider{height:1px;background:#e5e5e5}
.info-box{background:#eff6ff;border-radius:8px;padding:10px 12px;font-size:12px;color:#1d4ed8}
.providers-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.prov-card{border:1px solid #e5e5e5;border-radius:8px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;background:#f8f8f7;position:relative}
.prov-card.on{border-color:#4F46E5;background:#fff}
.prov-logo{width:44px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;color:#888;background:#fff;border:1px solid #e5e5e5}
.prov-name{font-size:11px;text-align:center}
.prov-games{font-size:10px;color:#888}
.prov-check{position:absolute;top:5px;right:6px;font-size:11px;color:#4F46E5;font-weight:700}
.layout-opts{display:flex;gap:8px}
.layout-opt{border:1px solid #e5e5e5;border-radius:8px;padding:8px 12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;background:#f8f8f7}
.layout-opt.active{border-color:#4F46E5;background:#fff}
.layout-preview{display:flex;gap:2px;align-items:flex-end}
.lp-bar{background:#d1d5db;border-radius:1px}
.layout-opt.active .lp-bar{background:#4F46E5}
.layout-lbl{font-size:10px;color:#888}
.layout-opt.active .layout-lbl{color:#4F46E5}
.modal-bg{background:rgba(0,0,0,0.35);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:40px 20px;min-height:400px}
.modal{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:24px;width:100%;max-width:440px}
.modal-title{font-size:15px;font-weight:500;margin-bottom:16px}
.modal-body{display:flex;flex-direction:column;gap:12px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.hidden{display:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="nav">
    <div class="nav-top">
      <div class="nav-label">Site pages</div>
      <button class="add-btn" onclick="showView('new-page')">+ New page</button>
    </div>
    <div class="nav-section">
      <div class="nav-group-label">System pages</div>
      <div class="nav-item" onclick="nav(this,'home')"><span class="status-dot dot-live"></span><span class="page-label">Homepage</span><span class="badge-sys">sys</span></div>
      <div class="nav-item" onclick="nav(this,'promotions')"><span class="status-dot dot-live"></span><span class="page-label">Promotions</span><span class="badge-sys">sys</span></div>
      <div class="nav-item" onclick="nav(this,'vip')"><span class="status-dot dot-hidden"></span><span class="page-label muted">VIP club</span><span class="badge-sys">sys</span></div>
    </div>
    <div style="height:1px;background:#e5e5e5"></div>
    <div class="nav-section">
      <div class="nav-group-label">Custom pages</div>
      <div id="nav-providers" class="nav-item active" onclick="nav(this,'providers')"><span class="status-dot dot-new"></span><span class="page-label">Game providers</span></div>
      <div class="nav-item" onclick="nav(this,'about')"><span class="status-dot dot-live"></span><span class="page-label">About us</span></div>
      <div class="nav-item" onclick="nav(this,'blog')"><span class="status-dot dot-hidden"></span><span class="page-label muted">Blog</span></div>
    </div>
  </div>

  <div class="main">
    <!-- PROVIDERS PAGE -->
    <div id="v-providers">
      <div class="topbar">
        <div class="topbar-left"><div class="page-title">Game providers</div><div class="page-url">betup.com/providers</div></div>
        <div class="topbar-right">
          <span class="status-badge sb-new">Draft</span>
          <button class="btn" onclick="showView('delete-confirm')">Delete page</button>
          <button class="btn">Preview</button>
          <button class="btn btn-primary" onclick="publishPage()">Publish</button>
        </div>
      </div>
      <div class="content">
        <div class="info-box">Custom page. Configure URL, visibility and content below, then publish to make it live.</div>
        <div class="row2">
          <div class="field-group"><div class="field-label">Page title</div><input class="field-input" type="text" value="Game providers"></div>
          <div class="field-group"><div class="field-label">URL slug</div><input class="field-input" type="text" value="providers"></div>
        </div>
        <div class="row2">
          <div class="field-group"><div class="field-label">Show in navigation</div><select class="field-input"><option>Yes — main menu</option><option>Yes — footer only</option><option>No — hidden</option></select></div>
          <div class="field-group"><div class="field-label">Access</div><select class="field-input"><option>Public</option><option>Logged in only</option><option>VIP only</option></select></div>
        </div>
        <div class="divider"></div>
        <div>
          <div style="font-size:13px;font-weight:500;margin-bottom:12px">Page layout</div>
          <div class="layout-opts">
            <div class="layout-opt active" onclick="setLayout(this)">
              <div class="layout-preview"><div class="lp-bar" style="width:11px;height:14px"></div><div class="lp-bar" style="width:11px;height:14px"></div><div class="lp-bar" style="width:11px;height:14px"></div><div class="lp-bar" style="width:11px;height:14px"></div></div>
              <div class="layout-lbl">4-column</div>
            </div>
            <div class="layout-opt" onclick="setLayout(this)">
              <div class="layout-preview"><div class="lp-bar" style="width:14px;height:14px"></div><div class="lp-bar" style="width:14px;height:14px"></div><div class="lp-bar" style="width:14px;height:14px"></div></div>
              <div class="layout-lbl">3-column</div>
            </div>
            <div class="layout-opt" onclick="setLayout(this)">
              <div class="layout-preview" style="flex-direction:column"><div class="lp-bar" style="width:40px;height:6px;margin-bottom:2px"></div><div class="lp-bar" style="width:40px;height:6px;margin-bottom:2px"></div><div class="lp-bar" style="width:40px;height:6px"></div></div>
              <div class="layout-lbl">List view</div>
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <div style="font-size:13px;font-weight:500;margin-bottom:12px">Providers to display — click to toggle</div>
          <div class="providers-grid">
            <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">EZG</div><div class="prov-name">Ezugi</div><div class="prov-games">84 games</div></div>
            <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">PP</div><div class="prov-name">Pragmatic Play</div><div class="prov-games">312 games</div></div>
            <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">EVO</div><div class="prov-name">Evolution</div><div class="prov-games">127 games</div></div>
            <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">PNG</div><div class="prov-name">Play'n GO</div><div class="prov-games">256 games</div></div>
            <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">NET</div><div class="prov-name">NetEnt</div><div class="prov-games">203 games</div></div>
            <div class="prov-card" onclick="toggleProv(this)"><div class="prov-logo">YGG</div><div class="prov-name">Yggdrasil</div><div class="prov-games">91 games</div></div>
            <div class="prov-card" onclick="toggleProv(this)"><div class="prov-logo">HCK</div><div class="prov-name">Hacksaw</div><div class="prov-games">54 games</div></div>
            <div class="prov-card" onclick="toggleProv(this)"><div class="prov-logo">RLX</div><div class="prov-name">Relax Gaming</div><div class="prov-games">68 games</div></div>
          </div>
        </div>
        <div class="row2">
          <div class="field-group"><div class="field-label">Meta title</div><input class="field-input" type="text" value="Game Providers — BetUp Casino"></div>
          <div class="field-group"><div class="field-label">Meta description</div><input class="field-input" type="text" value="Explore all game providers at BetUp Casino"></div>
        </div>
      </div>
    </div>

    <!-- HOME -->
    <div id="v-home" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">Homepage</div><div class="page-url">betup.com/</div></div><div class="topbar-right"><span class="status-badge sb-live">Live</span><button class="btn btn-primary">Edit sections</button></div></div>
      <div class="content"><div class="info-box">System page — use Homepage Configurator to manage sections.</div></div>
    </div>

    <!-- PROMOTIONS -->
    <div id="v-promotions" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">Promotions</div><div class="page-url">betup.com/promotions</div></div><div class="topbar-right"><span class="status-badge sb-live">Live</span><button class="btn btn-primary">Manage promos</button></div></div>
      <div class="content"><div class="info-box">System page — manage individual promotion cards in the Promotions module.</div></div>
    </div>

    <!-- VIP -->
    <div id="v-vip" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">VIP club</div><div class="page-url">betup.com/vip</div></div><div class="topbar-right"><span class="status-badge sb-hidden">Hidden</span><button class="btn">Show page</button><button class="btn btn-primary">Edit content</button></div></div>
      <div class="content"><div class="info-box">This system page is currently hidden from all visitors.</div></div>
    </div>

    <!-- ABOUT -->
    <div id="v-about" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">About us</div><div class="page-url">betup.com/about</div></div><div class="topbar-right"><span class="status-badge sb-live">Live</span><button class="btn btn-danger">Hide page</button><button class="btn btn-primary">Edit content</button></div></div>
      <div class="content"><div class="info-box">Custom page — live and visible to all visitors.</div></div>
    </div>

    <!-- BLOG -->
    <div id="v-blog" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">Blog</div><div class="page-url">betup.com/blog</div></div><div class="topbar-right"><span class="status-badge sb-hidden">Hidden</span><button class="btn">Show page</button><button class="btn btn-danger">Delete page</button></div></div>
      <div class="content"><div class="info-box">Custom page — currently hidden.</div></div>
    </div>

    <!-- NEW PAGE MODAL -->
    <div id="v-new-page" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">New page</div></div><div class="topbar-right"><button class="btn" onclick="nav(document.getElementById('nav-providers'),'providers')">Cancel</button></div></div>
      <div class="content">
        <div class="modal-bg">
          <div class="modal">
            <div class="modal-title">Create a new page</div>
            <div class="modal-body">
              <div class="field-group"><div class="field-label">Page title</div><input class="field-input" type="text" placeholder="e.g. Game providers"></div>
              <div class="field-group"><div class="field-label">URL slug</div><input class="field-input" type="text" placeholder="e.g. providers"></div>
              <div class="field-group"><div class="field-label">Page type</div><select class="field-input"><option>Content page (logo grid, text, images)</option><option>Landing page (custom sections)</option><option>Redirect</option></select></div>
              <div class="field-group"><div class="field-label">Initial visibility</div><select class="field-input"><option>Draft — hidden until published</option><option>Live immediately</option></select></div>
            </div>
            <div class="modal-actions">
              <button class="btn" onclick="nav(document.getElementById('nav-providers'),'providers')">Cancel</button>
              <button class="btn btn-primary" onclick="nav(document.getElementById('nav-providers'),'providers')">Create page</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div id="v-delete-confirm" class="hidden">
      <div class="topbar"><div class="topbar-left"><div class="page-title">Delete page</div></div><div class="topbar-right"><button class="btn" onclick="nav(document.getElementById('nav-providers'),'providers')">Cancel</button></div></div>
      <div class="content">
        <div class="modal-bg">
          <div class="modal">
            <div class="modal-title">Delete "Game providers"?</div>
            <p style="font-size:13px;color:#888;line-height:1.6">This will permanently remove the page. Any links pointing to <strong style="color:#111">betup.com/providers</strong> will return 404. This cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn" onclick="nav(document.getElementById('nav-providers'),'providers')">Cancel</button>
              <button class="btn btn-danger" onclick="nav(document.getElementById('nav-providers'),'providers')">Delete page</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const views=['providers','home','promotions','vip','about','blog','new-page','delete-confirm'];
function showView(id){views.forEach(v=>{const el=document.getElementById('v-'+v);if(el)el.classList.toggle('hidden',v!==id)});}
function nav(el,id){document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));if(el)el.classList.add('active');showView(id);}
function toggleProv(el){el.classList.toggle('on');const chk=el.querySelector('.prov-check');if(el.classList.contains('on')){if(!chk){const c=document.createElement('div');c.className='prov-check';c.textContent='✓';el.prepend(c);}else chk.style.display='';}else{if(chk)chk.style.display='none';}}
function setLayout(el){document.querySelectorAll('.layout-opt').forEach(o=>o.classList.remove('active'));el.classList.add('active');}
function publishPage(){const badge=document.querySelector('#v-providers .status-badge');badge.className='status-badge sb-live';badge.textContent='Live';const dot=document.querySelector('#nav-providers .status-dot');dot.className='status-dot dot-live';}
showView('providers');
</script>
</body>
</html>`;

export default function MockupPagesPage() {
  return (
    <div className="sandbox-page">
      <div className="container">
        <div className="sandbox-header">
          <nav className="doc-breadcrumb" aria-label="Breadcrumb">
            <a className="doc-breadcrumb__link" href="/sandbox">Sandbox</a>
            <span className="doc-breadcrumb__sep">/</span>
            <span className="doc-breadcrumb__current">Page manager</span>
          </nav>
          <span className="sandbox-card__tag" style={{ display: 'inline-block', marginBottom: 8 }}>iGaming Backoffice (mockup)</span>
          <h1 className="sandbox-header__title">Page manager · BetUp</h1>
          <p className="sandbox-header__description">
            Create, hide and delete custom pages. Click pages in the left nav, toggle providers, switch layout, publish.
          </p>
        </div>
        <div className="sandbox-section">
          <iframe
            srcDoc={html}
            style={{ width: '100%', height: 700, border: 'none', borderRadius: 12 }}
            title="Page manager mockup"
          />
        </div>
      </div>
    </div>
  );
}
