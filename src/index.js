import HTML from "./ui.js";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const CORS_ORIGIN = "https://sched.safeandsoundpost.com";
const MODEL = "deepseek-chat";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_SCOPES = "openid https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly";
const REDIRECT_URI = "https://sched.safeandsoundpost.com/api/auth/google/callback";

function cors(request, headers = {}) {
  const origin = request?.headers?.get("Origin") || "";
  // Allow localhost, the custom domain, and the workers.dev domain
  const allowedOrigins = [
    "http://localhost",
    "http://127.0.0.1",
    CORS_ORIGIN,
    "https://sas-scheduler.safeandsoundpost.workers.dev",
  ];
  const allowed = allowedOrigins.some((o) => origin.startsWith(o))
    ? origin
    : CORS_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed || "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...headers,
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors({ "Content-Type": "application/json" }),
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

// ── Resolve alias to canonical resource name ──
async function resolveAlias(db, alias) {
  const row = await db
    .prepare("SELECT resource_type, canonical_name FROM resource_aliases WHERE alias = ?")
    .bind(alias.toLowerCase())
    .first();
  return row || null;
}

// ── Check if a resource is busy in a time range ──
async function isResourceBusy(db, resource, start, end, excludeSessionId = null) {
  let query =
    "SELECT COUNT(*) as count FROM sessions WHERE (resource_person = ? OR resource_room = ?) AND start_time < ? AND end_time > ? AND status != 'cancelled'";
  const params = [resource, resource, end.toISOString(), start.toISOString()];
  if (excludeSessionId) {
    query += " AND id != ?";
    params.push(excludeSessionId);
  }
  const row = await db.prepare(query).bind(...params).first();
  return row.count > 0;
}

// ── Google OAuth helpers ──

function generateState() {
  return crypto.randomUUID();
}

async function getStoredToken(db) {
  return db
    .prepare("SELECT * FROM oauth_tokens ORDER BY id DESC LIMIT 1")
    .first();
}

async function storeToken(db, email, accessToken, refreshToken, expiresIn) {
  const expiresAt = new Date(Date.now() + (expiresIn || 3600) * 1000).toISOString();
  await db
    .prepare(
      "INSERT OR REPLACE INTO oauth_tokens (user_email, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?)"
    )
    .bind(email, accessToken, refreshToken || null, expiresAt)
    .run();
}

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Google token refresh failed: ${err}`);
  }
  return resp.json();
}

async function getValidToken(db, env) {
  const row = await getStoredToken(db);
  if (!row) return null;

  // Check if expired (with 60s buffer)
  if (new Date(row.expires_at) > new Date(Date.now() + 60000)) {
    return { accessToken: row.access_token, email: row.user_email };
  }

  // Refresh (need a refresh token to refresh)
  if (!row.refresh_token) return null;
  try {
    const data = await refreshAccessToken(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      row.refresh_token
    );
    await storeToken(
      db,
      row.user_email,
      data.access_token,
      data.refresh_token || row.refresh_token,
      data.expires_in || 3600
    );
    return { accessToken: data.access_token, email: row.user_email };
  } catch (e) {
    console.error("Token refresh failed:", e.message);
    // Clear the stale token so we don't keep failing
    await db.prepare("DELETE FROM oauth_tokens").run();
    return null;
  }
}

async function createCalendarEvent(accessToken, session, projectName, calendarId, statusSuffix = "") {
  const calId = calendarId || "primary";
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const resp = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: (session.summary || `${session.resource_room || "Studio"} ${projectName} ${session.resource_person || ""}`.trim()) + statusSuffix,
        description: `Resources: ${[session.resource_person, session.resource_room].filter(Boolean).join(", ") || "none"}`,
        location: (session.resource_room || "").toLowerCase().includes("tch") ? "17 Central Hospital Lane, Toronto" : (session.resource_room && (session.resource_room.toLowerCase().includes("st") || session.resource_room.toLowerCase().includes("studio"))) ? "150 John St, Toronto" : undefined,
        start: {
          dateTime: start.toISOString(),
          timeZone: "America/Toronto",
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: "America/Toronto",
        },
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Google Calendar API error: ${err}`);
  }
  const data = await resp.json();
  return data.id;
}

