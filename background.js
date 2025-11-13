chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'askGPT') {
    handleGPTRequest(message.prompt, message.optionCount, message.images).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true;
  } else if (message.action === 'askGemini') {
    handleGeminiRequest(message.prompt, message.optionCount, message.images).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true;
  }
});

async function handleGPTRequest(prompt, optionCount = 4, images = []) {
  try {
    const { openaiKey } = await chrome.storage.local.get(['openaiKey']);
    
    if (!openaiKey) {
      return { error: 'OpenAI API key not found' };
    }
    
    const maxOption = String.fromCharCode(65 + optionCount - 1);
    
    let userContent;
    if (images && images.length > 0) {
      userContent = [
        {
          type: 'text',
          text: prompt
        }
      ];
      
      images.forEach(base64Image => {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: base64Image,
            detail: 'high'
          }
        });
      });
    } else {
      userContent = prompt;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that answers multiple choice questions. Provide only the letter of the correct answer (A to ${maxOption}) without explanation.`
          },
          {
            role: 'user',
            content: userContent
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      return { error: errorMessage };
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('GPT Error:', error);
    return { error: error.message || 'OpenAI request failed' };
  }
}

async function handleGeminiRequest(prompt, optionCount = 4, images = []) {
  try {
    const { geminiKey } = await chrome.storage.local.get(['geminiKey']);
    
    if (!geminiKey) {
      return { error: 'Gemini API key not found' };
    }
    
    const maxOption = String.fromCharCode(65 + optionCount - 1);
    
    const parts = [];
    
    if (images && images.length > 0) {
      images.forEach(base64Image => {
        const base64Data = base64Image.split(',')[1];
        const mimeType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
        
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      });
    }
    
    parts.push({
      text: `You are a helpful assistant that answers multiple choice questions. Provide only the letter of the correct answer (A to ${maxOption}) without explanation.\n\n${prompt}`
    });
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 10
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      return { error: errorMessage };
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
    
  } catch (error) {
    console.error('Gemini Error:', error);
    return { error: error.message || 'Gemini request failed' };
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html')
    });
  }
});

console.log('Smart Form Assistant background service worker loaded');
