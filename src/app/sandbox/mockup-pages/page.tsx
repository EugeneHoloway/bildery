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
.prov-seo{display:none;position:absolute;bottom:5px;right:5px;padding:2px 6px;font-size:9px;font-weight:600;color:#4F46E5;background:#eef2ff;border-radius:4px;cursor:pointer;letter-spacing:0.02em;z-index:5;white-space:nowrap}
.prov-card:hover{border-color:#c7c5f4;background:#fafafe}
.prov-card.on:hover{border-color:#4F46E5;background:#fff}
.prov-card:hover .prov-seo{display:block}
.layout-opts{display:flex;gap:8px}
.layout-opt{border:1px solid #e5e5e5;border-radius:8px;padding:8px 12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;background:#f8f8f7}
.layout-opt.active{border-color:#4F46E5;background:#fff}
.layout-preview{display:flex;gap:2px;align-items:flex-end}
.lp-bar{background:#d1d5db;border-radius:1px}
.layout-opt.active .lp-bar{background:#4F46E5}
.layout-lbl{font-size:10px;color:#888}
.layout-opt.active .layout-lbl{color:#4F46E5}
.wysiwyg{border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}
.wysiwyg-toolbar{display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid #e5e5e5;background:#f8f8f7;align-items:center;flex-wrap:wrap}
.tb{min-width:26px;height:26px;border:none;background:transparent;border-radius:4px;cursor:pointer;font-size:12px;color:#555;display:inline-flex;align-items:center;justify-content:center;padding:0 6px;font-family:inherit}
.tb:hover{background:#e5e5e5;color:#111}
.tb-b{font-weight:700}
.tb-i{font-style:italic}
.tb-sep{width:1px;height:18px;background:#e5e5e5;margin:0 4px;flex-shrink:0}
.wysiwyg-body{padding:12px 14px;min-height:120px;font-size:13px;line-height:1.7;outline:none;color:#111}
.wysiwyg-body h2{font-size:15px;font-weight:600;margin-bottom:4px;margin-top:2px}
.wysiwyg-body p{margin-bottom:6px}
.wysiwyg-body ul,.wysiwyg-body ol{padding-left:20px;margin-bottom:6px}
.wysiwyg-body a{color:#4F46E5;text-decoration:underline}
.word-count{font-size:11px;color:#aaa;margin-top:4px;text-align:right}
.modal-bg{background:rgba(0,0,0,0.35);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:40px 20px;min-height:400px}
.modal{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:24px;width:100%;max-width:440px}
.modal-title{font-size:15px;font-weight:500;margin-bottom:16px}
.modal-body{display:flex;flex-direction:column;gap:12px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.hidden{display:none !important}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:100;display:flex;align-items:center;justify-content:center}
.add-modal{background:#fff;border-radius:14px;width:560px;max-height:520px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.18)}
.add-modal-header{padding:18px 20px 14px;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.add-modal-title{font-size:15px;font-weight:500}
.add-modal-close{width:28px;height:28px;border:none;background:#f1f1f1;border-radius:6px;cursor:pointer;font-size:16px;color:#888;display:flex;align-items:center;justify-content:center;line-height:1}
.add-modal-search{padding:12px 20px;border-bottom:1px solid #e5e5e5;flex-shrink:0}
.add-modal-list{overflow-y:auto;flex:1;padding:8px 12px}
.ap-item{display:flex;align-items:center;gap:12px;padding:10px 10px;border-radius:8px;cursor:pointer}
.ap-item:hover{background:#f5f5ff}
.ap-logo{width:40px;height:26px;border-radius:4px;background:#fff;border:1px solid #e5e5e5;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#888;flex-shrink:0}
.ap-info{flex:1}
.ap-name{font-size:13px;font-weight:500}
.ap-meta{font-size:11px;color:#888}
.ap-add{font-size:11px;font-weight:600;color:#4F46E5;padding:4px 10px;border:1px solid #c7c5f4;border-radius:6px;background:transparent;cursor:pointer}
.ap-add:hover{background:#eef2ff}
/* SEO section */
.seo-tabs{display:flex;border-bottom:1px solid #e5e5e5;margin-bottom:16px;overflow-x:auto}
.seo-tab{padding:8px 14px;font-size:12px;cursor:pointer;color:#888;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.seo-tab:hover{color:#111}
.seo-tab.seo-active{color:#4F46E5;border-bottom-color:#4F46E5}
.seo-panel{display:flex;flex-direction:column;gap:14px}
.lang-tabs{display:flex;gap:6px}
.lang-tab{padding:4px 10px;font-size:11px;border:1px solid #e5e5e5;border-radius:6px;cursor:pointer;background:transparent;color:#888}
.lang-tab.lang-active{background:#4F46E5;color:#fff;border-color:#4F46E5}
.char-bar-wrap{height:3px;border-radius:2px;background:#e5e5e5;margin-top:4px}
.char-bar{height:3px;border-radius:2px;transition:width 0.2s,background 0.2s}
.char-count{font-size:11px;color:#888;margin-top:3px}
.serp-preview{border:1px solid #e5e5e5;border-radius:10px;padding:14px;background:#f8f8f7}
.serp-label{font-size:11px;font-weight:500;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em}
.serp-url{font-size:12px;color:#1a7f4b;margin-bottom:2px}
.serp-title{font-size:17px;color:#1558d6;font-weight:400;margin-bottom:3px;line-height:1.3}
.serp-desc{font-size:13px;color:#555;line-height:1.5}
.og-preview{border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}
.og-img{width:100%;height:80px;background:#f1f1f1;display:flex;align-items:center;justify-content:center;font-size:12px;color:#888;cursor:pointer}
.og-meta{padding:10px 12px;background:#f8f8f7}
.og-domain{font-size:10px;color:#888;text-transform:uppercase}
.og-title{font-size:13px;font-weight:500}
.og-desc{font-size:12px;color:#888}
.checklist{display:flex;flex-direction:column;gap:8px;padding:12px;background:#f8f8f7;border-radius:8px}
.status-row{display:flex;align-items:center;gap:8px}
.audit-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot-ok{background:#22c55e}.dot-warn{background:#f59e0b}.dot-err{background:#E24B4A}
.status-text{font-size:12px;color:#555}
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
      <div id="nav-providers" class="nav-item active" onclick="nav(this,'providers')"><span class="status-dot dot-new"></span><span class="page-label">Game providers</span><span class="badge-sys">sys</span></div>
    </div>
    <div style="height:1px;background:#e5e5e5"></div>
    <div class="nav-section">
      <div class="nav-group-label">Custom pages</div>
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
        <div>
          <div class="seo-tabs">
            <div class="seo-tab seo-active" onclick="seoTab('s-main',this)">Main</div>
            <div class="seo-tab" onclick="seoTab('s-basic',this)">Basic SEO</div>
            <div class="seo-tab" onclick="seoTab('s-content',this)">Content</div>
            <div class="seo-tab" onclick="seoTab('s-og',this)">Social / OG</div>
            <div class="seo-tab" onclick="seoTab('s-advanced',this)">Advanced</div>
            <div class="seo-tab" onclick="seoTab('s-audit',this)">SEO audit</div>
          </div>

          <!-- Main -->
          <div id="s-main" class="seo-panel">
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
                <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">EZG</div><div class="prov-name">Ezugi</div><div class="prov-games">84 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">PP</div><div class="prov-name">Pragmatic Play</div><div class="prov-games">312 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">EVO</div><div class="prov-name">Evolution</div><div class="prov-games">127 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">PNG</div><div class="prov-name">Play'n GO</div><div class="prov-games">256 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card on" onclick="toggleProv(this)"><div class="prov-check">✓</div><div class="prov-logo">NET</div><div class="prov-name">NetEnt</div><div class="prov-games">203 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card" onclick="toggleProv(this)"><div class="prov-logo">YGG</div><div class="prov-name">Yggdrasil</div><div class="prov-games">91 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card" onclick="toggleProv(this)"><div class="prov-logo">HCK</div><div class="prov-name">Hacksaw</div><div class="prov-games">54 games</div><div class="prov-seo" onclick="editSeo(event)">Edit SEO ↗</div></div>
                <div class="prov-card" style="border-style:dashed;cursor:pointer;justify-content:center;gap:6px" onclick="openAddModal()"><div style="width:28px;height:28px;border-radius:50%;background:#f1f1f1;display:flex;align-items:center;justify-content:center;font-size:18px;color:#aaa">+</div><div class="prov-name" style="color:#aaa">Add new</div></div>
              </div>
            </div>
          </div>

          <!-- Basic SEO -->
          <div id="s-basic" class="seo-panel hidden">
            <div class="lang-tabs">
              <button class="lang-tab lang-active" onclick="seoLang(this)">EN</button>
              <button class="lang-tab" onclick="seoLang(this)">DE</button>
              <button class="lang-tab" onclick="seoLang(this)">UA</button>
            </div>
            <div class="field-group">
              <div class="field-label" style="display:flex;justify-content:space-between">H1 — page heading <span style="font-size:11px;color:#aaa;font-weight:400">shown on the page, 1 per page</span></div>
              <input id="s-h1" class="field-input" type="text" value="Game providers at BetUp Casino" oninput="seoSerp()">
            </div>
            <div class="field-group">
              <div class="field-label" style="display:flex;justify-content:space-between">Title tag <span style="font-size:11px;color:#aaa;font-weight:400">shown in browser tab and Google</span></div>
              <input id="s-title" class="field-input" type="text" value="Game Providers — BetUp Casino | Slots & Live Games" oninput="seoBars();seoSerp()">
              <div class="char-bar-wrap"><div id="s-bar-title" class="char-bar"></div></div>
              <div id="s-cnt-title" class="char-count"></div>
            </div>
            <div class="field-group">
              <div class="field-label" style="display:flex;justify-content:space-between">Meta description <span style="font-size:11px;color:#aaa;font-weight:400">shown under title in Google</span></div>
              <textarea id="s-desc" class="field-input" rows="3" style="resize:vertical;line-height:1.5" oninput="seoBars();seoSerp()">Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.</textarea>
              <div class="char-bar-wrap"><div id="s-bar-desc" class="char-bar"></div></div>
              <div id="s-cnt-desc" class="char-count"></div>
            </div>
            <div class="divider"></div>
            <div class="field-group">
              <div class="field-label">SERP preview</div>
              <div class="serp-preview">
                <div class="serp-label">Google search result</div>
                <div class="serp-url">betup.com › providers</div>
                <div id="s-serp-title" class="serp-title">Game Providers — BetUp Casino | Slots & Live Games</div>
                <div id="s-serp-desc" class="serp-desc">Explore 12 top game providers at BetUp Casino. Play 2000+ slots, live casino games and crash games from Pragmatic Play, Evolution, NetEnt and more.</div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div id="s-content" class="seo-panel hidden">
            <div class="field-group">
              <div class="field-label" style="display:flex;justify-content:space-between">Page text <span style="font-size:11px;color:#aaa;font-weight:400">shown below the provider grid</span></div>
              <div class="wysiwyg">
                <div class="wysiwyg-toolbar">
                  <button class="tb tb-b" onclick="sFmt('bold')">B</button>
                  <button class="tb tb-i" onclick="sFmt('italic')">I</button>
                  <button class="tb" onclick="sFmt('underline')" style="text-decoration:underline">U</button>
                  <span class="tb-sep"></span>
                  <button class="tb" onclick="sFmt('formatBlock','h2')" style="font-size:11px;font-weight:600">H2</button>
                  <button class="tb" onclick="sFmt('formatBlock','p')" style="font-size:11px">¶</button>
                  <span class="tb-sep"></span>
                  <button class="tb" onclick="sFmt('insertUnorderedList')">• list</button>
                  <button class="tb" onclick="sFmt('insertOrderedList')">1. list</button>
                  <span class="tb-sep"></span>
                  <button class="tb" onclick="sInsertLink()" style="color:#4F46E5">⌘ link</button>
                </div>
                <div id="s-wysiwyg" class="wysiwyg-body" contenteditable="true" oninput="sUpdateWc()"><h2>Top Game Providers at BetUp Casino</h2><p>BetUp Casino partners with 12 of the world's leading game studios, delivering over 2,000 slots, live casino tables, and crash games. From <strong>Pragmatic Play's</strong> iconic Sweet Bonanza to <strong>Evolution's</strong> live Lightning Roulette — every title is hand-picked for quality.</p><p>All providers are licensed, regularly audited for fairness, and offer games optimised for desktop and mobile.</p></div>
              </div>
              <div id="s-wc" class="word-count"></div>
            </div>
          </div>

          <!-- Social / OG -->
          <div id="s-og" class="seo-panel hidden">
            <div class="field-group"><div class="field-label" style="display:flex;justify-content:space-between">OG title <span style="font-size:11px;color:#aaa;font-weight:400">shown when sharing on social</span></div><input class="field-input" type="text" value="Game Providers — BetUp Casino"></div>
            <div class="field-group"><div class="field-label">OG description</div><textarea class="field-input" rows="2" style="resize:vertical;line-height:1.5">Discover all game providers at BetUp. Slots, live casino and more from the world's top studios.</textarea></div>
            <div class="field-group">
              <div class="field-label" style="display:flex;justify-content:space-between">OG image <span style="font-size:11px;color:#aaa;font-weight:400">recommended 1200×630px</span></div>
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

          <!-- Advanced -->
          <div id="s-advanced" class="seo-panel hidden">
            <div class="row2">
              <div class="field-group"><div class="field-label" style="display:flex;justify-content:space-between">Canonical URL <span style="font-size:11px;color:#aaa;font-weight:400">leave blank = self</span></div><input class="field-input" type="text" placeholder="https://betup.com/providers"></div>
              <div class="field-group"><div class="field-label">Robots</div><select class="field-input"><option>index, follow</option><option>noindex, follow</option><option>noindex, nofollow</option></select></div>
            </div>
            <div class="row2">
              <div class="field-group"><div class="field-label">Include in sitemap</div><select class="field-input"><option>Yes</option><option>No</option></select></div>
              <div class="field-group"><div class="field-label">Sitemap priority</div><select class="field-input"><option>0.8 — high</option><option>0.5 — normal</option><option>0.3 — low</option></select></div>
            </div>
            <div class="divider"></div>
            <div class="field-group"><div class="field-label">Structured data (JSON-LD)</div><textarea class="field-input" rows="5" style="font-family:monospace;font-size:12px;resize:vertical">{\n  "@context": "https://schema.org",\n  "@type": "ItemList",\n  "name": "Game providers at BetUp Casino"\n}</textarea></div>
            <div class="field-group"><div class="field-label">Hreflang</div><select class="field-input"><option>Auto — generate from active languages</option><option>Manual</option><option>Disabled</option></select></div>
          </div>

          <!-- SEO audit -->
          <div id="s-audit" class="seo-panel hidden">
            <div class="checklist">
              <div class="status-row"><span class="audit-dot dot-ok"></span><span class="status-text">H1 present and unique</span></div>
              <div class="status-row"><span class="audit-dot dot-ok"></span><span class="status-text">Title tag: 50 characters — good length</span></div>
              <div class="status-row"><span class="audit-dot dot-ok"></span><span class="status-text">Meta description: 148 characters — good length</span></div>
              <div class="status-row"><span class="audit-dot dot-warn"></span><span class="status-text">OG image not set — social shares will use fallback</span></div>
              <div class="status-row"><span class="audit-dot dot-ok"></span><span class="status-text">Page is indexable (robots: index, follow)</span></div>
              <div class="status-row"><span class="audit-dot dot-ok"></span><span class="status-text">Page included in sitemap</span></div>
              <div class="status-row"><span class="audit-dot dot-warn"></span><span class="status-text">No structured data — consider adding JSON-LD</span></div>
              <div class="status-row"><span class="audit-dot dot-ok"></span><span class="status-text">Canonical URL: self-referencing (correct)</span></div>
              <div class="status-row"><span class="audit-dot dot-err"></span><span class="status-text">DE and UA translations missing</span></div>
            </div>
          </div>
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
function fmt(cmd,val){document.getElementById('page-wysiwyg').focus();document.execCommand(cmd,false,val||null);}
function insertLink(){const url=prompt('URL:','https://');if(url)document.execCommand('createLink',false,url);}
function updateWc(){const t=document.getElementById('page-wysiwyg').innerText||'';const w=t.trim().split(/\s+/).filter(Boolean).length;document.getElementById('wc').textContent=w+' words';}
const views=['providers','home','promotions','vip','about','blog','new-page','delete-confirm'];
function showView(id){views.forEach(v=>{const el=document.getElementById('v-'+v);if(el)el.classList.toggle('hidden',v!==id)});}
function nav(el,id){document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));if(el)el.classList.add('active');showView(id);}
function toggleProv(el){el.classList.toggle('on');const chk=el.querySelector('.prov-check');if(el.classList.contains('on')){if(!chk){const c=document.createElement('div');c.className='prov-check';c.textContent='✓';el.prepend(c);}else chk.style.display='';}else{if(chk)chk.style.display='none';}}
function setLayout(el){document.querySelectorAll('.layout-opt').forEach(o=>o.classList.remove('active'));el.classList.add('active');}
function editSeo(e){e.stopPropagation();window.top.location.href='/sandbox/mockup-seo';}
function publishPage(){const badge=document.querySelector('#v-providers .status-badge');badge.className='status-badge sb-live';badge.textContent='Live';const dot=document.querySelector('#nav-providers .status-dot');dot.className='status-dot dot-live';}
showView('providers');updateWc();
function seoTab(id,el){['s-main','s-basic','s-content','s-og','s-advanced','s-audit'].forEach(t=>{document.getElementById(t).classList.toggle('hidden',t!==id)});document.querySelectorAll('.seo-tab').forEach(t=>t.classList.remove('seo-active'));el.classList.add('seo-active');}
function seoLang(el){document.querySelectorAll('.lang-tab').forEach(t=>t.classList.remove('lang-active'));el.classList.add('lang-active');}
function seoBars(){const t=document.getElementById('s-title').value;const d=document.getElementById('s-desc').value;const tLen=t.length,dLen=d.length,tMax=60,dMax=160;const bt=document.getElementById('s-bar-title');const bd=document.getElementById('s-bar-desc');bt.style.width=Math.min(tLen/tMax*100,100)+'%';bt.style.background=tLen>tMax?'#E24B4A':tLen>50?'#22c55e':'#f59e0b';bd.style.width=Math.min(dLen/dMax*100,100)+'%';bd.style.background=dLen>dMax?'#E24B4A':dLen>120?'#22c55e':'#f59e0b';document.getElementById('s-cnt-title').textContent=tLen+' / '+tMax+' characters';document.getElementById('s-cnt-desc').textContent=dLen+' / '+dMax+' characters';}
function seoSerp(){const t=document.getElementById('s-title').value;const d=document.getElementById('s-desc').value;document.getElementById('s-serp-title').textContent=t.length>60?t.slice(0,57)+'…':t;document.getElementById('s-serp-desc').textContent=d.length>160?d.slice(0,157)+'…':d;}
function sFmt(cmd,val){document.getElementById('s-wysiwyg').focus();document.execCommand(cmd,false,val||null);}
function sInsertLink(){const url=prompt('URL:','https://');if(url)document.execCommand('createLink',false,url);}
function sUpdateWc(){const t=document.getElementById('s-wysiwyg').innerText||'';const w=t.trim().split(/\s+/).filter(Boolean).length;document.getElementById('s-wc').textContent=w+' words';}
function sToggleGame(el){el.classList.toggle('on');const chk=el.querySelector('.game-check');if(el.classList.contains('on')){if(!chk){const c=document.createElement('div');c.className='game-check';c.textContent='✓';el.prepend(c);}else chk.style.display='';}else{if(chk)chk.style.display='none';}const total=document.querySelectorAll('#s-games-grid .game-card.on').length;document.getElementById('s-sel-count').textContent=total+' selected';}
function sFilterGames(q){const cards=document.querySelectorAll('#s-games-grid .game-card');let v=0;cards.forEach(c=>{const m=c.dataset.name.includes(q.toLowerCase());c.style.display=m?'':'none';if(m)v++;});document.getElementById('s-games-total').textContent=v+' games';}
seoBars();seoSerp();sUpdateWc();
function openAddModal(){
  document.getElementById('add-modal-overlay').classList.remove('hidden');
  document.getElementById('ap-name').value='';
  setTimeout(()=>document.getElementById('ap-name').focus(),50);
}
function closeAddModal(){document.getElementById('add-modal-overlay').classList.add('hidden');}
function createProvider(){
  const name=document.getElementById('ap-name').value.trim();
  if(!name)return;
  closeAddModal();
  window.top.location.href='/sandbox/mockup-seo';
}
</script>

<!-- Add provider modal -->
<div id="add-modal-overlay" class="overlay hidden" onclick="if(event.target===this)closeAddModal()">
  <div class="add-modal" style="max-height:none">
    <div class="add-modal-header">
      <div class="add-modal-title">New game provider</div>
      <button class="add-modal-close" onclick="closeAddModal()">✕</button>
    </div>
    <div style="padding:20px;display:flex;flex-direction:column;gap:16px">
      <div class="field-group">
        <div class="field-label">Provider name</div>
        <input id="ap-name" class="field-input" type="text" placeholder="e.g. Relax Gaming" onkeydown="if(event.key==='Enter')createProvider()">
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn" onclick="closeAddModal()">Cancel</button>
        <button class="btn btn-primary" onclick="createProvider()">Create →</button>
      </div>
    </div>
  </div>
</div>

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
            style={{ width: '100%', height: 900, border: 'none', borderRadius: 12 }}
            title="Page manager mockup"
          />
        </div>
      </div>
    </div>
  );
}
