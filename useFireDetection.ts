import { useState, useEffect, useRef, MutableRefObject } from 'react';
import * as tf from '@tensorflow/tfjs';
import { loadModel, detectFire } from '@/lib/fireDetectionModel';

export interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

export default function useFireDetection(
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  sensitivity: string = 'medium',
  active: boolean = true
) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load the model on component mount
  useEffect(() => {
    let isMounted = true;

    const loadTFModel = async () => {
      try {
        console.log('Loading model...');
        modelRef.current = await loadModel();
        if (isMounted) {
          console.log('Model loaded successfully');
          setIsModelLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };

    loadTFModel();
    
    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Function to draw bounding boxes on the canvas
  const drawDetections = (detections: Detection[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Calculate scale factors if the video dimensions differ from the canvas
    const scaleX = canvasRef.current.width / videoRef.current.videoWidth;
    const scaleY = canvasRef.current.height / videoRef.current.videoHeight;
    
    // Draw each detection
    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Draw bounding box
      ctx.strokeStyle = '#E63946'; // Fire red color
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw label background
      const label = `${detection.class} ${Math.round(detection.score * 100)}%`;
      const labelWidth = ctx.measureText(label).width + 10;
      ctx.fillStyle = '#E63946';
      ctx.fillRect(scaledX, scaledY - 25, labelWidth, 25);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.fillText(label, scaledX + 5, scaledY - 8);
    });
  };

  // Process video frames when active
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current || !active) {
      setIsProcessing(false);
      return;
    }

    const processFrame = async () => {
      if (!videoRef.current || !modelRef.current) return;
      
      if (videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
        setIsProcessing(true);
        
        try {
          // Adjust detection threshold based on sensitivity
          const thresholds = {
            low: 0.7, // 70% confidence threshold
            medium: 0.5, // 50% confidence threshold
            high: 0.3, // 30% confidence threshold
          };
          
          const threshold = thresholds[sensitivity as keyof typeof thresholds];
          const result = await detectFire(modelRef.current, videoRef.current, threshold);
          
          setDetections(result);
          drawDetections(result);
        } catch (error) {
          console.error('Error during detection:', error);
        }
      }
      
      // Schedule the next frame
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start processing frames
    processFrame();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsProcessing(false);
    };
  }, [isModelLoaded, videoRef, canvasRef, active, sensitivity]);

  return { detections, isProcessing, isModelLoaded };
}
