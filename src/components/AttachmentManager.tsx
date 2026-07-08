import React, { useState } from 'react';
import { Upload, FileText, Camera, Eye, Trash2, Download, X } from 'lucide-react';
import { Attachment } from '../types';
import { CameraScanner } from './CameraScanner';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onChange: (updated: Attachment[]) => void;
  title?: string;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  onChange,
  title = "Receipts & Documents",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag-and-drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFiles = (files: FileList) => {
    setError(null);
    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        setError(`${file.name} is too large. Max file size is 8MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const nextAttachment: Attachment = {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: 'User Upload',
          dataUrl: reader.result as string,
        };
        onChange([...attachments, nextAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDelete = (index: number) => {
    const next = [...attachments];
    next.splice(index, 1);
    onChange(next);
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isPdf = (type: string) => type === 'application/pdf' || type.endsWith('/pdf');

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted font-sans">
          {title} ({attachments.length})
        </label>
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="text-xs font-medium text-[#4C7A5A] hover:text-[#3D6349] hover:underline flex items-center gap-1 transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
          Camera Scan
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
          <span className="text-xs mt-0.5">⚠️</span>
          <p className="font-medium text-rose-700/95 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1">✕</button>
        </div>
      )}

      {/* Drag & Drop Canvas */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-[#4C7A5A] bg-[#DEE9DD]/10'
            : 'border-line bg-surface hover:border-[#4C7A5A]/50'
        }`}
      >
        <Upload className="w-6 h-6 text-muted" />
        <p className="text-xs font-medium text-ink text-center">
          Drag and drop files here, or{' '}
          <span className="text-[#4C7A5A] font-semibold underline">browse</span>
        </p>
        <p className="text-[10px] text-muted text-center">
          Supports PDFs, images, Excel sheets (Max 8MB)
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {/* File List Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {attachments.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3 bg-surface border border-line rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isImage(file.type) ? (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-9 h-9 object-cover rounded-lg border border-line flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 bg-[#DEE9DD] text-[#223A2A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate max-w-[140px] sm:max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted font-mono mt-0.5">
                    {getFormatSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Individual Actions */}
              <div className="flex items-center gap-1">
                {(isImage(file.type) || isPdf(file.type)) && (
                  <button
                    type="button"
                    onClick={() => setPreviewAttachment(file)}
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                    title="Preview File"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  className="p-1.5 rounded-lg text-muted hover:text-[#4C7A5A] hover:bg-[#DEE9DD] transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-[#F3DFDF] transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Camera Live Scanner Overlay */}
      {showCamera && (
        <CameraScanner
          onCapture={(captured) => onChange([...attachments, captured])}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Document/Image Preview Lightbox Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-surface border border-line rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface">
              <span className="font-semibold text-ink text-sm truncate max-w-[80%]">
                Preview: {previewAttachment.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 rounded-lg hover:bg-bg transition-colors text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-auto bg-zinc-950 flex items-center justify-center p-4">
              {isImage(previewAttachment.type) ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : isPdf(previewAttachment.type) ? (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="w-full h-full border-0 bg-white rounded-lg"
                />
              ) : (
                <p className="text-white text-xs">Preview is not available for this file type.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
