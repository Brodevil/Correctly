document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('setupForm');
  const saveBtn = document.getElementById('saveBtn');
  const skipBtn = document.getElementById('skipBtn');
  const messageEl = document.getElementById('message');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const openaiKey = document.getElementById('openaiKey').value.trim();
    const geminiKey = document.getElementById('geminiKey').value.trim();
    
    if (!openaiKey || !geminiKey) {
      showMessage('Please enter both API keys', 'error');
      return;
    }
    
    if (!openaiKey.startsWith('sk-')) {
      showMessage('OpenAI API key should start with "sk-"', 'error');
      return;
    }
    
    if (!geminiKey.startsWith('AIza')) {
      showMessage('Gemini API key should start with "AIza"', 'error');
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';
    
    try {
      await chrome.storage.local.set({ openaiKey, geminiKey });
      
      showMessage('✅ API keys saved successfully! You can now use the extension.', 'success');
      
      setTimeout(() => {
        window.close();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving keys:', error);
      showMessage('❌ Error saving keys. Please try again.', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Keys & Continue';
    }
  });
  
  skipBtn.addEventListener('click', () => {
    if (confirm('You can add your API keys later by clicking the extension icon. Continue without saving?')) {
      window.close();
    }
  });
});

function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
  
  if (type === 'error') {
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
}
