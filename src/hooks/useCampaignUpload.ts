"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CampaignMediaKind = "image" | "video";

export type CampaignAsset = {
  url: string;
  kind: CampaignMediaKind;
  name: string;
  width: number;
  height: number;
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

function classify(file: File): CampaignMediaKind | null {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return "image";
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return "video";
  const lower = file.name.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|svg)$/.test(lower)) return "image";
  if (/\.(mp4|webm|mov)$/.test(lower)) return "video";
  return null;
}

function loadImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
}

function loadVideoSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => resolve({ width: v.videoWidth || 1, height: v.videoHeight || 1 });
    v.onerror = () => reject(new Error("Could not decode video"));
    v.src = url;
  });
}

export function useCampaignUpload() {
  const [asset, setAsset] = useState<CampaignAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ownedUrlRef = useRef<string | null>(null);

  const replaceAsset = useCallback((next: CampaignAsset | null, ownedUrl: string | null) => {
    if (ownedUrlRef.current && ownedUrlRef.current !== ownedUrl) {
      URL.revokeObjectURL(ownedUrlRef.current);
    }
    ownedUrlRef.current = ownedUrl;
    setAsset(next);
  }, []);

  useEffect(() => {
    return () => {
      if (ownedUrlRef.current) URL.revokeObjectURL(ownedUrlRef.current);
    };
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      const kind = classify(file);
      if (!kind) {
        setError("Unsupported file type. Use PNG, JPG, WEBP, SVG, MP4, or WEBM.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("File is larger than 25 MB. Please use a smaller creative.");
        return;
      }
      setLoading(true);
      try {
        const url = URL.createObjectURL(file);
        const { width, height } = kind === "image" ? await loadImageSize(url) : await loadVideoSize(url);
        replaceAsset({ url, kind, name: file.name, width, height }, url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load file");
      } finally {
        setLoading(false);
      }
    },
    [replaceAsset]
  );

  const setPreset = useCallback(
    async (presetUrl: string, presetName: string, kind: CampaignMediaKind = "image") => {
      setError(null);
      setLoading(true);
      try {
        const { width, height } = kind === "image" ? await loadImageSize(presetUrl) : await loadVideoSize(presetUrl);
        replaceAsset({ url: presetUrl, kind, name: presetName, width, height }, null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load preset");
      } finally {
        setLoading(false);
      }
    },
    [replaceAsset]
  );

  const clear = useCallback(() => {
    replaceAsset(null, null);
    setError(null);
  }, [replaceAsset]);

  return { asset, error, loading, upload, setPreset, clear };
}
