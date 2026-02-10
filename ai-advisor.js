// Obfuscated AI Advisor Module
(function(){
    'use strict';

    // Encoded configuration
    const _cfg = {
        k: '', // API key removed
        e: 'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMi4wLWZsYXNoOmdlbmVyYXRlQ29udGVudA==', // Base64 encoded endpoint
        m: 'UG9TVA==', // POST method
        h: 'Q29udGVudC1UeXBl' // Content-Type header
    };

    // Decode function
    function _d(str) {
        return atob(str);
    }

    // Main API call function
    async function _callAI(prompt, systemMsg) {
        try {
            if (!_cfg.k) {
                throw new Error('API key missing');
            }
            const apiKey = _d(_cfg.k);
            const endpoint = _d(_cfg.e) + '?key=' + apiKey;

            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                systemInstruction: {
                    parts: [{ text: systemMsg }]
                }
            };

            const response = await fetch(endpoint, {
                method: _d(_cfg.m),
                headers: {
                    [_d(_cfg.h)]: 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('API Error: ' + response.status);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                let text = candidate.content.parts[0].text;
                // Clean markdown
                text = text.replace(/^```html\s*/, '').replace(/\s*```$/, '');
                return text;
            } else {
                throw new Error('No response content');
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







