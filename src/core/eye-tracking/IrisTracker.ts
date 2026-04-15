// Iris Tracker - MediaPipe Face Mesh Integration

declare global {
  interface Window {
    FaceMesh?: any;
    Camera?: any;
    DrawingUtils?: any;
  }
}

import type { IrisData } from '../types/eye-tracking';

/**
 * Iris Tracker - Wraps MediaPipe Face Mesh for eye tracking
 */
export class IrisTracker {
  private faceMesh: any = null;
  private camera: any = null;
  private onResultsCallback: ((results: IrisData) => void) | null = null;
  private isInitialized = false;
  private isRunning = false;
  private minConfidence = 0.7;

  constructor() {}

  /**
   * Initialize MediaPipe Face Mesh
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('[IrisTracker] Already initialized');
      return true;
    }

    try {
      // Wait for MediaPipe to load
      const maxWaitTime = 15000; // 15 seconds
      const startTime = Date.now();

      console.log('[IrisTracker] Waiting for MediaPipe Face Mesh to load...');

      while (!window.FaceMesh && Date.now() - startTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const elapsed = Date.now() - startTime;
        if (elapsed % 2000 < 200) {
          console.log(`[IrisTracker] Still waiting... (${elapsed / 1000}s elapsed)`);
        }
      }

      if (!window.FaceMesh) {
        console.error('[IrisTracker] MediaPipe Face Mesh not loaded after timeout.');
        console.error('[IrisTracker] Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('face') || k.toLowerCase().includes('mesh')));
        return false;
      }

      console.log('[IrisTracker] Face Mesh loaded! Initializing...');

      // Create Face Mesh instance
      this.faceMesh = new window.FaceMesh({
        locateFile: (file: string) => {
          console.log('[IrisTracker] Loading asset:', file);
          return `https://unpkg.com/@mediapipe/face_mesh@0.4.1633529619/${file}`;
        },
      });

      // Configure options
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: this.minConfidence,
        minTrackingConfidence: this.minConfidence,
        modelComplexity: 0, // Use lite model for better performance
      });

      // Set callback
      this.faceMesh.onResults(this.handleResults.bind(this));

      this.isInitialized = true;
      console.log('[IrisTracker] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[IrisTracker] Failed to initialize MediaPipe Face Mesh:', error);
      return false;
    }
  }

  /**
   * Start tracking with video element
   */
  async start(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) return false;
    }

    try {
      console.log('[IrisTracker] Starting camera...');

      // Wait for Camera utility to load
      const maxWaitTime = 10000; // 10 seconds
      const startTime = Date.now();

      while (!window.Camera && Date.now() - startTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!window.Camera) {
        console.error('[IrisTracker] MediaPipe Camera utility not loaded.');
        return false;
      }

      // Create camera with error handling
      this.camera = new window.Camera(videoElement, {
        onFrame: async () => {
          if (this.faceMesh && videoElement.readyState >= 2) {
            try {
              await this.faceMesh.send({ image: videoElement });
            } catch (error) {
              console.error('[IrisTracker] Error sending frame to Face Mesh:', error);
            }
          }
        },
        width: 640,
        height: 480,
      });

      await this.camera.start();
      this.isRunning = true;
      console.log('[IrisTracker] Camera started successfully');
      return true;
    } catch (error) {
      console.error('[IrisTracker] Failed to start camera:', error);
      return false;
    }
  }

  /**
   * Stop tracking
   */
  async stop(): Promise<void> {
    if (this.camera) {
      await this.camera.stop();
      this.camera = null;
    }
    this.isRunning = false;
  }

  /**
   * Set result callback
   */
  onResults(callback: (results: IrisData) => void): void {
    this.onResultsCallback = callback;
  }

  /**
   * Handle results from MediaPipe Face Mesh
   */
  private handleResults(results: any): void {
    try {
      if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];

      // Face Mesh eye landmarks indices
      // Left eye (468 total landmarks in Face Mesh)
      // Left eye landmarks: 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
      // Right eye landmarks: 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
      // Iris landmarks (when refineLandmarks is true):
      // Left iris: 468, 469, 470, 471, 472
      // Right iris: 473, 474, 475, 476, 477

      const leftIrisIndices = [468, 469, 470, 471, 472];
      const rightIrisIndices = [473, 474, 475, 476, 477];

      // Extract iris landmarks
      const leftIrisLandmarks = leftIrisIndices.map(i => landmarks[i] || { x: 0, y: 0 });
      const rightIrisLandmarks = rightIrisIndices.map(i => landmarks[i] || { x: 0, y: 0 });

      // Calculate iris centers
      const leftIris = {
        x: leftIrisLandmarks.reduce((sum, p) => sum + p.x, 0) / leftIrisLandmarks.length,
        y: leftIrisLandmarks.reduce((sum, p) => sum + p.y, 0) / leftIrisLandmarks.length,
      };

      const rightIris = {
        x: rightIrisLandmarks.reduce((sum, p) => sum + p.x, 0) / rightIrisLandmarks.length,
        y: rightIrisLandmarks.reduce((sum, p) => sum + p.y, 0) / rightIrisLandmarks.length,
      };

      // Get eye region landmarks for blink detection
      const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
      const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

      const leftEyeLandmarks = leftEyeIndices.map(i => landmarks[i] || { x: 0, y: 0 });
      const rightEyeLandmarks = rightEyeIndices.map(i => landmarks[i] || { x: 0, y: 0 });

      const irisData: IrisData = {
        leftIris,
        rightIris,
        leftLandmarks: leftEyeLandmarks.flatMap(p => [p.x, p.y]),
        rightLandmarks: rightEyeLandmarks.flatMap(p => [p.x, p.y]),
        confidence: 1, // We got results, so confidence is good
        timestamp: Date.now(),
      };

      this.onResultsCallback?.(irisData);
    } catch (error) {
      console.error('[IrisTracker] Error handling Face Mesh results:', error);
    }
  }

  /**
   * Check if tracker is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if tracker is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stop();
    this.faceMesh = null;
    this.onResultsCallback = null;
    this.isInitialized = false;
  }
}