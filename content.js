let isProcessing = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startAutoAnswer') {
    processForm();
  }
});

async function processForm() {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    const questions = extractQuestions();
    
    if (questions.length === 0) {
      sendMessageToPopup('error', '❌ No MCQ questions found on this page');
      isProcessing = false;
      return;
    }
    
    let agreedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      sendMessageToPopup('updateProgress', {
        current: i + 1,
        total: questions.length,
        agreed: agreedCount,
        skipped: skippedCount
      });
      
      const result = await processQuestion(question);
      
      if (result.agreed) {
        selectAnswer(question, result.answer);
        highlightQuestion(question.element, 'agreed');
        agreedCount++;
      } else {
        highlightQuestion(question.element, 'disagreed');
        skippedCount++;
      }
      
      await sleep(500);
    }
    
    sendMessageToPopup('completed', 
      `✅ Complete! ${agreedCount} answered, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error('Error processing form:', error);
    sendMessageToPopup('error', '❌ Error: ' + error.message);
  } finally {
    isProcessing = false;
  }
}

function extractQuestions() {
  const questions = [];
  const questionElements = document.querySelectorAll('[role="listitem"]');
  
  questionElements.forEach(element => {
    const questionText = element.querySelector('[role="heading"]')?.textContent?.trim() || '';
    
    const images = [];
    const imageElements = element.querySelectorAll('img');
    imageElements.forEach(img => {
      if (img.src && !img.src.includes('icon') && img.width > 50 && img.height > 50) {
        images.push({
          src: img.src,
          alt: img.alt || ''
        });
      }
    });
    
    if (!questionText && images.length === 0) return;
    
    const options = [];
    const radioGroups = element.querySelectorAll('[role="radio"], [role="checkbox"]');
    
    radioGroups.forEach(radio => {
      const label = radio.closest('[role="radio"], [role="checkbox"]')?.getAttribute('aria-label') || 
                   radio.closest('label')?.textContent?.trim() ||
                   radio.parentElement?.textContent?.trim();
      
      if (label) {
        options.push({
          text: label,
          element: radio
        });
      }
    });
    
    if (options.length > 1) {
      questions.push({
        text: questionText || 'Image-based question',
        images: images,
        options: options,
        element: element
      });
    }
  });
  
  return questions;
}

async function imageToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    console.error('Image URL:', imageUrl);
    return null;
  }
}

async function processQuestion(question) {
  const safeOptionCount = Math.min(question.options.length, 26);
  
  if (question.options.length > 26) {
    console.warn(`Question has ${question.options.length} options, only first 26 (A-Z) will be processed`);
  }
  
  const maxOption = String.fromCharCode(65 + safeOptionCount - 1);
  const prompt = `Question: ${question.text}\n\nOptions:\n${question.options.slice(0, safeOptionCount).map((opt, idx) => 
    `${String.fromCharCode(65 + idx)}. ${opt.text}`).join('\n')}\n\nProvide only the letter of the correct answer (A to ${maxOption}).`;
  
  const imageBase64Array = [];
  if (question.images && question.images.length > 0) {
    for (const img of question.images) {
      const base64 = await imageToBase64(img.src);
      if (base64) {
        imageBase64Array.push(base64);
      }
    }
    console.log(`Question has ${imageBase64Array.length} image(s)`);
  }
  
  try {
    const [gptAnswer, geminiAnswer] = await Promise.all([
      chrome.runtime.sendMessage({ 
        action: 'askGPT', 
        prompt: prompt,
        images: imageBase64Array,
        optionCount: safeOptionCount
      }),
      chrome.runtime.sendMessage({ 
        action: 'askGemini', 
        prompt: prompt,
        images: imageBase64Array,
        optionCount: safeOptionCount
      })
    ]);
    
    if (gptAnswer && typeof gptAnswer === 'object' && gptAnswer.error) {
      sendMessageToPopup('error', `OpenAI Error: ${gptAnswer.error}`);
      return { agreed: false, error: true };
    }
    
    if (geminiAnswer && typeof geminiAnswer === 'object' && geminiAnswer.error) {
      sendMessageToPopup('error', `Gemini Error: ${geminiAnswer.error}`);
      return { agreed: false, error: true };
    }
    
    const gptChoice = extractAnswerLetter(gptAnswer, safeOptionCount);
    const geminiChoice = extractAnswerLetter(geminiAnswer, safeOptionCount);
    
    console.log(`Question: ${question.text.substring(0, 50)}...`);
    console.log(`GPT answer: ${gptChoice}, Gemini answer: ${geminiChoice}`);
    
    if (gptChoice && geminiChoice && gptChoice === geminiChoice) {
      return {
        agreed: true,
        answer: gptChoice
      };
    }
    
    return { agreed: false };
    
  } catch (error) {
    console.error('Error processing question:', error);
    sendMessageToPopup('error', `Processing error: ${error.message}`);
    return { agreed: false, error: true };
  }
}

function extractAnswerLetter(response, optionCount) {
  if (typeof response === 'object' && response && response.error) {
    return null;
  }
  
  const safeOptionCount = Math.min(optionCount, 26);
  const maxLetter = String.fromCharCode(65 + safeOptionCount - 1);
  const pattern = new RegExp(`\\b([A-${maxLetter}])\\b`, 'i');
  const match = (typeof response === 'string' ? response : '').match(pattern);
  return match ? match[1].toUpperCase() : null;
}

function selectAnswer(question, answerLetter) {
  const index = answerLetter.charCodeAt(0) - 65;
  
  if (index >= 0 && index < question.options.length) {
    const optionElement = question.options[index].element;
    
    optionElement.click();
    
    setTimeout(() => {
      if (optionElement.getAttribute('aria-checked') !== 'true') {
        optionElement.click();
      }
    }, 100);
  }
}

function highlightQuestion(element, status) {
  element.classList.add('ai-processed');
  element.classList.add(status === 'agreed' ? 'ai-agreed' : 'ai-disagreed');
}

function sendMessageToPopup(action, data) {
  chrome.runtime.sendMessage({ 
    action: action, 
    ...(typeof data === 'string' ? { message: data } : { data: data })
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('Smart Form Assistant content script loaded');
