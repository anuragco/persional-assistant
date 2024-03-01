// App.js
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css'; // Make sure to import your CSS file

const App = () => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceCommand = (command) => {
    if (command.includes('open Gmail')) {
      window.open('https://mail.google.com', '_blank');
    } else if (command.includes('open camera')) {
      console.log('Opening camera...');
    } else if (command.includes('open file explorer')) {
      console.log('Opening file explorer...');
    } else if (command.includes('open YouTube')) {
      console.log('Opening YouTube...');
    } else if (command.includes('search Google')) {
      const query = command.replace('search Google for', '').trim();
      // Make a request to the server's GPT-3 endpoint
      fetch(`http://localhost:5000/gpt3?prompt=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
          const reply = data.choices[0].text.trim();
          console.log('Jarvis:', reply);
          handleVoiceCommand(reply);
        })
        .catch(error => console.error(error));
    } else {
      console.log('Sorry, I did not understand that command.');
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      SpeechRecognition.startListening();
      console.log('Jarvis is listening...');
    } else {
      SpeechRecognition.stopListening();
      console.log('Jarvis stopped listening.');
    }
  };

  const { transcript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      console.log('You said:', transcript);
      // Make a request to the server's GPT-3 endpoint
      fetch(`http://localhost:5000/gpt3?prompt=${encodeURIComponent(transcript)}`)
        .then(response => response.json())
        .then(data => {
          const reply = data.choices[0].text.trim();
          console.log('Jarvis:', reply);
          handleVoiceCommand(reply);
        })
        .catch(error => console.error(error));
    }
  }, [transcript]);

  // Start listening when the component mounts
  useEffect(() => {
    toggleListening();
  }, []);

  return (
    <div className={`glow-circle app-container ${isListening ? 'listening' : ''}`} onClick={toggleListening}>
      <p className="listening-text">{isListening ? 'Listening...' : 'Click the circle to start listening'}</p>
    </div>
  );
};

export default App;
