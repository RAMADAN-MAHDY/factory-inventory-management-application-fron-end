import { useState, useRef, useCallback } from 'react';
import api from '@/lib/api';

export const useCamera = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = resolve;
        });
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  }, []);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append('image', blob, 'photo.jpg');
              try {
                const res = await api.post('/upload', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                resolve(res.data.imageUrl);
              } catch (err) {
                console.error(err);
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.9);
        });
      }
    }
    return null;
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
      if (!e.target.files || !e.target.files[0]) return null;
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.imageUrl;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    []
  );

  return {
    isCameraActive,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    handleImageUpload,
  };
};
