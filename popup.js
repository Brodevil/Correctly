let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
  await checkApiKeys();
  
  document.getElementById('saveKeysBtn').addEventListener('click', saveApiKeys);
  document.getElementById('startBtn').addEventListener('click', startAutoAnswer);
});

async function checkApiKeys() {
  const result = await chrome.storage.local.get(['openaiKey', 'geminiKey']);
  
  const openaiStatus = document.getElementById('openai-status');
  const geminiStatus = document.getElementById('gemini-status');
  const startBtn = document.getElementById('startBtn');
  
  const hasOpenAI = result.openaiKey && result.openaiKey.length > 0;
  const hasGemini = result.geminiKey && result.geminiKey.length > 0;
  
  openaiStatus.className = hasOpenAI ? 'status-indicator status-ok' : 'status-indicator status-missing';
  geminiStatus.className = hasGemini ? 'status-indicator status-ok' : 'status-indicator status-missing';
  
  startBtn.disabled = !(hasOpenAI && hasGemini) || isProcessing;
  
  if (hasOpenAI && hasGemini) {
    document.getElementById('openaiKey').value = '••••••••';
    document.getElementById('geminiKey').value = '••••••••';
  }
}

async function saveApiKeys() {
  const openaiKey = document.getElementById('openaiKey').value;
  const geminiKey = document.getElementById('geminiKey').value;
  
  if (!openaiKey || !geminiKey || openaiKey === '••••••••' || geminiKey === '••••••••') {
    showStatus('Please enter both API keys', 'error');
    return;
  }
  
  await chrome.storage.local.set({ openaiKey, geminiKey });
  showStatus('✅ API keys saved successfully!', 'success');
  await checkApiKeys();
}

function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.style.display = 'block';
  statusEl.style.background = type === 'error' 
    ? 'rgba(248, 113, 113, 0.3)' 
    : 'rgba(74, 222, 128, 0.3)';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

async function startAutoAnswer() {
  if (isProcessing) return;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('docs.google.com/forms')) {
    showStatus('⚠️ Please open a Google Form first', 'error');
    return;
  }
  
  isProcessing = true;
  document.getElementById('startBtn').disabled = true;
  document.getElementById('startBtn').textContent = '⏳ Processing...';
  document.getElementById('progressSection').style.display = 'block';
  
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'startAutoAnswer' });
  } catch (error) {
    console.error('Error:', error);
    showStatus('❌ Error: ' + error.message, 'error');
    resetUI();
  }
}

function resetUI() {
  isProcessing = false;
  document.getElementById('startBtn').disabled = false;
  document.getElementById('startBtn').textContent = '▶ Start Auto-Answer';
  document.getElementById('progressSection').style.display = 'none';
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateProgress') {
    updateProgress(message.data);
  } else if (message.action === 'completed') {
    showStatus(message.message, 'success');
    setTimeout(resetUI, 2000);
  } else if (message.action === 'error') {
    showStatus(message.message, 'error');
    resetUI();
  }
});

function updateProgress(data) {
  const { current, total, agreed, skipped } = data;
  const percentage = (current / total) * 100;
  
  document.getElementById('progressFill').style.width = percentage + '%';
  document.getElementById('progressText').textContent = `Processing ${current} of ${total} questions...`;
  document.getElementById('agreedCount').textContent = agreed;
  document.getElementById('skippedCount').textContent = skipped;
  document.getElementById('totalCount').textContent = total;
}
