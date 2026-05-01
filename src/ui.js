export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Schedule — Safe & Sound Post</title>
  <link rel="icon" href="https://f005.backblazeb2.com/file/safeandsound-uploads/From_Client/_General/EMAIL+NOTIFCATION/Assets/Safe%26Sound+Logo+B.png" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Instrument+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #0a0a0a; --charcoal: #1a1a1a; --rule: rgba(255,255,255,0.07);
      --rule-mid: rgba(255,255,255,0.12); --white: #f4f2ef; --off-white: #c8c5bf;
      --grey: #6e6b66; --radius: 6px; --success: #22c55e; --warning: #f59e0b; --conflict: #dc2626;
    }
    body {
      background: var(--black); color: var(--white);
      font-family: 'Instrument Sans', sans-serif; font-weight: 300;
      line-height: 1.7; min-height: 100vh; display: flex; flex-direction: column;
    }
    .bg-flourish {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 1920px; height: 1080px;
      background-image: url('https://f005.backblazeb2.com/file/safeandsound-uploads/From_Client/_General/EMAIL+NOTIFCATION/Assets/Lines+Flourish.png');
      background-size: 1920px 1080px; background-repeat: no-repeat;
      opacity: 0.18; pointer-events: none; z-index: 0;
    }
    body::after {
      content: ''; position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 9999;
    }
    header, main, footer { position: relative; z-index: 1; }
    header {
      padding: 18px 40px; display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--rule); background: rgba(10,10,10,0.55);
      backdrop-filter: blur(12px);
    }
    .header-logo { height: 44px; width: auto; object-fit: contain; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-tag { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--off-white); }
    .env-badge { font-size: 9px; padding: 2px 8px; border-radius: 10px; background: rgba(245,158,11,0.2); color: var(--warning); }
    main { flex: 1; padding: 48px 32px 64px; max-width: 1600px; margin: 0 auto; width: 100%; }
    .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 28px; }
    @media (max-width: 900px) { .grid-2col { grid-template-columns: 1fr; } }
    .card {
      background: rgba(15,15,15,0.75); backdrop-filter: blur(8px);
      border: 1px solid var(--rule-mid); border-radius: var(--radius); overflow: hidden;
    }
    .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--rule); background: rgba(26,26,26,0.5); font-weight: 500; display: flex; justify-content: space-between; }
    .card-body { padding: 1.5rem; }
    .smart-input, .batch-input {
      width: 100%; padding: 1rem; font-family: monospace; font-size: 0.85rem;
      background: rgba(10,10,10,0.8); border: 1px solid var(--rule-mid); border-radius: var(--radius);
      color: var(--white); resize: vertical;
    }
    .smart-input { background: linear-gradient(135deg, rgba(20,20,20,0.9), rgba(26,26,26,0.9)); border-left: 2px solid var(--warning); }
    .resource-tag {
      display: inline-flex; align-items: center; gap: 0.3rem;
      background: rgba(36,36,36,0.9); padding: 0.25rem 0.75rem; border-radius: 20px;
      font-size: 0.7rem; border: 1px solid var(--rule);
    }
    .resource-tag.person { border-left: 2px solid #60a5fa; }
    .resource-tag.room { border-left: 2px solid var(--warning); }
    .session-group { background: rgba(26,26,26,0.5); border-radius: var(--radius); margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--rule); }
    .session-header { font-weight: 600; margin-bottom: 0.75rem; display: flex; justify-content: space-between; }
    .event-item { border: 1px solid var(--rule); border-radius: var(--radius); padding: 1rem; margin-bottom: 0.75rem; background: rgba(10,10,10,0.6); }
    .event-item.suggested { border-left: 3px solid var(--success); }
    .event-item.saved { border-left: 3px solid #60a5fa; }
    .event-item.confirmed { border-left: 3px solid #60a5fa; }
    .event-item.pending_approval { border-left: 3px solid var(--warning); }
    .event-item.cancelled { border-left: 3px solid var(--grey); opacity: 0.5; }
    .event-item.conflict { border-left: 3px solid var(--conflict); background: rgba(220,38,38,0.08); }
    .event-title { font-weight: 600; margin-bottom: 0.5rem; display: flex; justify-content: space-between; }
    .event-resources { margin-bottom: 0.25rem; display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .btn {
      padding: 0.5rem 1rem; border-radius: var(--radius); font-weight: 500;
      cursor: pointer; border: none; font-family: inherit; letter-spacing: 0.06em;
      transition: opacity 0.2s;
    }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary { background: var(--white); color: var(--black); }
    .btn-primary:hover { background: #fff; }
    .btn-secondary { background: rgba(36,36,36,0.9); color: var(--off-white); border: 1px solid var(--rule-mid); }
    .btn-secondary:hover { background: rgba(50,50,50,0.9); }
    .btn-success { background: var(--success); color: var(--black); }
    .btn-danger { background: var(--conflict); color: white; }
    .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.7rem; }
    .suggestion-card { background: rgba(26,26,26,0.6); border: 1px solid var(--rule-mid); border-radius: var(--radius); padding: 1rem; margin-top: 1rem; max-height: 500px; overflow-y: auto; }
    .suggestion-header { font-weight: 600; color: var(--warning); margin-bottom: 0.75rem; }
    .alternative-slot { background: rgba(10,10,10,0.8); border-radius: var(--radius); padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--rule); cursor: pointer; }
    .alternative-slot:hover { background: rgba(36,36,36,0.9); transform: translateX(4px); }
    .alternative-slot.selected { border-color: var(--success); background: rgba(34,197,94,0.08); }
    .resource-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--rule); }
    .free-badge { color: var(--success); font-size: 0.7rem; }
    .busy-badge { color: var(--conflict); font-size: 0.7rem; }
    .project-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(26,26,26,0.7); border-radius: 40px; font-size: 12px; margin-bottom: 1rem; }
    .pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--warning); animation: blink 2s infinite; }
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); }
    @keyframes blink { 0%,100%{opacity:0.8;} 50%{opacity:0.2;} }
    .footer-actions { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: 1rem; padding: 1rem 1.5rem; border-top: 1px solid var(--rule); background: rgba(26,26,26,0.3); min-height: 56px; }
    .footer-actions-left { display: flex; align-items: center; }
    .footer-actions-right { display: flex; align-items: center; gap: 0.75rem; }
    .sync-label { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--off-white); cursor: pointer; user-select: none; }
    .status-bar { display: flex; gap: 1rem; font-size: 0.7rem; color: var(--grey); margin-bottom: 1rem; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px; }
    .status-dot.ok { background: var(--success); }
    .status-dot.err { background: var(--conflict); }
    .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--rule-mid); border-top-color: var(--warning); border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    footer { padding: 22px 40px; border-top: 1px solid var(--rule); display: flex; justify-content: space-between; background: rgba(10,10,10,0.5); backdrop-filter: blur(10px); }
    footer a { font-size: 12px; color: var(--grey); text-decoration: none; }
    @media (max-width: 580px) { header { padding: 16px 20px; } .header-tag { display: none; } main { padding: 32px 16px; } footer { flex-direction: column; text-align: center; gap: 6px; } .footer-actions { flex-direction: column; align-items: stretch; gap: 0.75rem; } .footer-actions-right { flex-direction: column; gap: 0.5rem; } .footer-actions-right .btn { width: 100%; } }
  </style>
