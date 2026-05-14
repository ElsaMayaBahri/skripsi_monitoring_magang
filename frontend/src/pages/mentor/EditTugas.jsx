// src/pages/mentor/EditTugas.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  File,
  Eye,
  Download,
  Globe
} from "lucide-react";
import * as api from "../../api/mentor/tugasService";
import axiosInstance from "../../api/axios";

function EditTugas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    deadline: "",
    file_tugas: null,
    file_link: "",
    existing_file: null,
    remove_file: false
  });
  const [existingFile, setExistingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch tugas detail
  const fetchTugasDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getMentorTugasDetail(id);
      console.log("Tugas detail response:", response);
      
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          judul: data.judul || "",
          deskripsi: data.deskripsi || "",
          deadline: data.deadline ? data.deadline.split('T')[0] : "",
          file_tugas: null,
          file_link: data.file_link || "",
          existing_file: data.file_tugas || null,
          remove_file: false
        });
        setExistingFile(data.file_tugas);
      } else {
        setError(response.message || "Gagal memuat data tugas");
      }
    } catch (err) {
      console.error("Error fetching tugas detail:", err);
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTugasDetail();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file_tugas: file, remove_file: false }));
      // Preview untuk gambar
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveExistingFile = () => {
    setFormData(prev => ({ ...prev, remove_file: true, existing_file: null }));
    setExistingFile(null);
  };

  const handleCancelRemoveFile = () => {
    setFormData(prev => ({ ...prev, remove_file: false, file_tugas: null }));
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.judul.trim()) {
      alert("Judul tugas harus diisi");
      return;
    }
    if (!formData.deadline) {
      alert("Deadline harus diisi");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const submitData = new FormData();
      submitData.append('judul', formData.judul);
      submitData.append('deskripsi', formData.deskripsi);
      submitData.append('deadline', formData.deadline);
      
      if (formData.file_link) {
        submitData.append('file_link', formData.file_link);
      }
      
      if (formData.remove_file) {
        submitData.append('remove_file', 'true');
      }
      
      if (formData.file_tugas) {
        submitData.append('file_tugas', formData.file_tugas);
      }
      
      // Gunakan POST dengan _method=PUT untuk FormData
      const response = await axiosInstance.post(`/mentor/tugas/${id}?_method=PUT`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setSuccessMessage("Tugas berhasil diperbarui!");
        setTimeout(() => {
          navigate("/mentor/daftar-tugas");
        }, 1500);
      } else {
        setError(response.data.message || "Gagal memperbarui tugas");
      }
    } catch (err) {
      console.error("Error updating tugas:", err);
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={40} className="text-slate-400" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return "🖼️";
    if (ext === 'pdf') return "📄";
    if (['doc', 'docx'].includes(ext)) return "📝";
    if (['ppt', 'pptx'].includes(ext)) return "📊";
    if (['xls', 'xlsx'].includes(ext)) return "📈";
    return "📁";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
        </div>
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat data tugas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="relative p-6 lg:p-8 max-w-5xl mx-auto">
        
        {/* Header dengan tombol back */}
        <div className="mb-6">
          <Link to="/mentor/daftar-tugas" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-4 group">
            <ArrowLeft size="18" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Kembali ke Daftar Tugas</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                Edit Tugas
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Perbarui informasi tugas bimbingan</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <X size="18" />
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-600 flex-1">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Tugas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Masukkan judul tugas"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
              required
            />
          </div>

          {/* Deskripsi Tugas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Deskripsi Tugas
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows="5"
              placeholder="Jelaskan detail tugas yang harus dikerjakan peserta..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
            />
          </div>

          {/* Deadline */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* File Tugas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Materi Tugas
            </label>
            
            {/* Existing File */}
            {existingFile && !formData.remove_file && (
              <div className="mb-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getFileIcon(existingFile)}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[200px] md:max-w-[300px]">
                        {existingFile.split('/').pop()}
                      </p>
                      <p className="text-[10px] text-slate-400">File saat ini</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`http://localhost:8000/storage/${existingFile}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200"
                      title="Lihat file"
                    >
                      <Eye size="16" />
                    </a>
                    <a 
                      href={`http://localhost:8000/storage/${existingFile}`} 
                      download
                      className="p-2 rounded-lg bg-white text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200"
                      title="Download file"
                    >
                      <Download size="16" />
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveExistingFile}
                      className="p-2 rounded-lg bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                      title="Hapus file"
                    >
                      <Trash2 size="16" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload New File - Tampil jika tidak ada file atau file sudah dihapus */}
            {(!existingFile || formData.remove_file) && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-400 transition-all duration-200">
                <input
                  type="file"
                  id="file_tugas"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
                <label htmlFor="file_tugas" className="cursor-pointer block">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <Upload className="w-7 h-7 text-teal-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {formData.file_tugas ? formData.file_tugas.name : "Klik untuk upload file baru"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, ZIP (Max 10MB)
                  </p>
                </label>
                {formData.file_tugas && (
                  <button
                    type="button"
                    onClick={handleCancelRemoveFile}
                    className="mt-3 text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                  >
                    <X size="12" /> Hapus file yang dipilih
                  </button>
                )}
              </div>
            )}

            {/* Jika sudah hapus file dan belum upload baru, tampilkan opsi upload */}
            {formData.remove_file && !formData.file_tugas && (
              <div className="mt-3 text-center">
                <p className="text-xs text-amber-600 mb-2">⚠️ File lama telah dihapus. Silakan upload file baru.</p>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('file_tugas')?.click();
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Upload file baru
                </button>
              </div>
            )}

            {/* Preview untuk file yang baru dipilih */}
            {previewUrl && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-600 mb-2">Preview:</p>
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-48 rounded-lg object-contain" />
              </div>
            )}

            {/* Atau Link Eksternal */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Atau Gunakan Link Eksternal
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  name="file_link"
                  value={formData.file_link}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Masukkan link Google Drive, OneDrive, atau platform lainnya
              </p>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3">
            <Link
              to="/mentor/daftar-tugas"
              className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size="18" className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size="18" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTugas;