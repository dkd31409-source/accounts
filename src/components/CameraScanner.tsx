import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image, Check, X, RefreshCw } from 'lucide-react';
import { Attachment } from '../types';

interface CameraScannerProps {
  onCapture: (attachment: Attachment) => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Attempt to initialize active HTML5 video stream
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('getUserMedia not accessible, falling back to static capture:', err);
        setCameraError(true);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        setIsCompressing(true);
        // Set canvas to match video stream size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Compress and extract as low-overhead JPG (compression ratio: 0.7)
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCapturedDataUrl(compressedUrl);
        setIsCompressing(false);
      }
    }
  };

  const handleFallbackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (capturedDataUrl) {
      // Calculate approx size from base64 string
      const stringLength = capturedDataUrl.length - 'data:image/jpeg;base64,'.length;
      const sizeInBytes = Math.ceil(stringLength * 0.75);

      const attachment: Attachment = {
        name: `scan_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: sizeInBytes,
        uploadedAt: new Date().toISOString().slice(0, 10),
        uploadedBy: 'Mobile Camera',
        dataUrl: capturedDataUrl,
      };

      onCapture(attachment);
      handleStopCamera();
      onClose();
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-white font-medium text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#4C7A5A]" />
            Camera Document Scanner
          </h3>
          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
          {capturedDataUrl ? (
            /* PREVIEW STEP */
            <div className="relative w-full h-full flex flex-col justify-between p-4 bg-zinc-950">
              <img
                src={capturedDataUrl}
                alt="Captured scan"
                className="max-w-full max-h-[80%] object-contain rounded-lg mx-auto shadow-md"
              />
              <div className="text-zinc-400 text-xs text-center">
                Preview captured document. Tap save to attach.
              </div>
            </div>
          ) : cameraError ? (
            /* FALLBACK FOR UNSUPPORTED/BLOCKED BROWSER CAMERA */
            <div className="text-center p-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Image className="w-8 h-8" />
              </div>
              <div>
                <p className="text-zinc-200 text-sm font-medium">Camera API Not Accessible</p>
                <p className="text-zinc-500 text-xs mt-1 px-4">
                  Select photo option to trigger your native device camera app instead.
                </p>
              </div>
              <label className="px-5 py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-95 text-white font-medium rounded-xl text-sm cursor-pointer transition-all flex items-center gap-2 shadow-lg">
                <Camera className="w-4 h-4" />
                Launch System Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFallbackFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* LIVE VIDEO STREAM */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {isCompressing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 text-white">
              <RefreshCw className="w-8 h-8 animate-spin text-[#4C7A5A]" />
              <span className="text-xs">Optimizing Image...</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="px-6 py-5 border-t border-zinc-800 bg-zinc-950 flex justify-center gap-4">
          {capturedDataUrl ? (
            <>
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleSavePhoto}
                className="px-5 py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-95 text-white font-medium rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg"
              >
                <Check className="w-4 h-4" />
                Save & Attach
              </button>
            </>
          ) : (
            !cameraError && (
              <button
                onClick={handleCapturePhoto}
                className="w-14 h-14 rounded-full bg-white hover:bg-zinc-100 border-4 border-zinc-700 hover:border-zinc-500 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
              />
            )
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
