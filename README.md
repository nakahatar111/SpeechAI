# SpeechAI Voice Assistant Web Application

## Project Overview

This project is a voice assistant web application that captures voice input from the user, processes the input to generate a response, and delivers that response in both text and spoken audio. The frontend interface allows users to record their voice and receive responses, while the backend service handles voice-to-text translation, interaction with a GPT model to generate responses, and text-to-speech conversion to vocalize the response.

## Technologies Used

- **Frontend**:
  - **React.js**: A JavaScript library for building user interfaces.
  - **HTML/CSS**: For structuring and styling the web application.

- **Backend**:
  - **Node.js**: A JavaScript runtime for building the server-side application.
  - **Express.js**: A web application framework for Node.js.
  - **OpenAI's GPT**: For generating text responses to user input.
  - **OpenAI's Whisper**: For voice-to-text translation.
  - **OpenAI's Text-to-Speech (TTS)**: For converting text responses back into spoken audio.

## How to Use

### Running the Frontend

1. Navigate to the `voice-assistant-frontend` directory:
  ```bash
  cd voice-assistant-frontend
  ```
2. Install the necessary node modules (only needed the first time):
  ```bash
  npm install
  ```
3. Start the frontend application:
  ```bash
  npm start
  ```
  The frontend should now be accessible in your web browser at localhost:3000.

### Running the Backend

1. Navigate to the `voice-assistant-backend` directory:
  ```bash
  cd voice-assistant-backend
  ```
2. Install the necessary node modules (only needed the first time):
  ```bash
  npm install
  ```
3. Start the frontend application:
  ```bash
  node index.js
  ```
   The backend server will start and listen for requests, typically on localhost:3001.

## Interacting with the Voice Assistant

Once both the frontend and backend are running:

 1. Click the microphone button and speak into your microphone.
 2. After speaking, click the microphone button again.
 3. The application will process your speech, generate a response, and display it on the screen.
 4. You will also hear the spoken response through your speakers or headphones.

## Future Work

- Add additional features and enhancements.
- Improve performance of audio processing.
- Enhance UI/UX design.
