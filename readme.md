# Class Recording Summarizer

## Introduction
This project is a summarizer for audio recordings. The idea is meant to be used for lectures, meetings, or any other audio recording that you would like to summarize. The summarizer will take an audio file as input and output a summary of the audio file. The summarizer will use speech-to-text to convert the audio file to text and then use a summarization algorithm to summarize the text. The summarizer will output the summary and generate questions for the student to practice. The summarizer will also have a feature to generate a quiz for the student to take. The quiz will be generated based on the summary and will test the student's understanding of the material.

## Features
- Summarize audio recordings
- Generate questions for the student to practice

## Technologies
- Cloudflare Workers
- Cloudflare Pages
- Cloudflare AI speech-to-text
- Cloudflare AI summarization

## How to deploy
1. Clone the repository
2. Deploy the FE or BE is up to you

### Deploying the Cloudflare Workers AI Backend
```bash
cd cf-meeting-summarizer
npm install
npm run deploy
```
After deploying the BACKEND, make sure to configure `FE_URL` env in settings, match the Pages URL to prevent CORS

### Deploying the Cloudflare Pages Frontend
1. Create a new Cloudflare Pages project
2. Open the `cf-meeting-summarizer-fe` folder
3. Edit `WORKER_URL` in index.html to the URL of the deployed Cloudflare Workers AI Backend
4. Upload the `cf-meeting-summarizer-fe` folder to the Cloudflare Pages project
