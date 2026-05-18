// src/pages/mentor/LaporanAkhir.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Sparkles,
  Shield,
  Zap,
  Users,
  Loader2,
  ChevronDown
} from "lucide-react";
import { 
  getMentorLaporanAkhir
} from "../../api/mentor/laporanAkhirService";
import axiosInstance from "../../api/axios";
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import logo from "../../assets/logo.png";

function LaporanAkhir() {
  const [loading, setLoading] = useState(false);
  const [laporan, setLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [downloading, setDownloading] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    sudahUpload: 0,
    belumUpload: 0
  });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);
  
  // State untuk preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Helper untuk mendapatkan URL file
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    if (filePath.startsWith('/storage')) return `http://localhost:8000${filePath}`;
    if (filePath.startsWith('storage/')) return `http://localhost:8000/${filePath}`;
    if (filePath.startsWith('laporan/')) return `http://localhost:8000/storage/${filePath}`;
    return `http://localhost:8000/storage/${filePath}`;
  };

  // Fungsi untuk mendapatkan file blob untuk preview
  const getFileBlob = async (fileUrl) => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(fileUrl, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  // Fungsi preview file - di halaman yang sama (modal)
  const handlePreviewFile = async (laporanItem) => {
    if (!laporanItem.file_url && !laporanItem.id) {
      alert("File tidak tersedia");
      return;
    }
    
    setPreviewLoading(true);
    setShowPreviewModal(true);
    setPreviewTitle(laporanItem.peserta_nama || "Laporan Akhir");
    
    try {
      const fileUrl = getFileUrl(laporanItem.file_url || laporanItem.file_path);
      
      // Cek ekstensi file
      const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
      const isImage = fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
      
      if (isPdf || isImage) {
        // Untuk PDF dan gambar, langsung gunakan URL
        setPreviewUrl(fileUrl);
      } else {
        // Untuk file lain, coba buat blob URL
        const blob = await getFileBlob(fileUrl);
        const blobUrl = URL.createObjectURL(blob);
        setPreviewUrl(blobUrl);
      }
    } catch (error) {
      console.error("Preview error:", error);
      // Fallback: buka URL langsung
      const fileUrl = getFileUrl(laporanItem.file_url || laporanItem.file_path);
      setPreviewUrl(fileUrl);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Fungsi download file laporan langsung ke device
  const handleDownloadFile = async (laporanItem) => {
    if (!laporanItem.file_url && !laporanItem.id) {
      alert("File tidak tersedia");
      return;
    }
    
    setDownloading(laporanItem.id);
    try {
      let fileUrl = laporanItem.file_url || laporanItem.file_path;
      
      if (!fileUrl && laporanItem.file_path) {
        fileUrl = laporanItem.file_path;
      }
      
      if (!fileUrl) {
        alert("URL file tidak ditemukan");
        return;
      }
      
      if (!fileUrl.startsWith('http')) {
        if (fileUrl.startsWith('/storage')) {
          fileUrl = `http://localhost:8000${fileUrl}`;
        } else if (fileUrl.startsWith('storage/')) {
          fileUrl = `http://localhost:8000/${fileUrl}`;
        } else if (fileUrl.startsWith('laporan/')) {
          fileUrl = `http://localhost:8000/storage/${fileUrl}`;
        } else {
          fileUrl = `http://localhost:8000/storage/${fileUrl}`;
        }
      }
      
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(fileUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let extension = 'pdf';
      if (fileUrl.toLowerCase().includes('.pdf')) extension = 'pdf';
      else if (fileUrl.toLowerCase().includes('.doc')) extension = 'doc';
      else if (fileUrl.toLowerCase().includes('.docx')) extension = 'docx';
      else if (fileUrl.toLowerCase().includes('.jpg') || fileUrl.toLowerCase().includes('.jpeg')) extension = 'jpg';
      else if (fileUrl.toLowerCase().includes('.png')) extension = 'png';
      
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `laporan_${laporanItem.peserta_nama || 'akhir'}_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mendownload file. Silakan coba lagi.");
    } finally {
      setDownloading(null);
    }
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup blob URL saat modal ditutup
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format tanggal untuk PDF
  const formatDatePDF = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "-";
    }
  };

  // Escape HTML untuk keamanan
  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  // Fetch laporan dari backend
  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== "all") params.status = filterStatus;
      
      const response = await getMentorLaporanAkhir(params);
      
      if (response && response.success) {
        let laporanData = response.data || [];
        const formattedData = laporanData.map(item => ({
          ...item,
          file_url: getFileUrl(item.file_path || item.file_url)
        }));
        
        const sudahUpload = formattedData.filter(l => l.uploaded_at && l.status !== "not_uploaded").length;
        const belumUpload = formattedData.filter(l => !l.uploaded_at || l.status === "not_uploaded").length;
        
        let summaryData = {
          total: formattedData.length,
          sudahUpload: sudahUpload,
          belumUpload: belumUpload
        };
        
        setLaporan(formattedData);
        setFilteredLaporan(formattedData);
        setSummary(summaryData);
      } else {
        setLaporan([]);
        setFilteredLaporan([]);
      }
    } catch (error) {
      console.error("Error fetching laporan:", error);
      setLaporan([]);
      setFilteredLaporan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  useEffect(() => {
    let filtered = [...laporan];
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        (l.peserta_nama && l.peserta_nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.judul && l.judul.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterStatus !== "all") {
      if (filterStatus === "uploaded") {
        filtered = filtered.filter(l => l.status !== "not_uploaded" && l.uploaded_at);
      } else if (filterStatus === "not_uploaded") {
        filtered = filtered.filter(l => !l.uploaded_at || l.status === "not_uploaded");
      }
    }
    
    setFilteredLaporan(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, laporan]);

  // Export ke Excel
  const handleExportExcel = () => {
    if (filteredLaporan.length === 0 && laporan.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }
    
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const dataToExport = filteredLaporan.length > 0 ? filteredLaporan : laporan;
      
      // 🔥 HAPUS KOLOM DIVISI DI EXCEL
      const exportData = dataToExport.map((item, index) => ({
        "No": index + 1,
        "Nama Peserta": item.peserta_nama || '-',
        "Judul Laporan": item.judul || '-',
        "Tanggal Upload": item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID') : 'Belum upload',
        "Status": item.uploaded_at ? 'Sudah Upload' : 'Belum Upload',
        "Nama File": item.file_name || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Akhir");
      
      ws['!cols'] = [
        {wch:5}, {wch:30}, {wch:50}, {wch:20}, {wch:15}, {wch:35}
      ];
      
      const fileName = `laporan_akhir_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Gagal mengexport ke Excel: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export ke PDF
  const handleExportPDF = () => {
    if (filteredLaporan.length === 0 && laporan.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }
    
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const dataToExport = filteredLaporan.length > 0 ? filteredLaporan : laporan;
      const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const element = document.createElement('div');
      element.style.padding = '30px';
      element.style.fontFamily = "'Times New Roman', Arial, sans-serif";
      element.style.backgroundColor = 'white';
      element.style.width = '100%';
      
      // 🔥 HAPUS KOLOM DIVISI DI PDF TABLE
      let tableRows = '';
      dataToExport.forEach((item, index) => {
        const statusText = item.uploaded_at ? 'Sudah Upload' : 'Belum Upload';
        const statusColor = item.uploaded_at ? '#16a34a' : '#d97706';
        
        tableRows += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(item.peserta_nama || '-')}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(item.judul || '-')}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.uploaded_at ? formatDatePDF(item.uploaded_at) : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;"><span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></td>
          </tr>
        `;
      });
      
      if (dataToExport.length === 0) {
        tableRows = `
          <tr>
            <td colspan="5" style="border: 1px solid #cbd5e1; padding: 40px; text-align: center; color: #94a3b8;">Tidak ada data laporan</td>
          </tr>
        `;
      }
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <img src="${logo}" alt="Logo Perusahaan" style="height: 60px; width: auto;" />
            <div style="text-align: left;">
              <h1 style="color: #1e3a5f; margin: 0; font-size: 24px;">PT KUANTA PRIMA INDONESIA</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 10px;">Jl. Gayungsari IV No. 33 Surabaya</p>
              <p style="color: #64748b; margin: 2px 0 0 0; font-size: 10px;">+62 821-4338-0273 | partnership@kuanta.id</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 20px;">LAPORAN AKHIR MAGANG</h2>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 12px;">Kuanta Academy - Sistem Monitoring Magang</p>
          ${searchTerm ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">Pencarian: ${escapeHtml(searchTerm)}</p>` : ''}
          ${filterStatus !== "all" ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">Filter Status: ${filterStatus === "uploaded" ? "Sudah Upload" : "Belum Upload"}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px; text-align: right;">
          <p style="color: #94a3b8; font-size: 10px; margin: 0;">Dicetak: ${today}</p>
        </div>
        
        <div style="display: flex; gap: 15px; margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #2563eb;">${summary.total}</div>
            <div style="font-size: 10px; color: #64748b;">Total Peserta</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #16a34a;">${summary.sudahUpload}</div>
            <div style="font-size: 10px; color: #64748b;">Sudah Upload</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #d97706;">${summary.belumUpload}</div>
            <div style="font-size: 10px; color: #64748b;">Belum Upload</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #1e3a5f;">
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Nama Peserta</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Judul Laporan</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Tanggal Upload</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Status</th>
             </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
         </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #cbd5e1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: left;">
              <p style="font-size: 9px; color: #94a3b8; margin: 0;">Dokumen ini dicetak secara elektronik</p>
              <p style="font-size: 9px; color: #94a3b8; margin: 2px 0 0 0;">&copy; ${new Date().getFullYear()} PT Kuanta Prima Indonesia - All Rights Reserved</p>
            </div>
            <div style="text-align: right;">
              <div style="margin-top: 30px;">
                <p style="font-size: 10px; margin: 0;">Surabaya, ${today}</p>
                <p style="font-size: 10px; margin: 20px 0 0 0;">Mentor</p>
                <div style="margin-top: 30px;">
                  <p style="font-size: 10px; margin: 0; text-decoration: underline;">(_____________________)</p>
                  <p style="font-size: 9px; color: #64748b; margin: 2px 0 0 0;">Nama Lengkap & Tanda Tangan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `laporan_akhir_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Gagal mengexport ke PDF: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status, uploadedAt) => {
    const hasUploaded = uploadedAt || (status !== "not_uploaded");
    
    if (hasUploaded) {
      return { bg: "bg-gradient-to-r from-teal-500/20 to-emerald-500/20", text: "text-teal-600", icon: CheckCircle, label: "Sudah Upload", border: "border-teal-200" };
    }
    return { bg: "bg-gradient-to-r from-slate-500/10 to-slate-600/10", text: "text-slate-500", icon: Clock, label: "Belum Upload", border: "border-slate-200" };
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLaporan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
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
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="relative mb-10 rounded-2xl overflow-visible">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15"></div>
          </div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                      Laporan Akhir
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Lihat dan download laporan akhir magang peserta</p>
                  </div>
                </div>
              </div>
              
              {/* Export Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowExportDropdown(!showExportDropdown)} 
                  disabled={isExporting}
                  className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 size="16" className="animate-spin" />
                  ) : (
                    <Download size="16" />
                  )}
                  <span>{isExporting ? "Memproses..." : "Unduh Laporan"}</span>
                  {!isExporting && <ChevronDown size="14" className={`transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                
                {showExportDropdown && !isExporting && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[100]">
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-colors border-b border-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FileText size="14" className="text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Export ke Excel</p>
                        <p className="text-[10px] text-slate-400">Format .xlsx</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText size="14" className="text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Export ke PDF</p>
                        <p className="text-[10px] text-slate-400">Format .pdf</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-2"><Users size="16" className="text-teal-600" /></div>
              <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{summary.total}</p>
              <p className="text-[10px] text-slate-500 mt-1">Total Peserta</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2"><FileText size="16" className="text-blue-600" /></div>
              <p className="text-2xl font-bold text-blue-600">{summary.sudahUpload}</p>
              <p className="text-[10px] text-slate-500 mt-1">Sudah Upload</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2"><AlertCircle size="16" className="text-amber-600" /></div>
              <p className="text-2xl font-bold text-amber-600">{summary.belumUpload}</p>
              <p className="text-[10px] text-slate-500 mt-1">Belum Upload</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" /></div>
              <input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
              <option value="all">Semua Status</option>
              <option value="uploaded">Sudah Upload</option>
              <option value="not_uploaded">Belum Upload</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />Menampilkan <span className="font-bold text-slate-700">{currentItems.length}</span> dari <span className="font-bold text-slate-700">{filteredLaporan.length}</span> laporan</p></div>

        {/* Laporan Table - 🔥 HAPUS KOLOM DIVISI */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Upload</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item) => {
                  const status = getStatusBadge(item.status, item.uploaded_at);
                  const StatusIcon = status.icon;
                  const isDownloading = downloading === item.id;
                  const hasUploaded = item.uploaded_at || (item.status !== "not_uploaded");
                  
                  return (
                    <tr key={item.id || item.peserta_id} className="transition-colors duration-200 hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {item.peserta_nama?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.peserta_nama}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-400">{item.peserta_divisi}</span>
                            </div>
                            {item.judul && <p className="text-[10px] text-slate-400 truncate max-w-[250px] mt-0.5">{item.judul}</p>}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        {hasUploaded ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center"><Calendar size="12" className="text-teal-500" /></div>
                            <div><span className="text-xs font-medium text-slate-700">{item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID') : '-'}</span><p className="text-[10px] text-slate-400">{item.uploaded_at ? new Date(item.uploaded_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '-'}</p></div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center"><Clock size="12" className="text-slate-400" /></div>Belum upload</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border ${status.border} shadow-sm`}><StatusIcon size="10" /><span className="text-[10px] font-semibold">{status.label}</span></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {hasUploaded ? (
                            <>
                              <button 
                                onClick={() => handlePreviewFile(item)} 
                                className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all duration-200" 
                                title="Lihat Laporan"
                              >
                                <Eye size="14" />
                              </button>
                              <button 
                                onClick={() => handleDownloadFile(item)} 
                                disabled={isDownloading} 
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 disabled:opacity-50" 
                                title="Download"
                              >
                                {isDownloading ? <Loader2 size="14" className="animate-spin" /> : <Download size="14" />}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic flex items-center gap-1.5"><div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center"><Clock size="10" className="text-slate-400" /></div>Menunggu upload</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLaporan.length === 0 && !loading && (
            <div className="py-16 text-center">
              <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><FileText size="32" className="text-slate-400" /></div></div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data laporan</p><p className="text-sm text-slate-400 mt-1">Belum ada laporan yang diupload peserta</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman <span className="font-bold text-slate-700">{currentPage}</span> dari <span className="font-bold text-slate-700">{totalPages}</span></p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i;
                    return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{currentPage === pageNum && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 -z-10"></div>}{pageNum}</button>);
                  })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div><p className="text-sm font-bold text-teal-800">Informasi Laporan Akhir</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Halaman ini digunakan untuk melihat dan mendownload laporan akhir yang telah diupload oleh peserta magang. Klik ikon mata untuk preview laporan di halaman yang sama, atau ikon download untuk menyimpan file langsung ke perangkat Anda.</p></div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md">
                  <FileText size="16" className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Preview Laporan Akhir</h3>
                  <p className="text-xs text-slate-500">{previewTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (previewUrl && previewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setShowPreviewModal(false);
                    setPreviewUrl("");
                  }} 
                  className="p-2 rounded-lg bg-white/80 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X size="18" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              {previewLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  <span className="ml-3 text-slate-600">Memuat preview...</span>
                </div>
              ) : previewUrl ? (
                previewUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-[70vh] rounded-lg border-0" 
                    title="Preview Laporan"
                  />
                ) : previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                  <div className="flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <FileText size="48" className="text-slate-400 mb-4" />
                    <p className="text-slate-600 font-medium">File tidak dapat dipreview</p>
                    <p className="text-sm text-slate-400 mt-1">Silakan download file untuk melihat isinya</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <AlertCircle size="48" className="text-slate-400 mb-4" />
                  <p className="text-slate-600 font-medium">Gagal memuat preview</p>
                  <p className="text-sm text-slate-400 mt-1">Silakan coba lagi atau download file</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => {
                  if (previewUrl && previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setShowPreviewModal(false);
                  setPreviewUrl("");
                }} 
                className="px-5 py-2 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 0.2s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
      `}</style>
    </div>
  );
}

export default LaporanAkhir;