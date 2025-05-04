import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { playAlertSound } from '@/lib/audioAlert';

interface FireAlertModalProps {
  confidence: number;
  locationText: string;
  timestamp: string;
  imageUrl: string;
  onSendAlert: () => void;
  onCancelAlert: () => void;
}

const FireAlertModal: React.FC<FireAlertModalProps> = ({
  confidence,
  locationText,
  timestamp,
  imageUrl,
  onSendAlert,
  onCancelAlert
}) => {
  useEffect(() => {
    // Play alert sound when component is mounted
    playAlertSound();
    
    // Set up vibration pattern if supported
    if ('vibrate' in navigator) {
      try {
        // Vibrate with a pattern: 500ms on, 200ms off, 500ms on
        navigator.vibrate([500, 200, 500]);
      } catch (err) {
        console.error('Vibration failed:', err);
      }
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="bg-[hsl(var(--fire-red))] text-white p-6 rounded-2xl max-w-xs w-full mx-4 alert-pulse">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">FIRE DETECTED!</h2>
            <p className="text-sm">
              {confidence < 70 
                ? 'Potential fire detected'
                : confidence < 90
                  ? 'High confidence detection'
                  : 'Very high confidence detection'
              }
            </p>
          </div>
          <i className="material-icons text-3xl">local_fire_department</i>
        </div>
        
        <div className="border border-white border-opacity-30 rounded-lg overflow-hidden mb-4">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Fire evidence" 
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-black flex items-center justify-center">
              <span>No image available</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="text-xs">
            <div className="font-bold">Location:</div>
            <div>{locationText}</div>
          </div>
          <div className="text-xs text-right">
            <div className="font-bold">Time:</div>
            <div>{timestamp}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-white text-[hsl(var(--fire-red))] font-bold rounded-xl flex items-center justify-center"
            onClick={onSendAlert}
          >
            <i className="material-icons mr-1">warning</i>
            Send Alert
          </Button>
          <Button 
            className="bg-white bg-opacity-20 text-white font-bold rounded-xl flex items-center justify-center"
            variant="ghost"
            onClick={onCancelAlert}
          >
            <i className="material-icons mr-1">cancel</i>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FireAlertModal;
