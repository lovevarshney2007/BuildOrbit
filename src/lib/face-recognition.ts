import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceApiModels() {
  if (modelsLoaded) return true;
  
  try {
    // Models are served from jsdelivr CDN to avoid hosting them in the repo
    const modelPath = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
    ]);
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error("Failed to load face-api models:", error);
    return false;
  }
}

export async function getFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> {
  await loadFaceApiModels();
  
  const detection = await faceapi
    .detectSingleFace(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  if (!detection) return null;
  return detection.descriptor;
}
