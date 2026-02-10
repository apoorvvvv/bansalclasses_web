const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Queue directory for AI responses
const QUEUE_DIR = '/tmp/ai-advisor-queue';
const RESPONSE_DIR = '/tmp/ai-advisor-responses';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize directories
async function initDirs() {
    await fs.mkdir(QUEUE_DIR, { recursive: true });
    await fs.mkdir(RESPONSE_DIR, { recursive: true });
}
initDirs().catch(console.error);

// AI Advisor Endpoint
app.post('/api/ai-advisor', async (req, res) => {
    try {
        const { userPrompt, systemPrompt } = req.body;

        if (!userPrompt) {
            return res.status(400).json({ error: 'userPrompt is required' });
        }

        console.log(`[${new Date().toISOString()}] AI Advisor request:`, userPrompt.substring(0, 100) + '...');

        // Create request file for processing
        const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const requestFile = path.join(QUEUE_DIR, `${requestId}.json`);
        const responseFile = path.join(RESPONSE_DIR, `${requestId}.json`);

        await fs.writeFile(requestFile, JSON.stringify({
            requestId,
            userPrompt,
            systemPrompt,
            timestamp: new Date().toISOString()
        }));

        // Wait for response (poll up to 30 seconds)
        const maxWait = 30000;
        const interval = 500;
        let response = null;

        for (let i = 0; i < maxWait / interval; i++) {
            try {
                const data = await fs.readFile(responseFile, 'utf8');
                response = JSON.parse(data);
                break;
            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }

        // Cleanup
        await fs.unlink(requestFile).catch(() => {});
        await fs.unlink(responseFile).catch(() => {});

        if (response && response.success) {
            res.json({ success: true, response: response.data });
        } else {
            // Fallback response if AI doesn't respond in time
            const fallbackResponse = `<p>Thank you for your interest! Based on your query about "${userPrompt.substring(0, 50)}...", I recommend connecting with our counselors for personalized guidance.</p><p>Please visit our center or call us at +91-91356 99903 for detailed course recommendations.</p>`;
            res.json({ success: true, response: fallbackResponse });
        }

    } catch (error) {
        console.error('AI Advisor error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendation'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Advisor API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
