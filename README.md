# 🤖 Smart Form Assistant

An AI-powered Chrome extension that automatically answers Google Forms MCQ questions by cross-referencing responses from both ChatGPT and Gemini APIs.

## ✨ Features

- **Dual AI Validation**: Uses both OpenAI's GPT-4o-mini and Google's Gemini 1.5 Flash
- **Smart Answer Selection**: Only marks answers when both AI models agree
- **Multimodal Support**: Handles questions with text, images, graphs, or both
- **Visual Feedback**: Color-coded highlighting (green for agreed, yellow for disagreed)
- **Safe & Secure**: API keys stored locally in browser storage
- **Progress Tracking**: Real-time progress display with statistics

## 📋 Prerequisites

Before using this extension, you need:

1. **OpenAI API Key** - Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Chrome Browser** or any Chromium-based browser (Edge, Brave, etc.)

## 🚀 Installation

### Step 1: Download Extension Files

Download or clone this repository to your local computer. You need all these files:
- `manifest.json`
- `popup.html`
- `popup.js`
- `content.js`
- `background.js`
- `styles.css`
- `generated-icon.png`

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the folder containing all the extension files
5. The extension will now appear in your extensions list

### Step 3: Configure API Keys

When you first install the extension, a setup page will automatically open asking for your API keys.

1. Enter your OpenAI API key (starts with "sk-")
2. Enter your Gemini API key (starts with "AIza")
3. Click **"Save Keys & Continue"**

You can also configure keys later by clicking the extension icon in your Chrome toolbar.

## 📖 How to Use

1. **Open a Google Form** with multiple choice questions
2. **Click the extension icon** in your Chrome toolbar
3. **Click "Start Auto-Answer"** button
4. The extension will:
   - Extract all MCQ questions
   - Send each to both ChatGPT and Gemini
   - Auto-select answers where both AIs agree
   - Skip questions where AIs disagree

### Visual Indicators

- **🟢 Green border + "Both AIs Agree"** - Answer selected automatically
- **🟡 Yellow border + "AIs Disagree - Skipped"** - Needs manual review

## ⚠️ Important Notice

This extension is for **educational purposes only**. Using AI to complete exams may violate academic integrity policies. Use responsibly and in accordance with your institution's guidelines.

## 🔧 Technical Details

### AI Models

- **OpenAI**: GPT-4o-mini (optimized for speed and cost-efficiency)
- **Google**: Gemini 1.5 Flash (fast, efficient responses)

### How It Works

1. Content script scans Google Form for MCQ questions and extracts text and images
2. Images are converted to base64 and sent along with question text
3. Questions (with text and/or images) are sent to both AI APIs simultaneously
4. Both GPT-4o-mini and Gemini 1.5 Flash analyze the multimodal content
5. Responses are normalized to extract answer letters (A, B, C, D, etc.)
6. If both APIs return the same letter, that option is auto-selected
7. If APIs disagree, the question is highlighted but skipped

### Architecture

- **manifest.json**: Chrome Extension configuration (Manifest V3)
- **popup.html/js**: Extension popup UI with API key management
- **content.js**: Content script that runs on Google Forms pages
- **background.js**: Service worker handling API requests
- **styles.css**: Visual styling for question highlighting

## 🔧 Troubleshooting

### Extension Not Working?

- Ensure you're on a Google Forms page (`docs.google.com/forms/*`)
- Check that both API keys are saved and showing green status
- Open browser console (F12) to view error messages
- Try reloading the extension from `chrome://extensions/`

### API Errors?

- Verify API keys are valid and have available credits
- Check OpenAI billing: [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
- Verify Gemini API key status: [aistudio.google.com](https://aistudio.google.com)

### Questions Not Being Answered?

- Some forms may use different HTML structures - extension works best with standard Google Forms
- Check console logs for any errors during question extraction
- Ensure questions are actual MCQs (radio buttons or checkboxes)

### Known Limitations

- **Maximum 26 Options**: Questions with more than 26 answer choices (A-Z) will only process the first 26 options
- **Image Detection**: Images smaller than 50x50 pixels or containing "icon" in their URL are filtered out
- **Image Size**: Very large images may increase API costs and processing time
- The extension works best with standard Google Forms; custom forms may have compatibility issues

## 💰 API Costs

Both APIs charge per request:
- **OpenAI GPT-4o-mini**: ~$0.00015 per question
- **Gemini 1.5 Flash**: Free tier available, then ~$0.000075 per question

Typical 50-question form costs: **~$0.01** total

## 🛡️ Privacy & Security

- API keys are stored locally in Chrome's storage (never sent to third parties)
- No data is collected or stored by the extension
- All API calls go directly to OpenAI and Google servers
- Extension only runs on Google Forms pages

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your own learning purposes.

## ⚖️ Disclaimer

The creators of this extension are not responsible for any violations of academic integrity policies or terms of service. Use this tool ethically and responsibly. Always check with your instructor or institution before using AI assistance on assessments.
