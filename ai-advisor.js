// AI Advisor Module - Local OpenClaw Integration
(function(){
    'use strict';

    const API_BASE_URL = 'http://31.97.237.35:3001';

    // Main API call function
    async function _callAI(prompt, systemMsg) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai-advisor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userPrompt: prompt,
                    systemPrompt: systemMsg
                })
            });

            if (!response.ok) {
                throw new Error('API Error: ' + response.status);
            }

            const result = await response.json();

            if (result.success && result.response) {
                // Response is already formatted as HTML from the server
                return result.response;
            } else {
                throw new Error(result.error || 'No response content');
            }
        } catch (error) {
            console.error('AI Advisor Error:', error);
            throw error;
        }
    }

    // Expose to global scope
    window.AIAdvisor = {
        generateRecommendation: _callAI
    };

})();
