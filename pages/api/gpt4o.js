require('dotenv').config();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    // CORS 헤더 추가
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Connection', 'keep-alive');

    const apiKey = process.env.OPENAI_KEY;
    const endpoint = "https://gpt-4o-ptu-m.openai.azure.com/openai/deployments/gpt-4o-2/chat/completions?api-version=2024-08-01-preview";

    console.log(req.body.agent);
    const promptUrl = `${req.headers.origin}/${req.body.agent}-prompt.txt`;

    try {
        const promptResponse = await fetch(promptUrl);
        if (!promptResponse.ok) {
            throw new Error(`Failed to fetch prompt: ${promptResponse.statusText}`);
        }
        
        const artiPrompt = await promptResponse.text();

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: artiPrompt },
                    { role: "user", content: req.body.userMessage },
                ],
                max_tokens: 1000,
                stream: true,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({ error });
        }

        // response를 직접 파이프
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        // 응답 스트림 처리를 위한 함수
        async function processStream() {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        res.end();
                        break;
                    }
                    buffer += decoder.decode(value);
                    const lines = buffer.split("\n");
                    buffer = lines.pop(); // 마지막 줄은 불완전할 수 있으므로 남겨둠
                    
                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        if (line.includes('[DONE]')) {
                            res.end();
                            return;
                        }

                        if (line.startsWith('data: ')) {
                            const jsonString = line.replace('data: ', '').trim();
                            try {
                                const parsed = JSON.parse(jsonString);
                                const content = parsed.choices[0]?.delta?.content || '';
                                if (content) {
                                    // 직접 데이터 스트리밍
                                    res.write(`data: ${content}\n\n`);
                                }
                            } catch (error) {
                                console.error('Failed to parse JSON:', error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Stream processing error:', error);
                res.end();
            }
        }

        await processStream();
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}