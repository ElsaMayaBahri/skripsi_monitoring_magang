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
  FileSpreadsheet,
  X,
  CalendarRange,
  Filter,
  ChevronDown,
} from "lucide-react";
import { getMentorPresensi } from "../../api/mentor/presensiService";
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
  const [allPresensi, setAllPresensi] = useState([]);
  const [filteredPresensi, setFilteredPresensi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(tanggalParam || new Date().toISOString().split('T')[0]);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailReport, setSelectedDetailReport] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "error" }), 4000);
  };

  const [summary, setSummary] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0
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
      fetchPresensiData();
    } else if (viewMode === "detail" && pesertaId) {
      fetchDailyReportDetail();
    }
  }, [selectedDate, startDate, endDate, filterType, viewMode, pesertaId]);

  const getNamaPeserta = (item) => {
    if (item.peserta_nama) return item.peserta_nama;
    if (item.nama) return item.nama;
    if (item.peserta?.nama) return item.peserta.nama;
    if (item.peserta?.user?.nama) return item.peserta.user.nama;
    return "-";
  };

  const getDivisiPeserta = (item) => {
    if (item.peserta_divisi) {
      if (typeof item.peserta_divisi === 'string') return item.peserta_divisi;
      if (item.peserta_divisi.nama_divisi) return item.peserta_divisi.nama_divisi;
    }
    if (item.divisi) {
      if (typeof item.divisi === 'string') return item.divisi;
      if (item.divisi.nama_divisi) return item.divisi.nama_divisi;
    }
    if (item.peserta?.divisi?.nama_divisi) return item.peserta.divisi.nama_divisi;
    return "-";
  };

  const isDateRangeValidForPDF = () => {
    if (filterType !== "range") return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
  };

  const getDateRangeDays = () => {
    if (filterType !== "range") return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const fetchPresensiData = async () => {
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
      
      console.log("Fetching presensi with params:", params);
      
      const response = await getMentorPresensi(params);
      console.log("Presensi response:", response);
      
      if (response && response.success) {
        const presensiData = response.data || [];
        
        const transformedData = presensiData.map(item => ({
          id: item.id,
          peserta_nama: getNamaPeserta(item),
          peserta_divisi: getDivisiPeserta(item),
          status_kehadiran: item.status || item.status_kehadiran || "-",
          aktivitas: item.aktivitas || item.daily_report || "-",
          check_in: item.check_in || "-",
          check_out: item.check_out || "-",
          lokasi: item.lokasi || "-",
          tanggal: item.tanggal || selectedDate,
          feedback: item.feedback || null
        }));
        
        setAllPresensi(transformedData);
        setFilteredPresensi(transformedData);
        
        const total = transformedData.length;
        const hadir = transformedData.filter(p => p.status_kehadiran === "Hadir").length;
        const terlambat = transformedData.filter(p => p.status_kehadiran === "Terlambat").length;
        const izin = transformedData.filter(p => p.status_kehadiran === "Izin").length;
        const tidakHadir = transformedData.filter(p => p.status_kehadiran === "Tidak Hadir" || p.status_kehadiran === "Alpha").length;
        const persentaseKehadiran = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 0;
        
        setSummary({
          total,
          hadir,
          terlambat,
          izin,
          tidakHadir,
          persentaseKehadiran
        });
      } else {
        setAllPresensi([]);
        setFilteredPresensi([]);
        setSummary({
          total: 0,
          hadir: 0,
          terlambat: 0,
          izin: 0,
          tidakHadir: 0,
          persentaseKehadiran: 0
        });
      }
    } catch (error) {
      console.error("Error fetching presensi data:", error);
      setAllPresensi([]);
      setFilteredPresensi([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReportDetail = async () => {
    setLoading(true);
    try {
      const response = await getMentorPresensi({ tanggal: selectedDate });
      
      if (response && response.success && response.data) {
        const data = response.data.find(p => p.peserta_nama === pesertaId || p.id_peserta == pesertaId);
        if (data) {
          setSelectedPeserta({
            nama: getNamaPeserta(data),
            divisi: getDivisiPeserta(data),
            check_in: data.check_in || null,
            check_out: data.check_out || null,
            status: data.status_kehadiran || data.status || "alpha",
            aktivitas: data.aktivitas || data.daily_report || null,
            kendala: null,
            lokasi: data.lokasi || "-",
            device: null,
            tanggal: data.tanggal || selectedDate
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
      showToast("Feedback berhasil dikirim", "success");
      setReviewText("");
      await fetchDailyReportDetail();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast("Gagal mengirim feedback", "error");
    } finally {
      setSubmitting(false);
    }
  };

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

  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    if (typeof dateTime === 'string' && dateTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return dateTime;
    }
    if (typeof dateTime === 'string' && dateTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
      const parts = dateTime.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return "-";
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return "-";
    }
  };

  const formatDateOnly = (dateTime) => {
    if (!dateTime) return "-";
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

  const formatDate = (dateString) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date(dateString);
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleExportExcel = () => {
    if (!filteredPresensi || filteredPresensi.length === 0) {
      showToast("Tidak ada data untuk diekspor", "error");
      return;
    }
    
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const exportData = filteredPresensi.map((item, index) => ({
        "No": index + 1,
        "Nama Peserta": item.peserta_nama,
        "Divisi": item.peserta_divisi,
        "Tanggal": formatDateOnly(item.tanggal || selectedDate),
        "Check-In": formatDateTime(item.check_in),
        "Check-Out": formatDateTime(item.check_out),
        "Status": item.status_kehadiran,
        "Aktivitas": item.aktivitas,
        "Lokasi": item.lokasi
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Presensi");
      
      const fileName = `presensi_${filterType === "single" ? selectedDate : `${startDate}_to_${endDate}`}.xlsx`;
      XLSX.writeFile(wb, fileName);
      // TIDAK ADA TOAST SUKSES
    } catch (error) {
      console.error("Export Excel error:", error);
      showToast("Gagal mengexport ke Excel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!isDateRangeValidForPDF()) {
      const daysCount = getDateRangeDays();
      showToast(`Export PDF tidak dapat dilakukan untuk rentang waktu ${daysCount} hari. Silahkan gunakan Export Excel untuk rentang waktu yang lebih panjang.`, "error");
      setShowExportDropdown(false);
      return;
    }
    
    if (!filteredPresensi || filteredPresensi.length === 0) {
      showToast("Tidak ada data untuk diekspor", "error");
      return;
    }
    
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const startDateFormatted = filterType === "single" 
        ? formatDatePDF(selectedDate) 
        : (startDate ? formatDatePDF(startDate) : "Semua");
      const endDateFormatted = filterType === "single" 
        ? formatDatePDF(selectedDate) 
        : (endDate ? formatDatePDF(endDate) : "Semua");
      
      const element = document.createElement('div');
      element.style.padding = '30px';
      element.style.fontFamily = "'Times New Roman', Arial, sans-serif";
      element.style.backgroundColor = 'white';
      element.style.width = '100%';
      
      let tableRows = '';
      filteredPresensi.forEach((item, index) => {
        const aktivitasText = (item.aktivitas || '-').substring(0, 100);
        tableRows += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(item.peserta_nama)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(item.peserta_divisi)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${formatDateOnly(item.tanggal || selectedDate)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${formatDateTime(item.check_in)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${formatDateTime(item.check_out)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.status_kehadiran}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(aktivitasText)}${(item.aktivitas || '').length > 100 ? '...' : ''}</td>
          </tr>
        `;
      });
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <img src="${logo}" alt="Logo" style="height: 60px; width: auto;" />
            <div style="text-align: left;">
              <h1 style="color: #1e3a5f; margin: 0; font-size: 24px;">PT KUANTA PRIMA INDONESIA</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 10px;">Jl. Gayungsari IV No. 33 Surabaya</p>
              <p style="color: #64748b; margin: 2px 0 0 0; font-size: 10px;">+62 821-4338-0273 | partnership@kuanta.id</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 20px;">LAPORAN PRESENSI PESERTA MAGANG</h2>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 12px;">Periode: ${startDateFormatted} s/d ${endDateFormatted}</p>
          ${searchTerm ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">Pencarian: ${escapeHtml(searchTerm)}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px; text-align: right;">
          <p style="color: #94a3b8; font-size: 10px; margin: 0;">Dicetak: ${today}</p>
        </div>
        
        <div style="display: flex; gap: 15px; margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #2563eb;">${summary.total}</div>
            <div style="font-size: 10px; color: #64748b;">Total Data</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #16a34a;">${summary.hadir}</div>
            <div style="font-size: 10px; color: #64748b;">Hadir</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #d97706;">${summary.terlambat}</div>
            <div style="font-size: 10px; color: #64748b;">Terlambat</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #7c3aed;">${summary.persentaseKehadiran}%</div>
            <div style="font-size: 10px; color: #64748b;">Kehadiran</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #1e3a5f;">
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Nama Peserta</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Divisi</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Tanggal</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Check-In</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Check-Out</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Status</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Aktivitas</th>
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
        filename: `presensi_${filterType === "single" ? selectedDate : `${startDate}_to_${endDate}`}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      
      html2pdf().set(opt).from(element).save();
      // TIDAK ADA TOAST SUKSES
    } catch (error) {
      console.error("Export PDF error:", error);
      showToast("Gagal mengexport ke PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setSearchParams({ view: "list", tanggal: newDateStr });
    fetchPresensiData();
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = allPresensi.filter(r => 
        r.peserta_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.peserta_divisi.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPresensi(filtered);
      setCurrentPage(1);
    } else {
      setFilteredPresensi(allPresensi);
    }
  }, [searchTerm, allPresensi]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPresensi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPresensi.length / itemsPerPage);

  const getKehadiranBadge = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch(statusLower) {
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

  const DetailModal = ({ report, onClose }) => {
    if (!report) return null;
    const kehadiran = getKehadiranBadge(report.status_kehadiran);
    const KehadiranIcon = kehadiran.icon;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md">
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Detail Presensi</h3>
                <p className="text-xs text-slate-400">{report.peserta_nama} - {report.tanggal ? formatDate(report.tanggal) : formatDate(selectedDate)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={20} className="text-slate-400" /></button>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {report.peserta_nama?.charAt(0) || "P"}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{report.peserta_nama}</h4>
                <p className="text-sm text-slate-500">{report.peserta_divisi}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm text-slate-600">Status Kehadiran</span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border}`}>
                <KehadiranIcon size={12} />
                <span className="text-xs font-semibold">{kehadiran.label}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-slate-600" />
                  <span className="text-xs font-medium text-slate-600">Check In</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatDateTime(report.check_in) || "-"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-slate-600" />
                  <span className="text-xs font-medium text-slate-600">Check Out</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatDateTime(report.check_out) || "-"}</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-slate-600" />
                <span className="text-xs font-medium text-slate-600">Lokasi</span>
              </div>
              <p className="text-sm text-slate-700">{report.lokasi || "-"}</p>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-slate-600" />
                <span className="text-xs font-medium text-slate-600">Aktivitas</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.aktivitas || "Belum mengisi aktivitas"}</p>
            </div>
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
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Clock size="12" className="text-slate-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.check_in || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Check Out</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Clock size="12" className="text-slate-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.check_out || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Lokasi</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <MapPin size="12" className="text-slate-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.lokasi || "-"}</span>
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
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        <Target size="14" className="text-slate-600" />
                      </div>
                      Aktivitas Hari Ini
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPeserta?.aktivitas || "Belum mengisi aktivitas"}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        <MessageSquare size="14" className="text-slate-600" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 relative z-0">
      {toast.show && (
        <div className="fixed top-5 right-5 z-[10001] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {toast.type === "success" && <CheckCircle size="18" />}
            {toast.type === "error" && <AlertCircle size="18" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: "", type: "error" })}
              className="ml-2 p-0.5 hover:bg-white/20 rounded transition-colors"
            >
              <X size="14" />
            </button>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-slate-600 font-medium">Sedang memproses...</p>
            <p className="text-xs text-slate-400">Mohon tunggu</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        
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
                    Presensi Peserta Magang
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Rekap check-in, check-out, dan aktivitas harian peserta</p>
                </div>
              </div>
            </div>
            
            <div className="relative inline-block" ref={dropdownRef} style={{ zIndex: 9999, isolation: "isolate" }}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={isExporting || filteredPresensi.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Unduh Laporan
                <ChevronDown size={16} className={`transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[10000]">
                  <button
                    onClick={handleExportExcel}
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
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <FileText size={16} className="text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Export ke PDF</p>
                      <p className="text-[10px] text-slate-400">Format .pdf (Max 3 bulan)</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

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
                <button onClick={() => changeDate(-1)} className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
                <div className="relative group">
                  <div className="relative flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                    <Calendar size="18" className="text-teal-500" />
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSearchParams({ view: "list", tanggal: e.target.value });
                        fetchPresensiData();
                      }} 
                      className="text-sm text-slate-700 focus:outline-none bg-transparent font-medium" 
                    />
                  </div>
                </div>
                <button onClick={() => changeDate(1)} className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
                <button 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setSelectedDate(today);
                    setSearchParams({ view: "list", tanggal: today });
                    fetchPresensiData();
                  }} 
                  className="relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Hari Ini
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                  <Calendar size="16" className="text-teal-500" />
                  <span className="text-xs text-slate-500">Dari</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm text-slate-700 focus:outline-none bg-transparent" />
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                  <Calendar size="16" className="text-teal-500" />
                  <span className="text-xs text-slate-500">Sampai</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm text-slate-700 focus:outline-none bg-transparent" />
                </div>
                <button 
                  onClick={() => fetchPresensiData()}
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

        <div className="mb-5">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Sparkles size="14" className="text-teal-500" />
            {filterType === "single" ? formatDate(selectedDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg">
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Total Peserta</p><div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Users size="16" className="text-teal-600" /></div></div><p className="text-3xl font-bold text-slate-800">{summary.total}</p><p className="text-[10px] text-slate-400 mt-1">Hari ini</p></div></div>
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg">
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Hadir</p><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle size="16" className="text-emerald-600" /></div></div><p className="text-3xl font-bold text-emerald-600">{summary.hadir}</p><p className="text-[10px] text-slate-400 mt-1">Tepat waktu</p></div></div>
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg">
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Terlambat</p><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><AlertCircle size="16" className="text-amber-600" /></div></div><p className="text-3xl font-bold text-amber-600">{summary.terlambat}</p><p className="text-[10px] text-slate-400 mt-1">Perlu diperhatikan</p></div></div>
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-5 shadow-lg">
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-white/80 font-medium">Kehadiran</p><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><TrendingUp size="16" className="text-white" /></div></div><p className="text-3xl font-bold text-white">{summary.persentaseKehadiran}%</p><p className="text-[10px] text-white/70 mt-1">Tingkat kehadiran</p></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
            <div className="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all duration-500" style={{ width: `${summary.persentaseKehadiran}%` }}></div>
          </div>
        </div>

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
                {currentItems.map((item) => {
                  const kehadiran = getKehadiranBadge(item.status_kehadiran);
                  const KehadiranIcon = kehadiran.icon;
                  return (
                    <tr key={item.id || Math.random()} className="transition-all duration-300 group cursor-pointer hover:bg-slate-50/50" onMouseEnter={() => setHoveredRow(item.id)} onMouseLeave={() => setHoveredRow(null)} onClick={() => setSelectedDetailReport(item)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">{item.peserta_nama?.charAt(0) || "P"}</div>
                          </div>
                          <div><p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{item.peserta_nama}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-medium text-slate-600">{item.peserta_divisi}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateOnly(item.tanggal || selectedDate)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(item.check_in)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(item.check_out)}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border} shadow-sm`}>
                          <KehadiranIcon size="10" />
                          <span className="text-[10px] font-semibold">{kehadiran.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.aktivitas && item.aktivitas !== "-" ? (
                          <p className="text-xs text-slate-600 max-w-[200px] truncate font-medium">{item.aktivitas}</p>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1.5"><AlertCircle size="10" />Belum mengisi</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedDetailReport(item); 
                            setShowDetailModal(true);
                            // PERBAIKAN: Dispatch event saat modal preview dibuka
                            window.dispatchEvent(new CustomEvent("preview-modal-open"));
                          }} 
                          className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn inline-flex items-center gap-1.5"
                        >
                          <Eye size="12" />Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPresensi.length === 0 && !loading && (
            <div className="py-16 text-center">
              <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><FileText size="32" className="text-slate-400" /></div></div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data</p>
              <p className="text-sm text-slate-400 mt-1">Tidak ada data presensi pada rentang tanggal ini</p>
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
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
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
      </div>

      {showDetailModal && selectedDetailReport && (
        <DetailModal 
          report={selectedDetailReport} 
          onClose={() => { 
            setShowDetailModal(false); 
            setSelectedDetailReport(null);
            // PERBAIKAN: Dispatch event saat modal preview ditutup
            window.dispatchEvent(new CustomEvent("preview-modal-close"));
          }} 
        />
      )}
    </div>
  );
}

export default PresensiDailyReport;