// ── Call DeepSeek API for structured extraction ──
async function callDeepSeek(apiKey, systemPrompt, userMessage, tools) {
  // Convert Anthropic-style tools to OpenAI format
  const openaiTools = tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    },
  }));

  const body = {
    model: MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    tools: openaiTools,
    tool_choice: "required",
  };

  const resp = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`DeepSeek API error ${resp.status}: ${errBody}`);
  }

  return resp.json();
}

// ── Parse natural language into structured scheduling request ──
async function handleParse(request, env) {
  const { text } = await request.json();
  if (!text || text.trim().length < 3) return error("Text too short");

  const tools = [
    {
      name: "extract_scheduling_request",
      description: "Extract structured scheduling requirements from natural language",
      input_schema: {
        type: "object",
        properties: {
          projectName: { type: "string", description: "Project or album name" },
          client: { type: "string", description: "Client name if mentioned" },
          numberOfSessions: { type: "integer", description: "Number of mixing sessions/days needed", default: 1 },
          durationHours: { type: "integer", description: "Hours per session", default: 8 },
          preferredTimeOfDay: { type: "string", enum: ["morning", "afternoon", "evening", "any"], description: "Preferred time of day" },
          preferredDays: { type: "string", enum: ["weekdays", "weekends", "any"], description: "Day preference" },
          preferredPeople: { type: "array", items: { type: "string" }, description: "Resource people mentioned (use short names like thom, jesse, alex)" },
          preferredRooms: { type: "array", items: { type: "string" }, description: "Rooms/studios mentioned (use short names like st1, st2, studio_a, studio_b)" },
          notes: { type: "string", description: "Any additional constraints or notes" },
        },
        required: ["projectName", "numberOfSessions"],
      },
    },
  ];

  try {
    const result = await callDeepSeek(
      env.DEEPSEEK_API_KEY,
      "You extract structured scheduling requests from natural language. Map people names to short forms: thom, jesse. Map rooms: ST1 (150 John St) = st1 (also studio_a), ST2 (150 John St) = st2 (also studio_b), TCHA at 17 Central Hospital Lane = tcha (also studio_a_tch), TCHB at 17 Central Hospital Lane = tchb (also studio_b_tch). All studio bookings require approval from Alex Reinprecht (Difuze Studio Manager). If time of day isn't specified, default to 'any'. If days aren't specified, default to 'any'. Return only the structured data.",
      text,
      tools
    );

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return error("Failed to parse request");

    const parsed = JSON.parse(toolCall.function.arguments);
    return json(parsed);
  } catch (e) {
    return error(e.message, 500);
  }
}

