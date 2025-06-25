
import React, { useState, useEffect, useRef } from 'react';
import { getAIAssistanceResponse } from '../services/geminiService';
import { MicrophoneIcon, PaperAirplaneIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Using solid for active state
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

// Define the specific error codes for speech synthesis
// Removed custom SpeechSynthesisErrorCode type definition to avoid conflict with lib.dom.d.ts
// type SpeechSynthesisErrorCode =
//   | "canceled"
//   | "interrupted"
//   | "audio-busy"
//   | "audio-hardware"
//   | "network"
//   | "synthesis-unavailable"
//   | "synthesis-failed"
//   | "language-unavailable"
//   | "voice-unavailable"
//   | "text-too-long"
//   | "invalid-argument";

// Revised global type declarations for Web Speech API.
declare global {
  // These interfaces are part of the Web Speech API.

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList; // Assumes SpeechRecognitionResultList is globally available
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string; // e.g., 'no-speech', 'aborted', 'audio-capture', 'network', 'not-allowed', 'service-not-allowed', 'bad-grammar', 'language-not-supported'
    readonly message: string; // Human-readable description of the error
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: any; // Actually SpeechGrammarList, but using 'any' if SpeechGrammarList might also be missing
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

    abort(): void;
    start(): void;
    stop(): void;
  }
  
  // SpeechSynthesisErrorCode below will now refer to the built-in type from lib.dom.d.ts
  interface SpeechSynthesisErrorEvent extends Event { // Consider extending SpeechSynthesisEvent for full accuracy
    readonly utterance: SpeechSynthesisUtterance; // Assumes SpeechSynthesisUtterance is globally available
    readonly charIndex: number;
    readonly elapsedTime: number;
    readonly error: SpeechSynthesisErrorCode; // This now refers to the standard global type
  }


  interface Window {
    // Ensure TypeScript knows about these specific constructors on the window object.
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;

    // SpeechSynthesisUtterance and speechSynthesis are usually covered by lib.dom.d.ts.
  }
}


interface AIAssistantProps {}

const AIAssistant: React.FC<AIAssistantProps> = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for SpeechRecognition API
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported by your browser.');
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      let errorMessage = `Speech recognition error: ${event.message || event.error}`;
      if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Audio capture failed. Ensure microphone is connected and permissions are granted.';
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings.';
      }
      setError(errorMessage);
      setIsListening(false);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setUserInput(transcript);
    };

    // Check for SpeechSynthesis API
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      utteranceRef.current = new window.SpeechSynthesisUtterance();
      const utterance = utteranceRef.current;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => { 
        console.error('Speech synthesis error:', event.error);
        setError(`Text-to-speech error: ${event.error}`);
        setIsSpeaking(false);
      };
    } else {
        console.warn('Speech synthesis is not supported by your browser.');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not available.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setUserInput(''); 
      setAiResponse(null);
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e: any) { 
         console.error("Error starting speech recognition in toggleListening:", e);
         let message = "Could not start microphone.";
         // DOMException errors from MediaDevices or SpeechRecognition
         if (e instanceof DOMException) {
            if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
              message = "Microphone access denied. Please enable microphone permissions in your browser settings and for this site.";
            } else if (e.name === 'InvalidStateError') {
               message = "Microphone is already active or in an invalid state. Please try again.";
            } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') { // For some browsers
               message = "No microphone found. Please ensure a microphone is connected and enabled.";
            } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') { // For some browsers
               message = "Microphone is already in use by another application or tab, or a hardware error occurred.";
            } else {
               message = `Could not start microphone: ${e.name}${e.message ? ` - ${e.message}` : ''}. It might be in use or permissions are blocked.`;
            }
         } else if (e && typeof e.message === 'string') { // Generic error with a message
            message = `Could not start microphone: ${e.message}`;
         }
         setError(message);
         setIsListening(false); // Ensure listening state is reset
      }
    }
  };

  const handleSubmitQuery = async (query?: string) => {
    const currentQuery = query || userInput;
    if (!currentQuery.trim()) {
      setError("Please enter or say your question.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResponse(null);
    if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }


    try {
      // Pass the current learning path title as context if available.
      // This requires access to the current learning path, which might need to be lifted or passed down.
      // For now, let's assume no specific learning context is passed.
      // To implement this, you'd need to get the path title from state/context when on LearningPathDisplay page.
      const response = await getAIAssistanceResponse(currentQuery /*, learningPathTitle */);
      setAiResponse(response);
    } catch (e: any) {
      setError(e.message || 'Failed to get response from AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSpeakResponse = () => {
    if (!aiResponse || !utteranceRef.current || !('speechSynthesis' in window)) {
        setError('Text-to-speech is not available or no response to read.');
        return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      // onend should set isSpeaking to false, but to be safe:
      setIsSpeaking(false); 
    } else {
      utteranceRef.current.text = aiResponse;
      // utteranceRef.current.lang = 'en-US'; // Optionally set language
      // utteranceRef.current.voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US') || null; // Optionally select a voice
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  if (!showAssistant) {
    return (
      <button
        onClick={() => setShowAssistant(true)}
        className="fixed bottom-6 right-6 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 z-50"
        aria-label="Open AI Assistant"
      >
        <SparklesIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-4 w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col" style={{height: 'min(550px, 80vh)'}} role="dialog" aria-modal="true" aria-labelledby="ai-assistant-title">
      <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
        <h3 id="ai-assistant-title" className="text-lg font-semibold text-sky-700 flex items-center">
          <SparklesIcon className="h-6 w-6 mr-2 text-sky-600" aria-hidden="true" />
          AI Learning Assistant
        </h3>
        <button
          onClick={() => {
            setShowAssistant(false);
            if (isListening && recognitionRef.current) recognitionRef.current.stop();
            if (isSpeaking && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close assistant"
        >
          <XCircleIcon className="h-7 w-7" />
        </button>
      </div>

      <div className="p-4 space-y-3 flex-grow overflow-y-auto">
        {error && <p role="alert" className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
        
        {aiResponse && (
          <div className="bg-sky-50 p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold text-sky-700">Assistant's Response:</p>
                {('speechSynthesis' in window && utteranceRef.current) && (
                    <button onClick={handleSpeakResponse} className="p-1 text-sky-600 hover:text-sky-800" aria-label={isSpeaking ? "Stop speaking" : "Read response aloud"}>
                        {isSpeaking ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-3" aria-live="polite">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-600 mr-2"></div>
            <p className="text-sm text-slate-600">Assistant is thinking...</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleListening}
            disabled={!recognitionRef.current || isLoading} // isLoading check added
            className={`p-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors
                        ${isListening ? 'bg-red-500 text-white focus:ring-red-400' : 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500'}
                        disabled:bg-slate-300 disabled:cursor-not-allowed`}
            aria-label={isListening ? 'Stop listening' : 'Start listening with microphone'}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmitQuery()}
            placeholder={isListening ? "Listening..." : "Ask a question..."}
            className="flex-grow p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="User input for AI Assistant"
          />
          <button
            onClick={() => handleSubmitQuery()}
            disabled={isLoading || !userInput.trim()}
            className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Send query"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
