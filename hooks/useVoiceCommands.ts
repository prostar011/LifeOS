// hooks/useVoiceCommands.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type SpeechRecognition = any; // narrow type for brevity; in real app, define proper types

export function useVoiceCommands({
  onCommand,
  enabled = true,
}: {
  onCommand: (transcript: string) => void;
  enabled?: boolean;
}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
      } else {
        setError(`Speech error: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        onCommand(transcript);
      }
    };

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [onCommand, enabled]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
    } catch {
      // some browsers throw if already started
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  }, [isListening]);

  return { isListening, error, startListening, stopListening };
}
