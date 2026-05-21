// src/pages/mentor/AddTugas.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardList,
  ArrowLeft,
  Save,
  X,
  Calendar,
  Users,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  Zap,
  Target,
  Activity,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  Paperclip,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import * as api from "../../api/mentor/tugasService";
import { getMentorPesertaList, getMyPesertas } from "../../api/mentor/pesertaService";

function AddTugas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingPeserta, setFetchingPeserta] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pesertaList, setPesertaList] = useState([]);
  const [filteredPeserta, setFilteredPeserta] = useState([]);
  const [displayedPeserta, setDisplayedPeserta] = useState([]);
  const [searchPeserta, setSearchPeserta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [fileUpload, setFileUpload] = useState(null);
  const [fileLink, setFileLink] = useState("");
  const [attachmentType, setAttachmentType] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    deadline: "",
    deadline_time: "23:59",
    peserta: []
  });
  const [errors, setErrors] = useState({});

  // Fetch peserta from backend
  useEffect(() => {
  const fetchPeserta = async () => {
    try {
      setFetchingPeserta(true)
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8000/api/mentor/pesertas", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await res.json()
      console.log("Peserta data:", data)

      if (data.success && Array.isArray(data.data)) {
  const transformed = data.data.map(p => {
    console.log("Struktur peserta:", p) // debug dulu
    return {
      id:     p.id_peserta,
      nama:   p.user?.nama      || p.nama_lengkap || p.nama || "Unknown",
      divisi: p.divisi?.nama_divisi || p.nama_divisi || "-",
      email:  p.user?.email     || p.email || "-",
    }
  })
  console.log("Transformed:", transformed)
  setPesertaList(transformed)
  setFilteredPeserta(transformed)
} else {
  setError("Tidak ada data peserta: " + (data.message || ""))
}
    } catch (err) {
      console.error("Fetch peserta error:", err)
      setError("Gagal memuat peserta: " + err.message)
    } finally {
      setFetchingPeserta(false)
    }
  }
  fetchPeserta()
}, [])

  // Filter peserta berdasarkan search
  useEffect(() => {
    if (searchPeserta) {
      const filtered = pesertaList.filter(p => 
        p.nama.toLowerCase().includes(searchPeserta.toLowerCase()) ||
        p.divisi.toLowerCase().includes(searchPeserta.toLowerCase()) ||
        p.email.toLowerCase().includes(searchPeserta.toLowerCase())
      );
      setFilteredPeserta(filtered);
      setCurrentPage(1);
    } else {
      setFilteredPeserta(pesertaList);
      setCurrentPage(1);
    }
  }, [searchPeserta, pesertaList]);

  // Update displayed peserta berdasarkan pagination
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedPeserta(filteredPeserta.slice(start, end));
  }, [filteredPeserta, currentPage, itemsPerPage]);

  // Handle pilihan attachment type
  const selectAttachmentType = (type) => {
    if (attachmentType === type) {
      setAttachmentType(null);
    } else {
      setAttachmentType(type);
      if (type === "file") {
        setFileLink("");
      } else if (type === "link") {
        setFileUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ file: "Ukuran file maksimal 10 MB" });
        setFileUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "application/zip",
        "application/x-rar-compressed",
        "text/plain"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: "Format file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, ZIP, RAR, atau TXT" });
        setFileUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      setFileUpload(file);
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const removeFile = () => {
    setFileUpload(null);
    setAttachmentType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLinkChange = (e) => {
    const url = e.target.value;
    setFileLink(url);
    if (errors.link) {
      setErrors(prev => ({ ...prev, link: "" }));
    }
  };

  const removeLink = () => {
    setFileLink("");
    setAttachmentType(null);
  };

  const handlePesertaToggle = (pesertaId) => {
    setFormData(prev => {
      if (prev.peserta.includes(pesertaId)) {
        return { ...prev, peserta: prev.peserta.filter(id => id !== pesertaId) };
      } else {
        return { ...prev, peserta: [...prev.peserta, pesertaId] };
      }
    });
  };

  const handleSelectAll = () => {
    if (formData.peserta.length === filteredPeserta.length && filteredPeserta.length > 0) {
      setFormData(prev => ({ ...prev, peserta: [] }));
    } else {
      setFormData(prev => ({ ...prev, peserta: filteredPeserta.map(p => p.id) }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.judul.trim()) newErrors.judul = "Judul tugas wajib diisi";
    if (!formData.deskripsi.trim()) newErrors.deskripsi = "Deskripsi tugas wajib diisi";
    if (!formData.deadline) newErrors.deadline = "Deadline wajib diisi";
    if (!formData.deadline_time) newErrors.deadline_time = "Jam deadline wajib diisi";
    if (formData.peserta.length === 0) newErrors.peserta = "Pilih minimal 1 peserta";
    
    // Link validation - hanya validasi format URL standar
    if (attachmentType === "link" && fileLink && !fileLink.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i)) {
      newErrors.link = "Masukkan URL yang valid (contoh: https://docs.google.com/... atau https://drive.google.com/...)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const submitData = new FormData();
      submitData.append("judul", formData.judul);
      submitData.append("deskripsi", formData.deskripsi);
      
      const deadlineDateTime = `${formData.deadline} ${formData.deadline_time}:00`;
      submitData.append("deadline", deadlineDateTime);
      
      submitData.append("id_peserta", JSON.stringify(formData.peserta));
      
      if (attachmentType === "file" && fileUpload) {
        submitData.append("file_tugas", fileUpload);
      }
      
      if (attachmentType === "link" && fileLink) {
        submitData.append("file_link", fileLink);
      }
      
      const response = await api.createMentorTugas(submitData);
      console.log("Create tugas response:", response);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/mentor/tugas");
        }, 1500);
      } else {
        setError(response.message || "Gagal menambahkan tugas");
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (err) {
      console.error("Error adding tugas:", err);
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat menambahkan tugas");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMinDate = formatDateForInput();

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("powerpoint")) return "📊";
    if (type.includes("excel")) return "📈";
    if (type.includes("image")) return "🖼️";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📎";
  };

  const selectedCount = formData.peserta.length;
  const totalCount = filteredPeserta.length;
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  if (fetchingPeserta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size="48" className="animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-600">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1200px] mx-auto">
        
        {/* Header Premium */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                  Tambah Tugas Baru
                </h1>
                <p className="text-sm text-slate-500 mt-1">Buat tugas baru untuk peserta bimbingan dengan detail lengkap</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50/90 to-rose-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                <AlertCircle size="16" className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-800">Gagal Membuat Tugas!</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <CheckCircle size="16" className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Tugas Berhasil Dibuat!</p>
                <p className="text-xs text-emerald-600">Tugas akan segera tersedia untuk peserta yang dipilih</p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          </div>
          
          <div className="p-8 space-y-7">
            {/* Judul Tugas */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-teal-50">
                  <FileText size="14" className="text-teal-600" />
                </div>
                Judul Tugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                placeholder="Contoh: Frontend Development - Week 3"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                  errors.judul ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                }`}
              />
              {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
            </div>

            {/* Deskripsi Tugas */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-50">
                  <FileText size="14" className="text-blue-600" />
                </div>
                Deskripsi Tugas <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows="4"
                placeholder="Jelaskan detail tugas yang harus dikerjakan oleh peserta..."
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 resize-none ${
                  errors.deskripsi ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                }`}
              />
              {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
            </div>

            {/* Deadline dengan Tanggal dan Jam */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-50">
                  <Calendar size="14" className="text-amber-600" />
                </div>
                Deadline <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={getMinDate}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 focus:outline-none transition-all duration-200 ${
                      errors.deadline ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    }`}
                  />
                </div>
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock size="16" className="text-slate-400" />
                    </div>
                    <input
                      type="time"
                      name="deadline_time"
                      value={formData.deadline_time}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-10 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 focus:outline-none transition-all duration-200 ${
                        errors.deadline_time ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                      }`}
                    />
                  </div>
                </div>
              </div>
              {(errors.deadline || errors.deadline_time) && (
                <p className="text-xs text-red-500 mt-1">{errors.deadline || errors.deadline_time}</p>
              )}
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Clock size="10" />
                Tentukan batas waktu pengerjaan tugas (tanggal dan jam)
              </p>
            </div>

            {/* Materi Tugas: Pilihan Upload File atau Link */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-indigo-50">
                  <Paperclip size="14" className="text-indigo-600" />
                </div>
                Materi Tugas
                <span className="text-xs text-slate-400 font-normal ml-2">(Opsional - Pilih salah satu)</span>
              </label>
              
              {/* 2 Pilihan Tombol */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => selectAttachmentType("file")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                    attachmentType === "file" 
                      ? "border-teal-500 bg-teal-50 shadow-md" 
                      : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 bg-white"
                  }`}
                >
                  <Upload size="24" className={`mx-auto mb-2 ${attachmentType === "file" ? "text-teal-500" : "text-slate-400"}`} />
                  <p className={`text-sm font-semibold ${attachmentType === "file" ? "text-teal-600" : "text-slate-600"}`}>Upload File</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, DOC, PPT, XLS, dll</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectAttachmentType("link")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                    attachmentType === "link" 
                      ? "border-teal-500 bg-teal-50 shadow-md" 
                      : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 bg-white"
                  }`}
                >
                  <LinkIcon size="24" className={`mx-auto mb-2 ${attachmentType === "link" ? "text-teal-500" : "text-slate-400"}`} />
                  <p className={`text-sm font-semibold ${attachmentType === "link" ? "text-teal-600" : "text-slate-600"}`}>Masukkan Link</p>
                  <p className="text-[10px] text-slate-400 mt-1">Google Drive, Docs, Sheets, atau link lainnya</p>
                </button>
              </div>

              {/* Upload File Section */}
              {attachmentType === "file" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file_tugas"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt"
                  />
                  {!fileUpload ? (
                    <label
                      htmlFor="file_tugas"
                      className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer border-slate-200 bg-slate-50/50 hover:border-teal-400 hover:bg-teal-50/20"
                    >
                      <div className="text-center">
                        <Upload size="32" className="mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-600 font-medium">Klik untuk upload file</p>
                        <p className="text-xs text-slate-400 mt-1">
                          PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, ZIP, RAR, TXT (Max 10 MB)
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-2xl">
                          {getFileIcon(fileUpload)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{fileUpload.name}</p>
                          <p className="text-xs text-slate-400">
                            {(fileUpload.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all duration-200"
                      >
                        <Trash2 size="18" />
                      </button>
                    </div>
                  )}
                  {errors.file && <p className="text-xs text-red-500 mt-2">{errors.file}</p>}
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Shield size="10" />
                    File akan tersedia untuk diunduh oleh peserta tugas
                  </p>
                </div>
              )}

              {/* Link URL Section */}
              {attachmentType === "link" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe size="16" className="text-slate-400" />
                    </div>
                    <input
                      id="file_link_input"
                      type="url"
                      value={fileLink}
                      onChange={handleLinkChange}
                      placeholder="https://docs.google.com/spreadsheets/d/... atau link lainnya"
                      className={`w-full px-4 py-3 pl-10 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                        errors.link ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                      }`}
                    />
                    {fileLink && (
                      <button
                        type="button"
                        onClick={removeLink}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X size="16" className="text-slate-400 hover:text-rose-500 transition-colors" />
                      </button>
                    )}
                  </div>
                  {errors.link && <p className="text-xs text-red-500 mt-2">{errors.link}</p>}
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Shield size="10" />
                    Peserta dapat mengakses link yang Anda berikan untuk mengerjakan tugas
                  </p>
                </div>
              )}
            </div>

            {/* Peserta dengan Search & Pagination */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-50">
                    <Users size="14" className="text-emerald-600" />
                  </div>
                  Peserta Tugas <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-400 ml-2">({selectedCount} dari {totalCount} dipilih)</span>
                </label>
                {totalCount > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-4 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all duration-200"
                  >
                    {selectedCount === totalCount && totalCount > 0 ? "Hapus Semua" : "Pilih Semua"}
                  </button>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari peserta berdasarkan nama, divisi, atau email..."
                  value={searchPeserta}
                  onChange={(e) => setSearchPeserta(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                />
              </div>
              
              {/* Daftar Peserta */}
              <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 max-h-96 overflow-y-auto">
                {displayedPeserta.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Users size="32" className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada peserta ditemukan</p>
                    <p className="text-xs mt-1">Pastikan Anda memiliki peserta bimbingan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedPeserta.map(peserta => {
                      const isChecked = formData.peserta.includes(peserta.id);
                      return (
                        <label 
                          key={peserta.id} 
                          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                            isChecked ? "bg-teal-50 border border-teal-200 shadow-sm" : "hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePesertaToggle(peserta.id)}
                            className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {peserta.nama.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isChecked ? 'text-teal-700' : 'text-slate-700'}`}>
                              {peserta.nama}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{peserta.divisi}</p>
                          </div>
                          {isChecked && (
                            <CheckCircle size="16" className="text-teal-500 flex-shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPeserta.length)} dari {filteredPeserta.length} peserta
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200"
                    >
                      <ChevronLeft size="14" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage <= 2) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-7 h-7 rounded-lg text-xs font-medium transition-all duration-200 ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-sm"
                                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200"
                    >
                      <ChevronRight size="14" />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.peserta && <p className="text-xs text-red-500 mt-2">{errors.peserta}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 flex justify-end gap-4">
            <Link to="/mentor/tugas">
              <button type="button" className="px-6 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200">
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}
                {loading ? "Menyimpan..." : "Simpan Tugas"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTugas;