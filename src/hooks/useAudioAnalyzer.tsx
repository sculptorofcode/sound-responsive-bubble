
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<number[]>([0, 0, 0]);
  const [isListening, setIsListening] = useState(false);
  const [lastSoundTime, setLastSoundTime] = useState(Date.now());
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup audio context and analyzer
  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Configure analyser
      analyserRef.current.fftSize = 32; // Small FFT for just a few data points
      sourceRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      toast.success("Microphone connected");
      
      // Start analyzing
      analyzeAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Failed to access microphone");
    }
  };

  // Analyze audio data
  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateData = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // We only need 3 frequency bands for our visualization
      const lowFreq = Math.max(1, dataArray[1] || 0); // Bass (low frequency)
      const midFreq = Math.max(1, dataArray[5] || 0); // Mids
      const highFreq = Math.max(1, dataArray[10] || 0); // Highs
      
      // Normalize to 0-100 range
      const normalizedData = [
        lowFreq / 255 * 100,
        midFreq / 255 * 100,
        highFreq / 255 * 100
      ];
      
      setAudioData(normalizedData);
      
      // Check if there's sound
      const hasSound = normalizedData.some(val => val > 5); // Threshold
      
      if (hasSound) {
        setLastSoundTime(Date.now());
        // Clear any existing timeout when sound is detected
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
      } else {
        // If silence and no timeout is set, create one
        if (!silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            // If we've been silent for 10 seconds
            if (Date.now() - lastSoundTime >= 10000) {
              setAudioData([0, 0, 0]);
            }
          }, 10000);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(updateData);
    };
    
    updateData();
  };

  // Cleanup resources
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    setIsListening(false);
  };

  // Start audio analysis
  useEffect(() => {
    setupAudio();
    
    return cleanup;
  }, []);

  // Calculate if we should show the ball based on time since last sound
  const showBall = Date.now() - lastSoundTime > 10000;

  return {
    audioData,
    isListening,
    showBall,
    lastSoundTime
  };
};
