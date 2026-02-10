# Bansal Classes AI Advisor - Setup Complete

## Architecture
```
Browser (contact.html) 
  → Local API (port 3001)
  → Monitor Process
  → Response File
  → Back to Browser
```

## Running Services

### 1. bansal-ai-advisor (PM2 Process 0)
- File: `api-server.js`
- Port: 3001
- Purpose: HTTP endpoint for frontend
- Status: Online

### 2. bansal-ai-monitor (PM2 Process 1)
- File: `monitor.js`
- Purpose: Processes AI requests and generates responses
- Status: Online

### 3. bansal-ai-advisor (Sub-agent)
- Session: `agent:main:subagent:40d28d91-413a-480b-af97-38178ed1c763`
- Purpose: Dedicated AI agent for customer service (spawned)

## How It Works

1. Frontend sends POST to `http://localhost:3001/api/ai-advisor`
2. API writes request to `/tmp/ai-advisor-queue/`
3. Monitor detects new request files
4. Monitor processes request using intelligent course matching
5. Monitor writes response to `/tmp/ai-advisor-responses/`
6. API polls for response and returns to frontend
7. Response displayed in contact.html

## Course Recommendations

The system detects student intent and recommends:

- **Foundation Course**: Class 9-10 students
- **NEET Course**: Medical/MBBS aspirants
- **IIT-JEE Course**: Engineering/IIT aspirants

## Frontend Integration

File: `ai-advisor.js`
- Calls `http://localhost:3001/api/ai-advisor`
- Sends userPrompt and systemPrompt
- Receives HTML-formatted response

## Production Deployment Steps

To go live:

1. **Update `ai-advisor.js`** with your domain:
   ```javascript
   const API_BASE_URL = 'https://your-domain.com:3001';
   ```

2. **Open firewall port**:
   ```bash
   ufw allow 3001/tcp
   ```

3. **Optionally add HTTPS** using nginx reverse proxy or similar

## Testing

Test endpoint:
```bash
curl -X POST http://localhost:3001/api/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"I am in class 10 and want to become a doctor","systemPrompt":"Test"}'
```

## PM2 Commands

```bash
pm2 list                              # View status
pm2 logs bansal-ai-advisor --lines 50    # API logs
pm2 logs bansal-ai-monitor --lines 50    # Monitor logs
pm2 restart all                        # Restart services
pm2 stop all                            # Stop services
pm2 start all                           # Start services
```

## Files Created

- `api-server.js` - Express API server
- `monitor.js` - Request processing monitor
- `ai-advisor.js` - Frontend integration (updated)

## Notes

- System uses file-based queuing for simplicity
- Currently uses rule-based matching (can be enhanced with actual AI calls)
- All responses are HTML-formatted for frontend display
- Response timeout: 30 seconds (with fallback)
