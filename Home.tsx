import { useState, useEffect } from 'react';
import CameraView from '@/components/CameraView';
import StatusIndicator from '@/components/StatusIndicator';
import ControlPanel from '@/components/ControlPanel';
import FireAlertModal from '@/components/FireAlertModal';
import AlertSentConfirmation from '@/components/AlertSentConfirmation';
import EmergencyButton from '@/components/EmergencyButton';
import useFireDetection from '@/hooks/useFireDetection';
import useCamera from '@/hooks/useCamera';
import useLocation from '@/hooks/useLocation';
import useSettings from '@/hooks/useSettings';

export default function Home() {
  const [fireDetected, setFireDetected] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [detectionImage, setDetectionImage] = useState<string | null>(null);
  
  const { settings, sensitivity, setSensitivity, toggleAI, aiActive } = useSettings();
  const { location, locationEnabled, toggleLocation } = useLocation();
  const { videoRef, canvasRef, currentCameraId, availableCameras, flipCamera, flashEnabled, toggleFlash } = useCamera();
  const { detections, isProcessing } = useFireDetection(videoRef, canvasRef, sensitivity, aiActive);

  // Keep screen awake
  useEffect(() => {
    const keepScreenAwake = async () => {
      if ('wakeLock' in navigator) {
        try {
          // @ts-ignore - The wake lock API may not be recognized by TypeScript
          await navigator.wakeLock.request('screen');
        } catch (err) {
          console.error('Failed to keep screen awake:', err);
        }
      }
    };

    keepScreenAwake();
  }, []);

  // Monitor battery status
  useEffect(() => {
    const updateBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          // @ts-ignore - getBattery may not be recognized by TypeScript
          const battery = await navigator.getBattery();
          setBatteryLevel(battery.level * 100);

          // Add event listener for battery level changes
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level * 100);
          });
        } catch (err) {
          console.error('Battery status not available:', err);
          setBatteryLevel(null);
        }
      }
    };

    updateBatteryStatus();
  }, []);

  // Check for fire detection
  useEffect(() => {
    if (detections && detections.length > 0 && aiActive) {
      // Find the highest confidence fire detection
      const highestConfidence = detections.reduce((max, detection) => {
        return detection.score > max ? detection.score : max;
      }, 0);
      
      setDetectionConfidence(highestConfidence * 100);
      
      // If confidence is above threshold based on sensitivity, trigger fire alert
      const thresholds = {
        low: 0.7, // 70%
        medium: 0.5, // 50%
        high: 0.3, // 30%
      };
      
      if (highestConfidence > thresholds[sensitivity as keyof typeof thresholds]) {
        // Capture current frame as image
        if (videoRef.current && canvasRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            setDetectionImage(canvas.toDataURL('image/jpeg', 0.8));
            setFireDetected(true);
          }
        }
      }
    }
  }, [detections, sensitivity, aiActive, videoRef, canvasRef]);

  const handleSendAlert = async () => {
    if (location) {
      try {
        await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            imageData: detectionImage,
            confidence: detectionConfidence.toFixed(1),
            status: 'sent',
          }),
        });
        
        setFireDetected(false);
        setAlertSent(true);
      } catch (error) {
        console.error('Failed to send alert:', error);
      }
    }
  };

  const handleCancelAlert = () => {
    setFireDetected(false);
  };

  const handleContinueMonitoring = () => {
    setAlertSent(false);
  };

  const handleEmergencyButton = () => {
    setFireDetected(true);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[hsl(var(--light-bg))]">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-[hsl(var(--navy))] bg-opacity-70 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></span>
          <span className="text-xs">{isProcessing ? 'Monitoring' : 'Paused'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">
            {batteryLevel !== null ? `Battery: ${Math.round(batteryLevel)}%` : 'Battery: N/A'}
          </span>
          <i className="material-icons text-sm">battery_6_bar</i>
        </div>
      </div>

      <CameraView 
        videoRef={videoRef} 
        canvasRef={canvasRef} 
        onFlipCamera={flipCamera} 
        flashEnabled={flashEnabled}
        onToggleFlash={toggleFlash}
      />
      
      <StatusIndicator isActive={aiActive && isProcessing} />
      
      <ControlPanel 
        locationText={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Location unavailable'}
        emergencyContact="Local Fire Department"
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
        aiActive={aiActive}
        onToggleAI={toggleAI}
      />
      
      {fireDetected && (
        <FireAlertModal
          confidence={detectionConfidence}
          locationText={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Unknown location'}
          timestamp={new Date().toLocaleTimeString()}
          imageUrl={detectionImage || ''}
          onSendAlert={handleSendAlert}
          onCancelAlert={handleCancelAlert}
        />
      )}
      
      {alertSent && (
        <AlertSentConfirmation onContinueMonitoring={handleContinueMonitoring} />
      )}
      
      <EmergencyButton onEmergencyClick={handleEmergencyButton} />
    </div>
  );
}
