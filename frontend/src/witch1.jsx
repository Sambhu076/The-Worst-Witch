// witch1.jsx
import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Header from "./Header"; // Assuming Header component is generic

// A simple icon for listening status
const MicrophoneIcon = ({ style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
  </svg>
);


export default function Witch1() {
  // State for core interaction flow
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Getting ready...');
  const [currentAudio, setCurrentAudio] = useState(null);
  
  // State to manage which question is being asked
  const [currentQuestionId, setCurrentQuestionId] = useState('Q1');

  // This is the question text for the current page (Q1)
  const QUESTION_TEXT = "Who is the main character introduced in this chapter?";

  // --- Speech Recognition & Synthesis Setup ---
  const { transcript, finalTranscript, listening, resetTranscript } = useSpeechRecognition();
  const speechTimeoutRef = useRef(null);
  const transcriptRef = useRef('');

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = async (text, onEndCallback = () => {}) => {
    if (!text) {
      onEndCallback();
      return;
    }
    stopSpeaking();
    SpeechRecognition.stopListening();
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

    setIsSpeaking(true);
    try {
      const response = await fetch('http://localhost:8000/api/google-tts/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Backend TTS error');
      const audioBlob = await response.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      setCurrentAudio(audio);
      audio.onended = () => { setIsSpeaking(false); onEndCallback(); };
      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => { setIsSpeaking(false); onEndCallback(); };
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListeningWithTimeout = (timeout = 7000) => {
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    speechTimeoutRef.current = setTimeout(() => {
      if (listening) {
        SpeechRecognition.stopListening();
        speakText("I'm sorry, I didn't hear anything. Let's try that again.", startListeningWithTimeout);
      }
    }, timeout);
  };

  // --- Core Activity Logic ---

  useEffect(() => {
    speakText(`Let's begin with our first question. ${QUESTION_TEXT}`, startListeningWithTimeout);
  }, []);

  useEffect(() => {
    if (finalTranscript && finalTranscript !== transcriptRef.current) {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      transcriptRef.current = finalTranscript;
      handleSpokenAnswer(finalTranscript);
    }
  }, [finalTranscript]);

  const handleSpokenAnswer = async (spokenText) => {
    setIsLoading(true);
    setStatusText('Thinking...');
    
    const startTime = Date.now();

    try {
      const response = await fetch('http://localhost:8000/api/book-review/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestionId,
          student_text: spokenText.trim(),
          time_to_first_response_ms: Date.now() - startTime
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API error');

      speakText(data.tts_text, () => {
        if (data.next_action.startsWith('PROCEED_TO_')) {
          const nextQuestion = data.next_action.split('_').pop();
          setCurrentQuestionId(nextQuestion);
          setStatusText(`Great! Moving to ${nextQuestion}...`);
          // In a full app, you would now load the next question's text and ask it.
        } else {
          startListeningWithTimeout();
        }
      });

    } catch (error) {
      console.error('Answer submission error:', error);
      speakText("Oops, something went wrong. Let's try that again.", startListeningWithTimeout);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSpeaking) {
      setStatusText('Speaking...');
    } else if (listening) {
      setStatusText('Listening...');
    } else if (!isLoading) {
      setStatusText('Ready for your answer.');
    }
  }, [isSpeaking, listening, isLoading]);


  useEffect(() => {
    return () => {
      stopSpeaking();
      SpeechRecognition.stopListening();
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{
      backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex",
      flexDirection: "column", fontFamily: "'Manrope', sans-serif"
    }}>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');
          .status-indicator { text-align: center; padding: 20px; background-color: #e9f7ff; border-radius: 12px; margin-bottom: 20px; color: #005f99; font-weight: 600; border: 1px solid #b3e0ff; font-size: 1.2em; }
          .main-content { flex: 1; padding: 40px 60px; display: flex; align-items: center; justify-content: center; gap: 120px; }
          .content-wrapper { flex: 1; max-width: 500px; display: flex; flex-direction: column; gap: 20px; }
          .book-image-section { flex: 0 0 auto; }
          .book-cover { width: 350px; height: 450px; border-radius: 15px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
          .question-section { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-bottom: 5px solid #8A2BE2; }
          .question-label { font-weight: 700; font-size: 24px; color: #333; margin: 0; text-align: center; }
        `}</style>
      <Header />
      <div className="main-content">
        <div className="book-image-section">
          <img src="/mildred-hubble.png" alt="The Worst Witch" className="book-cover" />
        </div>
        <div className="content-wrapper">
          <div className="status-indicator">
            <MicrophoneIcon style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            {statusText} {listening && <span style={{ fontStyle: 'italic' }}>"{transcript}"</span>}
          </div>
          <div className="question-section">
            <div className="question-label">{QUESTION_TEXT}</div>
          </div>
        </div>
      </div>
    </div>
  );
}