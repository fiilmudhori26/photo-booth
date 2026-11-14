"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAPTURE_H, CAPTURE_W } from "./strip";

export type CameraStatus = "idle" | "requesting" | "ready" | "error";

function describeError(err: unknown): string {
  const e = err as { name?: string; message?: string } | undefined;
  switch (e?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Akses kamera diblokir. Izinkan kamera lewat ikon kunci di address bar browsermu, lalu coba lagi.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "Tidak ada kamera yang ditemukan di perangkat ini. Sambungkan kamera dulu, atau coba lewat ponsel.";
    case "NotReadableError":
    case "TrackStartError":
      return "Kameramu lagi dipakai aplikasi lain. Tutup dulu aplikasinya, lalu ketuk Coba lagi.";
    case "OverconstrainedError":
      return "Kamera ini tidak bisa dibuka dengan resolusi segitu. Coba kamera lainnya.";
    default:
      return "Ada yang salah saat menyalakan kamera. Coba lagi, atau periksa izin kamera di browsermu.";
  }
}

export function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const start = async () => {
      stopStream();
      setStatus("requesting");
      setErrorMessage("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: preferredDeviceId
            ? { deviceId: { exact: preferredDeviceId } }
            : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          try {
            await video.play();
          } catch {
            /* autoplay can be interrupted when the element remounts */
          }
        }

        const inputs = (await navigator.mediaDevices.enumerateDevices()).filter(
          (device) => device.kind === "videoinput",
        );
        if (cancelled) return;

        setDevices(inputs);
        setActiveDeviceId(stream.getVideoTracks()[0]?.getSettings().deviceId ?? null);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(describeError(err));
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream();
      setStatus("idle");
    };
  }, [enabled, preferredDeviceId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const switchCamera = useCallback(() => {
    if (devices.length < 2) return;
    const index = devices.findIndex((d) => d.deviceId === activeDeviceId);
    const next = devices[(index + 1) % devices.length];
    if (next) setPreferredDeviceId(next.deviceId);
  }, [devices, activeDeviceId]);

  const selectCamera = useCallback((deviceId: string) => {
    setPreferredDeviceId(deviceId);
  }, []);

  /** Grabs the current frame as a small JPEG (used for the animated GIF). */
  const captureSmallFrame = useCallback(
    (mirror: boolean): string | null => {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) return null;
      const w = 360;
      const h = 270;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
      const dw = video.videoWidth * scale;
      const dh = video.videoHeight * scale;

      ctx.save();
      if (mirror) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.restore();

      return canvas.toDataURL("image/jpeg", 0.7);
    },
    [],
  );

  /** Grabs the current frame as a JPEG data URL, cropped to the strip ratio. */
  const captureFrame = useCallback((mirror: boolean): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = Math.max(CAPTURE_W / video.videoWidth, CAPTURE_H / video.videoHeight);
    const dw = video.videoWidth * scale;
    const dh = video.videoHeight * scale;

    ctx.save();
    if (mirror) {
      ctx.translate(CAPTURE_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, (CAPTURE_W - dw) / 2, (CAPTURE_H - dh) / 2, dw, dh);
    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.95);
  }, []);

  const activeDevice = devices.find((d) => d.deviceId === activeDeviceId);

  return {
    videoRef,
    status,
    errorMessage,
    devices,
    activeDeviceId,
    activeDeviceLabel: activeDevice?.label ?? "",
    retry,
    switchCamera,
    selectCamera,
    captureFrame,
    captureSmallFrame,
  };
}