</head>
<body>
<div class="bg-flourish"></div>
<header>
  <div class="header-left">
    <img class="header-logo" src="https://f005.backblazeb2.com/file/safeandsound-uploads/From_Client/_General/EMAIL+NOTIFCATION/Assets/Banner.png" alt="Safe & Sound" />
    <span class="env-badge" id="envBadge">LOCAL</span>
  </div>
  <div class="header-right" style="display:flex;align-items:center;gap:12px">
    <button class="btn btn-primary btn-sm" id="googleAuthBtn" onclick="connectGoogle()">Connect Calendar</button>
    <span id="googleStatus" style="display:none;font-size:0.7rem;color:var(--success)"></span>
    <span class="header-tag">Scheduler</span>
  </div>
</header>
<main>
  <div class="status-bar">
    <span><span class="status-dot" id="apiDot"></span> API: <span id="apiStatus">checking...</span></span>
    <span id="dbStatus"></span>
    <span id="googleCalStatus"></span>
  </div>

  <div class="card" style="margin-bottom:28px">
    <div class="card-header"><span>New Booking</span></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem 1rem;font-size:0.8rem">
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Project Name</label>
          <input id="bookingProject" style="width:100%;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem" placeholder="Project name" />
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Engineer</label>
          <select id="bookingEngineer" style="width:100%;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem">
            <option value="thom">Thom</option><option value="jesse">Jesse</option>
          </select>
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Studio</label>
          <select id="bookingStudio" style="width:100%;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem">
            <option value="st1">ST1 (150 John St)</option><option value="st2">ST2 (150 John St)</option><option value="tcha">TCHA (17 Central Hospital Ln)</option><option value="tchb">TCHB (17 Central Hospital Ln)</option>
          </select>
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Session Type</label>
          <select id="bookingType" style="width:100%;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem">
            <option value="PREMIX">PREMIX</option><option value="FINAL MIX">FINAL MIX</option><option value="ADR RECORD">ADR RECORD</option><option value="SPOTTING SESSION">SPOTTING SESSION</option><option value="FOLEY RECORD">FOLEY RECORD</option><option value="MEETING">MEETING</option>
          </select>
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Duration</label>
          <select id="bookingDuration" style="width:100%;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem">
            <option value="2">2 hours</option><option value="4">4 hours</option><option value="8">8 hours</option><option value="custom">Custom</option>
          </select>
          <input id="bookingCustomDuration" type="number" min="1" max="16" placeholder="hrs" style="display:none;width:100%;margin-top:4px;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem" />
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Sessions</label>
          <input id="bookingNumSessions" type="number" min="1" max="20" value="1" style="width:100%;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem" />
        </div>
      </div>
      <div style="display:flex;gap:1rem;align-items:center;margin-top:0.75rem;font-size:0.75rem;color:var(--off-white)">
        <label style="cursor:pointer"><input type="radio" name="dateMode" value="find" checked onchange="toggleDateMode()" /> Find available dates</label>
        <label style="cursor:pointer"><input type="radio" name="dateMode" value="specific" onchange="toggleDateMode()" /> Specific date & time</label>
      </div>
      <div id="findMode" style="display:flex;gap:1rem;align-items:center;margin-top:0.5rem;font-size:0.75rem">
        <span style="color:var(--off-white)">Days:</span>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefDays" value="any" checked /> Any</label>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefDays" value="weekdays" /> Weekdays</label>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefDays" value="weekends" /> Weekends</label>
        <span style="color:var(--off-white);margin-left:1rem">Time:</span>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefTime" value="any" checked /> Any</label>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefTime" value="morning" /> Morning</label>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefTime" value="afternoon" /> Afternoon</label>
        <label style="cursor:pointer;color:var(--grey)"><input type="radio" name="prefTime" value="evening" /> Evening</label>
      </div>
      <div id="specificMode" style="display:none;margin-top:0.5rem;display:none;gap:0.75rem;align-items:end;font-size:0.75rem">
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Date</label>
          <input type="date" id="specificDate" style="background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem" />
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">Start</label>
          <input type="time" id="specificStart" style="background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem" />
        </div>
        <div>
          <label style="color:var(--off-white);font-size:0.65rem;display:block;margin-bottom:2px">End</label>
          <input type="time" id="specificEnd" style="background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.4rem 0.6rem;font-family:inherit;font-size:0.8rem" />
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:1rem;gap:0.5rem">
        <button class="btn btn-secondary" id="clearBookingBtn">Clear</button>
        <button class="btn btn-primary" id="submitBookingBtn">Find Available Dates</button>
        <span id="bookingSpinner" style="display:none"><span class="spinner"></span></span>
      </div>
      <div id="suggestionsArea"></div>
    </div>
  </div>

  <div class="card" style="margin-bottom:28px">
    <div class="card-header">
      <span style="display:flex;align-items:center;gap:12px">
        <span>Calendar</span>
        <button class="btn btn-primary btn-sm" id="syncDifuzeBtn" onclick="syncDifuze()">Sync DIFUZE</button>
        <span id="syncDifuzeStatus" style="font-size:0.65rem;display:none"></span>
      </span>
      <span style="font-size:0.65rem;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="color:var(--grey)">Sources:</span>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="difuze" checked onchange="loadUpcoming()" /> <span style="color:var(--conflict)">DIFUZE</span></label>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="studio booking" checked onchange="loadUpcoming()" /> <span style="color:var(--success)">Studio Bookings</span></label>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="meeting" checked onchange="loadUpcoming()" /> <span style="color:#60a5fa">Meetings</span></label>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="festival" checked onchange="loadUpcoming()" /> <span style="color:#f59e0b">Festivals</span></label>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="safe&sound" checked onchange="loadUpcoming()" /> <span style="color:var(--off-white)">S&amp;S General</span></label>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="jesse" checked onchange="loadUpcoming()" /> <span style="color:var(--warning)">Jesse</span></label>
        <label style="cursor:pointer;white-space:nowrap"><input type="checkbox" class="calSrcCb" value="freelance" checked onchange="loadUpcoming()" /> <span style="color:#a78bfa">Freelance</span></label>
        <a href="#" onclick="document.querySelectorAll('.calSrcCb').forEach(cb=>cb.checked=false);loadUpcoming();return false" style="font-size:0.6rem;color:var(--grey);text-decoration:none;margin-left:4px">None</a>
        <a href="#" onclick="document.querySelectorAll('.calSrcCb').forEach(cb=>cb.checked=true);loadUpcoming();return false" style="font-size:0.6rem;color:var(--warning);text-decoration:none">All</a>
        <button class="btn btn-secondary btn-sm" id="refreshPreviewBtn" onclick="loadUpcoming()" style="margin-left:4px">Refresh</button>
      </span>
    </div>
    <div class="card-body" id="upcomingList" style="padding:0.5rem 1rem 1rem">
      <div style="text-align:center;color:var(--grey);padding:1rem;width:100%">Loading...</div>
    </div>
  </div>

  <div class="card" id="pendingApprovalsCard" style="display:none;margin-bottom:28px">
    <div class="card-header">
      <span>Pending Approvals — Alex Reinprecht (<span id="pendingCount">0</span>)</span>
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:8px">
        <button class="btn btn-secondary btn-sm" id="copyApprovalsBtn" onclick="copyApprovals()" style="display:none">Copy for Email</button>
        <a href="#" onclick="clearPendingApprovals();return false" style="color:var(--conflict);text-decoration:none;font-size:0.65rem">Clear All</a>
        <span style="color:var(--warning)">Requires booking approval</span>
      </span>
    </div>
    <div class="card-body" id="pendingList">
      <div style="text-align:center;color:var(--grey);padding:2rem">No pending approvals</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span>Session Queue (<span id="sessionCount">0</span> sessions)</span>
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:8px">
        <a href="#" onclick="clearAllSessions();return false" style="color:var(--conflict);text-decoration:none;font-size:0.65rem">Clear All</a>
        <span style="color:var(--grey)"><span style="color:var(--success)">clear</span> / <span style="color:var(--conflict)">conflict</span></span>
      </span>
    </div>
    <div class="card-body" id="eventsList">
      <div style="text-align:center; color:var(--grey); padding:2rem">Generate suggestions or parse batch events to see sessions here</div>
    </div>
    <div class="footer-actions">
      <div class="footer-actions-left">
        <label class="sync-label">
          <input type="checkbox" id="syncGoogleCheckbox" checked /> Sync to
        </label>
        <select id="calendarSelect" style="margin-left:6px;background:rgba(10,10,10,0.8);color:var(--white);border:1px solid var(--rule-mid);border-radius:var(--radius);padding:0.25rem 0.5rem;font-size:0.75rem;font-family:inherit;max-width:200px">
          <option value="primary">Primary Calendar</option>
        </select>
      </div>
      <div class="footer-actions-right">
        <button class="btn btn-secondary" id="generateIcsBtn">Export .ICS</button>
        <button class="btn btn-success" id="saveToDbBtn">Push to Google Calendar</button>
      </div>
    </div>
  </div>
