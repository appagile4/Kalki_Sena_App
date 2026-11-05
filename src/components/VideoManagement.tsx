"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchPromoVideo,
  uploadPromoVideo,
  uploadPromoThumbnail,
  updatePromoVideoDetails,
  deletePromoVideo,
  clearVideoMessages,
} from "../redux/slices/videoSlice";
import {
  Video,
  Upload,
  Play,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ExternalLink,
  Copy,
  Check,
  FileVideo,
  ImageIcon,
  Save,
  ShieldCheck,
  Smartphone,
  Eye,
  Info,
} from "lucide-react";

export default function VideoManagement() {
  const dispatch = useAppDispatch();
  const {
    promoVideo,
    loading,
    uploadingVideo,
    uploadingThumbnail,
    isSavingDetails,
    error,
    successMessage,
    deletedPreviousNotice,
  } = useAppSelector((state) => state.video);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  // Local form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [directVideoUrl, setDirectVideoUrl] = useState("");
  const [directThumbnailUrl, setDirectThumbnailUrl] = useState("");

  // Selected file states for preview
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [selectedThumbFile, setSelectedThumbFile] = useState<File | null>(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchPromoVideo());
  }, [dispatch]);

  // Sync redux state into form fields
  useEffect(() => {
    if (promoVideo) {
      setTitle(promoVideo.title || "Message from MR.666");
      setDescription(
        promoVideo.description ||
          "A visionary message from founder Jay Sah (MR. 666) regarding the youth economic revolution and free education mission."
      );
      setDirectVideoUrl(promoVideo.videoUrl || "");
      setDirectThumbnailUrl(promoVideo.thumbnailUrl || "");
    }
  }, [promoVideo]);

  // Handle video file selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  // Upload video file
  const handleExecuteVideoUpload = async () => {
    if (!selectedVideoFile) return;
    await dispatch(
      uploadPromoVideo({
        file: selectedVideoFile,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      })
    );
    setSelectedVideoFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = "";
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedThumbFile(file);
      const url = URL.createObjectURL(file);
      setThumbPreviewUrl(url);
    }
  };

  // Upload thumbnail file
  const handleExecuteThumbnailUpload = async () => {
    if (!selectedThumbFile) return;
    await dispatch(uploadPromoThumbnail(selectedThumbFile));
    setSelectedThumbFile(null);
    if (thumbPreviewUrl) {
      URL.revokeObjectURL(thumbPreviewUrl);
      setThumbPreviewUrl(null);
    }
    if (thumbnailFileInputRef.current) {
      thumbnailFileInputRef.current.value = "";
    }
  };

  // Save textual details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      updatePromoVideoDetails({
        title: title.trim(),
        description: description.trim(),
        videoUrl: directVideoUrl.trim() || undefined,
        thumbnailUrl: directThumbnailUrl.trim() || undefined,
      })
    );
  };

  // Handle video delete
  const handleDeleteVideo = async () => {
    await dispatch(deletePromoVideo());
    setShowDeleteConfirm(false);
  };

  // Copy video URL
  const handleCopyUrl = () => {
    if (promoVideo?.videoUrl) {
      navigator.clipboard.writeText(promoVideo.videoUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const formatDuration = (sec?: number) => {
    if (!sec || isNaN(sec)) return "00:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || isNaN(bytes)) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-6">
      {/* ---------------- TOP BANNER ---------------- */}
      <div className="bg-gradient-to-r from-[#03142b] via-[#052044] to-[#0a356b] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-mono font-semibold border border-blue-400/30 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>CLOUDINARY VIDEO CDN</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE MOBILE APP SYNC</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-mono font-semibold border border-purple-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AUTO-DELETE PREVIOUS VIDEO: ENABLED</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Promotional Video & Broadcast Controller</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Upload and manage the official broadcast video streamed in full-screen on the Kalki Sena mobile app. When you update or upload a new video, the previous video is automatically purged from Cloudinary storage to keep storage optimized.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => dispatch(fetchPromoVideo())}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition cursor-pointer backdrop-blur-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`}
              />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- ALERTS / NOTICES ---------------- */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">{successMessage}</p>
              {deletedPreviousNotice && (
                <p className="text-xs text-emerald-700 mt-0.5">
                  {deletedPreviousNotice}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => dispatch(clearVideoMessages())}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={() => dispatch(clearVideoMessages())}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ---------------- AUTO-DELETE CLOUDINARY INFO CALLOUT ---------------- */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100/80 flex items-start gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-slate-800 text-sm">
            Cloudinary Auto-Replacement Architecture
          </p>
          <p className="leading-relaxed text-slate-600">
            Whenever a new promotional video is uploaded to Cloudinary, our backend immediately calls the Cloudinary Uploader API to destroy the previous asset (<code>{promoVideo?.videoPublicId || "kalki_sena/videos/..."}</code>). This ensures zero orphaned files, zero storage wastage, and seamless instant playback switch on the driver mobile app.
          </p>
        </div>
      </div>

      {/* ---------------- MAIN GRID: LEFT (PLAYER & PREVIEW) / RIGHT (UPLOAD & CONTROLS) ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE VIDEO STREAM & LIVE MOBILE PREVIEW (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Cloudinary Video Player Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#0266b3]" />
                <h3 className="text-sm font-bold text-slate-800">
                  Active Cloudinary Video Stream
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-[#0266b3] text-[10px] font-mono font-bold">
                LIVE CDN
              </span>
            </div>

            {/* Video Player */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-950 relative border border-slate-300 shadow-inner group">
              {promoVideo?.videoUrl ? (
                <video
                  key={promoVideo.videoUrl}
                  src={promoVideo.videoUrl}
                  poster={promoVideo.thumbnailUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                  <FileVideo className="w-12 h-12 text-slate-500" />
                  <p className="text-xs">No video stream loaded yet</p>
                </div>
              )}
            </div>

            {/* Video Specs & Metadata Badge */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">Title:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                  {promoVideo?.title || "Message from MR.666"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">Public ID:</span>
                <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 max-w-[210px] truncate">
                  {promoVideo?.videoPublicId || "kalki_sena/default"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">Duration:</span>
                <span className="font-semibold text-slate-700">
                  {formatDuration(promoVideo?.duration)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">File Size:</span>
                <span className="font-semibold text-slate-700">
                  {formatBytes(promoVideo?.bytes)}
                </span>
              </div>
              {promoVideo?.updatedAt && (
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium">Last Updated:</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {new Date(promoVideo.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Direct CDN URL + Action Buttons */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Direct Stream URL (CDN)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={promoVideo?.videoUrl || ""}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-600 select-all truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  title="Copy Video URL"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                >
                  {copiedUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {promoVideo?.videoUrl && (
                  <a
                    href={promoVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                    title="Open stream in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Delete / Reset Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Storage Clean-up
              </span>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Video from Cloudinary</span>
              </button>
            </div>

            {/* Delete Confirmation Modal / Inline Alert */}
            {showDeleteConfirm && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-2.5 animate-fadeIn">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Confirm Cloudinary Video Deletion?</span>
                </p>
                <p className="text-rose-700 leading-normal">
                  This will permanently delete this video from your Cloudinary account and reset the broadcast to the default stream.
                </p>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteVideo}
                    disabled={loading}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 cursor-pointer"
                  >
                    {loading ? "Deleting..." : "Yes, Delete from Cloudinary"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Mobile App Live Card Preview */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Mobile App Live Screen Preview
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">
                PromoCards.tsx
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exact replica of how the promotional card renders in the user mobile app home screen:
            </p>

            {/* Replica of mobile PromoCards */}
            <div className="flex gap-2.5 h-[120px] w-full pt-1">
              {/* Left Promo Video Card */}
              <div className="flex-[1.7] rounded-xl overflow-hidden relative border border-[#0E3466] bg-[#03142B] p-2.5 flex flex-col justify-between shadow-md group">
                <Image
                  src={promoVideo?.thumbnailUrl || "/bookcover.png"}
                  alt="Video Thumbnail Preview"
                  fill
                  unoptimized
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(2,11,24,0.75)] to-[rgba(2,11,24,0.45)] pointer-events-none" />

                <div className="relative z-10 self-start">
                  <span className="text-[10px] font-semibold text-white drop-shadow-md line-clamp-1">
                    {promoVideo?.title || "Message from MR.666"}
                  </span>
                </div>

                <div className="relative z-10 self-center my-auto">
                  <div className="w-9 h-9 rounded-full bg-black/60 border border-white/50 flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[9px] text-cyan-300">
                  <span className="font-mono">Tap for Full-Screen</span>
                  <span>{formatDuration(promoVideo?.duration)}</span>
                </div>
              </div>

              {/* Right Buy Book Card */}
              <div className="flex-1 rounded-xl overflow-hidden relative border border-[#0E3466] bg-gradient-to-b from-[#052044] to-[#031731] p-2.5 flex flex-col justify-between items-center text-center shadow-md">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-[#7BB1F4] flex items-center justify-center mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] text-[#C2D9F2] font-medium leading-tight px-1">
                  Buy book to support Gen Z free education
                </span>
                <div className="px-2 py-0.5 rounded-full bg-[#082B55] border border-[#154278] text-[9px] font-semibold text-white">
                  Buy Book &rarr;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UPLOAD FORMS & CONTROLLERS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Video File Upload to Cloudinary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#0266b3]" />
                  <span>Upload Video to Cloudinary</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload MP4, MOV, WebM or MKV up to 100MB. The backend will upload the new video and automatically delete the previous video asset from Cloudinary.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-200 shrink-0">
                AUTO-REPLACE
              </span>
            </div>

            {/* Drag & Drop / File Input Zone */}
            <div
              onClick={() => videoFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#0266b3] rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 group"
            >
              <input
                type="file"
                ref={videoFileInputRef}
                onChange={handleVideoFileChange}
                accept="video/mp4,video/quicktime,video/webm,video/mkv"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0266b3] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                <FileVideo className="w-6 h-6" />
              </div>

              {selectedVideoFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {selectedVideoFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload to Cloudinary
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Click to browse video file or drag and drop
                  </p>
                  <p className="text-xs text-slate-400">
                    MP4, QuickTime MOV, WebM up to 100MB
                  </p>
                </div>
              )}
            </div>

            {/* Video File Preview before uploading */}
            {videoPreviewUrl && selectedVideoFile && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Local File Preview:
                  </span>
                  <button
                    onClick={() => {
                      setSelectedVideoFile(null);
                      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
                    }}
                    className="text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove Selection
                  </button>
                </div>
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full max-h-48 rounded-lg bg-black object-cover"
                />
              </div>
            )}

            {/* Upload Action Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Old video in Cloudinary is safely deleted</span>
              </div>

              <button
                type="button"
                onClick={handleExecuteVideoUpload}
                disabled={!selectedVideoFile || uploadingVideo}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#031b33] to-[#0266b3] hover:from-[#0266b3] hover:to-[#031b33] text-white text-xs font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploadingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading & Overwriting Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Replace Video</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Video Thumbnail Upload */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#0266b3]" />
                  <span>Video Thumbnail (Cover Art)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a high-resolution preview poster (16:9 recommended) shown before playback starts on mobile.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-[#0266b3] text-[10px] font-mono font-bold border border-cyan-200 shrink-0">
                POSTER ART
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Thumbnail preview */}
              <div className="w-36 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 relative shrink-0 shadow-sm">
                <Image
                  src={
                    thumbPreviewUrl ||
                    promoVideo?.thumbnailUrl ||
                    "/bookcover.png"
                  }
                  alt="Thumbnail"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="file"
                  ref={thumbnailFileInputRef}
                  onChange={handleThumbnailFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Thumbnail Image</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  {selectedThumbFile
                    ? `Selected: ${selectedThumbFile.name}`
                    : "Supports PNG, JPG, WebP up to 10MB"}
                </p>
              </div>

              {selectedThumbFile && (
                <button
                  type="button"
                  onClick={handleExecuteThumbnailUpload}
                  disabled={uploadingThumbnail}
                  className="px-4 py-2 rounded-xl bg-[#0266b3] text-white text-xs font-bold hover:bg-[#025291] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {uploadingThumbnail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Upload Poster</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Broadcast Metadata & Text Details */}
          <form
            onSubmit={handleSaveDetails}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5"
          >
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Save className="w-5 h-5 text-[#0266b3]" />
                <span>Broadcast Copy & Title Details</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize the promo card title, subtitle, and broadcast descriptions rendered on the mobile feed.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Broadcast Video Title (Mobile Card Heading) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Message from MR.666"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vision Statement / Video Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the context of this visionary video..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3] focus:bg-white transition"
                />
              </div>

              {/* Direct URLs manual fallback */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Custom Video URL (Manual Override)
                  </label>
                  <input
                    type="url"
                    value={directVideoUrl}
                    onChange={(e) => setDirectVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#0266b3] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Custom Thumbnail URL (Manual Override)
                  </label>
                  <input
                    type="url"
                    value={directThumbnailUrl}
                    onChange={(e) => setDirectThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#0266b3] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingDetails}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#031b33] to-[#0266b3] hover:from-[#0266b3] hover:to-[#031b33] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingDetails ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Broadcast Metadata</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
