import { useState, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API types not in default lib; will fix in Phase 3
type SpeechRecognitionAny = any;

export function useVoiceInput() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognitionAny | null>(null);

    useEffect(() => {
        // @ts-expect-error — Web Speech API vendor-prefixed; will type in Phase 3
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            // @ts-expect-error — Web Speech API vendor-prefixed
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'nl-NL'; // Default to Dutch

            recognitionRef.current.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
                const transcript = event.results[0][0].transcript;
                setTranscript(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: { error: string }) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            setTranscript(''); // Clear previous
            recognitionRef.current.start();
            setIsListening(true);
        } else {
            alert("Voice input is not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, startListening, stopListening, recognition: recognitionRef.current };
}