// ── Fetch Google Calendar busy periods for people ──
async function fetchGoogleBusyPeriods(db, env, people, rooms, rangeStart, rangeEnd) {
  const token = await getValidToken(db, env);
  if (!token) return {};

  try {
    const calResp = await fetch(
      `${GOOGLE_CALENDAR_API}/users/me/calendarList`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    );
    if (!calResp.ok) return {};
    const calData = await calResp.json();
    const calendars = calData.items || [];

    // Find the DIFUZE master studio calendar
    const difuzeCal = calendars.find(c => (c.summary || "").toLowerCase().includes("difuze"));

    const busyByResource = {};
    const calendarsToFetch = [];

    // Always fetch DIFUZE calendar for studio conflicts
    if (difuzeCal) calendarsToFetch.push({ id: difuzeCal.id, type: "studio" });

    // Match person calendars
    for (const cal of calendars) {
      const name = (cal.summary || "").toLowerCase();
      if (name.includes("can be booked over") || name.includes("book over")) continue;
      for (const person of people) {
        if (name.includes(person.toLowerCase())) {
          calendarsToFetch.push({ id: cal.id, type: "person", person });
        }
      }
    }

    if (!calendarsToFetch.length) return {};

    // Fetch events
    for (const c of calendarsToFetch) {
      const params = new URLSearchParams({
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
      });
      const evResp = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(c.id)}/events?${params}`,
        { headers: { Authorization: `Bearer ${token.accessToken}` } }
      );
      if (!evResp.ok) continue;
      const evData = await evResp.json();
      for (const e of (evData.items || [])) {
        const evStart = e.start?.dateTime || e.start?.date;
        const evEnd = e.end?.dateTime || e.end?.date;
        if (!evStart || !evEnd) continue;
        const busy = { start: new Date(evStart), end: new Date(evEnd), summary: e.summary || "Untitled" };

        if (c.type === "person") {
          if (!busyByResource[c.person]) busyByResource[c.person] = [];
          busyByResource[c.person].push(busy);
        } else if (c.type === "studio") {
          // Parse studio code from event summary (e.g. "ST1-MARY..." → st1)
          const summary = (e.summary || "").toLowerCase();
          for (const room of rooms) {
            if (summary.startsWith(room.toLowerCase() + "-") || summary.includes(" " + room.toLowerCase() + "-") || summary.startsWith(room.toLowerCase() + " ")) {
              if (!busyByResource[room]) busyByResource[room] = [];
              busyByResource[room].push(busy);
              break;
            }
          }
        }
      }
    }
    return busyByResource;
  } catch (e) {
    console.error("Google Calendar fetch for conflicts failed:", e.message);
    return {};
  }
}

// ── Find available slots ──
async function handleSuggest(request, env) {
  const { projectName, numberOfSessions, durationHours, preferredDays, preferredTimeOfDay, preferredPeople, preferredRooms, startDate, endDate } = await request.json();

  if (!numberOfSessions || numberOfSessions < 1) return error("numberOfSessions required");

  const hours = durationHours || 8;
  const numSessions = numberOfSessions;
  const people = preferredPeople?.length ? preferredPeople : ["thom", "jesse"];
  const rooms = preferredRooms?.length ? preferredRooms : ["st1", "st2", "tcha", "tchb"];
  const allResources = [...people, ...rooms];

  const db = env.DB;
  const suggestions = [];
  const maxSuggestions = Math.max(numSessions * 10, 60);

  // Toronto offset: EDT=UTC-4 (Mar-Nov), EST=UTC-5 (Nov-Mar)
  const now = new Date();
  const torOffset = (now.getMonth() >= 2 && now.getMonth() <= 10) ? -4 : -5;

  // Default to next 60 days
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setHours(0, 0, 0, 0);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);

  // Pre-fetch Google Calendar busy periods for all requested people
  const googleBusy = await fetchGoogleBusyPeriods(db, env, people, rooms, start, end);

  // Time windows as [startHour, startMin, label]. Session must end by 10pm.
  const WORKDAY_END = 23; // 11pm Chicago time
  const timeWindows = [];
  if (!preferredTimeOfDay || preferredTimeOfDay === "any") {
    timeWindows.push([9, 0, "Full Day (9am)"], [13, 0, "Afternoon (1pm)"], [18, 30, "Evening (6:30pm)"]);
  } else if (preferredTimeOfDay === "morning") {
    timeWindows.push([9, 0, "Morning"]);
  } else if (preferredTimeOfDay === "afternoon") {
    timeWindows.push([13, 0, "Afternoon"]);
  } else if (preferredTimeOfDay === "evening") {
    timeWindows.push([18, 30, "Evening"]);
  }

  for (let d = new Date(start); d <= end && suggestions.length < maxSuggestions; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (preferredDays === "weekends" && !isWeekend) continue;
    if (preferredDays === "weekdays" && isWeekend) continue;

    for (const [winStart, winMin, label] of timeWindows) {
      if (suggestions.length >= maxSuggestions) break;

      const slotStart = new Date(d);
      slotStart.setUTCHours(winStart - torOffset, winMin, 0, 0);
      const slotEnd = new Date(d);
      slotEnd.setUTCHours(winStart - torOffset + hours, winMin, 0, 0);

      // Weekday constraint: session must not end past 11pm Toronto time
      if (!isWeekend) {
        // Compute Toronto-local dates (UTC + offset hours)
        const torStartDay = new Date(slotStart.getTime() + torOffset * 3600000).getUTCDate();
        const torEndDay = new Date(slotEnd.getTime() + torOffset * 3600000).getUTCDate();
        const torEndHour = new Date(slotEnd.getTime() + torOffset * 3600000).getUTCHours();
        const torEndMin = new Date(slotEnd.getTime() + torOffset * 3600000).getUTCMinutes();
        const torEndDecimal = torEndHour + (torEndMin / 60);
        // Block if crosses Toronto midnight (different Toronto day)
        if (torEndDay !== torStartDay) continue;
        // Block if ends past 11pm
        if (torEndDecimal > WORKDAY_END) continue;
      }
      // Don't suggest past times
      if (slotStart < new Date()) continue;
      // Studio constraint: weekdays must start 6:30pm or later Chicago time
      const hasRoom = rooms.some(r => allResources.includes(r));
      if (hasRoom && !isWeekend) {
        const chiStartHour = slotStart.getUTCHours() + torOffset;
        const chiStartMin = slotStart.getUTCMinutes();
        if (chiStartHour < 18 || (chiStartHour === 18 && chiStartMin < 30)) continue;
      }

      let allFree = true;
      let conflictResource = null;
      let conflictSummary = null;
      for (const resource of allResources) {
        if (await isResourceBusy(db, resource, slotStart, slotEnd)) {
          allFree = false;
          conflictResource = resource;
          conflictSummary = "Already booked in scheduler";
          break;
        }
        const busy = googleBusy[resource];
        if (busy) {
          for (const b of busy) {
            if (slotStart < b.end && slotEnd > b.start) {
              allFree = false;
              conflictResource = resource;
              conflictSummary = b.summary || `Google Calendar event`;
              break;
            }
          }
        }
        if (!allFree) break;
      }

      const wouldConflictWithConstraint = (!isWeekend && hasRoom &&
        (slotStart.getUTCHours() + torOffset < 18 || (slotStart.getUTCHours() + torOffset === 18 && slotStart.getUTCMinutes() < 30)));

      if (!wouldConflictWithConstraint) {
        suggestions.push({
          date: d.toISOString().split("T")[0],
          dateStr: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          window: label,
          resources: allResources,
          conflict: !allFree,
          conflictResource: conflictResource || undefined,
          conflictSummary: conflictSummary || undefined,
        });
      }
    }
  }

  return json({ projectName, suggestions, total: suggestions.length });
}

// ── Save sessions ──
async function handleSaveSessions(request, env) {
  const { projectName, client, sessions, createGoogleEvents, calendarId } = await request.json();

  if (!projectName || !sessions?.length) return error("projectName and sessions required");

  const db = env.DB;

  // Check for conflicts before saving (local DB + Google Calendar)
  const people = [...new Set(sessions.map(s => s.person || s.resources?.[0]).filter(Boolean))];
  const rooms = [...new Set(sessions.map(s => s.room || s.resources?.[1]).filter(Boolean))];
  const sessionRangeEnd = new Date(Math.max(...sessions.map(s => new Date(s.endTime).getTime())));
  const sessionRangeStart = new Date(Math.min(...sessions.map(s => new Date(s.startTime).getTime())));
  const googleBusy = await fetchGoogleBusyPeriods(db, env, people, rooms, sessionRangeStart, sessionRangeEnd);

  for (const s of sessions) {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    const resources = s.resources || [s.person, s.room].filter(Boolean);
    for (const resource of resources) {
      // Check local DB
      if (await isResourceBusy(db, resource, start, end)) {
        return error(`Conflict: ${resource} is busy during ${start.toISOString()} - ${end.toISOString()}`, 409);
      }
      // Check Google Calendar (DIFUZE + person calendars)
      const busy = googleBusy[resource];
      if (busy) {
        for (const b of busy) {
          if (start < b.end && end > b.start) {
            return error(`Conflict: ${resource} is booked on Google Calendar during this time (DIFUZE or personal calendar)`, 409);
          }
        }
      }
    }
  }

  // Get Google token if available
  let googleToken = null;
  let googleError = null;
  if (createGoogleEvents && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    try {
      googleToken = await getValidToken(db, env);
      if (!googleToken) googleError = "No valid Google token stored";
    } catch (e) {
      googleError = e.message;
      console.error("Google auth error:", e.message);
    }
  }

  // Insert project
  const project = await db
    .prepare("INSERT INTO projects (name, client) VALUES (?, ?) RETURNING id")
    .bind(projectName, client || null)
    .first();

  // Insert sessions
  const insertedIds = [];
  const googleEventIds = [];
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const person = s.person || s.resources?.[0] || null;
    const room = s.room || s.resources?.[1] || null;

    const status = (isStudioRoom(room) && s.sessionType !== "MEETING") ? "pending_approval" : "suggested";
    const statusSuffix = status === "pending_approval" ? " (PENDING APPROVAL)" : "";

    // Create Google Calendar event
    let googleEventId = null;
    const calId = calendarId || "primary";
    if (googleToken) {
      try {
        googleEventId = await createCalendarEvent(googleToken.accessToken, {
          startTime: s.startTime,
          endTime: s.endTime,
          sessionNumber: s.sessionNumber || i + 1,
          resource_person: person,
          resource_room: room,
          summary: s.summary || null,
        }, projectName, calId, statusSuffix);
        googleEventIds.push(googleEventId);
      } catch (e) {
        googleError = e.message;
        console.error("Google Calendar event creation failed:", e.message);
      }
    }

    const result = await db
      .prepare(
        "INSERT INTO sessions (project_id, session_number, start_time, end_time, resource_person, resource_room, status, google_event_id, calendar_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        project.id,
        s.sessionNumber || i + 1,
        s.startTime,
        s.endTime,
        person,
        room,
        status,
        googleEventId,
        googleEventId ? calId : null
      )
      .run();
    insertedIds.push(result.meta?.last_row_id || project.id + i);
  }

  return json({
    success: true,
    projectId: project.id,
    sessionIds: insertedIds,
    googleCalendarSynced: googleEventIds.length > 0,
    googleError: googleError || undefined,
    googleEventIds: googleEventIds.length ? googleEventIds : undefined,
  }, 201);
}

// ── List sessions ──
async function handleGetSessions(request, env) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");
  const status = url.searchParams.get("status");
  const db = env.DB;

  let query = `
    SELECT s.*, p.name as project_name, p.client
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (projectId) {
    query += " AND s.project_id = ?";
    params.push(projectId);
  }
  if (startDate) {
    query += " AND s.start_time >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND s.end_time <= ?";
    params.push(endDate);
  }
  if (status) {
    if (status === "active") {
      query += " AND s.status != 'cancelled'";
    } else {
      query += " AND s.status = ?";
      params.push(status);
    }
  } else {
    query += " AND s.status != 'cancelled'";
  }

  query += " ORDER BY s.start_time ASC";

  const sessions = await db.prepare(query).bind(...params).all();
  return json({ sessions: sessions.results });
}

// ── Delete a session (soft delete + Google Calendar cleanup) ──
async function handleDeleteSession(request, env) {
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/sessions\/(\d+)/)?.[1];
  if (!id) return error("Session ID required", 404);

  const db = env.DB;

  // Fetch session to get google_event_id
  const session = await db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .bind(id)
    .first();
  if (!session) return error("Session not found", 404);

  // Attempt to delete the Google Calendar event if it exists
  if (session.google_event_id) {
    const calId = session.calendar_id || "primary";
    try {
      const token = await getValidToken(db, env);
      if (token) {
        await fetch(
          `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events/${session.google_event_id}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token.accessToken}` } }
        );
      }
    } catch (e) {
      console.error("Failed to delete Google Calendar event:", e.message);
    }
  }

  // Soft delete: set status to cancelled, clear google_event_id
  await db
    .prepare("UPDATE sessions SET status = 'cancelled', google_event_id = NULL WHERE id = ?")
    .bind(id)
    .run();

  return json({ success: true, cancelled: true });
}

