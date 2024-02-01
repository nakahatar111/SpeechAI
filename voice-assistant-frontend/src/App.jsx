import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [request, setRequest] = useState('');
  const [response, setResponse] = useState('');
  const [speechResponse, setSpeechResponse] = useState('');
  

  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("Your browser doesn't support media recording.");
      return;
    }
    setRequest('');
    setResponse('');
    setSpeechResponse('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      console.log('Recording started');
    };

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioBlob = event.data;
        const formData = new FormData();
        formData.append('audio', audioBlob);
    
        fetch('http://localhost:3001/process-audio', {
          method: 'POST',
          body: formData,
        })
        .then(response => response.json())
        .then(data => {
          setRequest(data.UserRequest);
          setResponse(data.GPTResponse);
          setSpeechResponse(`http://localhost:3001/${data.SpeechResponse}`);
        })
        .catch(error => {
          console.error('Error sending audio data:', error);
        });
      }
    };
    

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Also stop the user media stream to turn off the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
  };

  const handleRecordClick = () => {
    console.log('clicked')
    setIsRecording(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };
  
  const AudioPlayer = ({ src }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef(new Audio());
    
    useEffect(() => {
      audioRef.current = new Audio();
  
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.load();
        }
      };
    }, []);

  // Play audio when src is set
  useEffect(() => {
    if (src) {
      audioRef.current.src = src;
      const playAudio = async () => {
        try {
          await audioRef.current.play();
        } catch (e) {
          console.error('Error playing audio:', e);
        }
      };
      playAudio();
    }
  }, [src]);
  
    // Mute or unmute the audio when isMuted changes
    useEffect(() => {
      audioRef.current.muted = isMuted;
    }, [isMuted]);
  
    // Adjust the volume when volume state changes
    useEffect(() => {
      audioRef.current.volume = volume;
    }, [volume]);
  
    // Clean up the audio when component unmounts
    useEffect(() => {
      const audioCurrent = audioRef.current;
      return () => {
        audioCurrent.pause();
        audioCurrent.removeAttribute('src');
        audioCurrent.load();
      };
    }, []);

    const restartAudio = () => {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.error('Error playing audio:', e));
    
    };
  
    return (
      <div>
        {/* Play/Pause Button */}
        <img
          src='/Replay.png'
          onClick={restartAudio}
          alt='Replay'
          style={{ cursor: 'pointer', maxHeight:'30px'}}
        />
  
        {/* Volume Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
        
        {/* Mute/Unmute Button */}
        <img
          src='/Mute.webp'
          onClick={() => setIsMuted(!isMuted)}
          alt='mute'
          style={{ cursor: 'pointer', maxHeight:'30px' }}
        />
      </div>
    );
  };
  
  

  return (
    <div className="App" >
      <header className="App-header">
        <img
          src={isRecording ? '/Microphone.png' : '/Microphone.png'}
          onClick={handleRecordClick}
          alt={isRecording ? 'Stop Recording' : 'Start Recording'}
          style={{ cursor: 'pointer', maxHeight:'80px' }}
        />
        
        {request && (<p><b>User: </b>{request}</p>)}
        <div style={{width:'80%', height:'50%', marginTop:'10%',paddingLeft:'10px', background:'#dadada'}}>
        
          {response ? (<p><b>GPT Response:</b> {response}</p>) : (<p>Ask me anything!</p>)}
          
          {speechResponse && (
            <AudioPlayer src={speechResponse} />
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
