# Bansal Classes AI Advisor - Setup Complete

## Architecture
```
Browser (contact.html)
  → Local API (port 3001)
  → Monitor Process (Conversational AI)
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
- Purpose: Intelligent conversational AI response generation
- Status: Online

## How It Works

1. Frontend sends POST to `http://localhost:3001/api/ai-advisor`
2. API writes request to `/tmp/ai-advisor-queue/`
3. Monitor detects new request files
4. Monitor generates **conversational, contextual responses**
5. Monitor writes response to `/tmp/ai-advisor-responses/`
6. API polls for response and returns to frontend
7. Response displayed in contact.html

## Response System (Conversational AI)

The AI analyzes student context and responds naturally:

**Detects:**
- Class level: 9-10, 11-12, passed 12th, dropper
- Interests: biology/medical, math/engineering
- Goals: doctor, engineer, NEET, IIT-JEE

**Example Conversations:**

**Passed 12th + biology:**
```
"Great choice! Since you've passed 12th with a strong foundation in biology,
our NEET Course is perfect for you. With your background,
you'll benefit from focused biology preparation, physics/chemistry coaching..."
```

**Class 11 + confused:**
```
"Hello! I see you're in class 11-12. This is a crucial time for
your career preparation. Could you share: Are you more inclined toward
medical or engineering?"
```

**Dropper + IIT-JEE:**
```
"A dropper year for IIT-JEE can be a game-changer! With your
determination, one year of focused preparation can dramatically improve your rank..."
```

**Class 10 + thinking ahead:**
```
"It's great that you're thinking ahead! Classes 9-10 are the perfect time
to build a strong foundation..."
```

**Generic greeting:**
```
"Hello! I'm here to help you find the perfect course. Could you share
a bit about yourself? What class are you in? What subjects interest you most?"
```

## Frontend Integration

File: `ai-advisor.js`
- Calls `http://31.97.237.35:3001/api/ai-advisor`
- Sends userPrompt and systemPrompt
- Receives HTML-formatted response

## Production Deployment Steps

To go live:

1. **Download updated `monitor.js` from GitHub**:
   - Go to: https://github.com/apoorvvvv/bansalclasses_web
   - Copy `monitor.js` file
   - Replace old file on Hostinger

2. **Restart PM2 on Hostinger**:
   ```bash
   pm2 restart bansal-ai-monitor
   ```

3. **Open firewall port (if needed)**:
   ```bash
   ufw allow 3001/tcp
   ```

## Testing

Test various scenarios:
```bash
# Passed 12th + medical
curl -X POST http://localhost:3001/api/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"I passed 12th, like biology, want to be doctor","systemPrompt":"Test"}'

# Class 11 + confused
curl -X POST http://localhost:3001/api/ai-advisor \
  -d '{"userPrompt":"I am in 11th class and confused","systemPrompt":"Test"}'

# Dropper + IIT
curl -X POST http://localhost:3001/api/ai-advisor \
  -d '{"userPrompt":"Dropper wanting to crack IIT","systemPrompt":"Test"}'
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
- `monitor.js` - Conversational AI response generator
- `ai-advisor.js` - Frontend integration (updated with VPS IP)

## Notes

- Context-aware conversational responses
- Natural, encouraging tone
- Handles multiple scenarios intelligently
- File-based queuing for reliability
- Response timeout: 30 seconds
