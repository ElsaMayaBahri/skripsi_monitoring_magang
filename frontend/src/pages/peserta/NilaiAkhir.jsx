import React, { useState, useEffect } from "react";
import {
  Award,
  Star,
  Download,
  Users,
  Shield,
  UserCheck,
  ClipboardList,
  Brain,
  X,
  Loader2,
  GraduationCap,
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Calendar,
  User,
  BookOpen,
  Building2,
  Sparkles,
  FileText,
} from "lucide-react";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";
import api from "../../api/axios";
import { 
  getNilaiAkhir, 
  getSertifikatMagangTemplate, 
  downloadTemplateFile 
} from "../../api/peserta/nilaiService";

function NilaiAkhir() {
  const [loading, setLoading] = useState(true);
  const [nilai, setNilai] = useState(null);
  const [components, setComponents] = useState([]);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [downloading, setDownloading] = useState(false);
  
  // State untuk Sertifikat Magang yang langsung tampil
  const [magangCertificate, setMagangCertificate] = useState(null);
  const [magangLoading, setMagangLoading] = useState(false);
  const [magangPdfUrl, setMagangPdfUrl] = useState(null);

  useEffect(() => {
    loadNilaiData();
    loadMagangCertificate();
  }, []);

  const loadNilaiData = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const data = await getNilaiAkhir();

      if (data && data.success) {
        setNilai({
          ...data.data,
          participant_name: data.data.participant_name || "-",
          participant_nim: data.data.participant_nim || "-",
          participant_program: data.data.participant_program || "-",
          institution: data.data.institution || "-",
          start_date: data.data.start_date || null,
          end_date: data.data.end_date || null,
          mentor_name: data.data.mentor_name || "-",
          ceo_name: data.data.ceo_name || "-",
          certificate_number: data.data.certificate_number || "-",
          total: data.data.total || 0,
          grade: data.data.grade || "-",
          predikat: data.data.predikat || "-",
          status: data.data.status || "belum_lulus",
        });

        setComponents(data.data.components || []);
      } else {
        const errorMsg = data?.message || "Nilai akhir belum tersedia";
        setError(errorMsg);
        if (
          errorMsg.toLowerCase().includes("belum difinalisasi") ||
          errorMsg.toLowerCase().includes("belum di finalisasi") ||
          errorMsg.toLowerCase().includes("belum tersedia")
        ) {
          setErrorType("not_finalized");
        } else {
          setErrorType("other");
        }
      }
    } catch (err) {
      console.error("Error nilai akhir peserta:", err);
      
      if (err.response?.status === 404) {
        setError("Endpoint API belum tersedia. Silakan hubungkan administrator.");
        setErrorType("not_finalized");
      } else {
        const errorMsg =
          err.response?.data?.message ||
          "Nilai akhir belum tersedia atau belum difinalisasi oleh mentor";
        setError(errorMsg);
        
        if (
          errorMsg.toLowerCase().includes("belum difinalisasi") ||
          errorMsg.toLowerCase().includes("belum di finalisasi")
        ) {
          setErrorType("not_finalized");
        } else {
          setErrorType("other");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load Sertifikat Magang langsung
  const loadMagangCertificate = async () => {
    setMagangLoading(true);
    try {
      const response = await api.post("/peserta/sertifikat-magang/generate");
      
      if (response.data.success && response.data.data) {
        const certData = response.data.data;
        setMagangCertificate(certData);
        
        const pdfResponse = await api.get(`/peserta/sertifikat-magang/download/${certData.id}`, {
          responseType: 'blob'
        });
        const url = URL.createObjectURL(pdfResponse.data);
        setMagangPdfUrl(url);
      }
    } catch (err) {
      console.error("Error loading magang certificate:", err);
    } finally {
      setMagangLoading(false);
    }
  };

  const handleDownloadMagangCertificate = async () => {
    if (!magangCertificate?.id) {
      alert("Sertifikat belum tersedia");
      return;
    }
    
    setDownloading(true);
    try {
      const response = await api.get(`/peserta/sertifikat-magang/download/${magangCertificate.id}`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sertifikat_Magang_${nilai?.participant_name?.replace(/\s/g, "_") || 'peserta'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading:", err);
      alert("Gagal mengunduh sertifikat");
    } finally {
      setDownloading(false);
    }
  };

  const isLulus = nilai?.status === "lulus" || nilai?.total >= 70;

  if (loading) {
    return (
      <div className="min-h-screen px-5 py-5 pb-10 mx-auto max-w-7xl md:px-6">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Memuat data nilai...</p>
        </div>
      </div>
    );
  }

  if (error && errorType === "not_finalized") {
    return (
      <div className="min-h-screen px-5 py-5 pb-10 mx-auto max-w-7xl md:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 shadow-sm">
              <Award className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Nilai Akhir Magang
              </h1>
              <p className="text-sm text-gray-500">
                Hasil evaluasi akhir program magang
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-amber-50 to-amber-100">
              <Clock size="44" className="text-amber-500" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-800">
              Nilai Akhir Belum Tersedia
            </h2>
            <p className="mb-6 text-gray-600 leading-relaxed">
              Mentor pembimbing sedang melakukan proses finalisasi penilaian magang. <br />
              Silakan cek kembali secara berkala.
            </p>
            <button
              onClick={loadNilaiData}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw size="16" />
              Refresh Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && errorType === "other") {
    return (
      <div className="min-h-screen px-5 py-5 pb-10 mx-auto max-w-7xl md:px-6">
        <div className="p-8 text-center border border-red-100 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-sm">
          <AlertCircle size="48" className="mx-auto mb-4 text-red-400" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={loadNilaiData}
            className="px-6 py-2.5 mt-6 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-6 pb-10 mx-auto max-w-7xl md:px-6 bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
      {/* Header */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-2xl blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Nilai Akhir Magang
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-teal-500"></span>
                Hasil evaluasi akhir program magang
              </p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
            isLulus 
              ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200" 
              : "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200"
          }`}>
            {isLulus ? (
              <>
                <CheckCircle size="12" className="text-emerald-600" />
                <span>Lulus</span>
              </>
            ) : (
              <>
                <AlertCircle size="12" className="text-amber-600" />
                <span>Belum Lulus</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Score Card - Hijau */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-800"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-32 -translate-x-32"></div>
        
        <div className="relative p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs">
                <TrendingUp size="12" />
                <span>Nilai Akhir</span>
              </div>
              <div className="flex items-baseline gap-1 justify-center md:justify-start">
                <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                  {nilai.total}
                </p>
                <p className="text-white/70 text-base font-semibold">/100</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-base shadow-inner">
                  {nilai.grade}
                </span>
                <span className="text-white/80 text-xs font-medium px-1.5 py-0.5 rounded-full bg-black/20">
                  {nilai.predikat}
                </span>
              </div>
            </div>

            <div className="w-full md:w-[280px] flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size="14" className="text-white/70" />
                  <p className="text-xs font-medium text-white/80">Periode Magang</p>
                </div>
                <p className="text-sm text-white font-medium">
                  {new Date(nilai.start_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })} — {new Date(nilai.end_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-2 pt-2 border-t border-white/20 text-sm">
                  <div>
                    <p className="text-white/60 text-xs">Mentor</p>
                    <p className="text-white font-medium text-sm truncate">{nilai.mentor_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SERTIFIKAT MAGANG - UKURAN KECIL ==================== */}
      {isLulus && magangPdfUrl && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size="16" className="text-blue-600" />
                  <h3 className="font-semibold text-sm text-gray-800">Sertifikat Magang</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-medium">
                    Tersedia
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2 bg-gray-100 flex justify-center">
              <iframe 
                src={`${magangPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-[280px] rounded-md shadow-sm"
                title="Sertifikat Magang"
              />
            </div>
            <div className="px-4 py-2 bg-white flex items-center justify-between border-t border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-800">{nilai?.participant_name}</p>
                <p className="text-[10px] text-gray-500">Peserta Magang</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">{nilai?.total}/100</p>
                <p className="text-[10px] text-gray-500">Grade {nilai?.grade}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-50 flex justify-end border-t border-gray-100">
              <button
                onClick={handleDownloadMagangCertificate}
                disabled={downloading}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5"
              >
                {downloading ? <Loader2 size="12" className="animate-spin" /> : <Download size="12" />}
                Unduh Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dua Kolom: Info Peserta + Komponen Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kartu Info Peserta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 transition-all hover:shadow-md">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User size="14" className="text-teal-600" />
              <h3 className="font-semibold text-sm text-gray-800">Informasi Peserta</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0">
                <User size="13" className="text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Nama Lengkap</p>
                <p className="text-sm text-gray-800 font-medium">{nilai.participant_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <BookOpen size="13" className="text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Program Studi</p>
                <p className="text-sm text-gray-800 font-medium">{nilai.participant_program}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Building2 size="13" className="text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Institusi</p>
                <p className="text-sm text-gray-800 font-medium">{nilai.institution}</p>
              </div>
            </div>
            {nilai.certificate_number !== "-" && (
              <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Shield size="13" className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">No. Sertifikat</p>
                  <p className="text-sm text-gray-800 font-mono">{nilai.certificate_number}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Komponen Nilai */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 transition-all hover:shadow-md">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Star size="14" className="text-teal-600" />
              <h3 className="font-semibold text-sm text-gray-800">Rincian Nilai per Komponen</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {components.map((comp, idx) => {
              const progressWidth = (comp.nilai / 100) * 100;
              const getIcon = () => {
                if (idx === 0) return <UserCheck size="12" />;
                if (idx === 1) return <ClipboardList size="12" />;
                if (idx === 2) return <Brain size="12" />;
                if (idx === 3) return <Users size="12" />;
                return <Star size="12" />;
              };
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-teal-50 flex items-center justify-center text-teal-600">
                        {getIcon()}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{comp.name}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-bold text-teal-600">{comp.nilai}</span>
                      <span className="text-[10px] text-gray-400">/100</span>
                    </div>
                  </div>
                  <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Bobot: <span className="font-medium text-gray-600">{comp.bobot}%</span></span>
                    <span className="text-gray-400">Kontribusi: <span className="font-medium text-gray-600">{comp.kontribusi}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-teal-600/5 to-emerald-600/5 border border-teal-100/50 p-2 mt-6">
        <div className="flex items-start gap-1.5">
          <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Sparkles size="10" className="text-teal-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-700 leading-relaxed">
              <span className="font-semibold text-teal-800">Informasi Nilai:</span> Nilai akhir dihitung berdasarkan bobot masing-masing komponen penilaian.
              {isLulus &&
                " Selamat! Anda dinyatakan lulus dan berhak mendapatkan sertifikat penyelesaian magang."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NilaiAkhir;