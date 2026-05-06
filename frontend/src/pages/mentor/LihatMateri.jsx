import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Video,
  Link as LinkIcon,
  Eye,
  Calendar,
  Loader2,
  Shield,
  Download,
  ExternalLink,
  File,
  FileArchive
} from "lucide-react";
import api from "../../utils/api";

function LihatMateri() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [materi, setMateri] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const response = await api.getMentorMateriById(id);
        console.log("Materi detail:", response);
        if (response.success && response.data) {
          setMateri(response.data);
        } else {
          setError("Materi tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching materi:", err);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };
    fetchMateri();
  }, [id]);

  const getTipeInfo = () => {
    switch(materi?.tipe_materi) {
      case "dokumen":
        return { icon: FileText, label: "Dokumen", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
      case "video":
        return { icon: Video, label: "Video", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      case "link":
        return { icon: LinkIcon, label: "Link", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
      default:
        return { icon: FileText, label: "Materi", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    }
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    const parts = url.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  const isPdf = (url) => {
    return getFileExtension(url) === 'pdf';
  };

  const isImage = (url) => {
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const isWord = (url) => {
    const ext = getFileExtension(url);
    return ['doc', 'docx'].includes(ext);
  };

  const isExcel = (url) => {
    const ext = getFileExtension(url);
    return ['xls', 'xlsx'].includes(ext);
  };

  const isPpt = (url) => {
    const ext = getFileExtension(url);
    return ['ppt', 'pptx'].includes(ext);
  };

  const getFileTypeLabel = (url) => {
    const ext = getFileExtension(url);
    if (isWord(url)) return "Microsoft Word";
    if (isExcel(url)) return "Microsoft Excel";
    if (isPpt(url)) return "Microsoft PowerPoint";
    if (isPdf(url)) return "PDF";
    if (isImage(url)) return "Gambar";
    return ext.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !materi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Materi tidak ditemukan"}</p>
          <Link to="/mentor/materi" className="text-teal-500 hover:underline">
            Kembali ke Daftar Materi
          </Link>
        </div>
      </div>
    );
  }

  const tipeInfo = getTipeInfo();
  const TipeIcon = tipeInfo.icon;
  const fileUrl = materi.file_url || materi.link;
  const canPreview = isPdf(fileUrl) || isImage(fileUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
        
        {/* Back Button */}
        <Link to="/mentor/materi" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all duration-300 mb-6 group">
          <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:bg-teal-50 transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span className="text-sm font-medium">Kembali ke Daftar Materi</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-teal-500 to-blue-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-10 left-8">
              <div className="relative w-20 h-20 rounded-xl bg-white shadow-xl flex items-center justify-center border-2 border-white/50">
                <TipeIcon size={32} className={tipeInfo.color} />
              </div>
            </div>
          </div>

          <div className="pt-12 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">{materi.judul}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(materi.created_at).toLocaleDateString('id-ID')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {materi.views} dilihat
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tipeInfo.bg} ${tipeInfo.color} border ${tipeInfo.border}`}>
                    <TipeIcon size={12} />
                    {tipeInfo.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-3">Deskripsi</h2>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-600 leading-relaxed">{materi.deskripsi || "Tidak ada deskripsi"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="font-semibold text-slate-800">Konten Materi</h2>
          </div>
          
          <div className="p-6">
            {materi.tipe_materi === "dokumen" && fileUrl && (
              <div className="space-y-4">
                {/* File Info & Actions */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      {isWord(fileUrl) && <FileArchive size={18} className="text-blue-500" />}
                      {isExcel(fileUrl) && <FileArchive size={18} className="text-green-500" />}
                      {isPpt(fileUrl) && <FileArchive size={18} className="text-orange-500" />}
                      {isPdf(fileUrl) && <FileText size={18} className="text-red-500" />}
                      {isImage(fileUrl) && <FileText size={18} className="text-purple-500" />}
                      <span className="text-sm font-medium text-slate-700">
                        {fileUrl.split('/').pop()}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {getFileTypeLabel(fileUrl)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={fileUrl} 
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <Download size={14} />
                        Download
                      </a>
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <ExternalLink size={14} />
                        Buka di Tab Baru
                      </a>
                    </div>
                  </div>
                  
                  {/* PDF Preview */}
                  {isPdf(fileUrl) && (
                    <div className="mt-4 border rounded-xl overflow-hidden bg-white">
                      <embed
                        src={fileUrl}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                        className="w-full"
                      />
                      <div className="bg-slate-50 p-2 text-center border-t">
                        <p className="text-xs text-slate-500">
                          Jika preview tidak muncul, klik tombol "Buka di Tab Baru" atau "Download"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {isImage(fileUrl) && (
                    <div className="mt-4 border rounded-xl overflow-hidden bg-white text-center p-4">
                      <img 
                        src={fileUrl} 
                        alt={materi.judul}
                        className="max-w-full max-h-[600px] mx-auto object-contain"
                      />
                    </div>
                  )}

                  {/* Word/Excel/PPT - Tidak bisa preview */}
                  {(isWord(fileUrl) || isExcel(fileUrl) || isPpt(fileUrl)) && (
                    <div className="mt-4 bg-amber-50 rounded-xl p-6 text-center border border-amber-200">
                      <File size={48} className="text-amber-500 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-amber-700 mb-2">
                        File {getFileTypeLabel(fileUrl)} tidak dapat ditampilkan langsung di browser
                      </p>
                      <p className="text-xs text-amber-600 mb-4">
                        Silakan download file atau buka di tab baru untuk melihat konten.
                        File akan dibuka menggunakan aplikasi default (Microsoft Word, Excel, atau PowerPoint).
                      </p>
                      <div className="flex justify-center gap-3 flex-wrap">
                        <a 
                          href={fileUrl} 
                          download
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium shadow-md"
                        >
                          <Download size={16} />
                          Download File
                        </a>
                        <a 
                          href={fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium shadow-md"
                        >
                          <ExternalLink size={16} />
                          Buka di Tab Baru
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Unsupported file type */}
                  {!isPdf(fileUrl) && !isImage(fileUrl) && !isWord(fileUrl) && !isExcel(fileUrl) && !isPpt(fileUrl) && (
                    <div className="mt-4 bg-amber-50 rounded-xl p-6 text-center border border-amber-200">
                      <File size={48} className="text-amber-500 mx-auto mb-3" />
                      <p className="text-sm text-amber-700 mb-2">Preview tidak tersedia untuk file jenis ini</p>
                      <p className="text-xs text-amber-600 mb-4">
                        File dengan format {getFileExtension(fileUrl).toUpperCase()} tidak dapat ditampilkan langsung.
                      </p>
                      <div className="flex justify-center gap-3">
                        <a 
                          href={fileUrl} 
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
                        >
                          <Download size={14} />
                          Download File
                        </a>
                        <a 
                          href={fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium"
                        >
                          <ExternalLink size={14} />
                          Buka di Tab Baru
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Informasi Dokumen</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {isPdf(fileUrl) && "File PDF dapat dilihat langsung di halaman ini."}
                        {isImage(fileUrl) && "File gambar dapat dilihat langsung di halaman ini."}
                        {(isWord(fileUrl) || isExcel(fileUrl) || isPpt(fileUrl)) && "File Word/Excel/PPT tidak dapat ditampilkan langsung di browser. Silakan download atau buka di tab baru."}
                        {!isPdf(fileUrl) && !isImage(fileUrl) && !isWord(fileUrl) && !isExcel(fileUrl) && !isPpt(fileUrl) && "File ini tidak dapat ditampilkan langsung. Silakan download untuk melihat konten."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {materi.tipe_materi === "video" && fileUrl && (
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <video controls className="w-full">
                    <source src={fileUrl} type="video/mp4" />
                    Browser Anda tidak mendukung video tag.
                  </video>
                </div>
                <div className="flex justify-end">
                  <a 
                    href={fileUrl} 
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <Download size={14} />
                    Download Video
                  </a>
                </div>
              </div>
            )}

            {materi.tipe_materi === "link" && materi.link && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl p-6 text-center border border-green-200">
                  <LinkIcon size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-green-700 mb-4">Klik tombol di bawah untuk membuka link materi eksternal</p>
                  <a 
                    href={materi.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ExternalLink size={18} />
                    Buka Link Materi
                  </a>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">URL:</p>
                  <p className="text-sm text-teal-600 break-all">{materi.link}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LihatMateri;