// src/pages/mentor/EditTugas.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Trash2,
  Upload,
  X,
  Link as LinkIcon,
  Globe,
  File,
  Eye,
  Download,
  ExternalLink,
  Clock,
  FileCheck
} from "lucide-react";
import { getMentorTugasById, updateMentorTugas } from "../../api/mentor/tugasService";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getPreviewUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\/storage\//, '');
  return `${API_BASE_URL}/api/storage/preview/${encodeURIComponent(cleanPath)}`;
};

const getDownloadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\/storage\//, '');
  return `${API_BASE_URL}/api/storage/download/${encodeURIComponent(cleanPath)}`;
};

const getFileNameFromPath = (path) => {
  if (!path) return null;
  const parts = path.split('/');
  return parts[parts.length - 1];
};

function EditTugas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [formData, setFormData] = useState({
    judul_tugas: "",
    deskripsi: "",
    tanggal_deadline: "",
    deadline_time: "23:59",
    bobot: "",
    file_tugas: null,
    file_link: ""
  });
  const [existingFiles, setExistingFiles] = useState([]);
  const [existingLink, setExistingLink] = useState("");
  const [uploadType, setUploadType] = useState("file");
  const [removeFiles, setRemoveFiles] = useState(false);
  const [removeLink, setRemoveLink] = useState(false);

  useEffect(() => {
    fetchTugasDetail();
  }, [id]);

  const fetchTugasDetail = async () => {
    try {
      const response = await getMentorTugasById(id);
      console.log("Tugas detail response:", response);
      
      if (response?.success && response?.data) {
        const tugas = response.data;
        
        let deadlineDate = "";
        let deadlineTime = "23:59";
        
        if (tugas.deadline) {
          const deadlineStr = tugas.deadline;
          console.log("Raw deadline:", deadlineStr);
          
          if (deadlineStr.includes(' ')) {
            const [date, time] = deadlineStr.split(' ');
            deadlineDate = date;
            deadlineTime = time.substring(0, 5);
          } else if (deadlineStr.includes('T')) {
            const [date, time] = deadlineStr.split('T');
            deadlineDate = date;
            deadlineTime = time.substring(0, 5);
          } else {
            deadlineDate = deadlineStr;
          }
        }
        
        setFormData({
          judul_tugas: tugas.judul || "",
          deskripsi: tugas.deskripsi || "",
          tanggal_deadline: deadlineDate,
          deadline_time: deadlineTime,
          bobot: tugas.bobot?.toString() || "",
          file_tugas: null,
          file_link: ""
        });
        
        if (tugas.file_urls && Array.isArray(tugas.file_urls) && tugas.file_urls.length > 0) {
          const files = tugas.file_urls.map(url => {
            const cleanPath = url.replace(/^\/storage\//, '');
            return {
              name: getFileNameFromPath(cleanPath) || 'file',
              url: getDownloadUrl(cleanPath),
              preview_url: getPreviewUrl(cleanPath),
              path: cleanPath
            };
          });
          setExistingFiles(files);
          setUploadType("file");
        } else if (tugas.file_tugas) {
          let filePath = tugas.file_tugas;
          if (typeof filePath === 'string') {
            try {
              const parsed = JSON.parse(filePath);
              if (Array.isArray(parsed)) {
                const files = parsed.map(path => ({
                  name: getFileNameFromPath(path) || 'file',
                  url: getDownloadUrl(path),
                  preview_url: getPreviewUrl(path),
                  path: path
                }));
                setExistingFiles(files);
              } else {
                setExistingFiles([{
                  name: getFileNameFromPath(filePath) || 'file',
                  url: getDownloadUrl(filePath),
                  preview_url: getPreviewUrl(filePath),
                  path: filePath
                }]);
              }
            } catch {
              setExistingFiles([{
                name: getFileNameFromPath(filePath) || 'file',
                url: getDownloadUrl(filePath),
                preview_url: getPreviewUrl(filePath),
                path: filePath
              }]);
            }
          }
          setUploadType("file");
        }
        
        if (tugas.file_links && Array.isArray(tugas.file_links) && tugas.file_links.length > 0) {
          setExistingLink(tugas.file_links[0]);
          setFormData(prev => ({ ...prev, file_link: tugas.file_links[0] }));
          setUploadType("link");
        } else if (tugas.file_link) {
          let link = tugas.file_link;
          if (typeof link === 'string') {
            try {
              const parsed = JSON.parse(link);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setExistingLink(parsed[0]);
                setFormData(prev => ({ ...prev, file_link: parsed[0] }));
              } else {
                setExistingLink(link);
                setFormData(prev => ({ ...prev, file_link: link }));
              }
            } catch {
              setExistingLink(link);
              setFormData(prev => ({ ...prev, file_link: link }));
            }
          }
          setUploadType("link");
        }
      } else {
        setError(response?.message || "Gagal memuat data tugas");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Gagal memuat data tugas");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB.");
        return;
      }
      setFormData(prev => ({ ...prev, file_tugas: file, file_link: "" }));
      setRemoveFiles(false);
      setRemoveLink(false);
      if (error) setError(null);
    }
  };

  const handleLinkChange = (e) => {
    const link = e.target.value;
    setFormData(prev => ({ ...prev, file_link: link, file_tugas: null }));
    setRemoveFiles(false);
    setRemoveLink(false);
    if (error) setError(null);
  };

  const handleRemoveFiles = () => {
    setExistingFiles([]);
    setFormData(prev => ({ ...prev, file_tugas: null }));
    setRemoveFiles(true);
  };

  const handleRemoveLink = () => {
    setExistingLink("");
    setFormData(prev => ({ ...prev, file_link: "" }));
    setRemoveLink(true);
  };

  const openPreviewModal = (url, type) => {
    if (url) {
      setPreviewUrl(url);
      setPreviewType(type);
      setShowPreviewModal(true);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewUrl("");
    setPreviewType("");
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'other';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  const validateForm = () => {
    if (!formData.judul_tugas.trim()) { setError("Judul tugas wajib diisi"); return false; }
    if (!formData.deskripsi.trim()) { setError("Deskripsi tugas wajib diisi"); return false; }
    if (!formData.tanggal_deadline) { setError("Tanggal deadline wajib diisi"); return false; }
    if (!formData.deadline_time) { setError("Waktu deadline wajib diisi"); return false; }
    if (formData.bobot && (parseFloat(formData.bobot) < 0 || parseFloat(formData.bobot) > 100)) {
      setError("Bobot harus antara 0-100"); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("judul", formData.judul_tugas);
      submitData.append("deskripsi", formData.deskripsi);
      
      const deadlineDateTime = `${formData.tanggal_deadline} ${formData.deadline_time}:00`;
      console.log("📅 Deadline dikirim:", deadlineDateTime);
      submitData.append("deadline", deadlineDateTime);
      
      if (formData.bobot) submitData.append("bobot", formData.bobot);
      
      if (formData.file_tugas) {
        submitData.append("file_tugas[]", formData.file_tugas);
        if (removeLink) submitData.append("remove_links", "true");
      } else if (formData.file_link && formData.file_link.trim()) {
        const linksArray = [formData.file_link.trim()];
        submitData.append("file_links", JSON.stringify(linksArray));
        if (removeFiles) submitData.append("remove_files", "true");
      } else {
        if (removeFiles) submitData.append("remove_files", "true");
        if (removeLink) submitData.append("remove_links", "true");
      }
      
      submitData.append("_method", "PUT");

      const response = await updateMentorTugas(id, submitData);
      
      if (response?.success) {
        setSuccess(true);
        setTimeout(() => navigate("/mentor/daftar-tugas"), 1500);
      } else {
        setError(response?.message || "Gagal mengupdate tugas");
      }
    } catch (err) {
      console.error("Error:", err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.data?.errors) setError(Object.values(err.response.data.errors).flat().join(", "));
      else setError(err.message || "Gagal mengupdate tugas");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        <p className="text-slate-500 text-sm ml-3">Memuat data tugas...</p>
      </div>
    );
  }

  const getDeadlineInfo = () => {
    if (!formData.tanggal_deadline || !formData.deadline_time) return null;
    const deadlineStr = `${formData.tanggal_deadline}T${formData.deadline_time}:00`;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) return { text: "Deadline sudah lewat", color: "text-red-600", bg: "bg-red-50" };
    if (diffHours < 24) return { text: `${diffHours} jam lagi`, color: "text-orange-600", bg: "bg-orange-50" };
    if (diffDays <= 3) return { text: `${diffDays} hari lagi`, color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: `${diffDays} hari lagi`, color: "text-green-600", bg: "bg-green-50" };
  };

  const deadlineInfo = getDeadlineInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div><h1 className="text-xl md:text-2xl font-bold text-slate-800">Edit Tugas</h1><p className="text-xs text-slate-500">Perbarui informasi tugas bimbingan</p></div>
          </div>
        </div>

        {success && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Save size="14" className="text-emerald-600" /><p className="text-sm font-semibold text-emerald-800">Berhasil! Tugas berhasil diperbarui.</p>
          </div>
        )}

        {error && !success && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-600" /><p className="text-sm text-red-600 flex-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Tugas <span className="text-red-500">*</span></label>
              <input type="text" name="judul_tugas" value={formData.judul_tugas} onChange={handleChange} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Tugas <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} required rows={3} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Materi Tugas</label>
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setUploadType("file")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${uploadType === "file" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}><Upload size="14" className="inline mr-1.5" />Upload File</button>
                <button type="button" onClick={() => setUploadType("link")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${uploadType === "link" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}><LinkIcon size="14" className="inline mr-1.5" />Link Eksternal</button>
              </div>

              {uploadType === "file" && (
                <div>
                  {existingFiles.length > 0 && !removeFiles ? (
                    <div className="space-y-2">
                      {existingFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                          <div className="flex items-center gap-3"><File size="18" className="text-teal-500" /><div><p className="text-sm font-medium text-slate-700">{file.name}</p><p className="text-[10px] text-teal-600">File saat ini</p></div></div>
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => openPreviewModal(file.preview_url, getFileType(file.name))} className="p-1.5 rounded-lg bg-white hover:bg-teal-500 hover:text-white"><Eye size="14" /></button>
                            <button type="button" onClick={() => window.open(file.url, '_blank')} className="p-1.5 rounded-lg bg-white hover:bg-teal-500 hover:text-white"><Download size="14" /></button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={handleRemoveFiles} className="w-full mt-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">Hapus Semua File</button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-teal-400">
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar" />
                      <Upload size="24" className="mx-auto text-slate-400 mb-1" /><p className="text-xs text-slate-600">Klik atau drag file ke sini</p>
                    </div>
                  )}
                </div>
              )}

              {uploadType === "link" && (
                <div>
                  {existingLink && !removeLink ? (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-3"><Globe size="18" className="text-indigo-500" /><div><p className="text-sm font-medium text-slate-700 truncate max-w-[300px]">{existingLink}</p><p className="text-[10px] text-indigo-600">Link saat ini</p></div></div>
                      <div className="flex gap-1.5">
                        <a href={existingLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white hover:bg-indigo-500 hover:text-white"><ExternalLink size="14" /></a>
                        <button type="button" onClick={handleRemoveLink} className="p-1.5 rounded-lg bg-white text-red-500 hover:bg-red-500 hover:text-white"><Trash2 size="14" /></button>
                      </div>
                    </div>
                  ) : (
                    <input type="url" name="file_link" value={formData.file_link} onChange={handleLinkChange} placeholder="https://drive.google.com/..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3"><Calendar size="16" className="text-teal-500" /><h3 className="text-sm font-semibold text-slate-700">Deadline <span className="text-red-500">*</span></h3></div>
              <div className="space-y-2">
                <input type="date" name="tanggal_deadline" value={formData.tanggal_deadline} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size="14" className="text-slate-400" />
                  </div>
                  <input
                    type="time"
                    name="deadline_time"
                    value={formData.deadline_time}
                    onChange={handleChange}
                    step="60"
                    className="w-full px-3 py-2 pl-9 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
                  />
                </div>
              </div>
              {deadlineInfo && <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium ${deadlineInfo.bg} ${deadlineInfo.color}`}>{deadlineInfo.text}</div>}
              <p className="text-[10px] text-slate-400 mt-2">Gunakan format 24 jam</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3"><FileCheck size="16" className="text-teal-500" /><h3 className="text-sm font-semibold text-slate-700">Bobot Nilai</h3></div>
              <input type="number" name="bobot" value={formData.bobot} onChange={handleChange} min="0" max="100" step="1" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="0 - 100" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate("/mentor/daftar-tugas")} className="px-5 py-2 border-2 border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 text-sm">Batal</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 text-sm">
                {submitting ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4" onClick={closePreviewModal}>
          <div className="relative z-[10000] bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2"><Eye size="16" className="text-teal-600" /><h3 className="text-md font-bold text-slate-800">Preview File</h3></div>
              <button onClick={closePreviewModal} className="p-1.5 rounded-lg hover:bg-slate-100"><X size="18" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50">
              {previewType === 'pdf' && <iframe src={previewUrl} className="w-full h-[70vh] rounded-xl" title="PDF Preview" />}
              {previewType === 'image' && <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] mx-auto object-contain rounded-xl" />}
              {(!previewType || (previewType !== 'pdf' && previewType !== 'image')) && (
                <div className="text-center py-12"><FileText size="48" className="mx-auto text-slate-400 mb-3" /><p className="text-slate-600 mb-4">Preview tidak tersedia</p><button onClick={() => window.open(previewUrl, '_blank')} className="px-4 py-2 bg-teal-500 text-white rounded-lg">Buka di tab baru</button></div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-3 border-t">
              <button onClick={closePreviewModal} className="px-4 py-1.5 border rounded-lg text-slate-600">Tutup</button>
              <a href={previewUrl} download className="px-4 py-1.5 bg-teal-500 text-white rounded-lg flex items-center gap-1"><Download size="14" />Download</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditTugas;