import * as tf from '@tensorflow/tfjs';

// MobileNet SSD model URL (pre-trained model from TensorFlow Hub)
const MOBILENET_MODEL_URL = 'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1';

// List of COCO classes the SSD MobileNet model can detect
const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
  'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 
  'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 
  'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 
  'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 
  'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 
  'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 
  'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 
  'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 
  'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

// Load a lightweight custom fire detection model
export async function loadModel() {
  // For a real-world implementation, you'd want to train and load a custom fire detection model
  // For this demo, we'll use a general object detection model and treat certain detected objects as "fire"
  try {
    await tf.ready();
    console.log('TensorFlow.js is ready');
    
    // Load MobileNet SSD model
    const model = await tf.loadGraphModel(MOBILENET_MODEL_URL, { fromTFHub: true });
    return model;
  } catch (error) {
    console.error('Failed to load the model:', error);
    throw error;
  }
}

// Preprocess the image for the model
function preprocessImage(video: HTMLVideoElement) {
  // SSD MobileNet expects 300x300 RGB images
  return tf.tidy(() => {
    // Capture a frame from the video element
    const img = tf.browser.fromPixels(video);
    
    // Resize to 300x300 (SSD MobileNet input size)
    const resized = tf.image.resizeBilinear(img, [300, 300]);
    
    // Normalize pixel values to [0, 1]
    const normalized = resized.div(255);
    
    // Add batch dimension [1, 300, 300, 3]
    const batched = normalized.expandDims(0);
    
    return batched;
  });
}

export interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

// Function to simulate fire detection
// In a real implementation, this would use a custom fire detection model
export async function detectFire(
  model: tf.GraphModel,
  video: HTMLVideoElement,
  threshold: number = 0.5
): Promise<Detection[]> {
  return tf.tidy(() => {
    // Preprocess the image
    const input = preprocessImage(video);
    
    // Run prediction
    const predictions = model.predict(input) as {[key: string]: tf.Tensor<tf.Rank>};
    
    // Process results
    // The model returns an object with 4 tensors:
    // - detection_boxes: [1, num_detections, 4] containing [ymin, xmin, ymax, xmax]
    // - detection_classes: [1, num_detections] containing class indices
    // - detection_scores: [1, num_detections] containing detection scores
    // - num_detections: scalar indicating the number of detections
    
    const boxes = predictions['detection_boxes'].arraySync()[0] as number[][];
    const scores = predictions['detection_scores'].arraySync()[0] as number[];
    const classes = predictions['detection_classes'].arraySync()[0] as number[];
    
    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Convert detections to our format
    const detections: Detection[] = [];
    
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] >= threshold) {
        const classId = Math.round(classes[i]);
        // Map class indices to class names (1-indexed in SSD MobileNet)
        const className = COCO_CLASSES[classId - 1] || 'unknown';
        
        // In a real implementation, we would check for fire-specific classes
        // For this demo, we'll simulate fire detection based on certain classes
        // like "fire hydrant" (class index 10) and add some randomness
        // to occasionally detect "fire" based on the confidence threshold
        const isFireHydrant = classId === 11; // fire hydrant index is 11 in 1-indexed system
        
        // Simulate fire detection using a random factor and the fire hydrant class
        // This is just for demonstration purposes
        const isFire = isFireHydrant || 
          (Math.random() < 0.1 && ['person', 'chair', 'couch'].includes(className));
        
        if (isFire) {
          // Extract bounding box coordinates: [ymin, xmin, ymax, xmax]
          const [ymin, xmin, ymax, xmax] = boxes[i];
          
          // Convert normalized coordinates to pixel values
          const x = xmin * videoWidth;
          const y = ymin * videoHeight;
          const width = (xmax - xmin) * videoWidth;
          const height = (ymax - ymin) * videoHeight;
          
          detections.push({
            bbox: [x, y, width, height],
            class: 'FIRE', // Always mark as fire for demo purposes
            score: scores[i],
          });
        }
      }
    }
    
    return detections;
  });
}
