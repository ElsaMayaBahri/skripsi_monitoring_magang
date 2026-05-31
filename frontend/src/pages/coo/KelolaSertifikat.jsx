// frontend/src/pages/coo/KelolaSertifikat.jsx
import { useState, useEffect, useRef } from "react";
import { 
  Award, 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  GraduationCap,
  Briefcase,
  LayoutGrid,
  List,
  Download,
  Edit,
  Power,
  PowerOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import api from "../../api/axios";
import {
  getSertifikatTemplates,
  createSertifikatTemplate,
  updateSertifikatTemplate,
  deleteSertifikatTemplate,
  getSertifikat,
  getDivisiAktif
} from "../../api/coo/sertifikatService";

// Ambil base URL dari environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const KelolaSertifikat = () => {
  const [activeMainTab, setActiveMainTab] = useState('kompetensi');
  const [activeSubTab, setActiveSubTab] = useState('template');
  const [templates, setTemplates] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingSertifikat, setLoadingSertifikat] = useState(false);
  const [showModalTemplate, setShowModalTemplate] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [formTemplate, setFormTemplate] = useState({
    nama_template: '',
    jenis_sertifikat: 'kompetensi',
    divisi_id: '',
    is_active: true,
    file: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // State untuk preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cache untuk data yang sudah di-fetch
  const divisiFetched = useRef(false);
  const templatesCache = useRef({ kompetensi: [], magang: [] });
  const sertifikatCache = useRef({ kompetensi: [], magang: [] });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successDetail, setSuccessDetail] = useState("");
  const [successType, setSuccessType] = useState("");

  const showPremiumPopup = (message, detail, type = "success") => {
    setSuccessMessage(message);
    setSuccessDetail(detail);
    setSuccessType(type);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  // Fetch divisi hanya sekali
  useEffect(() => {
    if (!divisiFetched.current) {
      fetchDivisi();
    }
  }, []);

  // Fetch data saat activeMainTab berubah
  useEffect(() => {
    if (activeSubTab === 'template') {
      fetchTemplates();
    } else {
      fetchSertifikat();
    }
  }, [activeMainTab, activeSubTab]);

  // Handle ESC key untuk fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const fetchDivisi = async () => {
    try {
      const response = await getDivisiAktif();
      let divisiData = [];
      if (response && response.success && response.data) {
        divisiData = response.data;
      } else if (response && Array.isArray(response)) {
        divisiData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        divisiData = response.data;
      }
      setDivisiList(divisiData);
      divisiFetched.current = true;
    } catch (error) {
      console.error('Error fetching divisi:', error);
    }
  };

  const fetchTemplates = async () => {
    // Cek cache dulu
    if (templatesCache.current[activeMainTab]?.length > 0) {
      setTemplates(templatesCache.current[activeMainTab]);
      return;
    }
    
    setLoadingTemplates(true);
    try {
      const response = await getSertifikatTemplates(activeMainTab);
      let data = [];
      if (response && response.success && response.data) {
        data = response.data;
      } else if (response && Array.isArray(response)) {
        data = response;
      }
      // Simpan ke cache
      templatesCache.current[activeMainTab] = data;
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showPremiumPopup('Gagal', 'Gagal memuat data template', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchSertifikat = async () => {
    // Cek cache dulu
    if (sertifikatCache.current[activeMainTab]?.length > 0) {
      setSertifikatList(sertifikatCache.current[activeMainTab]);
      return;
    }
    
    setLoadingSertifikat(true);
    try {
      const response = await getSertifikat(activeMainTab);
      let data = [];
      if (response && response.success && response.data) {
        data = response.data;
      } else if (response && Array.isArray(response)) {
        data = response;
      }
      
      // Log untuk debugging
      if (data.length > 0) {
        console.log('Sample sertifikat data:', data[0]);
      }
      
      // Simpan ke cache
      sertifikatCache.current[activeMainTab] = data;
      setSertifikatList(data);
    } catch (error) {
      console.error('Error fetching sertifikat:', error);
      showPremiumPopup('Gagal', 'Gagal memuat data sertifikat', 'error');
    } finally {
      setLoadingSertifikat(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg')) {
      setFormTemplate({ ...formTemplate, file });
    } else {
      showPremiumPopup('Error', 'File harus berupa PDF, PNG, atau JPG', 'error');
    }
  };

  const uploadTemplate = async () => {
    if (!formTemplate.nama_template) {
      showPremiumPopup('Validasi Gagal', 'Nama template harus diisi', 'error');
      return;
    }

    if (!isEditMode && !formTemplate.file) {
      showPremiumPopup('Validasi Gagal', 'File template harus diupload', 'error');
      return;
    }

    if (formTemplate.jenis_sertifikat === 'kompetensi' && !formTemplate.divisi_id) {
      showPremiumPopup('Validasi Gagal', 'Divisi harus diisi untuk sertifikat kompetensi', 'error');
      return;
    }

    setLoadingTemplates(true);
    try {
      const formData = new FormData();
      formData.append('nama_template', formTemplate.nama_template);
      formData.append('jenis_sertifikat', formTemplate.jenis_sertifikat);
      if (formTemplate.divisi_id) formData.append('divisi_id', formTemplate.divisi_id);
      formData.append('is_active', formTemplate.is_active ? '1' : '0');
      if (formTemplate.file) formData.append('file', formTemplate.file);
      
      let response;
      if (isEditMode && editTemplateId) {
        response = await updateSertifikatTemplate(editTemplateId, formData);
      } else {
        response = await createSertifikatTemplate(formData);
      }

      if (response && response.success) {
        showPremiumPopup(
          'Berhasil', 
          isEditMode ? 'Template berhasil diperbarui' : 'Template berhasil diupload', 
          'success'
        );
        setShowModalTemplate(false);
        resetFormTemplate();
        setIsEditMode(false);
        setEditTemplateId(null);
        templatesCache.current[activeMainTab] = [];
        fetchTemplates();
      } else {
        showPremiumPopup('Gagal', response?.message || 'Gagal menyimpan template', 'error');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showPremiumPopup('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const openEditModal = (template) => {
    setIsEditMode(true);
    setEditTemplateId(template.id);
    setFormTemplate({
      nama_template: template.nama_template,
      jenis_sertifikat: template.jenis_sertifikat || activeMainTab,
      divisi_id: template.divisi_id || '',
      is_active: template.is_active === 1 || template.is_active === true,
      file: null
    });
    setShowModalTemplate(true);
  };

  const resetFormTemplate = () => {
    setFormTemplate({
      nama_template: '',
      jenis_sertifikat: activeMainTab,
      divisi_id: '',
      is_active: true,
      file: null
    });
  };

  const getDivisiName = (divisiId) => {
    const divisi = divisiList.find(d => d.id_divisi === divisiId || d.id === divisiId);
    return divisi ? (divisi.nama_divisi || divisi.nama) : '-';
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    return `${BASE_URL}/storage/${filePath}`;
  };

  // Cek apakah file adalah gambar
  const isImageFile = (url) => {
    return url.match(/\.(png|jpg|jpeg)$/i);
  };

  // Download template langsung (tanpa popup)
  const handleDownloadTemplate = async (template) => {
    if (!template?.id) {
      return;
    }
    
    try {
      const response = await api.get(`/sertifikat/templates/download/${template.id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = template.file_name || template.nama_template || 'template.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  // Download sertifikat langsung (tanpa popup)
  const handleDownloadSertifikat = async (sertifikat) => {
    const id = sertifikat.id_sertifikat || sertifikat.id;
    if (!id) {
      return;
    }
    
    try {
      const response = await api.get(`/sertifikat/download/${id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sertifikat_${sertifikat.peserta?.user?.nama || sertifikat.user?.nama || 'peserta'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading sertifikat:', error);
    }
  };

  // Handle pindah tab
  const handleMainTabChange = (tab) => {
    if (tab === activeMainTab) return;
    setActiveMainTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSubTabChange = (tab) => {
    if (tab === activeSubTab) return;
    setActiveSubTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const filteredTemplates = templates.filter(template =>
    template.nama_template?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredSertifikat = sertifikatList.filter(sert =>
    (sert.peserta?.user?.nama || sert.user?.nama || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sert.nomor_sertifikat?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const totalSertifikatPages = Math.ceil(filteredSertifikat.length / itemsPerPage);
  const paginatedSertifikat = filteredSertifikat.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fungsi untuk mendapatkan nama peserta dari berbagai struktur data
  const getNamaPeserta = (sertifikat) => {
    if (sertifikat.peserta?.user?.nama) return sertifikat.peserta.user.nama;
    if (sertifikat.user?.nama) return sertifikat.user.nama;
    if (sertifikat.peserta?.nama) return sertifikat.peserta.nama;
    return '-';
  };

  const isLoading = (activeSubTab === 'template' && loadingTemplates) || 
                    (activeSubTab === 'sertifikat' && loadingSertifikat);

  if (isLoading && 
      ((activeSubTab === 'template' && templates.length === 0) || 
       (activeSubTab === 'sertifikat' && sertifikatList.length === 0))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-zoomIn">
            <div className="relative">
              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
                successType === 'success' 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500'
              }`}></div>
              <div className="pt-8 pb-4 text-center">
                <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                  successType === 'success' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                }`}>
                  {successType === 'success' ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <div className="px-6 pb-2 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{successMessage}</h3>
                <p className="text-slate-500 text-sm mb-6">{successDetail}</p>
              </div>
              <div className="px-6 pb-8">
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className={`w-full py-3 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all ${
                    successType === 'success' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                      : 'bg-gradient-to-r from-red-600 to-rose-600'
                  }`}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL - PREMIUM FULLSCREEN STYLE */}
      {showPreview && (
        <div 
          className={`fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
            isFullscreen ? 'p-0' : 'pl-[280px] p-6'
          }`} 
          onClick={() => setShowPreview(false)}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isFullscreen 
                ? 'w-full h-full rounded-none' 
                : 'w-[1000px] max-w-[calc(100vw-340px)] max-h-[90vh]'
            }`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-sm">{previewName}</h3>
              </div>
              <div className="flex items-center gap-1">
                {/* Tombol Fullscreen HANYA muncul untuk preview TEMPLATE (file gambar), bukan untuk sertifikat */}
                {isImageFile(previewUrl) && (
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                )}
                <button
                  onClick={() => {
                    // Download from preview
                    if (previewUrl.includes('/storage/sertifikat_templates/')) {
                      const template = templates.find(t => getFileUrl(t.file_path) === previewUrl);
                      if (template) handleDownloadTemplate(template);
                    } else {
                      const sertifikat = sertifikatList.find(s => getFileUrl(s.file_sertifikat) === previewUrl);
                      if (sertifikat) handleDownloadSertifikat(sertifikat);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className={`bg-slate-100 flex items-center justify-center flex-1 overflow-auto ${
              isFullscreen ? 'p-4' : 'p-6'
            }`}>
              {isImageFile(previewUrl) ? (
                <img
                  src={previewUrl}
                  alt="Preview Template"
                  className="w-auto h-auto max-w-[95%] max-h-[85vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <iframe
                  src={`${previewUrl}#view=FitH&toolbar=0&navpanes=0`}
                  className="w-full h-[75vh] rounded-lg shadow-lg"
                  title="Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kelola Sertifikat</h1>
              <p className="text-sm text-slate-500 mt-0.5">Kelola template dan daftar sertifikat kompetensi & magang peserta</p>
            </div>
          </div>
        </div>

        {/* CARD UTAMA */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
          
          {/* TAB SECTION */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="px-6 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleMainTabChange('kompetensi')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                    activeMainTab === 'kompetensi'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Sertifikat Kompetensi
                </button>
                <button
                  onClick={() => handleMainTabChange('magang')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                    activeMainTab === 'magang'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Sertifikat Magang
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pb-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSubTabChange('template')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                      activeSubTab === 'template'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Template Sertifikat
                  </button>
                  <button
                    onClick={() => handleSubTabChange('sertifikat')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                      activeSubTab === 'sertifikat'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Daftar Sertifikat
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={activeSubTab === 'template' ? "Cari template..." : "Cari peserta atau nomor sertifikat..."}
                      className="w-64 pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                    />
                  </div>

                  {activeSubTab === 'template' && (
                    <button
                      onClick={() => {
                        resetFormTemplate();
                        setIsEditMode(false);
                        setEditTemplateId(null);
                        setFormTemplate(prev => ({ ...prev, jenis_sertifikat: activeMainTab }));
                        setShowModalTemplate(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Upload Template
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="p-6">
            
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-3 text-slate-500">Memuat data...</span>
              </div>
            )}

            {/* TEMPLATE TAB */}
            {!isLoading && activeSubTab === 'template' && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Template</th>
                        {activeMainTab === 'kompetensi' && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTemplates.map((template, index) => (
                        <tr key={template.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{template.nama_template}</span>
                              {template.is_active && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded-full">Aktif</span>
                              )}
                            </div>
                          </td>
                          {activeMainTab === 'kompetensi' && (
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {getDivisiName(template.divisi_id)}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setPreviewUrl(getFileUrl(template.file_path));
                                  setPreviewName(template.nama_template);
                                  setShowPreview(true);
                                }}
                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadTemplate(template)}
                                className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(template)}
                                className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedTemplates.length === 0 && (
                        <tr>
                          <td colSpan={activeMainTab === 'kompetensi' ? 4 : 3} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-slate-400" />
                              </div>
                              <p className="text-slate-400 text-sm">Belum ada template sertifikat</p>
                              <button
                                onClick={() => {
                                  resetFormTemplate();
                                  setFormTemplate(prev => ({ ...prev, jenis_sertifikat: activeMainTab }));
                                  setShowModalTemplate(true);
                                }}
                                className="mt-2 px-3 py-1.5 text-blue-600 text-xs font-medium hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                + Upload sekarang
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTemplates.length)} dari {filteredTemplates.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SERTIFIKAT TAB */}
            {!isLoading && activeSubTab === 'sertifikat' && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Sertifikat</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Terbit</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedSertifikat.map((sertifikat, index) => {
                        const namaPeserta = getNamaPeserta(sertifikat);
                        return (
                          <tr key={sertifikat.id_sertifikat || sertifikat.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                  {namaPeserta.charAt(0) || "?"}
                                </div>
                                <span className="font-medium text-slate-800 text-sm">{namaPeserta}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-slate-600">{sertifikat.nomor_sertifikat}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {sertifikat.tanggal_terbit ? new Date(sertifikat.tanggal_terbit).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setPreviewUrl(getFileUrl(sertifikat.file_sertifikat));
                                    setPreviewName(`Sertifikat - ${namaPeserta}`);
                                    setShowPreview(true);
                                  }}
                                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadSertifikat(sertifikat)}
                                  className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedSertifikat.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <Award className="w-6 h-6 text-slate-400" />
                              </div>
                              <p className="text-slate-400 text-sm">Belum ada sertifikat yang diterbitkan</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalSertifikatPages > 1 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSertifikat.length)} dari {filteredSertifikat.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalSertifikatPages, p + 1))}
                        disabled={currentPage === totalSertifikatPages}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Informasi:</strong> 
              {activeMainTab === 'kompetensi' 
                ? " Sertifikat kompetensi akan diterbitkan otomatis saat peserta lulus uji kompetensi. Template yang diupload akan digunakan untuk generate sertifikat."
                : " Sertifikat magang akan diterbitkan otomatis saat peserta menyelesaikan masa magang minimal 3 bulan. Template yang diupload akan digunakan untuk generate sertifikat."}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL UPLOAD/EDIT TEMPLATE */}
      {showModalTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {isEditMode ? 'Edit Template' : 'Upload Template'} {activeMainTab === 'kompetensi' ? 'Kompetensi' : 'Magang'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModalTemplate(false);
                  setIsEditMode(false);
                  setEditTemplateId(null);
                  resetFormTemplate();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Nama Template</label>
                <input
                  type="text"
                  value={formTemplate.nama_template}
                  onChange={(e) => setFormTemplate({ ...formTemplate, nama_template: e.target.value })}
                  placeholder="Contoh: Sertifikat Kompetensi Circle School Design"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
              </div>
              
              {activeMainTab === 'kompetensi' && (
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1.5">Divisi</label>
                  <select
                    value={formTemplate.divisi_id}
                    onChange={(e) => setFormTemplate({ ...formTemplate, divisi_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white"
                  >
                    <option value="">Pilih Divisi</option>
                    {divisiList.map(divisi => (
                      <option key={divisi.id_divisi || divisi.id} value={divisi.id_divisi || divisi.id}>
                        {divisi.nama_divisi || divisi.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">
                  File Template {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && <span className="text-xs text-slate-400 ml-2">(Kosongkan jika tidak ingin mengubah file)</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400 mt-1.5">PDF, PNG, JPG (maks 5MB)</p>
              </div>

              {isEditMode && (
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-600 text-sm font-medium">Status Template</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formTemplate.is_active 
                          ? "Template aktif akan digunakan untuk generate sertifikat" 
                          : "Template nonaktif tidak akan digunakan untuk generate sertifikat"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormTemplate({ ...formTemplate, is_active: !formTemplate.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formTemplate.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formTemplate.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowModalTemplate(false);
                  setIsEditMode(false);
                  setEditTemplateId(null);
                  resetFormTemplate();
                }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition-all"
              >
                Batal
              </button>
              <button
                onClick={uploadTemplate}
                disabled={loadingTemplates}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loadingTemplates ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isEditMode ? 'Simpan Perubahan' : 'Upload')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default KelolaSertifikat;