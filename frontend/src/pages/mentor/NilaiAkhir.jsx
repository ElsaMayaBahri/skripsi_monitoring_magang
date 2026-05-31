// src/pages/mentor/NilaiAkhir.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  Clock,
  PieChart,
  Shield,
  Sparkles,
  Zap,
  X,
  UserCheck,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { getMentorPesertaList } from "../../api/mentor/pesertaService";
import {
  getMentorNilai,
  finalizeMentorNilai,
} from "../../api/mentor/nilaiService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assets/logo.png";

function NilaiAkhir() {
  const [loading, setLoading] = useState(false);
  const [peserta, setPeserta] = useState([]);
  const [filteredPeserta, setFilteredPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  // State untuk toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const weights = {
    kehadiran: 20,
    tugas: 25,
    kuis: 15,
    manual: 40,
  };

  // Fungsi untuk menampilkan toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Fetch peserta and nilai from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setDebugInfo(null);
    try {
      console.log("Fetching data...");

      const pesertaResponse = await getMentorPesertaList({});
      console.log("Peserta Response:", pesertaResponse);

      if (pesertaResponse.success && pesertaResponse.data) {
        const nilaiResponse = await getMentorNilai({});
        console.log("Nilai Response:", nilaiResponse);

        const nilaiMap = new Map();

        if (nilaiResponse.success && nilaiResponse.data) {
          nilaiResponse.data.forEach((n) => {
            nilaiMap.set(n.id_peserta, n);
          });
        }

        const transformedPeserta = pesertaResponse.data.map((p) => {
          const nilaiData = nilaiMap.get(p.id_peserta);

          const sikap = nilaiData?.sikap ?? null;
          const kualitasKerja = nilaiData?.kualitas_kerja ?? null;
          const komunikasi = nilaiData?.komunikasi ?? null;
          const kreativitas = nilaiData?.kreativitas ?? null;
          const kerjasama = nilaiData?.kerjasama ?? null;
          const inisiatif = nilaiData?.inisiatif ?? null;
          const kehadiran = nilaiData?.nilai_kehadiran ?? null;
          const nilaiTugas = nilaiData?.nilai_tugas ?? null;
          const nilaiKuis = nilaiData?.nilai_kuis ?? null;

          const manualValues = [
            sikap,
            kualitasKerja,
            komunikasi,
            kreativitas,
            kerjasama,
            inisiatif,
          ].filter((v) => v !== null);
          const nilaiManual =
            manualValues.length > 0
              ? Math.round(
                  manualValues.reduce((a, b) => a + b, 0) / manualValues.length,
                )
              : null;

          const status =
            nilaiData?.status === "final" || nilaiData?.status === "sudah_final"
              ? "sudah_final"
              : "belum_final";

          return {
            id: p.id_peserta,
            nama: p.nama || p.nama_peserta || "Unknown",
            divisi: p.divisi || "-",
            kehadiran: kehadiran,
            tugas: nilaiTugas,
            kuis: nilaiKuis,
            sikap: sikap,
            kualitas_kerja: kualitasKerja,
            komunikasi: komunikasi,
            kreativitas: kreativitas,
            kerjasama: kerjasama,
            inisiatif: inisiatif,
            nilai_manual: nilaiManual,
            nilai_akhir:
              nilaiData?.nilai_akhir !== null &&
              nilaiData?.nilai_akhir !== undefined
                ? Number(nilaiData.nilai_akhir)
                : null,
            status: status,
            progress: p.progress || 0,
          };
        });

        console.log("Transformed Peserta:", transformedPeserta);
        setPeserta(transformedPeserta);
        setFilteredPeserta(transformedPeserta);
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      let errorMsg = "Gagal memuat data nilai akhir";
      let debugData = null;

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 500) {
          errorMsg =
            "Server error (500): Gagal memuat data. Kemungkinan kolom database tidak ditemukan.";
          debugData = {
            type: "server_error",
            status: 500,
            message: data?.message || "Internal Server Error",
            suggestion:
              "Periksa apakah kolom sudah ada di tabel nilai_pesertas.",
          };
        } else if (status === 403) {
          errorMsg = "Akses ditolak: Anda tidak memiliki izin";
          debugData = {
            type: "unauthorized",
            status: 403,
            message: data?.message,
          };
        } else if (status === 404) {
          errorMsg = "Endpoint tidak ditemukan: " + (data?.message || "");
          debugData = {
            type: "not_found",
            status: 404,
            message: data?.message,
          };
        } else {
          errorMsg = data?.message || `Error ${status}: Gagal memuat data`;
          debugData = {
            type: "api_error",
            status: status,
            message: data?.message,
          };
        }
      } else if (error.request) {
        errorMsg =
          "Tidak ada respons dari server. Periksa koneksi atau server sedang bermasalah.";
        debugData = {
          type: "no_response",
          suggestion: "Pastikan server Laravel berjalan (php artisan serve)",
        };
      } else {
        errorMsg = error.message || "Terjadi kesalahan";
        debugData = { type: "request_error", message: error.message };
      }

      setErrorMessage(errorMsg);
      setDebugInfo(debugData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = [...peserta];
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.divisi.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filterStatus !== "all")
      filtered = filtered.filter((p) => p.status === filterStatus);
    setFilteredPeserta(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, peserta]);

  const hitungNilaiManual = (p) => {
    const manualValues = [
      p.sikap,
      p.kualitas_kerja,
      p.komunikasi,
      p.kreativitas,
      p.kerjasama,
      p.inisiatif,
    ]
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v) && v >= 0);

    if (manualValues.length === 0) return null;

    return Math.round(
      manualValues.reduce((a, b) => a + b, 0) / manualValues.length,
    );
  };

  const hitungPreviewNilaiAkhir = (p) => {
    const kehadiran = Number(p.kehadiran ?? 0);
    const tugas = Number(p.tugas ?? 0);
    const kuis = Number(p.kuis ?? 0);
    const nilaiManual = hitungNilaiManual(p);

    if (nilaiManual === null) {
      return null;
    }

    return Number(
      (
        kehadiran * 0.2 +
        tugas * 0.25 +
        kuis * 0.15 +
        nilaiManual * 0.4
      ).toFixed(2),
    );
  };

  const isManualComplete = (p) => {
    return p.sikap !== null && p.kualitas_kerja !== null;
  };

  const handleFinalize = async (p) => {
    const nilaiManual = hitungNilaiManual(p);
    if (nilaiManual === null) {
      showToast("Lengkapi penilaian manual terlebih dahulu sebelum finalisasi", "error");
      return;
    }
    setSelectedPeserta(p);
    setShowFinalizeModal(true);
  };

  const confirmFinalize = async () => {
    if (!selectedPeserta) return;

    setFinalizing(true);
    setErrorMessage("");
    setDebugInfo(null);
    try {
      console.log("Finalizing peserta ID:", selectedPeserta.id);
      const response = await finalizeMentorNilai(selectedPeserta.id);
      console.log("Finalize Response:", response);

      if (response.success) {
        showToast(`Nilai akhir ${selectedPeserta.nama} berhasil difinalisasi`, "success");
        setShowFinalizeModal(false);
        setSelectedPeserta(null);
        await fetchData();
      } else {
        showToast(response.message || "Gagal finalisasi nilai", "error");
      }
    } catch (error) {
      console.error("Error finalizing:", error);

      let errorMsg =
        error.response?.data?.message || "Terjadi kesalahan saat finalisasi";

      let debugData = error.response?.data || null;

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 500) {
          errorMsg =
            data?.message || "Server error (500): Gagal finalisasi nilai.";

          debugData = {
            type: "server_error",
            status: 500,
            message: data?.message || "Internal Server Error",
            suggestion:
              "Cek pesan error detail. Biasanya karena kolom database belum ada.",
          };
        } else if (status === 422) {
          errorMsg =
            "Validasi gagal: " +
            (data?.message || "Lengkapi nilai manual terlebih dahulu");

          debugData = {
            type: "validation_error",
            status: 422,
            errors: data?.errors,
            message: data?.message,
          };
        } else {
          errorMsg = data?.message || `Error ${status}: Gagal finalisasi`;
          debugData = {
            type: "api_error",
            status: status,
            message: data?.message,
          };
        }
      } else if (error.request) {
        errorMsg = "Tidak ada respons dari server. Periksa koneksi.";
        debugData = { type: "no_response" };
      } else {
        errorMsg = error.message || "Terjadi kesalahan";
      }

      showToast(errorMsg, "error");
      setErrorMessage(errorMsg);
      setDebugInfo(debugData);
    } finally {
      setFinalizing(false);
    }
  };

  // Export to Excel - langsung download tanpa notifikasi
  const exportToExcel = () => {
    setExporting(true);
    try {
      const exportData = filteredPeserta.map((p) => {
        const nilaiManual = hitungNilaiManual(p);
        const nilaiAkhir =
          p.nilai_akhir !== null && Number(p.nilai_akhir) > 0
            ? Number(p.nilai_akhir)
            : hitungPreviewNilaiAkhir(p);
        
        return {
          "Nama Peserta": p.nama,
          Divisi: p.divisi,
          "Kehadiran (%)": p.kehadiran !== null ? p.kehadiran : "-",
          "Tugas (%)": p.tugas !== null ? p.tugas : "-",
          "Kuis (%)": p.kuis !== null ? p.kuis : "-",
          "Nilai Manual": nilaiManual !== null ? nilaiManual : "-",
          "Nilai Akhir": nilaiAkhir !== null ? nilaiAkhir : "-",
          Status: p.status === "sudah_final" ? "Sudah Final" : "Belum Final",
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Nilai Akhir");
      
      ws['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      
      XLSX.writeFile(wb, `nilai_akhir_${new Date().toISOString().split("T")[0]}.xlsx`);
      setShowExportOptions(false);
      showToast("Export Excel berhasil", "success");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast("Gagal export Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF - langsung download tanpa notifikasi dan tanpa ringkasan
  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      
      // Add logo
      const img = new Image();
      img.src = logo;
      doc.addImage(img, 'PNG', 14, 10, 20, 20);
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(20, 184, 166);
      doc.text("LAPORAN NILAI AKHIR PESERTA MAGANG", 40, 20);
      
      // Date
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 28);
      doc.text(`Total Peserta: ${filteredPeserta.length} orang`, 40, 34);
      
      // Table data
      const tableData = filteredPeserta.map((p) => {
        const nilaiManual = hitungNilaiManual(p);
        const nilaiAkhir =
          p.nilai_akhir !== null && Number(p.nilai_akhir) > 0
            ? Number(p.nilai_akhir)
            : hitungPreviewNilaiAkhir(p);
        
        return [
          p.nama,
          p.divisi,
          p.kehadiran !== null ? `${p.kehadiran}` : "-",
          p.tugas !== null ? `${p.tugas}` : "-",
          p.kuis !== null ? `${p.kuis}` : "-",
          nilaiManual !== null ? `${nilaiManual}` : "-",
          nilaiAkhir !== null ? `${nilaiAkhir}` : "-",
          p.status === "sudah_final" ? "Sudah Final" : "Belum Final",
        ];
      });
      
      doc.autoTable({
        head: [["Nama", "Divisi", "Kehadiran", "Tugas", "Kuis", "Nilai Manual", "Nilai Akhir", "Status"]],
        body: tableData,
        startY: 45,
        theme: 'striped',
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: [240, 253, 250] },
        margin: { top: 45, left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 18 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 22 },
          6: { cellWidth: 22 },
          7: { cellWidth: 22 },
        },
      });
      
      // Langsung save PDF tanpa ringkasan tambahan
      doc.save(`nilai_akhir_${new Date().toISOString().split("T")[0]}.pdf`);
      setShowExportOptions(false);
      showToast("Export PDF berhasil", "success");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      showToast("Gagal export PDF", "error");
    } finally {
      setExporting(false);
    }
  };

  const getGrade = (nilai) => {
    if (nilai >= 85)
      return {
        label: "A",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        desc: "Sangat Baik",
      };
    if (nilai >= 75)
      return {
        label: "B",
        color: "text-blue-600",
        bg: "bg-blue-100",
        desc: "Baik",
      };
    if (nilai >= 65)
      return {
        label: "C",
        color: "text-teal-600",
        bg: "bg-teal-100",
        desc: "Cukup",
      };
    if (nilai >= 50)
      return {
        label: "D",
        color: "text-purple-600",
        bg: "bg-purple-100",
        desc: "Kurang",
      };
    return {
      label: "E",
      color: "text-red-600",
      bg: "bg-red-100",
      desc: "Sangat Kurang",
    };
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  const sudahFinal = peserta.filter((p) => p.status === "sudah_final").length;
  const belumFinal = peserta.filter((p) => p.status === "belum_final").length;
  const nilaiAkhirList = peserta
    .map((p) => {
      if (p.nilai_akhir !== null && Number(p.nilai_akhir) > 0) {
        return Number(p.nilai_akhir);
      }

      return hitungPreviewNilaiAkhir(p);
    })
    .filter((nilai) => nilai !== null && !Number.isNaN(nilai));

  const rataRataNilai =
    nilaiAkhirList.length > 0
      ? nilaiAkhirList.reduce((acc, nilai) => acc + nilai, 0) /
        nilaiAkhirList.length
      : 0;
  const progressPersen =
    peserta.length > 0 ? Math.round((sudahFinal / peserta.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="relative">
          <Loader2 className="relative w-12 h-12 text-teal-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-[1000] animate-in slide-in-from-right-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              className="ml-2 p-0.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header dengan background biru soft */}
        <div className="relative mb-8 rounded-2xl overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="absolute top-0 left-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 shadow-sm bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text">
                    Nilai Akhir
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Rekap nilai akhir dan finalisasi evaluasi peserta magang
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative">
                <button
                  onClick={fetchData}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium transition-all duration-300 border rounded-xl shadow-sm bg-white border-slate-200/60 text-slate-600 hover:text-teal-600"
                >
                  <Sparkles size="14" /> Refresh
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium transition-all duration-300 border rounded-xl shadow-sm bg-white border-slate-200/60 text-slate-600 hover:text-teal-600"
                  >
                    <Download size="14" />
                    Export
                  </button>
                  
                  {/* Dropdown Export */}
                  {showExportOptions && (
                    <>
                      <div 
                        className="fixed inset-0 z-[998]" 
                        onClick={() => setShowExportOptions(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 z-[999] bg-white border rounded-xl shadow-2xl border-slate-200/60 w-52 overflow-hidden">
                        <button
                          onClick={exportToExcel}
                          disabled={exporting}
                          className="flex items-center w-full gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-teal-50 text-slate-700"
                        >
                          <FileSpreadsheet size="16" className="text-emerald-600" />
                          <span>Export ke Excel</span>
                        </button>
                        <button
                          onClick={exportToPDF}
                          disabled={exporting}
                          className="flex items-center w-full gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-teal-50 text-slate-700 border-t border-slate-100"
                        >
                          <FileText size="16" className="text-red-600" />
                          <span>Export ke PDF</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 mb-6 border border-red-200 bg-red-50 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle size="18" className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                {debugInfo && (
                  <div className="p-3 mt-3 bg-red-100 rounded-xl">
                    <pre className="p-2 font-mono text-xs text-red-700 whitespace-pre-wrap rounded bg-red-50">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-5 mb-8 md:grid-cols-4">
          {/* Card 1 - TOTAL */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-teal-100/80 to-blue-100/40 -translate-y-16 translate-x-16"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-sm">
                  <Users size="18" className="text-white" />
                </div>
                <div className="rounded-full bg-white border border-teal-100 shadow-sm px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-teal-600 tracking-wider">TOTAL</span>
                </div>
              </div>
              <p className="text-4xl font-semibold text-slate-800">{peserta.length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Peserta Terdaftar</p>
            </div>
          </div>

          {/* Card 2 - SUDAH */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100/80 to-teal-100/40 -translate-y-16 translate-x-16"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                  <CheckCircle size="18" className="text-white" />
                </div>
                <div className="rounded-full bg-white border border-emerald-100 shadow-sm px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-emerald-600 tracking-wider">SUDAH</span>
                </div>
              </div>
              <p className="text-4xl font-semibold text-emerald-600">{sudahFinal}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Peserta Selesai</p>
            </div>
          </div>

          {/* Card 3 - BELUM */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-amber-100/80 to-orange-100/40 -translate-y-16 translate-x-16"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                  <Clock size="18" className="text-white" />
                </div>
                <div className="rounded-full bg-white border border-amber-100 shadow-sm px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-amber-600 tracking-wider">BELUM</span>
                </div>
              </div>
              <p className="text-4xl font-semibold text-amber-600">{belumFinal}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Peserta Tertunda</p>
            </div>
          </div>

          {/* Card 4 - RATA (Special Gradient Card) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 rounded-2xl shadow-sm border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm shadow-sm">
                  <Award size="18" className="text-white" />
                </div>
                <div className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-white tracking-wider">RATA</span>
                </div>
              </div>
              <p className="text-4xl font-semibold text-white">{rataRataNilai.toFixed(1)}</p>
              <p className="mt-1 text-xs font-medium text-white/80">Nilai Keseluruhan</p>
              <div className="pt-3 mt-3 border-t border-white/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/70">Progress Finalisasi</span>
                  <span className="text-[10px] font-semibold text-white/90">{progressPersen}%</span>
                </div>
                <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-500 bg-white rounded-full" style={{ width: `${progressPersen}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bobot Penilaian - Diperkecil */}
        <div className="p-4 mb-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieChart size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Bobot Penilaian</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="p-2.5 text-center bg-slate-100/70 rounded-xl">
              <p className="text-[11px] text-slate-500">Kehadiran</p>
              <p className="text-lg font-semibold text-slate-700">{weights.kehadiran}%</p>
            </div>
            <div className="p-2.5 text-center bg-slate-100/70 rounded-xl">
              <p className="text-[11px] text-slate-500">Tugas</p>
              <p className="text-lg font-semibold text-slate-700">{weights.tugas}%</p>
            </div>
            <div className="p-2.5 text-center bg-slate-100/70 rounded-xl">
              <p className="text-[11px] text-slate-500">Kuis</p>
              <p className="text-lg font-semibold text-slate-700">{weights.kuis}%</p>
            </div>
            <div className="p-2.5 text-center bg-slate-100/70 rounded-xl">
              <p className="text-[11px] text-slate-500">Nilai Manual</p>
              <p className="text-lg font-semibold text-slate-700">{weights.manual}%</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 mb-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 border rounded-xl bg-slate-50 border-slate-200">
                <UserCheck size="14" className="text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent rounded-md text-sm text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="sudah_final">Sudah Final</option>
                  <option value="belum_final">Belum Final</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles size="14" className="text-teal-500" />
            Menampilkan <span className="font-bold text-slate-700">{currentItems.length}</span> dari{" "}
            <span className="font-bold text-slate-700">{filteredPeserta.length}</span> peserta
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50/50 border-slate-200/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kuis</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Manual</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Akhir</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((p) => {
                  const nilaiManual = hitungNilaiManual(p);
                  const nilaiAkhir =
                    p.nilai_akhir !== null && Number(p.nilai_akhir) > 0
                      ? Number(p.nilai_akhir)
                      : hitungPreviewNilaiAkhir(p);
                  const grade = nilaiAkhir ? getGrade(nilaiAkhir) : null;
                  const isComplete = isManualComplete(p);
                  const isHovered = hoveredRow === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors duration-150"
                      onMouseEnter={() => setHoveredRow(p.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        backgroundColor: isHovered ? "rgba(20, 184, 166, 0.02)" : "transparent",
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center text-sm font-bold text-white rounded-xl shadow-sm w-9 h-9 bg-gradient-to-br from-teal-500 to-blue-600">
                            {p.nama.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                            <p className="text-[10px] text-slate-400">{p.divisi}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.kehadiran !== null ? (
                          <span className="text-sm font-semibold text-slate-700">{p.kehadiran}%</span>
                        ) : (
                          <span className="text-xs italic text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.tugas !== null ? (
                          <span className="text-sm font-semibold text-slate-700">{p.tugas}%</span>
                        ) : (
                          <span className="text-xs italic text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.kuis !== null ? (
                          <span className="text-sm font-semibold text-slate-700">{p.kuis}%</span>
                        ) : (
                          <span className="text-xs italic text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {nilaiManual !== null && !Number.isNaN(nilaiManual) ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-teal-600">{nilaiManual}</span>
                            <span className="text-[9px] text-slate-400">/100</span>
                            {!isComplete && (
                              <span className="text-[9px] text-amber-500 ml-1">(belum lengkap)</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Belum diisi</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {nilaiAkhir !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-teal-600">{nilaiAkhir}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${grade.bg} ${grade.color}`}>
                              {grade?.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Belum final</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.status === "sudah_final" ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100">
                            <CheckCircle size="12" className="text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">Telah Difinalisasi</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleFinalize(p)}
                            disabled={!isComplete}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                              isComplete
                                ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-sm hover:shadow-md"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <Shield size="12" />
                            Finalisasi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPeserta.length === 0 && (
            <div className="py-12 text-center">
              <div className="relative inline-block">
                <div className="relative flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                  <Users size="28" className="text-slate-400" />
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-600">Tidak ada peserta ditemukan</p>
              <p className="mt-1 text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200/60 bg-slate-50/30">
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Zap size="14" className="text-teal-500" /> Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 transition-all duration-200 border rounded-xl shadow-sm bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size="16" />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative w-8 h-8 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-sm"
                            : "bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 transition-all duration-200 border rounded-xl shadow-sm bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size="16" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="p-4 mt-6 bg-teal-50/50 border border-teal-100 rounded-2xl">
          <div className="flex items-start gap-3">
            <Shield size="16" className="text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-teal-800">Informasi Finalisasi</p>
              <p className="text-xs text-teal-700 mt-0.5">
                Nilai akhir yang sudah <span className="font-bold">difinalisasi</span> menjadi nilai resmi dan tidak dapat diubah. 
                Pastikan semua komponen nilai manual sudah diisi sebelum melakukan finalisasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Finalize Modal */}
      {showFinalizeModal && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white shadow-2xl rounded-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-sm">
                    <Shield size="16" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Finalisasi Nilai</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">{selectedPeserta.nama}</p>
              </div>
              <button onClick={() => setShowFinalizeModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size="16" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm">
                    <AlertCircle size="14" className="text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-800">Konfirmasi Finalisasi</p>
                    <p className="mt-1 text-xs text-teal-700">
                      Nilai akhir akan ditetapkan sebagai nilai resmi dan{" "}
                      <span className="font-bold">tidak dapat diubah lagi</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Nilai Akhir:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-teal-600">{hitungPreviewNilaiAkhir(selectedPeserta)}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-teal-500 to-blue-600"
                    style={{ width: `${Math.min(100, hitungPreviewNilaiAkhir(selectedPeserta) || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={confirmFinalize}
                disabled={finalizing}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {finalizing ? <Loader2 size="14" className="animate-spin" /> : <Shield size="14" />}
                {finalizing ? "Memproses..." : "Ya, Finalisasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NilaiAkhir;