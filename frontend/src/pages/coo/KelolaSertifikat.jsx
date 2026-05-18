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
  List
} from 'lucide-react';
import {
  getSertifikatTemplates,
  createSertifikatTemplate,
  deleteSertifikatTemplate,
  getSertifikat,
  getDivisiAktif
} from "../../api/coo/sertifikatService";

const KelolaSertifikat = () => {
  const [activeMainTab, setActiveMainTab] = useState('kompetensi');
  const [activeSubTab, setActiveSubTab] = useState('template');
  const [templates, setTemplates] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingSertifikat, setLoadingSertifikat] = useState(false);
  const [showModalTemplate, setShowModalTemplate] = useState(false);
  const [formTemplate, setFormTemplate] = useState({
    nama_template: '',
    jenis_sertifikat: 'kompetensi',
    divisi_id: '',
    bidang_kompetensi: '',
    file: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

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
    }, 2500);
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
      // Simpan ke cache
      sertifikatCache.current[activeMainTab] = data;
      setSertifikatList(data);
    } catch (error) {
      console.error('Error fetching sertifikat:', error);
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
    if (!formTemplate.nama_template || !formTemplate.file) {
      showPremiumPopup('Validasi Gagal', 'Nama template dan file harus diisi', 'error');
      return;
    }

    if (formTemplate.jenis_sertifikat === 'kompetensi' && (!formTemplate.divisi_id || !formTemplate.bidang_kompetensi)) {
      showPremiumPopup('Validasi Gagal', 'Divisi dan bidang kompetensi harus diisi untuk sertifikat kompetensi', 'error');
      return;
    }

    setLoadingTemplates(true);
    try {
      const formData = new FormData();
      formData.append('nama_template', formTemplate.nama_template);
      formData.append('jenis_sertifikat', formTemplate.jenis_sertifikat);
      if (formTemplate.divisi_id) formData.append('divisi_id', formTemplate.divisi_id);
      if (formTemplate.bidang_kompetensi) formData.append('bidang_kompetensi', formTemplate.bidang_kompetensi);
      formData.append('file', formTemplate.file);

      const response = await createSertifikatTemplate(formData);

      if (response && response.success) {
        showPremiumPopup('Berhasil', 'Template sertifikat berhasil diupload', 'success');
        setShowModalTemplate(false);
        resetFormTemplate();
        // Clear cache dan reload
        templatesCache.current[activeMainTab] = [];
        fetchTemplates();
      } else {
        showPremiumPopup('Gagal', response?.message || 'Gagal upload template', 'error');
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      showPremiumPopup('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const deleteTemplateHandler = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus template ini?')) return;
    
    setLoadingTemplates(true);
    try {
      const response = await deleteSertifikatTemplate(id);
      if (response && response.success) {
        showPremiumPopup('Berhasil', 'Template berhasil dihapus', 'success');
        // Clear cache dan reload
        templatesCache.current[activeMainTab] = [];
        fetchTemplates();
      } else {
        showPremiumPopup('Gagal', response?.message || 'Gagal menghapus template', 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showPremiumPopup('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const resetFormTemplate = () => {
    setFormTemplate({
      nama_template: '',
      jenis_sertifikat: activeMainTab,
      divisi_id: '',
      bidang_kompetensi: '',
      file: null
    });
  };

  const getDivisiName = (divisiId) => {
    const divisi = divisiList.find(d => d.id_divisi === divisiId || d.id === divisiId);
    return divisi ? (divisi.nama_divisi || divisi.nama) : '-';
  };

  // Handle pindah tab dengan cepat
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
    template.nama_template?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.bidang_kompetensi?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredSertifikat = sertifikatList.filter(sert =>
    sert.user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sert.bidang_kompetensi?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (sert.nomor_sertifikat?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const totalSertifikatPages = Math.ceil(filteredSertifikat.length / itemsPerPage);
  const paginatedSertifikat = filteredSertifikat.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
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
              {/* Tab Jenis Sertifikat */}
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

              {/* Tab Menu + Search + Button Upload */}
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
                  {/* Search */}
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

                  {/* Button Upload */}
                  {activeSubTab === 'template' && (
                    <button
                      onClick={() => {
                        resetFormTemplate();
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
            
            {/* Loading indicator untuk transisi cepat */}
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
                          <>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bidang Kompetensi</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTemplates.map((template, index) => (
                        <tr key={template.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">{template.nama_template}</span>
                          </td>
                          {activeMainTab === 'kompetensi' && (
                            <>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {getDivisiName(template.divisi_id)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{template.bidang_kompetensi}</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-center">
                            <a
                              href={`http://localhost:8000/storage/${template.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-xs">Lihat</span>
                            </a>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => deleteTemplateHandler(template.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginatedTemplates.length === 0 && (
                        <tr>
                          <td colSpan={activeMainTab === 'kompetensi' ? 6 : 4} className="px-4 py-12 text-center">
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

                {/* Pagination */}
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                        {activeMainTab === 'kompetensi' && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bidang Kompetensi</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Sertifikat</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Terbit</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedSertifikat.map((sertifikat, index) => (
                        <tr key={sertifikat.id_sertifikat || sertifikat.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {sertifikat.user?.nama?.charAt(0) || "?"}
                              </div>
                              <span className="font-medium text-slate-800 text-sm">{sertifikat.user?.nama || "-"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {sertifikat.divisi?.nama_divisi || getDivisiName(sertifikat.divisi_id) || "-"}
                            </span>
                          </td>
                          {activeMainTab === 'kompetensi' && (
                            <td className="px-4 py-3 text-sm text-slate-600">{sertifikat.bidang_kompetensi}</td>
                          )}
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-600">{sertifikat.nomor_sertifikat}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {sertifikat.tanggal_terbit ? new Date(sertifikat.tanggal_terbit).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <a
                              href={`http://localhost:8000/storage/${sertifikat.file_sertifikat}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-xs">Lihat</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                      {paginatedSertifikat.length === 0 && (
                        <tr>
                          <td colSpan={activeMainTab === 'kompetensi' ? 7 : 6} className="px-4 py-12 text-center">
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

                {/* Pagination */}
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

      {/* MODAL UPLOAD TEMPLATE */}
      {showModalTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Upload Template {activeMainTab === 'kompetensi' ? 'Kompetensi' : 'Magang'}
                </h3>
              </div>
              <button
                onClick={() => setShowModalTemplate(false)}
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
                <>
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
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-1.5">Bidang Kompetensi</label>
                    <input
                      type="text"
                      value={formTemplate.bidang_kompetensi}
                      onChange={(e) => setFormTemplate({ ...formTemplate, bidang_kompetensi: e.target.value })}
                      placeholder="Contoh: Manajemen Pelatihan dan Pengelolaan Program Edukasi"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">File Template</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400 mt-1.5">PDF, PNG, JPG (maks 5MB)</p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
              <button
                onClick={() => setShowModalTemplate(false)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition-all"
              >
                Batal
              </button>
              <button
                onClick={uploadTemplate}
                disabled={loadingTemplates}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loadingTemplates ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Upload'}
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