// ── Get resources ──
async function handleGetResources(request, env) {
  const db = env.DB;
  const aliases = await db.prepare("SELECT * FROM resource_aliases ORDER BY resource_type, canonical_name").all();

  // Also get upcoming busy periods for each unique canonical resource
  const resources = await db
    .prepare(
      "SELECT resource_person, resource_room, start_time, end_time FROM sessions WHERE status != 'cancelled' AND end_time > ? ORDER BY start_time ASC"
    )
    .bind(new Date().toISOString())
    .all();

  // Group aliases by canonical name
  const grouped = {};
  for (const a of aliases.results) {
    if (!grouped[a.canonical_name]) {
      grouped[a.canonical_name] = { type: a.resource_type, canonicalName: a.canonical_name, aliases: [], busyPeriods: [] };
    }
    grouped[a.canonical_name].aliases.push(a.alias);
  }

  // Add busy periods
  for (const r of resources.results) {
    const names = [r.resource_person, r.resource_room].filter(Boolean);
    for (const name of names) {
      if (grouped[name]) {
        grouped[name].busyPeriods.push({ start: r.start_time, end: r.end_time });
      }
    }
  }

  return json({ resources: Object.values(grouped) });
}

// ── Export ICS ──
async function handleExportIcs(request) {
  const { sessions } = await request.json();
  if (!sessions?.length) return error("sessions required");

  let ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SafeAndSound//Scheduler//EN"];

  for (const s of sessions) {
    const fmtStart = s.startTime.replace(/[-:]/g, "").split(".")[0] + "Z";
    const fmtEnd = s.endTime.replace(/[-:]/g, "").split(".")[0] + "Z";
    const summary = s.projectName ? `${s.projectName} - Mix Session` : "Mix Session";
    const desc = s.resources ? `Resources: ${s.resources.join(", ")}` : "";

    ics.push("BEGIN:VEVENT");
    ics.push(`SUMMARY:${summary}`);
    ics.push(`DTSTART:${fmtStart}`);
    ics.push(`DTEND:${fmtEnd}`);
    if (desc) ics.push(`DESCRIPTION:${desc}`);
    ics.push(`UID:${crypto.randomUUID()}`);
    ics.push("END:VEVENT");
  }

  ics.push("END:VCALENDAR");

  return new Response(ics.join("\r\n"), {
    headers: {
      ...cors(),
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="schedule.ics"',
    },
  });
}

