// src/components/FilePreviewModal.jsx
import React, { useEffect } from "react";
import { X, Download, FileText, Eye } from "lucide-react";

const FilePreviewModal = ({ isOpen, onClose, previewUrl, previewType, previewFileName, onDownload }) => {
  // Handle body class and scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Tambahkan class ke body untuk menyembunyikan sidebar
      document.body.classList.add("preview-open");
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      // Hapus class dari body
      document.body.classList.remove("preview-open");
      // Unlock scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("preview-open");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = previewFileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-black"
      onClick={onClose}
    >
      <div 
        className="w-screen h-screen bg-white flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Compact */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 shadow-md">
              <Eye size="14" className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Preview File</h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{previewFileName || 'File'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload} 
              className="p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
            >
              <Download size="14" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg bg-white/80 text-slate-500 hover:bg-slate-100 transition-all duration-200"
            >
              <X size="16" />
            </button>
          </div>
        </div>

        {/* Modal Content - Full remaining space */}
        <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
          {previewType === "pdf" && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview PDF"
              onError={(e) => {
                console.error("PDF Load Error:", previewUrl);
                e.target.onerror = null;
              }}
            />
          )}
          
          {previewType === "image" && (
            <div className="flex items-center justify-center w-full h-full bg-[#1e1e1e]">
              <img 
                src={previewUrl} 
                alt={previewFileName} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400?text=Gambar+Tidak+Dapat+Dimuat';
                }}
              />
            </div>
          )}
          
          {(previewType === "document" || previewType === "spreadsheet") && (
            <div className="flex flex-col items-center justify-center h-full text-center bg-[#1e1e1e]">
              <FileText size="64" className="text-slate-500 mb-4" />
              <p className="text-white font-medium">Preview tidak tersedia untuk file ini</p>
              <p className="text-sm text-slate-400 mt-1">Silakan download file untuk melihat isinya</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Download size="16" />
                Download File
              </button>
            </div>
          )}
          
          {previewType === "other" && (
            <div className="flex flex-col items-center justify-center h-full text-center bg-[#1e1e1e]">
              <FileText size="64" className="text-slate-500 mb-4" />
              <p className="text-white font-medium">File tidak dapat dipreview</p>
              <p className="text-sm text-slate-400 mt-1">Silakan download file untuk melihat isinya</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Download size="16" />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;