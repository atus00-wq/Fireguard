import { useState, useEffect, useRef } from 'react';

export default function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        
        // Default to the back camera if available (usually the second camera on mobile)
        if (cameras.length > 1) {
          setCurrentCameraId(cameras[cameras.length - 1].deviceId);
        } else if (cameras.length === 1) {
          setCurrentCameraId(cameras[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getDevices();
  }, []);

  // Start the camera stream when component mounts or camera changes
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (streamRef.current) {
          // Stop any existing stream
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: currentCameraId ? { exact: currentCameraId } : undefined,
            facingMode: currentCameraId ? undefined : 'environment', // Default to back camera if no ID
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Try to enable flash if requested
        if (flashEnabled) {
          toggleFlash(true);
        }
      } catch (error) {
        console.error('Error starting camera:', error);
      }
    };

    if (currentCameraId !== null) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentCameraId]);

  // Function to switch camera
  const flipCamera = () => {
    if (availableCameras.length <= 1) return;

    // Find the index of the current camera
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === currentCameraId);
    
    // Switch to the next camera, or go back to the first one
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    setCurrentCameraId(availableCameras[nextIndex].deviceId);
  };

  // Function to toggle flash
  const toggleFlash = (forceState?: boolean) => {
    const newState = forceState !== undefined ? forceState : !flashEnabled;
    
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      
      if (track) {
        try {
          // This is experimental and might not be supported in all browsers/devices
          const capabilities = track.getCapabilities();
          
          if (capabilities.torch) {
            track.applyConstraints({
              advanced: [{ torch: newState }]
            }).then(() => {
              setFlashEnabled(newState);
            }).catch(error => {
              console.error('Error toggling flash:', error);
              setFlashEnabled(false);
            });
          } else {
            console.log('Torch not supported on this device');
            setFlashEnabled(false);
          }
        } catch (error) {
          console.error('Error checking torch capabilities:', error);
          setFlashEnabled(false);
        }
      }
    }
  };

  return {
    videoRef,
    canvasRef,
    currentCameraId,
    availableCameras,
    flipCamera,
    flashEnabled,
    toggleFlash
  };
}