// ── List Google Calendars ──
async function handleListCalendars(request, env) {
  try {
    const token = await getValidToken(env.DB, env);
    if (!token) return error("Google Calendar not connected", 401);

    const resp = await fetch(
      `${GOOGLE_CALENDAR_API}/users/me/calendarList`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    );

    if (!resp.ok) {
      const errBody = await resp.text();
      return error(`Calendar list failed (${resp.status}): ${errBody}`, resp.status);
    }

    const data = await resp.json();
    const calendars = (data.items || []).map((c) => ({
      id: c.id,
      summary: c.summary,
      description: c.description,
      primary: c.primary || false,
      timeZone: c.timeZone,
    }));

    return json({ calendars });
  } catch (e) {
    console.error("handleListCalendars error:", e.message);
    return error(e.message, 500);
  }
}

// ── Unified calendar preview ──
async function handleCalendarPreview(request, env) {
  const token = await getValidToken(env.DB, env);
  if (!token) return error("Google Calendar not connected", 401);

  try {
    // Get all calendars
    const calResp = await fetch(
      `${GOOGLE_CALENDAR_API}/users/me/calendarList`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    );
    if (!calResp.ok) return error("Could not fetch calendars", calResp.status);
    const calData = await calResp.json();
    const calendars = calData.items || [];

    // Target calendars by name
    const targetNames = ["studio booking", "difuze", "meeting", "festival", "networking", "safe&sound general", "jesse edit", "freelance"];
    const targetCals = calendars.filter(c => {
      const name = (c.summary || "").toLowerCase();
      return targetNames.some(t => name.includes(t));
    });

    // Fetch events for next 7 days from each
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const allEvents = [];

    for (const cal of targetCals) {
      const params = new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: weekEnd.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });
      const evResp = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
        { headers: { Authorization: `Bearer ${token.accessToken}` } }
      );
      if (evResp.ok) {
        const evData = await evResp.json();
        for (const e of (evData.items || [])) {
          allEvents.push({
            summary: e.summary,
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            calendarName: cal.summary,
          });
        }
      }
    }

    allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    return json({ events: allEvents });
  } catch (e) {
    return error(e.message, 500);
  }
}

