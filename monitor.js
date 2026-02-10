const fs = require('fs').promises;
const path = require('path');

const QUEUE_DIR = '/tmp/ai-advisor-queue';
const RESPONSE_DIR = '/tmp/ai-advisor-responses';
const SUBAGENT_SESSION = 'agent:main:subagent:40d28d91-413a-480b-af97-38178ed1c763';

// Use child_process to run openclaw CLI
const { exec } = require('child_process');

async function processRequest(requestFile) {
    try {
        const content = await fs.readFile(requestFile, 'utf8');
        const { requestId, userPrompt, systemPrompt } = JSON.parse(content);

        console.log(`[${new Date().toISOString()}] Processing request:`, requestId);

        // Send to sub-agent via openclaw CLI
        const prompt = `[SYSTEM INSTRUCTION: ${systemPrompt}\n\nUSER QUERY: ${userPrompt}]`;

        // Note: This is a workaround - in production, use actual OpenClaw API
        // For now, generate a response directly
        const response = generateDirectResponse(userPrompt, systemPrompt);

        // Write response
        const responseFile = path.join(RESPONSE_DIR, `${requestId}.json`);
        await fs.writeFile(responseFile, JSON.stringify({
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        }));

        console.log(`[${new Date().toISOString()}] Response written for:`, requestId);

    } catch (error) {
        console.error('Error processing request:', error);
        // Write error response
        try {
            const requestId = path.basename(requestFile, '.json');
            const responseFile = path.join(RESPONSE_DIR, `${requestId}.json`);
            await fs.writeFile(responseFile, JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {}
    }
}

function generateDirectResponse(userPrompt, systemPrompt) {
    const lowerPrompt = userPrompt.toLowerCase();

    let course = '';
    let reason = '';
    let features = [];

    // Check for class level first
    const isClass9_10 = lowerPrompt.includes('class 9') || lowerPrompt.includes('class 10') ||
                        lowerPrompt.includes('9th') || lowerPrompt.includes('10th');
    const isClass11_12 = lowerPrompt.includes('class 11') || lowerPrompt.includes('class 12') ||
                        lowerPrompt.includes('11th') || lowerPrompt.includes('12th') ||
                        lowerPrompt.includes('dropper');
    const wantsMedical = lowerPrompt.includes('doctor') || lowerPrompt.includes('medical') ||
                        lowerPrompt.includes('neet') || lowerPrompt.includes('mbbs') ||
                        lowerPrompt.includes('biology') || lowerPrompt.includes('medicine');
    const wantsEngineering = lowerPrompt.includes('engineer') || lowerPrompt.includes('iit') ||
                          lowerPrompt.includes('jee') || lowerPrompt.includes('tech') ||
                          lowerPrompt.includes('physics') || lowerPrompt.includes('math') ||
                          lowerPrompt.includes('chemistry');

    // Rule-based matching
    if (isClass9_10) {
        course = 'Foundation Course';
        reason = 'Since you are in class 9 or 10, this program builds your conceptual base in science subjects.';
        features = [
            'Strong foundation in Physics, Chemistry, Biology & Mathematics',
            'Prepares you for future competitive exams like JEE/NEET',
            'Regular practice tests and doubt-clearing sessions',
            'Experienced faculty focused on concept clarity'
        ];
    } else if (isClass11_12) {
        // Class 11-12 or dropper - determine based on interest
        if (wantsMedical) {
            course = 'NEET Course';
            reason = 'With your class 11-12 background and medical interests, focused NEET preparation is ideal.';
            features = [
                'Comprehensive Biology, Physics, Chemistry coverage',
                'NEET-specific test series and mock exams',
                'Regular doubt-clearing with subject experts',
                'Study material aligned with latest NEET pattern'
            ];
        } else if (wantsEngineering) {
            course = 'IIT-JEE Course';
            reason = 'With your class 11-12 background and engineering interests, rigorous JEE preparation is recommended.';
            features = [
                'In-depth coverage of Physics, Chemistry, Mathematics',
                'JEE Main + Advanced test series',
                'Problem-solving workshops and strategic guidance',
                'Past year question analysis and pattern discussion'
            ];
        } else {
            // Class 11-12 but unclear goal - recommend both or ask to contact
            course = 'Foundation Course (Advanced)';
            reason = 'Since you are in class 11-12, we recommend connecting with our counselors for personalized guidance on whether to pursue JEE or NEET based on your strengths.';
            features = [
                'Comprehensive science curriculum',
                'Competitive exam readiness',
                'Personal attention and mentorship',
                'Regular performance tracking'
            ];
        }
    } else if (wantsMedical) {
        course = 'NEET Course';
        reason = 'Your medical aspirations require focused preparation for NEET entrance exam.';
        features = [
            'Comprehensive Biology, Physics, Chemistry coverage',
            'NEET-specific test series and mock exams',
            'Regular doubt-clearing with subject experts',
            'Study material aligned with latest NEET pattern'
        ];
    } else if (wantsEngineering) {
        course = 'IIT-JEE Course';
        reason = 'Engineering dreams need rigorous preparation for JEE Main and Advanced.';
        features = [
            'In-depth coverage of Physics, Chemistry, Mathematics',
            'JEE Main + Advanced test series',
            'Problem-solving workshops and strategic guidance',
            'Past year question analysis and pattern discussion'
        ];
    } else {
        // Default recommendation
        course = 'Foundation Course';
        reason = 'Based on your interest, we recommend starting with our Foundation program to build strong fundamentals.';
        features = [
            'Comprehensive science curriculum',
            'Competitive exam readiness',
            'Personal attention and mentorship',
            'Regular performance tracking'
        ];
    }

    // Build HTML response
    let html = `<p>Based on your query, I recommend the <strong>${course}</strong>. ${reason}</p>`;
    html += '<p>Our program offers:</p><p>';
    features.forEach(f => {
        html += `<strong>•</strong> ${f}<br>`;
    });
    html += '</p>';
    html += '<p>Visit our center or call +91-91356 99903 for detailed information and enrollment!</p>';

    return html;
}

async function monitor() {
    console.log('AI Advisor Monitor started...');

    // Ensure directories exist
    await fs.mkdir(QUEUE_DIR, { recursive: true }).catch(() => {});
    await fs.mkdir(RESPONSE_DIR, { recursive: true }).catch(() => {});

    while (true) {
        try {
            const files = await fs.readdir(QUEUE_DIR);
            const requests = files.filter(f => f.endsWith('.json'));

            for (const file of requests) {
                const requestFile = path.join(QUEUE_DIR, file);
                await processRequest(requestFile);
                // Delete after processing
                await fs.unlink(requestFile).catch(() => {});
            }

            if (requests.length === 0) {
                // No requests, wait a bit
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Monitor error:', error);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

monitor();
