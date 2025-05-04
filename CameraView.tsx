import React, { useEffect, RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  onFlipCamera: () => void;
  flashEnabled: boolean;
  onToggleFlash: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  videoRef, 
  canvasRef, 
  onFlipCamera, 
  flashEnabled, 
  onToggleFlash 
}) => {
  useEffect(() => {
    // Ensure the canvas is always sized correctly
    const resizeCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        const { clientWidth, clientHeight } = videoRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasRef, videoRef]);

  return (
    <div className="camera-container relative h-full w-full">
      <video 
        ref={videoRef}
        className="camera-feed h-full w-full"
        autoPlay
        playsInline
        muted
      />
      
      <canvas 
        ref={canvasRef}
        className="detection-overlay h-full w-full absolute top-0 left-0"
      />
      
      {/* Camera Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-3 z-30">
        <button 
          className="bg-[hsl(var(--navy))] bg-opacity-70 rounded-full p-3 text-white shadow-lg"
          onClick={onFlipCamera}
        >
          <i className="material-icons">flip_camera_android</i>
        </button>
        <button 
          className="bg-[hsl(var(--navy))] bg-opacity-70 rounded-full p-3 text-white shadow-lg"
          onClick={onToggleFlash}
        >
          <i className="material-icons">{flashEnabled ? 'flash_on' : 'flash_off'}</i>
        </button>
      </div>
    </div>
  );
};

export default CameraView;