// ── Google Calendar search ──
async function handleCalendarSearch(request, env) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    if (!start || !end) return error("start and end query parameters required (ISO 8601)");

    const token = await getValidToken(env.DB, env);
    if (!token) return error("Google Calendar not connected", 401);

    const params = new URLSearchParams({
      timeMin: new Date(start).toISOString(),
      timeMax: new Date(end).toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

    const calendarId = url.searchParams.get("calendar_id") || "primary";
    const resp = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    );

    if (!resp.ok) {
      const errBody = await resp.text();
      return error(`Calendar search failed (${resp.status}): ${errBody}`, resp.status);
    }

    const data = await resp.json();
    const events = (data.items || []).map((e) => ({
      id: e.id,
      summary: e.summary,
      description: e.description,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      creator: e.creator?.email,
      htmlLink: e.htmlLink,
    }));

    return json({ events, count: events.length });
  } catch (e) {
    console.error("handleCalendarSearch error:", e.message);
    return error(e.message, 500);
  }
}

// ── Booking approval ──
function isStudioRoom(roomAlias) {
  // All studio rooms (ST1, ST2, TCHA, TCHB) require approval
  if (!roomAlias) return false;
  const a = roomAlias.toLowerCase();
  return a === "st1" || a === "st2" || a === "tcha" || a === "tchb"
    || a === "studio_a" || a === "studio_b" || a === "studio_a_tch" || a === "studio_b_tch"
    || a === "studio 1" || a === "studio 2" || a === "studio a" || a === "studio b"
    || a === "studio_1" || a === "studio_2";
}