</main>
<footer>
  <span>&copy; 2026 Safe &amp; Sound Post</span>
  <a href="https://safeandsoundpost.com">safeandsoundpost.com</a>
  <a href="mailto:studio@safeandsoundpost.com">studio@safeandsoundpost.com</a>
</footer>

<script>
// ── Config ──
const API_BASE = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://localhost:8787"
  : "";

const IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";
document.getElementById("envBadge").textContent = IS_LOCAL ? "LOCAL" : "PROD";

// ── State ──
let sessions = [];
let suggestions = [];
let currentRequest = null;

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Booking Form ──
function toggleDateMode() {
  const mode = document.querySelector('input[name="dateMode"]:checked').value;
  document.getElementById("findMode").style.display = mode === "find" ? "flex" : "none";
  document.getElementById("specificMode").style.display = mode === "specific" ? "flex" : "none";
  document.getElementById("submitBookingBtn").textContent = mode === "find" ? "Find Available Dates" : "Add to Queue";
}

document.getElementById("bookingDuration").onchange = function () {
  document.getElementById("bookingCustomDuration").style.display = this.value === "custom" ? "" : "none";
};

document.getElementById("submitBookingBtn").onclick = async function () {
  const proj = document.getElementById("bookingProject").value.trim();
  if (!proj) { alert("Enter a project name"); return; }
  const engineer = document.getElementById("bookingEngineer").value;
  const studio = document.getElementById("bookingStudio").value;
  const sessionType = document.getElementById("bookingType").value;
  const durVal = document.getElementById("bookingDuration").value;
  const hours = durVal === "custom" ? parseInt(document.getElementById("bookingCustomDuration").value) || 4 : parseInt(durVal);
  const numSessions = parseInt(document.getElementById("bookingNumSessions").value) || 1;
  const mode = document.querySelector('input[name="dateMode"]:checked').value;
  const summary = \`\${studio.toUpperCase()} \${proj.toUpperCase()} \${engineer.toUpperCase()} \${sessionType}\`;

  if (mode === "specific") {
    const date = document.getElementById("specificDate").value;
    const startTime = document.getElementById("specificStart").value;
    const endTime = document.getElementById("specificEnd").value;
    if (!date || !startTime || !endTime) { alert("Fill in date, start, and end time"); return; }
    const [sy, sm, sd] = date.split("-").map(Number);
    const [sh, smin] = startTime.split(":").map(Number);
    const [eh, emin] = endTime.split(":").map(Number);
    const start = new Date(sy, sm - 1, sd, sh, smin);
    const end = new Date(sy, sm - 1, sd, eh, emin);
    const hours = (end - start) / 3600000;

    // Check conflicts via suggest
    const btn = document.getElementById("submitBookingBtn");
    const spinner = document.getElementById("bookingSpinner");
    btn.disabled = true;
    spinner.style.display = "";
    try {
      const result = await apiJson("/api/suggest", {
        method: "POST",
        body: JSON.stringify({
          projectName: proj,
          numberOfSessions: 1,
          durationHours: hours,
          preferredDays: "any",
          preferredTimeOfDay: "any",
          preferredPeople: [engineer],
          preferredRooms: [studio],
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      });
      const slots = result.suggestions || [];
      const hasConflict = slots.length > 0 && slots[0].conflict;
      if (hasConflict) {
        const c = slots[0];
        alert(\`\${c.conflictResource || "Studio"} unavailable — \${c.conflictSummary || "already booked"}\`);
      } else if (slots.length > 0 && !slots[0].conflict) {
        sessions.push({
          id: Date.now() + Math.random(), project: proj,
          sessionNumber: sessions.filter(s => s.project === proj).length + 1,
          startTime: start.toISOString(), endTime: end.toISOString(),
          date: date, dateStr: start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
          resources: [engineer, studio], sessionType, summary,
        });
        renderSessions();
      } else {
        // Figure out which constraint blocked it
        const day = start.getDay();
        const isWeekend = day === 0 || day === 6;
        const startH = start.getHours() + start.getMinutes() / 60;
        const endH = end.getHours() + end.getMinutes() / 60;
        let reason = "";
        if (!isWeekend && startH < 18.5) {
          reason = "Studio bookings on weekdays must start at 6:30pm or later.";
        } else if (!isWeekend && endH > 23) {
          reason = "Weekday sessions cannot end past 11pm or cross midnight.";
        } else {
          reason = "This time conflicts with an existing booking or constraint.";
        }
        alert(\`Not available — \${reason}\`);
      }
    } catch (e) {
      alert("Could not check conflicts: " + e.message);
    } finally {
      btn.disabled = false;
      spinner.style.display = "none";
    }
    return;
  }

  const btn = this;
  const spinner = document.getElementById("bookingSpinner");
  btn.disabled = true;
  spinner.style.display = "";
  const prefDays = document.querySelector('input[name="prefDays"]:checked').value;
  const prefTime = document.querySelector('input[name="prefTime"]:checked').value;

  try {
    const result = await apiJson("/api/suggest", {
      method: "POST",
      body: JSON.stringify({
        projectName: proj,
        numberOfSessions: numSessions,
        durationHours: hours,
        preferredDays: prefDays,
        preferredTimeOfDay: prefTime,
        preferredPeople: [engineer],
        preferredRooms: [studio],
      }),
    });
    suggestions = result.suggestions || [];
    currentRequest = { projectName: proj, numberOfSessions: numSessions };
    renderSuggestions(suggestions, currentRequest);
  } catch (e) {
    document.getElementById("suggestionsArea").innerHTML = \`<div class="suggestion-card" style="color:var(--conflict)">\${e.message}</div>\`;
  } finally {
    btn.disabled = false;
    spinner.style.display = "none";
  }
};

document.getElementById("clearBookingBtn").onclick = function () {
  document.getElementById("bookingProject").value = "";
  document.getElementById("bookingNumSessions").value = "1";
  document.getElementById("suggestionsArea").innerHTML = "";
  suggestions = [];
  currentRequest = null;
};

// ── Render suggestions ──
function renderSuggestions(dates, req) {
  const area = document.getElementById("suggestionsArea");
  if (!dates.length) {
    area.innerHTML = '<div class="suggestion-card"><div class="suggestion-header">No available dates found</div></div>';
    return;
  }
  const unique = [];
  const seen = new Set();
  for (const d of dates) if (!seen.has(d.date)) { seen.add(d.date); unique.push(d); }
  let html = \`<div class="suggestion-card"><div class="suggestion-header">Found \${unique.length} available slots</div>\`;
  const available = unique.filter(d => !d.conflict);
  const conflicts = unique.filter(d => d.conflict);
  if (available.length) {
    html += \`<div style="font-size:0.7rem;color:var(--success);margin-bottom:0.5rem">\${available.length} available</div>\`;
    available.forEach((d, idx) => {
      const startTime = d.startTime ? new Date(d.startTime) : null;
      const endTime = d.endTime ? new Date(d.endTime) : null;
      const timeStr = startTime ? \`\${fmtTime(startTime)} → \${endTime ? fmtTime(endTime) : ""}\` : d.window;
      const isSelected = sessions.some(s => s.date === d.date && s.window === d.window);
      html += \`<div class="alternative-slot\${isSelected ? " selected" : ""}" data-idx="\${idx}">
        <div style="flex:1"><strong>\${d.dateStr}</strong><br><span style="font-size:0.75rem">\${timeStr} · \${d.window || ""}</span></div>
        <button class="btn btn-secondary btn-sm" onclick="selectSuggestion(\${idx})">\${isSelected ? "Selected" : "Select"}</button>
      </div>\`;
    });
  }
  if (conflicts.length) {
    html += \`<div style="font-size:0.7rem;color:var(--conflict);margin-top:0.75rem;margin-bottom:0.5rem">\${conflicts.length} conflicts (already booked)</div>\`;
    conflicts.forEach((d, idx) => {
      const startTime = d.startTime ? new Date(d.startTime) : null;
      const endTime = d.endTime ? new Date(d.endTime) : null;
      const timeStr = startTime ? \`\${fmtTime(startTime)} → \${endTime ? fmtTime(endTime) : ""}\` : d.window;
      const conflictDetail = d.conflictSummary ? d.conflictSummary : \`\${d.conflictResource || "resource"} booked\`;
      html += \`<div class="alternative-slot conflict" style="cursor:default">
        <div style="flex:1"><strong>\${d.dateStr}</strong><br><span style="font-size:0.75rem">\${timeStr} · \${d.window || ""}</span><br><span style="font-size:0.65rem;color:var(--conflict)">\${d.conflictResource || "Studio"} unavailable — \${conflictDetail}</span></div>
        <span style="color:var(--conflict);font-size:0.7rem">CONFLICT</span>
      </div>\`;
    });
  }
  html += \`<div style="margin-top:0.75rem;text-align:center"><button class="btn btn-primary btn-sm" onclick="selectAllSuggestions()">Add All \${req?.numberOfSessions || 1} Dates</button></div></div>\`;
  area.innerHTML = html;
}

window.selectSuggestion = function (idx) {
  const d = suggestions[idx];
  if (!d || !currentRequest) return;
  const alreadyAdded = sessions.find(s => s.date === d.date && s.window === d.window);
  if (alreadyAdded) { sessions = sessions.filter(s => s !== alreadyAdded); }
  else {
    const engineer = document.getElementById("bookingEngineer").value;
    const studio = document.getElementById("bookingStudio").value;
    const sessionType = document.getElementById("bookingType").value;
    const proj = currentRequest.projectName || "Untitled";
    sessions.push({
      id: Date.now() + idx, project: proj,
      sessionNumber: sessions.filter(s => s.project === proj).length + 1,
      startTime: d.startTime, endTime: d.endTime, date: d.date, dateStr: d.dateStr, window: d.window,
      resources: [engineer, studio], sessionType,
      summary: \`\${studio.toUpperCase()} \${proj.toUpperCase()} \${engineer.toUpperCase()} \${sessionType}\`,
    });
  }
  renderSessions();
  document.querySelectorAll(".alternative-slot").forEach(el => {
    const i = parseInt(el.dataset.idx);
    const sd = suggestions[i];
    if (!sd || !currentRequest) return;
    const sel = sessions.some(s => s.date === sd.date && s.window === sd.window);
    el.className = \`alternative-slot\${sel ? " selected" : ""}\`;
    const btn = el.querySelector("button");
    if (btn) btn.textContent = sel ? "Selected" : "Select";
  });
};

window.selectAllSuggestions = function () {
  if (!currentRequest) return;
  const engineer = document.getElementById("bookingEngineer").value;
  const studio = document.getElementById("bookingStudio").value;
  const sessionType = document.getElementById("bookingType").value;
  const proj = currentRequest.projectName || "Untitled";
  const evName = \`\${studio.toUpperCase()} \${proj.toUpperCase()} \${engineer.toUpperCase()} \${sessionType}\`;
  const toAdd = suggestions.slice(0, currentRequest.numberOfSessions || 1);
  toAdd.forEach((d, i) => {
    if (!sessions.find(s => s.date === d.date && s.window === d.window)) {
      sessions.push({
        id: Date.now() + i + Math.random(), project: proj,
        sessionNumber: sessions.filter(s => s.project === proj).length + 1,
        startTime: d.startTime, endTime: d.endTime, date: d.date, dateStr: d.dateStr, window: d.window,
        resources: [engineer, studio], sessionType, summary: evName,
      });
    }
  });
  renderSessions();
  document.querySelectorAll(".alternative-slot").forEach(el => {
    const i = parseInt(el.dataset.idx);
    const sd = suggestions[i];
    if (!sd || !currentRequest) return;
    const sel = sessions.some(s => s.date === sd.date && s.window === sd.window);
    el.className = \`alternative-slot\${sel ? " selected" : ""}\`;
    const btn = el.querySelector("button"); if (btn) btn.textContent = sel ? "Selected" : "Select";
  });
};

// ── API helpers ──
async function api(path, options = {}) {
  const resp = await fetch(\`\${API_BASE}\${path}\`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || \`API error \${resp.status}\`);
  }
  return resp;
}

async function apiJson(path, options) {
  const resp = await api(path, options);
  return resp.json();
}

// ── Check API health ──
async function checkHealth() {
  try {
    const resp = await fetch(\`\${API_BASE}/api/resources\`);
    const dot = document.getElementById("apiDot");
    const status = document.getElementById("apiStatus");
    if (resp.ok) {
      dot.className = "status-dot ok";
      status.textContent = "connected";
      document.getElementById("dbStatus").innerHTML = '<span class="status-dot ok"></span> DB: online';
      return true;
    }
    throw new Error("unhealthy");
  } catch (e) {
    document.getElementById("apiDot").className = "status-dot err";
    document.getElementById("apiStatus").textContent = "offline (using local fallback)";
    document.getElementById("dbStatus").innerHTML = '<span class="status-dot err"></span> DB: offline';
    return false;
  }
}

// ── Google Calendar auth ──
let googleConnected = false;

// Listen for OAuth callback from popup
window.addEventListener("message", (event) => {
  if (event.data === "google-auth-success") {
    googleConnected = true;
    updateGoogleUI();
  }
});

async function checkGoogleStatus() {
  try {
    const resp = await apiJson("/api/auth/status");
    googleConnected = resp.connected;
  } catch (e) {
    googleConnected = false;
  }
  updateGoogleUI();
}

function updateGoogleUI() {
  const btn = document.getElementById("googleAuthBtn");
  const status = document.getElementById("googleStatus");
  const calStatus = document.getElementById("googleCalStatus");
  const syncCheck = document.getElementById("syncGoogleCheckbox");

  btn.style.display = "";
  if (googleConnected) {
    btn.textContent = "Disconnect Calendar";
    btn.className = "btn btn-secondary btn-sm";
    btn.onclick = disconnectGoogle;
    status.style.display = "";
    status.textContent = "Calendar connected";
    status.style.color = "var(--success)";
    if (calStatus) calStatus.innerHTML = '<span class="status-dot ok"></span> Google: connected';
    if (syncCheck) syncCheck.disabled = false;
    loadCalendars();
    loadUpcoming();
  } else {
    btn.textContent = "Connect Calendar";
    btn.className = "btn btn-primary btn-sm";
    btn.onclick = connectGoogle;
    status.style.display = "none";
    if (calStatus) calStatus.innerHTML = '<span class="status-dot" style="background:var(--grey)"></span> Google: not connected';
    if (syncCheck) { syncCheck.checked = false; syncCheck.disabled = true; }
    document.getElementById("calendarSelect").innerHTML = '<option value="primary">Primary Calendar</option>';
  }
}

async function connectGoogle() {
  try {
    const data = await apiJson("/api/auth/google");
    if (data.url) {
      const popup = window.open(data.url, "google-oauth", "width=600,height=700");
      if (!popup) {
        alert("Please allow popups for this site to connect Google Calendar.");
      }
    } else {
      alert("Google OAuth is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets.");
    }
  } catch (e) {
    alert("Failed to start Google auth: " + e.message);
  }
}

async function disconnectGoogle() {
  if (!confirm("Disconnect Google Calendar? You'll need to re-authorize to sync events again.")) return;
  try {
    await apiJson("/api/auth/revoke", { method: "POST" });
    googleConnected = false;
    updateGoogleUI();
  } catch (e) {
    alert("Failed to disconnect: " + e.message);
  }
}

// ── Load available calendars ──
async function loadCalendars() {
  try {
    const data = await apiJson("/api/calendars");
    const sel = document.getElementById("calendarSelect");
    sel.innerHTML = "";
    let foundStudioBookings = false;
    for (const cal of (data.calendars || [])) {
      const opt = document.createElement("option");
      opt.value = cal.id;
      opt.textContent = cal.summary + (cal.primary ? " (default)" : "");
      const isStudioBookings = cal.summary && cal.summary.toLowerCase().includes("studio booking");
      if (isStudioBookings) { opt.selected = true; foundStudioBookings = true; }
      else if (!foundStudioBookings && cal.primary) opt.selected = true;
      sel.appendChild(opt);
    }
  } catch (e) {
    console.log("Could not load calendars:", e.message);
  }
}

// ── Load upcoming week calendar preview ──
async function loadUpcoming() {
  const btn = document.getElementById("refreshPreviewBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Refreshing..."; }
  try {
    const data = await apiJson("/api/calendar/preview");
    let events = data.events || [];
    // Filter by checked calendar sources
    const checkedSources = [...document.querySelectorAll(".calSrcCb:checked")].map(cb => cb.value);
    events = events.filter(e => {
      const cn = (e.calendarName || "").toLowerCase();
      return checkedSources.some(s => cn.includes(s));
    });
    const cont = document.getElementById("upcomingList");
    if (!events.length) {
      cont.innerHTML = '<div style="text-align:center;color:var(--grey);padding:1rem;width:100%">No events this week</div>';
      return;
    }
    // Group by date (handle both dateTime and date-only formats)
    const byDate = new Map();
    for (const e of events) {
      // Parse date: if it has a T or timezone offset, use local parsing; otherwise treat as local date
      let d;
      if (e.start.includes("T") || e.start.includes("+") || e.start.includes("Z")) {
        d = new Date(e.start);
      } else {
        // Date-only string like "2026-04-30" — parse as local midnight
        const [y, m, day] = e.start.split("-").map(Number);
        d = new Date(y, m - 1, day);
      }
      // Skip past events
      const now = new Date();
      now.setHours(0,0,0,0);
      if (d < now) continue;

      const key = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,"0")}-\${String(d.getDate()).padStart(2,"0")}\`;
      if (!byDate.has(key)) {
        const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        byDate.set(key, { label, events: [] });
      }
      byDate.get(key).events.push(e);
    }

    // Auto-refresh every 5 minutes
    clearInterval(window._calRefreshTimer);
    window._calRefreshTimer = setInterval(loadUpcoming, 5 * 60 * 1000);

    // Build calendar grid: Sunday-Saturday, next 30 days
    const today = new Date(); today.setHours(0,0,0,0);
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - today.getDay()); // Start from this Sunday
    const totalDays = 30 + today.getDay(); // Enough days to cover 30 from today
    const calDays = [];
    for (let i = 0; i < totalDays; i++) {
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      day.setHours(0,0,0,0);
      const key = \`\${day.getFullYear()}-\${String(day.getMonth()+1).padStart(2,"0")}-\${String(day.getDate()).padStart(2,"0")}\`;
      const label = day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const isToday = day.getTime() === today.getTime();
      const isPast = day < today;
      calDays.push({ key, label, events: byDate.get(key)?.events || [], isToday, isPast });
    }

    const calColors = {
      "difuze": "var(--conflict)",
      "studio booking": "var(--success)",
      "meeting": "#60a5fa",
      "festival": "#f59e0b",
      "jesse": "var(--warning)",
      "freelance": "#a78bfa",
      "safe&sound": "var(--off-white)",
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Find max events per cell to determine uniform height
    let maxEvents = 0;
    for (const dayData of calDays) { if (dayData.events.length > maxEvents) maxEvents = dayData.events.length; }
    const cellHeight = Math.max(120, 30 + maxEvents * 20);

    let html = \`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--rule)">\`;
    // Header row
    for (const dn of dayNames) {
      html += \`<div style="text-align:center;font-weight:500;color:var(--off-white);padding:0.3rem 0;border-bottom:1px solid var(--rule-mid);font-size:0.7rem">\${dn}</div>\`;
    }
    // Day cells
    for (let i = 0; i < calDays.length; i++) {
      const dayData = calDays[i];
      const isLastRow = (i + 7 >= calDays.length);
      html += \`<div style="min-height:\${cellHeight}px;padding:4px 4px;word-break:break-word;background:rgba(15,15,15,0.9);\${dayData.isPast ? "opacity:0.4" : ""}">
        <div style="font-size:0.7rem;\${dayData.isToday ? "color:var(--warning);font-weight:600" : "color:var(--off-white)"};margin-bottom:3px">\${dayData.label}</div>\`;
      for (const e of dayData.events) {
        const st = e.start ? new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
        const cn = (e.calendarName || "").toLowerCase();
        let color = "var(--grey)";
        for (const [k, v] of Object.entries(calColors)) { if (cn.includes(k)) { color = v; break; } }
        html += \`<div style="font-size:0.62rem;line-height:1.3;padding-bottom:2px" title="\${e.summary}">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:\${color};margin-right:3px;vertical-align:middle"></span><span style="font-size:0.55rem;color:var(--grey)">\${st}</span> \${e.summary || "—"}
        </div>\`;
      }
      if (!dayData.events.length && !dayData.isPast) {
        html += \`<div style="font-size:0.55rem;color:var(--grey)">—</div>\`;
      }
      html += "</div>";
    }
    html += "</div>";
    cont.innerHTML = html;
  } catch (e) {
    document.getElementById("upcomingList").innerHTML = \`<div style="text-align:center;color:var(--conflict);padding:1rem;width:100%">Calendar preview unavailable — \${e.message || "unknown error"}</div>\`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Refresh"; }
  }
}

// ── Load stored sessions from DB ──
function normalizeDbSession(s) {
  const startDate = new Date(s.start_time);
  return {
    id: s.id,
    project: s.project_name,
    sessionNumber: s.session_number,
    startTime: s.start_time,
    endTime: s.end_time,
    date: s.start_time.split("T")[0],
    dateStr: startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    resources: [s.resource_person, s.resource_room].filter(Boolean),
    status: s.status,
    googleEventId: s.google_event_id,
    saved: true,
    fromDb: true,
  };
}

async function loadSessions() {
  try {
    const data = await apiJson("/api/sessions");
    const dbSessions = (data.sessions || []).map(normalizeDbSession);
    const existingIds = new Set(sessions.map(s => s.id));
    for (const dbSess of dbSessions) {
      if (!existingIds.has(dbSess.id)) {
        sessions.push(dbSess);
      }
    }
    renderSessions();
  } catch (e) {
    console.log("Could not load stored sessions:", e.message);
  }
}

// ── Delete session from DB ──
window.deleteSession = async function (id) {
  if (!confirm("Delete this session? It will be cancelled and the Google Calendar event removed if synced.")) return;
  try {
    await api(\`/api/sessions/\${id}\`, { method: "DELETE" });
    sessions = sessions.filter(s => s.id !== id);
    renderSessions();
  } catch (e) {
    alert("Failed to delete: " + e.message);
  }
};

// ── Booking approval ──
window.approveSession = async function (id) {
  try {
    await api(\`/api/approvals/\${id}\`, {
      method: "POST",
      body: JSON.stringify({ action: "confirmed" }),
    });
    const session = sessions.find(s => s.id === id);
    if (session) { session.status = "confirmed"; renderSessions(); }
  } catch (e) {
    alert("Failed to approve: " + e.message);
  }
};

window.rejectSession = async function (id) {
  if (!confirm("Reject this session? It will be cancelled.")) return;
  try {
    await api(\`/api/approvals/\${id}\`, {
      method: "POST",
      body: JSON.stringify({ action: "cancelled" }),
    });
    const session = sessions.find(s => s.id === id);
    if (session) { session.status = "cancelled"; renderSessions(); }
  } catch (e) {
    alert("Failed to reject: " + e.message);
  }
};

window.clearPendingApprovals = function () {
  const pending = sessions.filter(s => s.status === "pending_approval" && s.fromDb);
  if (!pending.length) return;
  if (!confirm(\`Reject all \${pending.length} pending approvals?\`)) return;
  Promise.all(pending.map(s => api(\`/api/approvals/\${s.id}\`, { method: "POST", body: JSON.stringify({ action: "cancelled" }) }).catch(() => {})))
    .finally(() => {
      sessions = sessions.filter(s => !pending.includes(s));
      renderSessions();
    });
};

window.copyApprovals = function () {
  const pending = sessions.filter(s => s.status === "pending_approval");
  if (!pending.length) { alert("No pending approvals"); return; }
  // Sort by date
  pending.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  let text = "";
  for (const s of pending) {
    const d = new Date(s.startTime);
    const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const st = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const et = new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const room = (s.resources || []).find(r => r && (r.includes("st") || r.includes("tch") || r.includes("studio")));
    const engineer = (s.resources || []).find(r => r && !r.includes("st") && !r.includes("tch") && !r.includes("studio"));
    const engName = engineer ? engineer.charAt(0).toUpperCase() + engineer.slice(1) : "?";
    text += \`\${(room || "?").toUpperCase()} | \${day} \${st}-\${et} | \${engName}\\n\`;
  }
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyApprovalsBtn");
    btn.textContent = "Copied!";
    setTimeout(() => btn.textContent = "Copy for Email", 1500);
  }).catch(() => alert("Could not copy — check clipboard permissions"));
};

// ── Render session queue ──
function renderSessions() {
  const pending = sessions.filter(s => s.status === "pending_approval");
  const nonPending = sessions.filter(s => s.status !== "pending_approval");

  document.getElementById("sessionCount").textContent = nonPending.length;
  document.getElementById("pendingCount").textContent = pending.length;

  const pendingCard = document.getElementById("pendingApprovalsCard");
  const pendingCont = document.getElementById("pendingList");
  document.getElementById("copyApprovalsBtn").style.display = pending.length ? "" : "none";
  if (pending.length) {
    pendingCard.style.display = "";
    pendingCont.innerHTML = renderSessionGroup(pending, true);
  } else {
    pendingCard.style.display = "none";
    pendingCont.innerHTML = '<div style="text-align:center;color:var(--grey);padding:2rem">No pending approvals</div>';
  }

  const cont = document.getElementById("eventsList");
  if (!nonPending.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--grey);padding:2rem">No sessions in queue. Use the booking form above.</div>';
    return;
  }
  cont.innerHTML = renderSessionGroup(nonPending, false);
}

function renderSessionGroup(sessionsList, isPending) {
  const grouped = {};
  for (const s of sessionsList) {
    if (!grouped[s.project]) grouped[s.project] = [];
    grouped[s.project].push(s);
  }

  let html = "";
  for (const [proj, sess] of Object.entries(grouped)) {
    html += \`<div class="session-group"><div class="session-header">\${proj} <span style="font-size:0.7rem;font-weight:300;color:var(--grey)">\${sess.length} session(s)</span></div>\`;
    for (const s of sess) {
      const ts = \`\${fmtTime(new Date(s.startTime))} → \${fmtTime(new Date(s.endTime))}\`;
      const status = s.status || (s.saved ? "suggested" : "draft");
      const statusClass = status === "confirmed" ? "confirmed" : status === "pending_approval" ? "pending_approval" : status === "cancelled" ? "cancelled" : s.fromDb ? "saved" : "suggested";
      const statusLabel = status === "confirmed" ? "Confirmed" : status === "pending_approval" ? "Pending Approval (Alex Reinprecht)" : status === "cancelled" ? "Cancelled" : s.fromDb ? "Saved" : "Ready";
      const statusColor = status === "pending_approval" ? "var(--warning)" : status === "cancelled" ? "var(--grey)" : "var(--success)";

      let actionsHtml = "";
      if (s.fromDb) {
        actionsHtml += \`<button class="btn btn-danger btn-sm" onclick="deleteSession(\${s.id})">Delete</button>\`;
      } else {
        actionsHtml += \`<button class="btn btn-secondary btn-sm" onclick="removeSession(\${s.id})">Remove</button>\`;
      }

      if (isPending) {
        actionsHtml += \`<div style="margin-top:0.5rem;display:flex;gap:0.5rem">
          <button class="btn btn-success btn-sm" onclick="approveSession(\${s.id})">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectSession(\${s.id})">Reject</button>
        </div>\`;
      }

      html += \`<div class="event-item \${statusClass}">
        <div class="event-title">
          <span>Session \${s.sessionNumber}: \${s.dateStr} · \${ts}</span>
          \${actionsHtml}
        </div>
        <div style="font-size:0.75rem;margin-bottom:0.25rem"><strong>Project:</strong> \${proj}\${s.sessionType ? \` · <strong>Type:</strong> \${s.sessionType}\` : ""}</div>
        <div class="event-resources">\${(s.resources || []).map(r => {
          const cls = r && (r.includes("studio") || r.includes("st") || r.includes("tch")) ? "room" : "person";
          return \`<span class="resource-tag \${cls}">@\${r}</span>\`;
        }).join("")}</div>
        <div style="color:\${statusColor};font-size:0.75rem">\${statusLabel}</div>
      </div>\`;
    }
    html += "</div>";
  }
  return html;
}

let syncPollTimer = null;

async function syncDifuze() {
  const btn = document.getElementById("syncDifuzeBtn");
  const status = document.getElementById("syncDifuzeStatus");
  const TRIGGER_URL = "https://difuze-calendar-sync.safeandsoundpost.workers.dev/api/trigger";
  const STATUS_URL = "https://difuze-calendar-sync.safeandsoundpost.workers.dev/api/trigger/status";

  if (btn.disabled) return;
  btn.disabled = true;
  btn.textContent = "Syncing…";
  status.style.display = "";
  status.style.color = "var(--warning)";
  status.innerHTML = '<span class="spinner"></span>';

  clearTimeout(syncPollTimer);

  try {
    const triggerResp = await fetch(TRIGGER_URL, { method: "POST" });
    const trigger = await triggerResp.json();

    if (triggerResp.status === 409) {
      status.textContent = "Sync already in progress";
      status.style.color = "var(--warning)";
      btn.disabled = false;
      btn.textContent = "Sync DIFUZE";
      setTimeout(() => { status.style.display = "none"; }, 3000);
      return;
    }

    if (!triggerResp.ok) throw new Error(trigger.error || "Failed to create trigger");

    const startTime = Date.now();
    const poll = async () => {
      try {
        const r = await fetch(STATUS_URL);
        const t = await r.json();

        if (t.status === "completed") {
          let summary = "&#10003; Synced";
          if (t.result && t.result.output) {
            const m = t.result.output.match(/Imported (\\d+) events/);
            if (m) summary += " — " + m[1] + " events imported";
          }
          status.innerHTML = summary;
          btn.disabled = false;
          btn.textContent = "Sync DIFUZE";
          loadUpcoming();
          setTimeout(() => { status.style.display = "none"; }, 5000);
        } else if (t.status === "failed") {
          const err = (t.result && t.result.output) ? t.result.output.slice(-200) : "Unknown error";
          status.innerHTML = "&#10007; Sync failed";
          status.style.color = "var(--conflict)";
          status.title = err;
          btn.disabled = false;
          btn.textContent = "Sync DIFUZE";
          setTimeout(() => { status.style.display = "none"; }, 8000);
        } else if (Date.now() - startTime > 300000) {
          status.textContent = "Sync timed out";
          status.style.color = "var(--conflict)";
          btn.disabled = false;
          btn.textContent = "Sync DIFUZE";
          setTimeout(() => { status.style.display = "none"; }, 5000);
        } else {
          syncPollTimer = setTimeout(poll, 3000);
        }
      } catch (e) {
        status.textContent = "Connection error";
        status.style.color = "var(--conflict)";
        btn.disabled = false;
        btn.textContent = "Sync DIFUZE";
        setTimeout(() => { status.style.display = "none"; }, 5000);
      }
    };
    poll();
  } catch (e) {
    status.textContent = "Error: " + e.message;
    status.style.color = "var(--conflict)";
    btn.disabled = false;
    btn.textContent = "Sync DIFUZE";
    setTimeout(() => { status.style.display = "none"; }, 5000);
  }
}

window.removeSession = function (id) {
  sessions = sessions.filter(s => s.id !== id);
  renderSessions();
  if (suggestions.length) renderSuggestions(suggestions, currentRequest);
};

window.clearAllSessions = function () {
  if (!sessions.length) return;
  const dbCount = sessions.filter(s => s.fromDb).length;
  const msg = dbCount ? \`Remove all \${sessions.length} sessions? (\${dbCount} from database will be soft-deleted)\` : \`Remove all \${sessions.length} sessions from queue?\`;
  if (!confirm(msg)) return;
  // Delete DB sessions
  const dbSessions = sessions.filter(s => s.fromDb);
  Promise.all(dbSessions.map(s => api(\`/api/sessions/\${s.id}\`, { method: "DELETE" }).catch(() => {})))
    .finally(() => {
      sessions = [];
      renderSessions();
    });
};

// ── Save to DB ──
document.getElementById("saveToDbBtn").onclick = async function () {
  if (!sessions.length) { alert("No sessions to save"); return; }
  const btn = this;
  btn.disabled = true;
  btn.textContent = "Pushing...";

  try {
    // Only push local sessions (not already in DB)
    const toPush = sessions.filter(s => !s.fromDb);
    if (!toPush.length) { alert("No new sessions to push."); btn.disabled = false; btn.textContent = "Push to Google Calendar"; return; }

    const grouped = {};
    for (const s of toPush) {
      if (!grouped[s.project]) grouped[s.project] = [];
      grouped[s.project].push(s);
    }

    let syncedCount = 0;
    for (const [projectName, sess] of Object.entries(grouped)) {
      const resp = await apiJson("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          projectName,
          createGoogleEvents: document.getElementById("syncGoogleCheckbox").checked && googleConnected,
          calendarId: document.getElementById("calendarSelect").value,
          sessions: sess.map((s, i) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            sessionNumber: i + 1,
            person: s.resources?.[0] || null,
            room: s.resources?.[1] || null,
            summary: s.summary || null,
            sessionType: s.sessionType || null,
          })),
        }),
      });
      for (const s of sess) s.saved = true;
      if (resp.googleCalendarSynced) {
        syncedCount += resp.googleEventIds?.length || 0;
      }
    }
    // Remove pushed sessions and reload fresh from DB
    sessions = sessions.filter(s => s.fromDb);
    await loadSessions();
    renderSessions();

    if (syncedCount > 0) {
      btn.textContent = \`Pushed + \${syncedCount} calendar event(s)!\`;
    } else if (document.getElementById("syncGoogleCheckbox").checked) {
      const gErr = resp.googleError || "unknown error";
      btn.textContent = \`Sync failed: \${gErr}\`;
      if (gErr.includes("token")) alert("Google Calendar sync failed — try disconnecting and reconnecting.");
    } else {
      btn.textContent = "Saved to DB!";
    }
    setTimeout(() => { btn.textContent = "Push to Google Calendar"; btn.disabled = false; }, 3000);
  } catch (e) {
    alert(\`Save failed: \${e.message}\`);
    btn.textContent = "Push to Google Calendar";
    btn.disabled = false;
  }
};

// ── Export ICS ──
document.getElementById("generateIcsBtn").onclick = async function () {
  if (!sessions.length) { alert("No sessions to export"); return; }

  const icsSessions = sessions.map(s => ({
    projectName: s.project,
    startTime: s.startTime,
    endTime: s.endTime,
    resources: s.resources || [],
  }));

  try {
    const resp = await api("/api/export-ics", {
      method: "POST",
      body: JSON.stringify({ sessions: icsSessions }),
    });
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    // Fallback: generate ICS locally
    let ics = "BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\nPRODID:-//SafeAndSound//Scheduler//EN\\r\\n";
    for (const s of icsSessions) {
      const fmtStart = s.startTime.replace(/[-:]/g, "").split(".")[0] + "Z";
      const fmtEnd = s.endTime.replace(/[-:]/g, "").split(".")[0] + "Z";
      ics += \`BEGIN:VEVENT\\r\\nSUMMARY:\${s.projectName} - Mix Session\\r\\nDTSTART:\${fmtStart}\\r\\nDTEND:\${fmtEnd}\\r\\nUID:\${crypto.randomUUID()}\\r\\nEND:VEVENT\\r\\n\`;
    }
    ics += "END:VCALENDAR";
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  }
};

// ── Init ──
async function init() {
  const healthy = await checkHealth();
  if (healthy) {
    await loadUpcoming();
    await loadSessions();
    await checkGoogleStatus();
  } else {
    // Use mock resource data
    document.getElementById("resourcesList").innerHTML = \`
      <div class="resource-row"><span><span class="resource-tag person">Thom</span></span><span class="busy-badge">Busy May 17, 20</span></div>
      <div class="resource-row"><span><span class="resource-tag person">Jesse</span></span><span class="busy-badge">Busy May 17</span></div>
      <div class="resource-row"><span><span class="resource-tag room">ST1 (150 John St)</span></span><span class="busy-badge">Busy May 20</span></div>
      <div class="resource-row"><span><span class="resource-tag room">ST2 (150 John St)</span></span><span class="busy-badge">Busy May 17</span></div>
      <div class="resource-row"><span><span class="resource-tag room">TCHA (17 Central Hospital Ln)</span></span><span class="busy-badge">Busy May 19</span></div>
      <div class="resource-row"><span><span class="resource-tag room">TCHB (17 Central Hospital Ln)</span></span><span class="free-badge">Free</span></div>
    \`;
  }
}

window.syncDifuze = syncDifuze;

init();
</script>
</body>
</html>
`;