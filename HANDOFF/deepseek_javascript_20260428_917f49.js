export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': 'https://sched.safeandsoundpost.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    // Parse natural language with Claude/DS API
    if (path === '/api/parse' && request.method === 'POST') {
      const { text } = await request.json();
      
      // Call Claude or DeepSeek API here
      // For now, return mock response
      return Response.json({
        projectName: "Happy Families",
        sessions: [{
          durationHours: 8,
          preferredTimeOfDay: "evening",
          preferredDays: "weekends",
          preferredPeople: ["Thom"],
          preferredRooms: ["Studio 1"]
        }]
      }, { headers });
    }
    
    // Check conflicts via Google Calendar Free/Busy
    if (path === '/api/check-conflicts' && request.method === 'POST') {
      const { sessions, accessToken } = await request.json();
      // Implement Free/Busy check
      return Response.json({ conflicts: [] }, { headers });
    }
    
    // Save sessions to D1
    if (path === '/api/save-sessions' && request.method === 'POST') {
      const { projectName, sessions } = await request.json();
      const db = env.DB;
      
      // Insert project
      const project = await db.prepare(
        'INSERT INTO projects (name) VALUES (?) RETURNING id'
      ).bind(projectName).first();
      
      // Insert sessions
      for (const session of sessions) {
        await db.prepare(
          'INSERT INTO sessions (project_id, start_time, end_time, resource_person, resource_room) VALUES (?, ?, ?, ?, ?)'
        ).bind(project.id, session.start, session.end, session.person, session.room).run();
      }
      
      return Response.json({ success: true, projectId: project.id }, { headers });
    }
    
    // Push to Google Calendar
    if (path === '/api/push-to-gcal' && request.method === 'POST') {
      const { sessions, accessToken } = await request.json();
      // Implement Google Calendar API insert
      return Response.json({ success: true, eventIds: [] }, { headers });
    }
    
    // Generate ICS
    if (path === '/api/export-ics' && request.method === 'POST') {
      const { sessions } = await request.json();
      let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
      for (const s of sessions) {
        icsContent += `BEGIN:VEVENT\nSUMMARY:${s.projectName} - Mix Session\nDTSTART:${s.start.replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${s.end.replace(/[-:]/g, '').split('.')[0]}Z\nEND:VEVENT\n`;
      }
      icsContent += 'END:VCALENDAR';
      return new Response(icsContent, {
        headers: { 'Content-Type': 'text/calendar', 'Content-Disposition': 'attachment; filename="schedule.ics"' }
      });
    }
    
    return new Response('Not found', { status: 404, headers });
  }
};