async function handleGetApprovals(request, env) {
  const db = env.DB;
  const sessions = await db
    .prepare(`
      SELECT s.*, p.name as project_name, p.client
      FROM sessions s
      JOIN projects p ON s.project_id = p.id
      WHERE s.status = 'pending_approval'
      ORDER BY s.start_time ASC
    `)
    .all();
  return json({ sessions: sessions.results });
}

async function handleApprovalAction(request, env) {
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/approvals\/(\d+)/)?.[1];
  if (!id) return error("Session ID required", 404);

  const { action } = await request.json();
  if (!["confirmed", "cancelled"].includes(action)) {
    return error("action must be 'confirmed' or 'cancelled'");
  }

  const db = env.DB;

  const session = await db.prepare("SELECT * FROM sessions WHERE id = ?").bind(id).first();
  if (session?.google_event_id) {
    const calId = session.calendar_id || "primary";
    try {
      const token = await getValidToken(db, env);
      if (token) {
        if (action === "cancelled") {
          await fetch(
            `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events/${session.google_event_id}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${token.accessToken}` } }
          );
        } else if (action === "confirmed") {
          // Update event summary to replace PENDING APPROVAL with CONFIRMED
          const evResp = await fetch(
            `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events/${session.google_event_id}`,
            { headers: { Authorization: `Bearer ${token.accessToken}` } }
          );
          if (evResp.ok) {
            const evData = await evResp.json();
            const newSummary = (evData.summary || "").replace("(PENDING APPROVAL)", "(CONFIRMED)");
            await fetch(
              `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events/${session.google_event_id}`,
              {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ summary: newSummary }),
              }
            );
          }
        }
      }
    } catch (e) {
      console.error(`Failed to update Google Calendar event on ${action}:`, e.message);
    }
  }

  const result = await db
    .prepare("UPDATE sessions SET status = ?, google_event_id = CASE WHEN ? = 'cancelled' THEN NULL ELSE google_event_id END WHERE id = ? AND status = 'pending_approval'")
    .bind(action, action, id)
    .run();

  if (result.meta?.changes === 0) return error("Session not found or already processed", 404);

  return json({ success: true, newStatus: action });
}

// ── Google OAuth endpoints ──

async function handleAuthGoogle(env) {
  if (!env.GOOGLE_CLIENT_ID) return error("Google OAuth not configured", 501);

  const state = generateState();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return json({ url: `${GOOGLE_AUTH_URL}?${params.toString()}`, state });
}

