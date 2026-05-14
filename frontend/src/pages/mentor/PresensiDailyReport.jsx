// src/pages/mentor/PresensiDailyReport.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Target,
  TrendingUp,
  Eye,
  Send,
  Loader2,
  Users,
  Search,
  XCircle,
  Sparkles,
  Shield,
  Zap,
  Wifi,
  Smartphone,
  FileSpreadsheet,
  File,
  X,
  CalendarRange,
  Filter,
  ChevronDown,
  UserCheck,
  BarChart3
} from "lucide-react";
import { 
  getAllDailyReports,
  getDailyReport, 
  submitDailyReportFeedback
} from "../../api/mentor/dailyReportService";
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import logo from "../../assets/logo.png";

function PresensiDailyReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pesertaId = searchParams.get("peserta");
  const viewMode = searchParams.get("view") || "list";
  const tanggalParam = searchParams.get("tanggal");
  
  const [filterType, setFilterType] = useState("single");
  const [startDate, setStartDate] = useState(tanggalParam || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(tanggalParam || new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(tanggalParam || new Date().toISOString().split('T')[0]);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailReport, setSelectedDetailReport] = useState(null);
  
  const [summary, setSummary] = useState({
    total: 0,
    sudahMengisi: 0,
    belumMengisi: 0,
    persentase: 0
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (viewMode === "list") {
      fetchDailyReports();
    } else if (viewMode === "detail" && pesertaId) {
      fetchDailyReportDetail();
    }
  }, [selectedDate, startDate, endDate, filterType, viewMode, pesertaId]);

  const fetchDailyReports = async () => {
    setLoading(true);
    try {
      let params = {};
      
      if (filterType === "single") {
        params.tanggal = selectedDate;
      } else {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await getAllDailyReports(params);
      
      if (response && response.success) {
        const reports = response.data || [];
        const summaryData = response.summary || {
          total: reports.length,
          sudahMengisi: reports.filter(r => r.aktivitas && r.aktivitas !== null && r.aktivitas !== "").length,
          belumMengisi: reports.length - reports.filter(r => r.aktivitas && r.aktivitas !== null && r.aktivitas !== "").length,
          persentase: reports.length > 0 ? Math.round((reports.filter(r => r.aktivitas && r.aktivitas !== null && r.aktivitas !== "").length / reports.length) * 100) : 0
        };
        
        setAllReports(reports);
        setFilteredReports(reports);
        setSummary(summaryData);
      } else {
        setAllReports([]);
        setFilteredReports([]);
        setSummary({ total: 0, sudahMengisi: 0, belumMengisi: 0, persentase: 0 });
      }
    } catch (error) {
      console.error("Error fetching daily reports:", error);
      setAllReports([]);
      setFilteredReports([]);
      setSummary({ total: 0, sudahMengisi: 0, belumMengisi: 0, persentase: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReportDetail = async () => {
    setLoading(true);
    try {
      const response = await getDailyReport(pesertaId, selectedDate);
      
      if (response && response.success && response.data) {
        const data = response.data;
        setSelectedPeserta({
          nama: data.nama || "Peserta",
          divisi: data.divisi || "-",
          check_in: data.check_in || null,
          check_out: data.check_out || null,
          status: data.status || "alpha",
          aktivitas: data.aktivitas || null,
          kendala: data.kendala || null,
          lokasi: data.lokasi || "-",
          device: data.device || "-",
          tanggal: data.tanggal
        });
        setReviewText(data.feedback || "");
      } else {
        setSelectedPeserta({
          nama: "Peserta",
          divisi: "-",
          check_in: null,
          check_out: null,
          status: "alpha",
          aktivitas: null,
          kendala: null,
          lokasi: "-",
          device: "-",
          tanggal: selectedDate
        });
        setReviewText("");
      }
    } catch (error) {
      console.error("Error fetching daily report detail:", error);
      setSelectedPeserta({
        nama: "Peserta",
        divisi: "-",
        check_in: null,
        check_out: null,
        status: "alpha",
        aktivitas: null,
        kendala: null,
        lokasi: "-",
        device: "-",
        tanggal: selectedDate
      });
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!reviewText.trim() || !pesertaId) return;
    
    setSubmitting(true);
    try {
      const response = await submitDailyReportFeedback(pesertaId, selectedDate, reviewText);
      
      if (response && response.success) {
        alert("Feedback berhasil dikirim!");
        await fetchDailyReportDetail();
      } else {
        alert("Gagal mengirim feedback: " + (response?.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.response?.data?.message || "Gagal mengirim feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const showConfirmExport = (type) => {
    setExportType(type);
    setShowConfirmModal(true);
    setShowExportDropdown(false);
  };

  const executeExport = async () => {
    setShowConfirmModal(false);
    setIsExporting(true);
    
    try {
      if (exportType === 'excel') {
        handleExportExcel();
      } else if (exportType === 'pdf') {
        handleExportPDF();
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengexport laporan");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const getNamaPeserta = (item) => {
    return item.peserta_nama || item.nama || "-";
  };

  const getDivisiPeserta = (item) => {
    return item.peserta_divisi || item.divisi || "-";
  };

  // src/pages/mentor/PresensiDailyReport.jsx

// Ganti fungsi formatDateTime dengan ini
const formatDateTime = (dateTime) => {
  if (!dateTime) return "-";
  
  // Jika data sudah dalam format waktu saja (HH:MM atau HH:MM:SS)
  if (typeof dateTime === 'string') {
    // Cek format HH:MM (misal "08:30")
    if (dateTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return dateTime;
    }
    // Cek format HH:MM:SS (misal "08:30:00")
    if (dateTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
      // Ambil hanya jam dan menit
      const parts = dateTime.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  // Coba parse sebagai Date object
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "-";
    
    // Format hanya jam:menit
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return "-";
  }
};

// Ganti fungsi formatDateOnly dengan ini
const formatDateOnly = (dateTime) => {
  if (!dateTime) return "-";
  
  // Jika data sudah dalam format tanggal (YYYY-MM-DD)
  if (typeof dateTime === 'string' && dateTime.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateTime.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  }
  
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return "-";
  }
};

  const handleExportExcel = () => {
  const exportData = filteredReports.map((item, index) => ({
    "No": index + 1,
    "Nama Peserta": getNamaPeserta(item),
    "Divisi": getDivisiPeserta(item),
    "Tanggal": formatDateOnly(item.tanggal || selectedDate),
    "Check-In": formatDateTime(item.check_in),
    "Check-Out": formatDateTime(item.check_out),
    "Status Kehadiran": item.status_kehadiran || "-",
    "Aktivitas": item.aktivitas || "-",
    "Kendala": item.kendala || "-",
    "Lokasi": item.lokasi || "-",
    "Device": item.device || "-"
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Daily Report");
  
  const fileName = `daily_report_${filterType === "single" ? selectedDate : `${startDate}_to_${endDate}`}.xlsx`;
  XLSX.writeFile(wb, fileName);
  // ALERT DIHAPUS - langsung download
};

// Ganti fungsi handleExportPDF dengan ini (hapus alert)
const handleExportPDF = () => {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
    
     const startDateFormatted = filterType === "single" ? formatDatePDF(selectedDate) : (startDate ? formatDatePDF(startDate) : "Semua");
  const endDateFormatted = filterType === "single" ? formatDatePDF(selectedDate) : (endDate ? formatDatePDF(endDate) : "Semua");
  
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.fontFamily = "'Times New Roman', Arial, sans-serif";
  element.style.backgroundColor = 'white';
  
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
      <h2 style="color: #1e293b; margin: 0; font-size: 20px;">LAPORAN DAILY REPORT PESERTA MAGANG</h2>
      <p style="color: #64748b; margin: 8px 0 0 0; font-size: 12px;">Periode: ${startDateFormatted} s/d ${endDateFormatted}</p>
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
        <div style="font-size: 22px; font-weight: bold; color: #16a34a;">${summary.sudahMengisi}</div>
        <div style="font-size: 10px; color: #64748b;">Sudah Mengisi</div>
      </div>
      <div style="flex: 1; text-align: center;">
        <div style="font-size: 22px; font-weight: bold; color: #d97706;">${summary.belumMengisi}</div>
        <div style="font-size: 10px; color: #64748b;">Belum Mengisi</div>
      </div>
      <div style="flex: 1; text-align: center;">
        <div style="font-size: 22px; font-weight: bold; color: #7c3aed;">${summary.persentase}%</div>
        <div style="font-size: 10px; color: #64748b;">Partisipasi</div>
      </div>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
      <thead>
        <tr>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: center;">No</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: left;">Nama Peserta</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: left;">Divisi</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: center;">Tanggal</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: center;">Check-In</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: center;">Check-Out</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: center;">Status</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #1e3a5f; color: white; text-align: left;">Aktivitas</th>
        </tr>
      </thead>
      <tbody>
        ${filteredReports.map((item, index) => `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${getNamaPeserta(item)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${getDivisiPeserta(item)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${formatDateOnly(item.tanggal || selectedDate)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${formatDateTime(item.check_in)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${formatDateTime(item.check_out)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.status_kehadiran || '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.aktivitas || '-'}</td>
          </tr>
        `).join('')}
        ${filteredReports.length === 0 ? `
          <tr>
            <td colspan="8" style="border: 1px solid #cbd5e1; padding: 40px; text-align: center; color: #94a3b8;">Tidak ada data daily report</td>
          </tr>
        ` : ''}
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
    filename: `daily_report_${filterType === "single" ? selectedDate : `${startDate}_to_${endDate}`}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  };
  
  html2pdf().set(opt).from(element).save();
  // ALERT DIHAPUS - langsung download
};

  const openDetailModal = (report) => {
    setSelectedDetailReport(report);
    setShowDetailModal(true);
  };

  const getKehadiranBadge = (status) => {
    switch(status?.toLowerCase()) {
      case "hadir":
        return { bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", text: "text-emerald-600", icon: CheckCircle, label: "Hadir", border: "border-emerald-200" };
      case "terlambat":
        return { bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", text: "text-amber-600", icon: AlertCircle, label: "Terlambat", border: "border-amber-200" };
      case "izin":
        return { bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20", text: "text-blue-600", icon: FileText, label: "Izin", border: "border-blue-200" };
      default:
        return { bg: "bg-gradient-to-r from-rose-500/20 to-red-500/20", text: "text-rose-600", icon: XCircle, label: "Tidak Hadir", border: "border-rose-200" };
    }
  };

  const formatDate = (dateString) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date(dateString);
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setSearchParams({ view: "list", tanggal: newDateStr });
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = allReports.filter(r => 
        r.peserta_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.peserta_divisi && r.peserta_divisi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredReports(filtered);
      setCurrentPage(1);
    } else {
      setFilteredReports(allReports);
    }
  }, [searchTerm, allReports]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Detail Modal Component
  const DetailModal = ({ report, onClose }) => {
    if (!report) return null;
    const kehadiran = getKehadiranBadge(report.status_kehadiran);
    const KehadiranIcon = kehadiran.icon;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-zoomIn">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md">
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Detail Laporan Harian</h3>
                <p className="text-xs text-slate-400">{report.peserta_nama} - {report.tanggal ? formatDate(report.tanggal) : formatDate(selectedDate)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={20} className="text-slate-400" /></button>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {report.peserta_nama?.charAt(0) || "P"}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{report.peserta_nama}</h4>
                <p className="text-sm text-slate-500">{report.peserta_divisi || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm text-slate-600">Status Kehadiran</span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border}`}>
                <KehadiranIcon size={12} />
                <span className="text-xs font-semibold">{kehadiran.label}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-teal-600" />
                  <span className="text-xs font-medium text-teal-600">Check In</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatDateTime(report.check_in) || "-"}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">Check Out</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatDateTime(report.check_out) || "-"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-600">Lokasi</span>
                </div>
                <p className="text-sm text-slate-700">{report.lokasi || "-"}</p>
              </div>
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  {report.device === "Web" ? <Wifi size={14} className="text-slate-600" /> : <Smartphone size={14} className="text-slate-600" />}
                  <span className="text-xs font-medium text-slate-600">Device</span>
                </div>
                <p className="text-sm text-slate-700">{report.device || "-"}</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-teal-600" />
                <span className="text-xs font-medium text-teal-600">Aktivitas Hari Ini</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.aktivitas || "Belum mengisi aktivitas"}</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-amber-600" />
                <span className="text-xs font-medium text-amber-600">Kendala</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.kendala || "Tidak ada kendala"}</p>
            </div>
            
            {report.feedback && (
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={14} className="text-teal-600" />
                  <span className="text-xs font-medium text-teal-600">Feedback Mentor</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.feedback}</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white text-sm font-semibold">Tutup</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && viewMode === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
        </div>
      </div>
    );
  }

  // View Detail
  if (viewMode === "detail" && selectedPeserta) {
    const kehadiran = getKehadiranBadge(selectedPeserta.status);
    const KehadiranIcon = kehadiran.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative p-6 lg:p-8 max-w-[1200px] mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => setSearchParams({ view: "list", tanggal: selectedDate })}
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all duration-300 mb-4"
            >
              <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:bg-teal-50 transition-colors">
                <ArrowLeft size="14" />
              </div>
              <span className="text-sm font-medium">Kembali ke Daftar</span>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Presensi & Daily Report
                  </h1>
                </div>
                <p className="text-sm text-slate-500">
                  {selectedPeserta?.nama} - {formatDate(selectedDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-6">
                <div className="relative bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-8 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50"></div>
                      <div className="relative w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/30">
                        <span className="text-4xl font-bold text-white">{selectedPeserta?.nama?.charAt(0) || "P"}</span>
                      </div>
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">{selectedPeserta?.nama}</h2>
                    <p className="text-white/80 text-sm">{selectedPeserta?.divisi}</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Tanggal</span>
                    <span className="text-sm font-semibold text-slate-700">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Check In</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Clock size="12" className="text-teal-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.check_in || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Check Out</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Clock size="12" className="text-purple-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.check_out || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Lokasi</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <MapPin size="12" className="text-indigo-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.lokasi || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Device</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        {selectedPeserta?.device === "Web" ? <Wifi size="12" className="text-slate-500" /> : <Smartphone size="12" className="text-slate-500" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.device || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Status Kehadiran</span>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border}`}>
                      <KehadiranIcon size="10" />
                      <span className="text-xs font-semibold">{kehadiran.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-sm">
                      <FileText size="12" className="text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Laporan Harian</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-50">
                        <Target size="14" className="text-teal-600" />
                      </div>
                      Aktivitas Hari Ini
                    </h4>
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPeserta?.aktivitas || "Belum mengisi aktivitas"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-50">
                        <AlertCircle size="14" className="text-amber-600" />
                      </div>
                      Kendala
                    </h4>
                    <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100">
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPeserta?.kendala || "Tidak ada kendala"}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-50">
                        <MessageSquare size="14" className="text-teal-600" />
                      </div>
                      Berikan Feedback / Catatan
                    </label>
                    <div className="relative">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tulis feedback atau catatan untuk peserta..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
                        rows="4"
                      />
                      <button 
                        onClick={submitFeedback}
                        disabled={submitting || !reviewText.trim()}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                      >
                        {submitting ? <Loader2 size="14" className="animate-spin" /> : <Send size="14" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View List
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      
      {/* CONFIRMATION MODAL - HIGH Z-INDEX */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-zoomIn relative z-[10000]">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-t-2xl"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 rounded-xl">
                    <Download className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Konfirmasi Unduh Laporan</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Apakah Anda yakin ingin mengunduh laporan daily report dalam format <strong className="text-teal-600">{exportType?.toUpperCase()}</strong>?
                  <br />
                  <span className="text-sm text-slate-400">Data yang diunduh sesuai dengan filter yang sedang aktif.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setExportType(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeExport}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    Ya, Unduh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY SAAT EXPORT */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-slate-600 font-medium">Sedang memproses...</p>
            <p className="text-xs text-slate-400">Mohon tunggu</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header - FIXED: overflow-hidden changed to overflow-visible */}
        <div className="relative mb-10 rounded-2xl overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl -z-10"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Presensi & Daily Report
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Rekap check-in, check-out, dan laporan harian peserta</p>
                </div>
              </div>
            </div>
            
            {/* Export Dropdown - FIXED: Proper z-index and positioning */}
            <div className="relative inline-block" ref={dropdownRef} style={{ zIndex: 9999 }}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={isExporting || filteredReports.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Unduh Laporan
                <ChevronDown size={16} className={`transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown menu - HIGH Z-INDEX to ensure it's on top */}
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[10000]">
                  <button
                    onClick={() => showConfirmExport('excel')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-colors border-b border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FileSpreadsheet size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Export ke Excel</p>
                      <p className="text-[10px] text-slate-400">Format .xlsx</p>
                    </div>
                  </button>
                  <button
                    onClick={() => showConfirmExport('pdf')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <FileText size={16} className="text-red-600" />
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

        {/* Filter Controls - unchanged */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setFilterType("single")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === "single" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Calendar size="14" className="inline mr-1" />
                Per Hari
              </button>
              <button
                onClick={() => setFilterType("range")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === "range" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <CalendarRange size="14" className="inline mr-1" />
                Range Tanggal
              </button>
            </div>

            {filterType === "single" ? (
              <div className="flex items-center gap-3">
                <button onClick={() => changeDate(-1)} className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm group-hover:border-teal-200 transition-all duration-200">
                    <Calendar size="18" className="text-teal-500" />
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSearchParams({ view: "list", tanggal: e.target.value });
                      }} 
                      className="text-sm text-slate-700 focus:outline-none bg-transparent font-medium" 
                    />
                  </div>
                </div>
                <button onClick={() => changeDate(1)} className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
                <button 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setSelectedDate(today);
                    setSearchParams({ view: "list", tanggal: today });
                  }} 
                  className="relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Hari Ini
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                    <Calendar size="16" className="text-teal-500" />
                    <span className="text-xs text-slate-500">Dari</span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm text-slate-700 focus:outline-none bg-transparent" />
                  </div>
                </div>
                <span className="text-slate-400">→</span>
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                    <Calendar size="16" className="text-teal-500" />
                    <span className="text-xs text-slate-500">Sampai</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm text-slate-700 focus:outline-none bg-transparent" />
                  </div>
                </div>
                <button 
                  onClick={() => fetchDailyReports()}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Filter size="14" />
                  Terapkan
                </button>
              </div>
            )}
          </div>
          
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 shadow-sm" />
          </div>
        </div>

        {/* Display date info - unchanged */}
        <div className="mb-5">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Sparkles size="14" className="text-teal-500" />
            {filterType === "single" ? formatDate(selectedDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}
          </p>
        </div>

        {/* Summary Cards - unchanged */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Total Peserta</p><div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Users size="16" className="text-teal-600" /></div></div><p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{summary.total}</p><p className="text-[10px] text-slate-400 mt-1">Terdaftar</p></div></div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Sudah Mengisi</p><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle size="16" className="text-emerald-600" /></div></div><p className="text-3xl font-bold text-emerald-600">{summary.sudahMengisi}</p><p className="text-[10px] text-slate-400 mt-1">Laporan lengkap</p></div></div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Belum Mengisi</p><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><XCircle size="16" className="text-amber-600" /></div></div><p className="text-3xl font-bold text-amber-600">{summary.belumMengisi}</p><p className="text-[10px] text-slate-400 mt-1">Perlu pengingat</p></div></div>
          <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-white/80 font-medium">Partisipasi</p><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><TrendingUp size="16" className="text-white" /></div></div><p className="text-3xl font-bold text-white">{summary.persentase}%</p><p className="text-[10px] text-white/70 mt-1">Tingkat partisipasi</p></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
            <div className="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all duration-500" style={{ width: `${summary.persentase}%` }}></div>
          </div>
        </div>

        {/* Table - unchanged */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-In</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-Out</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktivitas</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((report) => {
                  const kehadiran = getKehadiranBadge(report.status_kehadiran);
                  const KehadiranIcon = kehadiran.icon;
                  return (
                    <tr key={report.id} className="transition-all duration-300 group cursor-pointer hover:bg-slate-50/50" onMouseEnter={() => setHoveredRow(report.id)} onMouseLeave={() => setHoveredRow(null)} onClick={() => openDetailModal(report)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">{getNamaPeserta(report).charAt(0) || "P"}</div>
                          </div>
                          <div><p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{getNamaPeserta(report)}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-medium text-slate-600">{getDivisiPeserta(report)}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateOnly(report.tanggal || selectedDate)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(report.check_in)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(report.check_out)}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border} shadow-sm`}>
                          <KehadiranIcon size="10" />
                          <span className="text-[10px] font-semibold">{kehadiran.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {report.aktivitas ? (
                          <p className="text-xs text-slate-600 max-w-[200px] truncate font-medium">{report.aktivitas}</p>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1.5"><AlertCircle size="10" />Belum mengisi</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn inline-flex items-center gap-1.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); openDetailModal(report); }}>
                          <span className="relative z-10 flex items-center gap-1.5"><Eye size="12" />Detail</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && !loading && (
            <div className="py-16 text-center">
              <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><FileText size="32" className="text-slate-400" /></div></div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data</p>
              <p className="text-sm text-slate-400 mt-1">Tidak ada laporan pada rentang tanggal ini</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman {currentPage} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
                <div className="flex gap-1.5">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                    }
                    if (totalPages > 5 && currentPage > 3 && i === 0 && pageNum > 2) return null;
                    if (totalPages > 5 && currentPage < totalPages - 2 && i === 3 && pageNum < totalPages - 1) return null;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {currentPage === pageNum && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 -z-10"></div>}
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner - unchanged */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/80 via-blue-50/80 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div className="flex-1"><p className="text-sm font-bold text-teal-800">Informasi Daily Report</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Daily report diupdate secara real-time oleh peserta. Klik baris peserta atau tombol <span className="font-semibold text-teal-600">"Detail"</span> untuk melihat laporan lengkap aktivitas, kendala, lokasi, dan device peserta, serta memberikan feedback.</p></div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDetailReport && (
        <DetailModal report={selectedDetailReport} onClose={() => setShowDetailModal(false)} />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}

export default PresensiDailyReport;