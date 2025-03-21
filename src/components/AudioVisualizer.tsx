
import { useEffect, useState } from 'react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MessageSquare, ArrowLeft, History } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChatDisplay } from '@/components/ChatDisplay';

export const AudioVisualizer = () => {
  const { audioData, isListening, showBall } = useAudioAnalyzer();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [previousState, setPreviousState] = useState<'ball' | 'bars'>('ball');
  const [currentState, setCurrentState] = useState<'ball' | 'bars'>('ball');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Check if any sound is detected (above threshold)
  const hasSound = audioData.some(value => value > 5);
  
  // Update visualization state based on sound
  useEffect(() => {
    if (hasInteracted) {
      const newState = hasSound && !showBall ? 'bars' : 'ball';
      
      if (newState !== currentState) {
        setPreviousState(currentState);
        setCurrentState(newState);
      }
    }
  }, [hasSound, showBall, hasInteracted, currentState]);

  // Request microphone permission
  const requestMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      setHasInteracted(true);
      toast.success("Microphone access granted");
    } catch (error) {
      console.error('Error requesting microphone access:', error);
      toast.error("Microphone access denied");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background pointer-events-none" />
      
      {!hasInteracted ? (
        <div className="glass-card p-8 rounded-lg max-w-md text-center space-y-6">
          <h2 className="text-2xl font-light tracking-tight">Sound Visualizer</h2>
          <p className="text-muted-foreground">
            This application transforms your voice into an interactive visualization.
            Speak to see the ball transform into responsive audio bars.
          </p>
          <button
            onClick={requestMicrophoneAccess}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 relative overflow-hidden group"
          >
            <span className="relative z-10">Start Visualization</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      ) : (
        <div className="audio-container flex flex-col items-center justify-center h-full w-full">
          {/* Status indicator */}
          <div className="absolute top-4 right-4 flex items-center">
            <div className={cn(
              "w-2 h-2 rounded-full mr-2 transition-colors",
              isListening ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-xs text-muted-foreground">
              {isListening ? "Listening" : "Microphone inactive"}
            </span>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 text-sm text-muted-foreground max-w-xs">
            <p>Speak to transform the ball into audio bars. After 10 seconds of silence, it returns to a ball.</p>
          </div>
          
          {currentState === 'ball' ? (
            /* Ball visualization */
            <div 
              className={cn(
                "audio-ball rounded-full animate-float",
                previousState === 'bars' ? "bars-to-ball" : ""
              )}
              style={{
                width: '200px',
                height: '200px',
                background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(124, 58, 237))',
                opacity: hasInteracted ? 1 : 0.5,
              }}
            />
          ) : (
            /* Bar visualization */
            <div className={cn(
              "flex items-center justify-center space-x-1 h-64",
              previousState === 'ball' ? "ball-to-bars" : ""
            )}>
              {audioData.map((value, index) => (
                <div
                  key={index}
                  className="audio-bar bg-white/90 rounded-full w-10"
                  style={{
                    height: `${Math.max(5, value)}%`,
                    transformOrigin: 'center',
                    transition: 'height 0.1s ease-out'
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Chat interface button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                className="absolute bottom-4 right-4 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                aria-label="Open chat"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] md:w-[550px] p-0">
              <ChatDisplay onBackClick={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};