async function handleAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return new Response(
      `<html><body><script>window.close();</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const resp = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await resp.json();

    // Decode id_token JWT to get email (no API call needed)
    let email = "unknown";
    if (data.id_token) {
      try {
        const payload = JSON.parse(atob(data.id_token.split(".")[1]));
        email = payload.email || "unknown";
      } catch (e) { /* fallthrough */ }
    }

    await storeToken(
      env.DB,
      email,
      data.access_token,
      data.refresh_token,
      data.expires_in || 3600
    );

    return new Response(
      `<html><body style="background:#0a0a0a;color:#22c55e;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div><h1>Connected!</h1><p>Google Calendar linked as ${email}</p><p style="color:#6e6b66">This window will close automatically.</p></div><script>if(window.opener){window.opener.postMessage("google-auth-success","*")}setTimeout(()=>window.close(),1500)</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (e) {
    console.error("OAuth callback error:", e.message);
    return new Response(
      `<html><body style="background:#0a0a0a;color:#dc2626;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div><h1>Connection Failed</h1><p>${e.message}</p><p style="color:#6e6b66">Close this window and try again.</p></div></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

async function handleAuthStatus(env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return json({ connected: false, reason: "not configured" });
  }
  try {
    const token = await getValidToken(env.DB, env);
    if (!token) return json({ connected: false });
    return json({ connected: true, email: token.email });
  } catch (e) {
    return json({ connected: false, error: e.message });
  }
}

async function handleAuthRevoke(env) {
  const token = await getStoredToken(env.DB);
  if (!token) return json({ success: true, message: "No token stored" });

  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: token.access_token }),
    });
  } catch (e) {
    console.error("Revoke error:", e.message);
  }

  await env.DB.prepare("DELETE FROM oauth_tokens").run();
  return json({ success: true, message: "Disconnected" });
}

// ── Main handler ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(request) });
    }

    try {
      // POST /api/parse — AI-powered natural language extraction
      if (path === "/api/parse" && method === "POST") {
        return handleParse(request, env);
      }

      // POST /api/suggest — find available slots
      if (path === "/api/suggest" && method === "POST") {
        return handleSuggest(request, env);
      }

      // POST /api/sessions — save sessions
      if (path === "/api/sessions" && method === "POST") {
        return handleSaveSessions(request, env);
      }

      // GET /api/sessions — list sessions
      if (path === "/api/sessions" && method === "GET") {
        return handleGetSessions(request, env);
      }

      // DELETE /api/sessions/:id
      if (path.startsWith("/api/sessions/") && method === "DELETE") {
        return handleDeleteSession(request, env);
      }

      // GET /api/resources
      if (path === "/api/resources" && method === "GET") {
        return handleGetResources(request, env);
      }

      // POST /api/export-ics
      if (path === "/api/export-ics" && method === "POST") {
        return handleExportIcs(request);
      }

      // GET /api/auth/google — initiate Google OAuth
      if (path === "/api/auth/google" && method === "GET") {
        return handleAuthGoogle(env);
      }

      // GET /api/auth/google/callback — OAuth callback
      if (path === "/api/auth/google/callback" && method === "GET") {
        return handleAuthCallback(request, env);
      }

      // GET /api/auth/status — check auth status
      if (path === "/api/auth/status" && method === "GET") {
        return handleAuthStatus(env);
      }

      // POST /api/auth/revoke — disconnect Google Calendar
      if (path === "/api/auth/revoke" && method === "POST") {
        return handleAuthRevoke(env);
      }

      // GET /api/calendars — list Google Calendars
      if (path === "/api/calendars" && method === "GET") {
        return handleListCalendars(request, env);
      }

      // GET /api/calendar/preview — unified calendar preview
      if (path === "/api/calendar/preview" && method === "GET") {
        return handleCalendarPreview(request, env);
      }

      // GET /api/calendar/search — search Google Calendar
      if (path === "/api/calendar/search" && method === "GET") {
        return handleCalendarSearch(request, env);
      }

      // GET /api/approvals — list pending sessions
      if (path === "/api/approvals" && method === "GET") {
        return handleGetApprovals(request, env);
      }

      // POST /api/approvals/:id — approve/reject
      if (path.startsWith("/api/approvals/") && method === "POST") {
        return handleApprovalAction(request, env);
      }

      // GET / — serve the scheduler UI
      if (path === "/" && method === "GET") {
        return new Response(HTML, {
          headers: { "Content-Type": "text/html; charset=utf-8", ...cors(request) },
        });
      }

      return new Response("Not found", { status: 404, headers: cors(request) });
    } catch (e) {
      console.error(e);
      return error(e.message, 500);
    }
  },
};
