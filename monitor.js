const fs = require('fs').promises;
const path = require('path');

const QUEUE_DIR = '/tmp/ai-advisor-queue';
const RESPONSE_DIR = '/tmp/ai-advisor-responses';

async function processRequest(requestFile) {
    try {
        const content = await fs.readFile(requestFile, 'utf8');
        const { requestId, userPrompt, systemPrompt } = JSON.parse(content);

        console.log(`[${new Date().toISOString()}] Processing request:`, requestId);

        // Generate conversational AI response
        const aiResponse = generateConversationalResponse(userPrompt);

        // Write response
        const responseFile = path.join(RESPONSE_DIR, `${requestId}.json`);
        await fs.writeFile(responseFile, JSON.stringify({
            success: true,
            data: aiResponse,
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

function generateConversationalResponse(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    let html = '';

    // Analyze student context
    const hasPassed12 = prompt.includes('passed') && (prompt.includes('12') || prompt.includes('12th') || prompt.includes('twelfth'));
    const isDropper = prompt.includes('dropper');
    const likesBiology = prompt.includes('biology') || prompt.includes('bio') || prompt.includes('life science');
    const likesMath = prompt.includes('math') || prompt.includes('physics') || prompt.includes('chemistry') || prompt.includes('calculation');
    const wantsMedical = prompt.includes('doctor') || prompt.includes('medical') || prompt.includes('neet') || prompt.includes('mbbs') || prompt.includes('medicine');
    const wantsEngineering = prompt.includes('engineer') || prompt.includes('engineering') || prompt.includes('jee') || prompt.includes('iit') || prompt.includes('tech');
    const isClass9_10 = prompt.includes('class 9') || prompt.includes('class 10') || prompt.includes('9th') || prompt.includes('10th');
    const isClass11_12 = prompt.includes('class 11') || prompt.includes('class 12') || prompt.includes('11th') || prompt.includes('12th');

    // Generate contextual, conversational response
    if (hasPassed12) {
        if (likesBiology || wantsMedical) {
            html = `<p>Great choice! Since you've passed 12th with a strong foundation in biology, our <strong>NEET Course</strong> is perfect for you.</p><p>With your background, you'll benefit from:</p><p><strong>•</strong> Focused biology preparation with detailed diagram explanations<br><strong>•</strong> Physics and chemistry coaching specifically for medical entrance<br><strong>•</strong> Regular mock tests simulating NEET pattern<br><strong>•</strong> Personalized doubt-clearing sessions</p><p>Many students with your profile excel in NEET. Let's work together to get you into a top medical college!</p>`;
        } else if (likesMath || wantsEngineering) {
            html = `<p>Excellent! Since you've passed 12th and have a strong math/physics background, our <strong>IIT-JEE Course</strong> is ideal.</p><p>You'll get comprehensive preparation including:</p><p><strong>•</strong> In-depth math, physics, chemistry for JEE Main & Advanced<br><strong>•</strong> Problem-solving strategies and shortcuts<br><strong>•</strong> Previous year question analysis<br><strong>•</strong> Regular mock tests with performance tracking</p><p>Your foundation is solid. With our focused coaching, IIT-JEE success is within reach!</p>`;
        } else {
            html = `<p>Since you've passed 12th, congratulations on reaching this milestone! Now, let's focus on your goals.</p><p>Could you tell me more about what interests you most - <strong>biology/medical</strong> or <strong>math/engineering</strong>? This will help me recommend the perfect course for you.</p>`;
        }
    } else if (isDropper) {
        if (wantsMedical) {
            html = `<p>Being a dropper shows your dedication! A gap year to focus on <strong>NEET</strong> preparation can significantly improve your rank.</p><p>Our dropper program offers:</p><p><strong>•</strong> Intensive revision of complete syllabus<br><strong>•</strong> Special doubt-clearing for weak areas<br><strong>•</strong> Daily practice tests with detailed analysis<br><strong>•</strong> Strategic exam-taking guidance</p><p>Many of our top rankers were droppers. Your hard work will pay off!</p>`;
        } else if (wantsEngineering) {
            html = `<p>A dropper year for <strong>IIT-JEE</strong> can be a game-changer! With your determination, one year of focused preparation can dramatically improve your rank.</p><p>You'll have access to:</p><p><strong>•</strong> Complete syllabus revision with advanced concepts<br><strong>•</strong> Rigorous problem-solving practice<br><strong>•</strong> Test series with nationwide ranking<br><strong>•</strong> Mentorship from IITians</p><p>Let's make this year count!</p>`;
        } else {
            html = `<p>Welcome, dropper! Taking a year to focus on your goals shows commitment and maturity.</p><p>To recommend the best path, I need to understand: do you want to prepare for <strong>medical (NEET)</strong> or <strong>engineering (JEE)</strong>?</p>`;
        }
    } else if (isClass9_10) {
        html = `<p>It's great that you're thinking ahead! Classes 9-10 are the perfect time to build a strong foundation for future competitive exams.</p><p>Our <strong>Foundation Course</strong> will help you:</p><p><strong>•</strong> Master concepts in physics, chemistry, biology, and mathematics<br><strong>•</strong> Develop problem-solving skills from an early age<br><strong>•</strong> Prepare systematically for JEE/NEET syllabus<br><strong>•</strong> Build exam temperament with regular tests</p><p>This foundation will give you a significant advantage when you reach classes 11-12!</p>`;
    } else if (isClass11_12) {
        if (wantsMedical) {
            html = `<p>I see you're in class 11-12 and interested in medical! That's a great path with excellent career prospects.</p><p>Our <strong>NEET Course</strong> for class 11-12 students covers:</p><p><strong>•</strong> Biology with detailed NCERT-based teaching<br><strong>•</strong> Physics and chemistry tailored for medical entrance<br><strong>•</strong> 2-year integrated preparation plan<br><strong>•</strong> Regular NEET mock tests with analysis</p><p>Starting early in class 11 gives you an edge. Ready to begin this journey?</p>`;
        } else if (wantsEngineering) {
            html = `<p>Class 11-12 with engineering aspirations - excellent! IIT-JEE requires systematic preparation starting now.</p><p>Our <strong>IIT-JEE Course</strong> provides:</p><p><strong>•</strong> Step-by-step concept building in math, physics, chemistry<br><strong>•</strong> JEE Main + Advanced parallel preparation<br><strong>•</strong> Problem-solving workshops developing your analytical skills<br><strong>•</strong> Performance tracking with actionable feedback</p><p>The foundation you build now will determine your success. Let's work together!</p>`;
        } else if (likesBiology) {
            html = `<p>I notice you're in class 11-12 with biology interest. Have you considered the medical field through <strong>NEET</strong>?</p><p>With biology as your strong point, NEET could be an excellent fit. Our program focuses on:</p><p><strong>•</strong> In-depth biology preparation<br><strong>•</strong> Physics and chemistry specifically for medical<br><strong>•</strong> Medical entrance test strategies</p><p>Would you like more details about our NEET course?</p>`;
        } else if (likesMath) {
            html = `<p>I see you're in class 11-12 with strong interest in math/physics. <strong>IIT-JEE</strong> might be your calling!</p><p>Our engineering program features:</p><p><strong>•</strong> Advanced math and physics training<br><strong>•</strong> Chemistry problem-solving techniques<br><strong>•</strong> JEE Main & Advanced comprehensive coverage</p><p>Shall I tell you more about our IIT-JEE course structure?</p>`;
        } else {
            html = `<p>Hello! I see you're in class 11-12. This is a crucial time for your career preparation.</p><p>To guide you better, could you share: Are you more inclined toward <strong>medical (biology)</strong> or <strong>engineering (math/physics)</strong>?</p><p>Both fields have excellent opportunities at Bansal Classes, and I'd love to help you choose the right path!</p>`;
        }
    } else if (wantsMedical) {
        html = `<p>A medical career is truly rewarding! To achieve your MBBS dream, focused NEET preparation is essential.</p><p>Our <strong>NEET Course</strong> offers everything you need:</p><p><strong>•</strong> Complete biology, physics, chemistry coverage<br><strong>•</strong> NEET-specific test series and mock exams<br><strong>•</strong> Expert faculty guidance<br><strong>•</strong> Study material updated with latest pattern</p><p>What's your current academic level? I can guide you more specifically!</p>`;
    } else if (wantsEngineering) {
        html = `<p>Engineering opens doors to countless opportunities! IIT-JEE preparation requires dedication and smart work.</p><p>Our <strong>IIT-JEE Course</strong> includes:</p><p><strong>•</strong> Rigorous math, physics, chemistry training<br><strong>•</strong> JEE Main + Advanced test series<br><strong>•</strong> Problem-solving methodology<br><strong>•</strong> Past year question analysis</p><p>Which class are you currently in? This will help me recommend the right batch.</p>`;
    } else {
        html = `<p>Hello! I'm here to help you find the perfect course at Bansal Classes.</p><p>Could you share a bit about yourself? For example:</p><p><strong>•</strong> What class are you in? (9, 10, 11, 12, or dropper)<br><strong>•</strong> What subjects interest you most?<br><strong>•</strong> What career goal do you have? (medical, engineering, etc.)</p><p>Once I understand your background, I can give you a personalized recommendation!</p>`;
    }

    return html;
}

async function monitor() {
    console.log('AI Advisor Monitor started (conversational responses)...');

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
