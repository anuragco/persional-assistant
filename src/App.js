import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState(null);
  const [shouldListen, setShouldListen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(new window.webkitSpeechRecognition());
  const recognition = recognitionRef.current;

  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setIsListening(true);
    console.log('Jarvis is listening...');
  };

  recognition.onend = () => {
    setIsListening(false);
    if (!shouldListen) {
      recognition.processing = false; // Reset processing flag
      setShouldListen(true);
      startListening();
    }
  };
  
  

  recognition.onresult = (event) => {
    if (!recognition.processing) {
      recognition.processing = true;
      const transcript = event.results[0][0].transcript;
      console.log('You said:', transcript);
  
      if (transcript.toLowerCase() !== 'hello jarvis' && transcript.toLowerCase() !== 'jarvis') {
        setLastSpeechTime(new Date().getTime());
        handleVoiceCommand(transcript);
        setShouldListen(false);
      } else {
        recognition.processing = false;
      }
    }
  };
  
  

  const startListening = () => {
    if (!isListening && !recognition.starting) {
      recognition.start();
      recognition.starting = true;
      console.log('Recognition started...');
    }
  };
  

  const stopListening = () => {
    recognition.stop();
    console.log('Recognition stopped...');
  };

  const handleVoiceCommand = async (command) => {
    console.log('Raw Command:', command);
  
    const currentTime = new Date().getTime();
    if ((lastSpeechTime && currentTime - lastSpeechTime > 5000) || !lastSpeechTime) {
      setLastSpeechTime(currentTime);
  
      if (command.toLowerCase().includes('hello jarvis') || command.toLowerCase().includes('jarvis')) {
        speakResponse('Hello boss, how can I help you today?');
        console.log('Greeting response sent.');
        return;
      } else if (command.toLowerCase().includes('open gmail')) {
        window.open('https://mail.google.com', '_blank');
        console.log('Opening Gmail...');
      } else if (command.toLowerCase().includes('open youtube')) {
        window.open('https://www.youtube.com', '_blank');
        console.log('Opening YouTube...');
      } else if (command.toLowerCase().includes('open google')) {
        window.open('https://www.google.com', '_blank');
        console.log('Opening Google...');
      } else if (command.toLowerCase().includes('open whatsapp')) {
        window.open('https://web.whatsapp.com', '_blank');
        console.log('Opening WhatsApp...');
      } else if (command.toLowerCase().includes('open facebook')) {
        window.open('https://www.facebook.com', '_blank');
        console.log('Opening Facebook...');
      } else if (command.toLowerCase().includes('open instagram')) {
        window.open('https://www.instagram.com', '_blank');
        console.log('Opening Instagram...');
      } else if (command.toLowerCase().includes('open tweeter')) {
        window.open('https://www.x.com', '_blank');
        console.log('Opening Twitter...');
      } else if (command.toLowerCase().includes('play a song on youtube')) {
        const songName = extractSongName(command);
        if (songName) {
          const searchQuery = encodeURIComponent(`${songName} official audio`);
          window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
          console.log(`Searching for ${songName} on YouTube...`);
        } else {
          speakResponse('I am sorry, I did not catch the song name. Can you please repeat it?');
        }
      } else if (command.toLowerCase().includes('search on youtube')) {
        const searchQuery = extractSearchQuery(command);
        if (searchQuery) {
          const encodedQuery = encodeURIComponent(searchQuery);
          window.open(`https://www.youtube.com/results?search_query=${encodedQuery}`, '_blank');
          console.log(`Searching for ${searchQuery} on YouTube...`);
        } else {
          speakResponse('I am sorry, I did not catch the search query. Can you please repeat it?');
        }
      } else {
        const query = command.trim();
        console.log('Sending request to GPT-3 API...' + command);
        try {
          const response = await fetch(`http://localhost:5000/gpt3?prompt=${encodeURIComponent(query)}`);
          const data = await response.json();
  
          if (data.storedResponse) {
            // If a stored response is present, use it
            const reply = data.storedResponse.trim();
            console.log('Stored Response:', reply);
            speakResponse(reply);
            setIsListening(false);
            console.log('Response received and processed.');
          } else if (data && data.choices && data.choices.length > 0) {
            // If no stored response, use the GPT-3 API response
            const reply = data.choices[0].text.trim();
            console.log('GPT-3 Response:', reply);
            speakResponse(reply);
            setIsListening(false);
            console.log('Response received and processed.');
          } else {
            console.error('Invalid or empty response:', data);
          }
        } catch (error) {
          console.error('Error in GPT-3 API request:', error);
        }
      }
  
      console.log('Should listen after processing command:', shouldListen);
  
      if (shouldListen) {
        startListening();
      }
    }
  };
  

  const extractSongName = (command) => {
    const matches = command.match(/play a song on youtube (.+)/i);
    return matches ? matches[1] : null;
  };

  const extractSearchQuery = (command) => {
    const matches = command.match(/search on youtube (.+)/i);
    return matches ? matches[1] : null;
  };

  const speakResponse = (message) => {
    setIsSpeaking(true);
    setShouldListen(false);
    const speechSynthesis = window.speechSynthesis;
    const speechMessage = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(speechMessage);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  useEffect(() => {
    toggleListening();

    return () => {
      stopListening();
    };
  }, []);

  useEffect(() => {
    const onEndHandler = () => {
      setIsSpeaking(false);
      // Restart listening after speech synthesis ends
      if (shouldListen) {
        startListening();
      }
    };
  
    window.speechSynthesis.addEventListener('end', onEndHandler);
  
    return () => {
      window.speechSynthesis.removeEventListener('end', onEndHandler);
    };
  }, [shouldListen]);
  

  return (
    <div className={`glow-circle app-container ${isListening ? 'listening' : ''}`} onClick={toggleListening}>
      <p className="listening-text">{isListening ? 'Listening...' : 'Click the circle to start listening'}</p>
    </div>
  );
};

export default App;
