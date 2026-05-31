// src/pages/mentor/AddTugas.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardList,
  Save,
  X,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import * as api from "../../api/mentor/tugasService";

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
  
  const [fileUploads, setFileUploads] = useState([]);
  const [fileLink, setFileLink] = useState("");
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    deadline: "",
    deadline_time: "23:59",
    peserta: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        setFetchingPeserta(true);
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/mentor/pesertas", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        console.log("Peserta data:", data);

        if (data.success && Array.isArray(data.data)) {
          const transformed = data.data.map(p => {
            return {
              id: p.id_peserta,
              nama: p.user?.nama || p.nama_lengkap || p.nama || "Unknown",
              divisi: p.divisi?.nama_divisi || p.nama_divisi || "-",
              email: p.user?.email || p.email || "-",
            };
          });
          setPesertaList(transformed);
          setFilteredPeserta(transformed);
        } else {
          setError("Tidak ada data peserta: " + (data.message || ""));
        }
      } catch (err) {
        console.error("Fetch peserta error:", err);
        setError("Gagal memuat peserta: " + err.message);
      } finally {
        setFetchingPeserta(false);
      }
    };
    fetchPeserta();
  }, []);

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

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedPeserta(filteredPeserta.slice(start, end));
  }, [filteredPeserta, currentPage, itemsPerPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    const fileErrors = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        fileErrors.push(`${file.name}: Ukuran file maksimal 10 MB`);
        continue;
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
        fileErrors.push(`${file.name}: Format file tidak didukung`);
        continue;
      }

      newFiles.push(file);
    }

    if (fileErrors.length > 0) {
      setErrors({ file: fileErrors.join(", ") });
    } else {
      setErrors(prev => ({ ...prev, file: "" }));
    }

    setFileUploads(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setFileUploads(prev => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (e) => {
    setFileLink(e.target.value);
    if (errors.link) {
      setErrors(prev => ({ ...prev, link: "" }));
    }
  };

  const removeLink = () => {
    setFileLink("");
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

  // 🔥 PERBAIKAN: Validasi URL yang lebih fleksibel
  const isValidUrl = (url) => {
    if (!url || url.trim() === "") return true; // Kosong dianggap valid (opsional)
    
    const trimmedUrl = url.trim();
    
    // Pattern untuk URL yang lebih fleksibel
    // Menerima http://, https://, ftp://, file://, atau tanpa protocol
    // Menerima domain dengan port, IP address, localhost, path dengan parameter
    const urlPattern = /^(https?:\/\/|ftp:\/\/|file:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6}|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})([\/\w \.-]*)*\/?(\?[^#\s]*)?(#[\w-]*)?$/i;
    
    // Pattern untuk URL lokal tanpa domain (seperti /path/to/file)
    const localPathPattern = /^\/[\/\w \.-]+$/i;
    
    // Pattern untuk URL dengan IP address atau localhost
    const ipOrLocalPattern = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/[\/\w \.-]*)*(\?[^#\s]*)?(#[\w-]*)?$/i;
    
    return urlPattern.test(trimmedUrl) || localPathPattern.test(trimmedUrl) || ipOrLocalPattern.test(trimmedUrl);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.judul.trim()) newErrors.judul = "Judul tugas wajib diisi";
    if (!formData.deskripsi.trim()) newErrors.deskripsi = "Deskripsi tugas wajib diisi";
    if (!formData.deadline) newErrors.deadline = "Deadline wajib diisi";
    if (!formData.deadline_time) newErrors.deadline_time = "Jam deadline wajib diisi";
    if (formData.peserta.length === 0) newErrors.peserta = "Pilih minimal 1 peserta";

    // 🔥 PERBAIKAN: Validasi URL yang lebih fleksibel
    if (fileLink && fileLink.trim() && !isValidUrl(fileLink)) {
      newErrors.link = "Masukkan URL yang valid (contoh: https://example.com, http://localhost/phpmyadmin, atau /path/to/file)";
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
      console.log("📅 Deadline dikirim:", deadlineDateTime);
      submitData.append("deadline", deadlineDateTime);

      submitData.append("id_peserta", JSON.stringify(formData.peserta));

      fileUploads.forEach(file => {
        submitData.append("file_tugas[]", file);
      });

      if (fileLink && fileLink.trim()) {
        submitData.append("file_link", fileLink.trim());
      }

      const response = await api.createMentorTugas(submitData);
      console.log("Response:", response);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/mentor/tugas");
        }, 1500);
      } else {
        setError(response.message || "Gagal menambahkan tugas");
        if (response.errors) setErrors(response.errors);
      }
    } catch (err) {
      console.error("Error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        setError("Validasi gagal. Silakan periksa kembali data yang diisi.");
      } else {
        setError(err.message || "Terjadi kesalahan saat menambahkan tugas");
      }
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
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size="48" className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-[#64748B]">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1E293B]">Tambah Tugas Baru</h1>
              <p className="text-sm text-[#64748B] mt-1">Buat tugas baru untuk peserta bimbingan dengan detail lengkap</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"><AlertCircle size="14" className="text-white" /></div>
              <div><p className="text-sm font-semibold text-red-800">Gagal Membuat Tugas!</p><p className="text-xs text-red-600">{error}</p></div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle size="14" className="text-white" /></div>
              <div><p className="text-sm font-semibold text-green-800">Tugas Berhasil Dibuat!</p><p className="text-xs text-green-600">Mengalihkan...</p></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 lg:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                <FileText size="14" className="text-[#64748B]" /> Judul Tugas <span className="text-red-500">*</span>
              </label>
              <input type="text" name="judul" value={formData.judul} onChange={handleChange}
                placeholder="Contoh: Frontend Development - Week 3"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.judul ? "border-red-400 bg-red-50/30" : "border-[#E2E8F0]"}`} />
              {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                <FileText size="14" className="text-[#64748B]" /> Deskripsi Tugas <span className="text-red-500">*</span>
              </label>
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="4"
                placeholder="Jelaskan detail tugas yang harus dikerjakan oleh peserta..."
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none ${errors.deskripsi ? "border-red-400 bg-red-50/30" : "border-[#E2E8F0]"}`} />
              {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                <Calendar size="14" className="text-[#64748B]" /> Deadline <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={getMinDate}
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.deadline ? "border-red-400 bg-red-50/30" : "border-[#E2E8F0]"}`}
                />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size="14" className="text-[#94A3B8]" />
                  </div>
                  <input
                    type="time"
                    name="deadline_time"
                    value={formData.deadline_time}
                    onChange={handleChange}
                    step="60"
                    className={`w-full px-4 py-2.5 pl-9 bg-white border rounded-lg text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.deadline_time ? "border-red-400 bg-red-50/30" : "border-[#E2E8F0]"}`}
                  />
                </div>
              </div>
              {(errors.deadline || errors.deadline_time) && (
                <p className="text-xs text-red-500 mt-1">Tanggal dan waktu deadline wajib diisi</p>
              )}
              <p className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1">
                <Clock size="10" /> Gunakan format 24 jam - Contoh: 23:59 untuk akhir hari
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                <Upload size="14" className="text-[#64748B]" /> File Tugas (Opsional)
                <span className="text-xs text-[#94A3B8] font-normal ml-2">Bisa upload beberapa file</span>
              </label>
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file_tugas" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt" />
                <label htmlFor="file_tugas" className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer border-[#CBD5E1] bg-white hover:border-blue-400 hover:bg-blue-50/30">
                  <div className="text-center"><Upload size="32" className="mx-auto mb-2 text-[#94A3B8]" /><p className="text-sm text-[#1E293B] font-medium">Klik untuk upload file</p><p className="text-xs text-[#64748B] mt-1">Bisa pilih beberapa file sekaligus (Max 10 MB per file)</p></div>
                </label>
                {fileUploads.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-[#1E293B]">File yang diupload ({fileUploads.length}):</p>
                    {fileUploads.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center text-xl">{getFileIcon(file)}</div><div><p className="text-sm font-medium text-[#1E293B]">{file.name}</p><p className="text-xs text-[#64748B]">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div></div>
                        <button type="button" onClick={() => removeFile(index)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200"><Trash2 size="16" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.file && <p className="text-xs text-red-500 mt-2">{errors.file}</p>}
                <p className="text-xs text-[#64748B] mt-3 flex items-center gap-1"><Shield size="10" /> File akan tersedia untuk diunduh oleh peserta tugas</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                <LinkIcon size="14" className="text-[#64748B]" /> Link Materi (Opsional)
              </label>
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Globe size="14" className="text-[#94A3B8]" /></div>
                  <input 
                    type="text" 
                    value={fileLink} 
                    onChange={handleLinkChange} 
                    placeholder="https://example.com, http://localhost/phpmyadmin, atau /path/to/file"
                    className={`w-full px-4 py-2.5 pl-9 bg-white border rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.link ? "border-red-400 bg-red-50/30" : "border-[#E2E8F0]"}`} />
                  {fileLink && <button type="button" onClick={removeLink} className="absolute inset-y-0 right-0 pr-3 flex items-center"><X size="16" className="text-slate-400 hover:text-rose-500" /></button>}
                </div>
                {errors.link && <p className="text-xs text-red-500 mt-2">{errors.link}</p>}
                <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1">
                  <Globe size="10" /> Bisa menggunakan berbagai jenis URL: Google Docs, YouTube, file lokal, atau path sistem
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-[#1E293B] flex items-center gap-2"><Users size="14" className="text-[#64748B]" /> Peserta Tugas <span className="text-red-500">*</span><span className="text-xs text-[#64748B] ml-2">({selectedCount} dari {totalCount} dipilih)</span></label>
                {totalCount > 0 && <button type="button" onClick={handleSelectAll} className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">{selectedCount === totalCount && totalCount > 0 ? "Hapus Semua" : "Pilih Semua"}</button>}
              </div>
              <div className="relative mb-3"><Search size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" /><input type="text" placeholder="Cari peserta..." value={searchPeserta} onChange={(e) => setSearchPeserta(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm" /></div>
              <div className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-3 max-h-96 overflow-y-auto">
                {displayedPeserta.length === 0 ? (
                  <div className="text-center py-8"><Users size="32" className="mx-auto mb-2 text-[#CBD5E1]" /><p className="text-sm text-[#64748B]">Tidak ada peserta</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {displayedPeserta.map(peserta => {
                      const isChecked = formData.peserta.includes(peserta.id);
                      return (
                        <label key={peserta.id} className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all ${isChecked ? "bg-blue-50 border border-blue-200" : "bg-white border border-[#E2E8F0] hover:border-blue-200"}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => handlePesertaToggle(peserta.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-blue-600" />
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">{peserta.nama.charAt(0)}</div>
                          <div className="flex-1"><p className={`text-sm font-medium ${isChecked ? 'text-blue-700' : 'text-[#1E293B]'}`}>{peserta.nama}</p><p className="text-[10px] text-[#64748B]">{peserta.divisi}</p></div>
                          {isChecked && <CheckCircle size="14" className="text-blue-500" />}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-[#64748B]">Halaman {currentPage} dari {totalPages}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-1 rounded border"><ChevronLeft size={12} /></button>
                    <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-1 rounded border"><ChevronRight size={12} /></button>
                  </div>
                </div>
              )}
              {errors.peserta && <p className="text-xs text-red-500 mt-2">{errors.peserta}</p>}
            </div>
          </div>

          <div className="px-6 lg:px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end gap-3">
            <Link to="/mentor/tugas"><button type="button" className="px-5 py-2 border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium bg-white hover:bg-[#F8FAFC]">Batal</button></Link>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-medium shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2">
              {loading ? <Loader2 size="14" className="animate-spin" /> : <Save size="14" />}
              {loading ? "Menyimpan..." : "Simpan Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTugas;