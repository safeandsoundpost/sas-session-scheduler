const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const CORS_ORIGIN = "https://sched.safeandsoundpost.com";
const MODEL = "deepseek-chat";

function cors(request, headers = {}) {
  const origin = request?.headers?.get("Origin") || "";
  const allowed = origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")
    ? origin
    : CORS_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
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
      "You extract structured scheduling requests from natural language. Map people names to short forms: thom, jesse, alex. Map rooms: Studio 1 = st1 or studio_a, Studio 2 = st2 or studio_b, Studio 3 = st3. If time of day isn't specified, default to 'any'. If days aren't specified, default to 'any'. Return only the structured data.",
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

// ── Find available slots ──
async function handleSuggest(request, env) {
  const { projectName, numberOfSessions, durationHours, preferredDays, preferredTimeOfDay, preferredPeople, preferredRooms, startDate, endDate } = await request.json();

  if (!numberOfSessions || numberOfSessions < 1) return error("numberOfSessions required");

  const hours = durationHours || 8;
  const numSessions = numberOfSessions;
  const people = preferredPeople?.length ? preferredPeople : ["thom", "jesse"];
  const rooms = preferredRooms?.length ? preferredRooms : ["studio_a", "studio_b"];
  const allResources = [...people, ...rooms];

  const db = env.DB;
  const suggestions = [];
  const maxSuggestions = numSessions * 5;

  // Default to next 30 days
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Time windows in hours: [startHour, endHour, label]
  const timeWindows = [];
  if (!preferredTimeOfDay || preferredTimeOfDay === "any") {
    timeWindows.push([9, 13, "Morning"], [13, 17, "Afternoon"], [18, 22, "Evening"]);
  } else if (preferredTimeOfDay === "morning") {
    timeWindows.push([9, 13, "Morning"]);
  } else if (preferredTimeOfDay === "afternoon") {
    timeWindows.push([13, 17, "Afternoon"]);
  } else if (preferredTimeOfDay === "evening") {
    timeWindows.push([18, 22, "Evening"]);
  }

  for (let d = new Date(start); d <= end && suggestions.length < maxSuggestions; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (preferredDays === "weekends" && !isWeekend) continue;
    if (preferredDays === "weekdays" && isWeekend) continue;

    for (const [winStart, winEnd, label] of timeWindows) {
      if (suggestions.length >= maxSuggestions) break;

      const slotStart = new Date(d);
      slotStart.setHours(winStart, 0, 0, 0);
      const slotEnd = new Date(d);
      slotEnd.setHours(winStart + hours, 0, 0, 0);

      // Make sure session fits in window
      if (slotEnd.getHours() > winEnd) continue;
      // Don't suggest past times
      if (slotStart < new Date()) continue;

      let allFree = true;
      for (const resource of allResources) {
        if (await isResourceBusy(db, resource, slotStart, slotEnd)) {
          allFree = false;
          break;
        }
      }

      if (allFree) {
        suggestions.push({
          date: d.toISOString().split("T")[0],
          dateStr: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          window: label,
          resources: allResources,
        });
      }
    }
  }

  return json({ projectName, suggestions, total: suggestions.length });
}

// ── Save sessions ──
async function handleSaveSessions(request, env) {
  const { projectName, client, sessions } = await request.json();

  if (!projectName || !sessions?.length) return error("projectName and sessions required");

  const db = env.DB;

  // Check for conflicts before saving
  for (const s of sessions) {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    const resources = s.resources || [s.person, s.room].filter(Boolean);
    for (const resource of resources) {
      if (await isResourceBusy(db, resource, start, end)) {
        return error(`Conflict: ${resource} is busy during ${start.toISOString()} - ${end.toISOString()}`, 409);
      }
    }
  }

  // Insert project
  const project = await db
    .prepare("INSERT INTO projects (name, client) VALUES (?, ?) RETURNING id")
    .bind(projectName, client || null)
    .first();

  // Insert sessions
  const insertedIds = [];
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const result = await db
      .prepare(
        "INSERT INTO sessions (project_id, session_number, start_time, end_time, resource_person, resource_room, status) VALUES (?, ?, ?, ?, ?, ?, 'suggested')"
      )
      .bind(
        project.id,
        s.sessionNumber || i + 1,
        s.startTime,
        s.endTime,
        s.person || s.resources?.[0] || null,
        s.room || s.resources?.[1] || null
      )
      .run();
    insertedIds.push(result.meta?.last_row_id || project.id + i);
  }

  return json({ success: true, projectId: project.id, sessionIds: insertedIds }, 201);
}

// ── List sessions ──
async function handleGetSessions(request, env) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");
  const db = env.DB;

  let query = `
    SELECT s.*, p.name as project_name, p.client
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
  `;
  const params = [];

  if (projectId) {
    query += " WHERE s.project_id = ?";
    params.push(projectId);
  }
  query += " ORDER BY s.start_time ASC";

  const sessions = await db.prepare(query).bind(...params).all();
  return json({ sessions: sessions.results });
}

// ── Delete a session ──
async function handleDeleteSession(request, env) {
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/sessions\/(\d+)/)?.[1];
  if (!id) return error("Session ID required", 404);

  const db = env.DB;
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
  return json({ success: true });
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

      return new Response("Not found", { status: 404, headers: cors(request) });
    } catch (e) {
      console.error(e);
      return error(e.message, 500);
    }
  },
};
