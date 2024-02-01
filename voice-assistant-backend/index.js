const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use('/static', express.static('static'));


const upload = multer({ storage: multer.memoryStorage() });

const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to process speech to text using OpenAI Whisper
async function processSpeechToText(audioBuffer) {
    try {
      // Write the buffer to a temporary file
      const tempFilePath = 'temp_audio.mp3';
      fs.writeFileSync(tempFilePath, audioBuffer);
  
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
      });
  
      // Delete the temporary file after processing
      fs.unlinkSync(tempFilePath);
      return transcription.text;

    } catch (error) {
      console.error('Error in STT processing:', error);
      throw error;
    }
  }

// Function to generate text using GPT 3.5
async function generateTextFromGPT(inputText) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: inputText
          }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.log(response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in GPT processing:', error);
      throw error;
    }
  }
  
// Function to generate speech from text using OpenAI
async function generateSpeechFromText(inputText) {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: inputText,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const speechFilePath = 'static/audios/response_audio.mp3';
    await fs.promises.writeFile(speechFilePath, buffer);

    return speechFilePath;
  } catch (error) {
    console.error('Error in TTS processing:', error);
    throw error;
  }
}


// Route to process audio and generate a response
app.post('/process-audio', upload.single('audio'), async (req, res) => {
  try {
    const audioData = req.file.buffer;
    const transcribedText = await processSpeechToText(audioData);
    const gptResponse = await generateTextFromGPT(transcribedText);
    const speechFilePath = await generateSpeechFromText(gptResponse);
    console.log(transcribedText);
    console.log(gptResponse);
    console.log(speechFilePath);
    res.json({
      UserRequest: transcribedText,
      GPTResponse: gptResponse,
      SpeechResponse: speechFilePath
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ message: 'Error processing audio' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
