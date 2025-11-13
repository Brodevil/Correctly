# Smart Form Assistant - Chrome Extension Project

## Overview
This project is a Chrome browser extension that automatically answers Google Forms MCQ questions using AI validation from both ChatGPT (OpenAI) and Gemini (Google) APIs. It supports multimodal questions (text, images, or both) and only marks answers when both AI models agree, ensuring higher accuracy.

## Project Purpose
- Automatically extract MCQ questions from Google Forms (including images)
- Convert images to base64 and send with question text to AI APIs
- Use vision capabilities of both ChatGPT (GPT-4o-mini) and Gemini (1.5 Flash)
- Compare responses and only auto-select when both AIs agree
- Visual highlighting for questions (green for agreement, yellow for disagreement)

## Current State
✅ **Completed MVP Features:**
- Chrome Extension Manifest V3 structure
- Content script for Google Forms integration
- Popup UI with API key management
- Background service worker for API calls
- Dual AI comparison logic
- Visual highlighting system
- Installation guide web page
- Comprehensive README documentation

## Recent Changes (November 13, 2025)
- Created complete Chrome extension with all core files
- Implemented manifest.json with proper permissions for Google Forms and API endpoints
- Built popup UI with API key storage and status indicators
- Created content script to extract and process MCQ questions
- Implemented background service worker for ChatGPT and Gemini API calls
- Added CSS styling for visual feedback on questions
- Created installation guide webpage served via Node.js server
- Added comprehensive README with setup instructions
- Fixed critical issues identified in code review:
  - Added API host permissions for OpenAI and Gemini endpoints
  - Implemented dynamic option handling (2-26 options)
  - Enhanced error propagation from background to popup
  - Added 26-option cap to prevent regex errors with oversized choice sets
- Added automatic onboarding page that opens on first install
  - Prompts for both OpenAI and Gemini API keys immediately
  - Validates key format before saving
  - Provides direct links to get API keys
- Added multimodal support for questions with images
  - Extract images from Google Forms questions
  - Convert images to base64 for API transmission
  - Updated OpenAI handler to use vision API format
  - Updated Gemini handler to use inline_data format
  - Support multiple images per question
  - Both AIs analyze images along with text for accurate answers

## Project Architecture

### Extension Files
1. **manifest.json** - Chrome Extension configuration (Manifest V3)
2. **popup.html/popup.js** - Extension popup interface with API key management
3. **content.js** - Content script running on Google Forms pages
4. **background.js** - Service worker handling API requests to OpenAI and Gemini
5. **styles.css** - Visual styling for question highlighting
6. **generated-icon.png** - Extension icon

### Supporting Files
1. **index.html** - Installation guide webpage
2. **server.js** - Simple Node.js HTTP server for serving the guide
3. **README.md** - Comprehensive documentation

## How It Works

1. User opens Google Form with MCQ questions
2. User clicks extension icon and presses "Start Auto-Answer"
3. Content script extracts all questions and options from the form
4. Each question is sent to both ChatGPT and Gemini APIs simultaneously
5. Background service worker handles API calls and returns responses
6. Content script compares both AI responses
7. If both AIs agree on the same answer (A, B, C, or D):
   - Auto-select that option
   - Highlight question with green border and "Both AIs Agree" badge
8. If AIs disagree:
   - Skip the question (don't select any option)
   - Highlight question with yellow border and "AIs Disagree" badge

## User Workflow

### Installation
1. Download all extension files to local computer
2. Open `chrome://extensions/` in Chrome
3. Enable Developer Mode
4. Click "Load unpacked" and select extension folder
5. Configure API keys in extension popup

### Usage
1. Get OpenAI API key from platform.openai.com
2. Get Gemini API key from Google AI Studio
3. Save both keys in extension popup
4. Navigate to any Google Form
5. Click extension icon and start auto-answer process
6. Review skipped questions (yellow highlights) manually

## Technical Details

### API Models Used
- **OpenAI**: GPT-4o-mini (optimized for speed and cost)
- **Gemini**: Gemini 1.5 Flash (fast, efficient responses)

### Key Technologies
- Chrome Extension Manifest V3
- Chrome Storage API (for API key storage)
- Chrome Tabs/Scripting API (for content script injection)
- OpenAI Chat Completions API
- Google Gemini Generative API

### Security Features
- API keys stored locally in Chrome storage (never transmitted to third parties)
- Extension only runs on Google Forms domains
- Direct API calls to OpenAI and Google (no intermediary servers)

## Installation Guide
The project includes a web-based installation guide served at http://localhost:5000 (or Replit webview URL) with:
- Detailed step-by-step installation instructions
- Feature overview
- Troubleshooting guide
- API cost estimates
- Privacy and security information

## Development Notes
This is a browser extension project, not a traditional web application. The extension files need to be loaded into Chrome as an "unpacked extension" for development/testing. The Node.js server (server.js) only serves the installation guide and is not required for the extension itself to function.

## User Preferences
None documented yet - first session.

## Important Disclaimers
- This tool is for educational purposes only
- Using AI for exams may violate academic integrity policies
- Users should check with their institution before using
- Extension creators are not responsible for policy violations
