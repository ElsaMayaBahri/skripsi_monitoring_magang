// src/pages/peserta/NilaiAkhir.jsx
import React, { useState, useEffect } from "react";
import {
  Award,
  Star,
  CheckCircle,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Trophy,
  Medal,
  Crown,
  Server,
  Info,
  UserCheck,
  ClipboardList,
  Brain,
  X,
  Loader2,
  Sparkles,
  GraduationCap,
  ScrollText,
  Verified,
  AlertCircle,
  Diamond,
  Gem,
} from "lucide-react";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";
import { getNilaiAkhir } from "../../api/peserta/nilaiService";

const USE_REAL_API = true;

function NilaiAkhir() {
  const [loading, setLoading] = useState(true);
  const [nilai, setNilai] = useState(null);
  const [components, setComponents] = useState([]);
  const [showSertifikatModal, setShowSertifikatModal] = useState(false);
  const [showTranskripModal, setShowTranskripModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'transkrip' or 'sertifikat'
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadNilaiData();
  }, []);

  const loadNilaiData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getNilaiAkhir();

      console.log("Response nilai akhir peserta:", data);

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
        });

        setComponents(data.data.components || []);
      } else {
        setError(data?.message || "Nilai akhir belum tersedia");
      }
    } catch (err) {
      console.error("Error nilai akhir peserta:", err);

      setError(
        err.response?.data?.message ||
          "Nilai akhir belum tersedia atau belum difinalisasi oleh mentor",
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF Transkrip - VERTIKAL (Portrait)
  const generateTranskripPDF = async () => {
    const doc = new jsPDF("portrait", "mm", "a4");
    let yPos = 20;

    // Header
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, 210, 45, "F");

    // Logo
    const logoImg = new Image();
    logoImg.src = logo;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });
    doc.addImage(logoImg, "PNG", 80, 8, 50, 12);

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSCRIPT OF INTERNSHIP", 105, 32, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text("Laporan Hasil Evaluasi Magang", 105, 40, { align: "center" });

    // Content background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 45, 210, 252, "F");

    yPos = 55;

    // Identitas
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text("IDENTITAS PESERTA", 15, yPos);
    yPos += 5;
    doc.setDrawColor(13, 148, 136);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    doc.text("Nama Lengkap", 20, yPos);
    doc.text(": " + nilai.participant_name, 80, yPos);
    yPos += 8;
    doc.text("NIM", 20, yPos);
    doc.text(": " + nilai.participant_nim, 80, yPos);
    yPos += 8;
    doc.text("Program Studi", 20, yPos);
    doc.text(": " + nilai.participant_program, 80, yPos);
    yPos += 8;
    doc.text("Institusi", 20, yPos);
    doc.text(": " + nilai.institution, 80, yPos);
    yPos += 8;
    doc.text("Periode Magang", 20, yPos);
    doc.text(
      `: ${new Date(nilai.start_date).toLocaleDateString("id-ID")} - ${new Date(nilai.end_date).toLocaleDateString("id-ID")}`,
      80,
      yPos,
    );
    yPos += 15;

    // Rincian Nilai
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text("RINCIAN NILAI", 15, yPos);
    yPos += 5;
    doc.setDrawColor(13, 148, 136);
    doc.line(15, yPos, 195, yPos);
    yPos += 10;

    // Table Header
    doc.setFillColor(240, 253, 250);
    doc.rect(15, yPos - 5, 180, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Komponen", 20, yPos);
    doc.text("Nilai", 120, yPos, { align: "center" });
    doc.text("Bobot", 145, yPos, { align: "center" });
    doc.text("Kontribusi", 170, yPos, { align: "center" });
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    components.forEach((comp, idx) => {
      doc.text(comp.name, 20, yPos + idx * 7);
      doc.text(comp.nilai.toString(), 120, yPos + idx * 7, { align: "center" });
      doc.text(comp.bobot + "%", 145, yPos + idx * 7, { align: "center" });
      doc.text(comp.kontribusi.toString(), 170, yPos + idx * 7, {
        align: "center",
      });
    });
    yPos += components.length * 7 + 10;

    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total Nilai Akhir", 20, yPos);
    doc.text(nilai.total.toString(), 165, yPos, { align: "right" });
    yPos += 8;
    doc.text("Grade", 20, yPos);
    doc.text(nilai.grade, 165, yPos, { align: "right" });
    yPos += 8;
    doc.text("Predikat", 20, yPos);
    doc.text(nilai.predikat, 165, yPos, { align: "right" });
    yPos += 15;

    // Signatures
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Mentor Pembimbing", 50, yPos + 20);
    doc.text("CEO PT Kuanta Kreasi", 140, yPos + 20);
    doc.setFont("helvetica", "bold");
    doc.text(nilai.mentor_name, 50, yPos + 28);
    doc.text(nilai.ceo_name, 140, yPos + 28);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 105, 280, {
      align: "center",
    });

    return doc.output("blob");
  };

  // Generate PDF Sertifikat - HORIZONTAL (Landscape) - 2 Halaman
  const generateSertifikatPDF = async () => {
    const doc = new jsPDF("landscape", "mm", "a4");

    // ============ HALAMAN 1: SERTIFIKAT ============
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, "F");

    // Border dekoratif
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(1);
    doc.rect(13, 13, 271, 184);
    doc.setLineWidth(0.3);
    doc.rect(16, 16, 265, 178);

    // Corner decorations
    doc.setFillColor(13, 148, 136);
    [20, 277, 20, 277].forEach((x, i) => {
      const y = i < 2 ? 20 : 190;
      doc.circle(x, y, 3, "F");
    });

    // Header gradient bar
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, 297, 50, "F");
    doc.setFillColor(6, 95, 70);
    doc.rect(0, 0, 297, 5, "F");

    // Logo
    const logoImg = new Image();
    logoImg.src = logo;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });
    doc.addImage(logoImg, "PNG", 123, 10, 50, 12);

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("SERTIFIKAT PENYELESAIAN MAGANG", 148.5, 38, { align: "center" });

    // Content
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Diberikan Kepada", 148.5, 75, { align: "center" });

    doc.setFontSize(32);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text(nilai.participant_name, 148.5, 100, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Telah menyelesaikan program magang di", 148.5, 125, {
      align: "center",
    });

    doc.setFontSize(18);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text("PT Kuanta Kreasi", 148.5, 145, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("dengan predikat", 148.5, 165, { align: "center" });

    // Grade badge
    doc.setFillColor(240, 253, 250);
    const gradeText = nilai.predikat;
    const gradeWidth = doc.getTextWidth(gradeText) + 30;
    doc.roundedRect(148.5 - gradeWidth / 2, 172, gradeWidth, 12, 6, 6, "F");
    doc.setDrawColor(13, 148, 136);
    doc.roundedRect(148.5 - gradeWidth / 2, 172, gradeWidth, 12, 6, 6, "D");
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text(gradeText, 148.5, 181, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("serta memperoleh nilai akhir", 148.5, 200, { align: "center" });

    doc.setFontSize(48);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text(nilai.total.toString(), 148.5, 228, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("/ 100", 180, 220);
    doc.text(`Grade: ${nilai.grade}`, 148.5, 245, { align: "center" });

    // Signatures
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");

    doc.text("Mentor Pembimbing", 80, 270);
    doc.text("CEO PT Kuanta Kreasi", 200, 270);
    doc.setFont("helvetica", "bold");
    doc.text(nilai.mentor_name, 80, 278);
    doc.text(nilai.ceo_name, 200, 278);

    // Certificate number
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`No: ${nilai.certificate_number}`, 148.5, 295, {
      align: "center",
    });

    // ============ HALAMAN 2: LAMPIRAN NILAI ============
    doc.addPage("landscape", "a4");

    // Header halaman 2
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, 297, 40, "F");
    doc.setFillColor(6, 95, 70);
    doc.rect(0, 0, 297, 5, "F");

    doc.addImage(logoImg, "PNG", 123, 8, 50, 12);
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("LAMPIRAN SERTIFIKAT", 148.5, 28, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text("Rincian Nilai Akhir Magang", 148.5, 36, { align: "center" });

    // Content halaman 2
    let y = 55;

    // Identitas
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text("IDENTITAS PESERTA", 20, y);
    y += 5;
    doc.setDrawColor(13, 148, 136);
    doc.line(20, y, 277, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    doc.text("Nama Lengkap", 25, y);
    doc.text(": " + nilai.participant_name, 80, y);
    y += 7;
    doc.text("NIM", 25, y);
    doc.text(": " + nilai.participant_nim, 80, y);
    y += 7;
    doc.text("Program Studi", 25, y);
    doc.text(": " + nilai.participant_program, 80, y);
    y += 7;
    doc.text("Institusi", 25, y);
    doc.text(": " + nilai.institution, 80, y);
    y += 7;
    doc.text("Periode Magang", 25, y);
    doc.text(
      `: ${new Date(nilai.start_date).toLocaleDateString("id-ID")} - ${new Date(nilai.end_date).toLocaleDateString("id-ID")}`,
      80,
      y,
    );
    y += 15;

    // Rincian Nilai
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text("RINCIAN NILAI", 20, y);
    y += 5;
    doc.line(20, y, 277, y);
    y += 10;

    // Table Header
    doc.setFillColor(240, 253, 250);
    doc.rect(20, y - 5, 257, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Komponen", 25, y);
    doc.text("Nilai", 150, y, { align: "center" });
    doc.text("Bobot", 190, y, { align: "center" });
    doc.text("Kontribusi", 230, y, { align: "center" });
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    components.forEach((comp, idx) => {
      doc.text(comp.name, 25, y + idx * 7);
      doc.text(comp.nilai.toString(), 150, y + idx * 7, { align: "center" });
      doc.text(comp.bobot + "%", 190, y + idx * 7, { align: "center" });
      doc.text(comp.kontribusi.toString(), 230, y + idx * 7, {
        align: "center",
      });
    });
    y += components.length * 7 + 15;

    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total Nilai Akhir", 25, y);
    doc.text(nilai.total.toString(), 250, y, { align: "right" });
    y += 8;
    doc.text("Grade", 25, y);
    doc.text(nilai.grade, 250, y, { align: "right" });
    y += 8;
    doc.text("Predikat", 25, y);
    doc.text(nilai.predikat, 250, y, { align: "right" });
    y += 15;

    // Signatures
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Mentor Pembimbing", 100, y + 15);
    doc.text("CEO PT Kuanta Kreasi", 200, y + 15);
    doc.setFont("helvetica", "bold");
    doc.text(nilai.mentor_name, 100, y + 23);
    doc.text(nilai.ceo_name, 200, y + 23);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 148.5, 200, {
      align: "center",
    });

    return doc.output("blob");
  };

  // Preview di dalam modal (menggunakan iframe)
  const handlePreviewTranskrip = async () => {
    try {
      const pdfBlob = await generateTranskripPDF();
      const url = URL.createObjectURL(pdfBlob);
      setPreviewPdfUrl(url);
      setPreviewType("transkrip");
      setShowTranskripModal(true);
    } catch (error) {
      alert("Gagal preview transkrip");
    }
  };

  const handlePreviewSertifikat = async () => {
    try {
      const pdfBlob = await generateSertifikatPDF();
      const url = URL.createObjectURL(pdfBlob);
      setPreviewPdfUrl(url);
      setPreviewType("sertifikat");
      setShowSertifikatModal(true);
    } catch (error) {
      alert("Gagal preview sertifikat");
    }
  };

  const handleDownloadTranskrip = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await generateTranskripPDF();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transkrip_nilai_${nilai.participant_name.replace(/\s/g, "_")}_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Gagal mengunduh transkrip nilai");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSertifikat = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await generateSertifikatPDF();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sertifikat_magang_${nilai.participant_name.replace(/\s/g, "_")}_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Gagal mengunduh sertifikat");
    } finally {
      setDownloading(false);
    }
  };

  const closePreviewModal = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setPreviewType(null);
    setShowTranskripModal(false);
    setShowSertifikatModal(false);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "from-teal-500 to-blue-600";
      case "B":
        return "from-blue-500 to-indigo-600";
      case "C":
        return "from-indigo-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getGradeIcon = (grade) => {
    switch (grade) {
      case "A":
        return <Diamond size={28} />;
      case "B":
        return <Gem size={28} />;
      default:
        return <Award size={28} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-5 py-5 pb-10 mx-auto space-y-5 max-w-7xl md:px-6">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 blur-xl opacity-30 animate-pulse"></div>
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-5 py-5 pb-10 mx-auto space-y-5 max-w-7xl md:px-6">
        <div className="p-6 text-center border-l-4 border-red-500 bg-red-50 rounded-xl">
          <AlertCircle size="48" className="mx-auto mb-3 text-red-500" />
          <p className="font-medium text-red-600">{error}</p>
          <button
            onClick={loadNilaiData}
            className="px-4 py-2 mt-4 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-5 pb-10 mx-auto space-y-5 max-w-7xl md:px-6">
      {/* NOTE UNTUK BACKEND DEVELOPER */}
      {!USE_REAL_API && (
        <div className="p-5 border-l-4 shadow-lg bg-amber-50/90 border-amber-500 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-xl">
                <Server size="18" className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">
                Catatan untuk Backend Developer
              </h3>
              <div className="mt-2 text-xs text-amber-700">
                <p>
                  Halaman ini menggunakan DATA DUMMY. Backend perlu membuat
                  endpoint:
                </p>
                <div className="p-3 mt-2 font-mono text-xs bg-amber-100 rounded-xl">
                  <p>1. GET /api/peserta/nilai-akhir</p>
                  <p>2. GET /api/peserta/sertifikat/download</p>
                  <p>3. GET /api/peserta/transkrip/download</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative p-6 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md"></div>
            <div className="relative flex items-center justify-center shadow-lg w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl">
              <Award className="text-white w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text">
              Nilai Akhir Magang
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Hasil evaluasi akhir program magang
            </p>
          </div>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="relative p-8 overflow-hidden shadow-2xl rounded-2xl bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-700">
        <div className="absolute top-0 right-0 rounded-full w-80 h-80 bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>

        <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Trophy size="14" className="text-white" />
              <span className="text-xs font-medium text-white">
                Nilai Akhir
              </span>
            </div>
            <p className="mb-2 font-bold text-white text-7xl">{nilai.total}</p>
            <div className="flex items-center justify-center gap-3 mb-4 lg:justify-start">
              <span
                className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${getGradeColor(nilai.grade)} text-white font-bold text-lg shadow-lg`}
              >
                {nilai.grade}
              </span>
              <span className="font-medium text-white/90">
                {nilai.predikat}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 lg:justify-start text-white/80">
              <Verified size="14" />
              <span className="text-sm">
                {nilai.status === "lulus" ? "Dinyatakan Lulus" : "Belum Lulus"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center border-4 rounded-full shadow-xl w-36 h-36 bg-white/10 backdrop-blur-sm border-white/30">
              {getGradeIcon(nilai.grade)}
            </div>
            <div className="text-center">
              <p className="text-xs tracking-wider uppercase text-white/70">
                Periode Magang
              </p>
              <p className="text-sm font-medium text-white">
                {new Date(nilai.start_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                -
                {new Date(nilai.end_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Components Breakdown */}
      <div className="overflow-hidden border border-gray-100 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600">
              <Star size="14" className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800">
              Rincian Nilai per Komponen
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {components.map((comp, idx) => {
              const progressWidth = (comp.nilai / 100) * 100;
              const colorGradients = [
                "from-teal-500 to-cyan-500",
                "from-cyan-500 to-blue-500",
                "from-blue-500 to-indigo-500",
                "from-indigo-500 to-purple-500",
                "from-purple-500 to-pink-500",
              ];

              return (
                <div
                  key={idx}
                  className="p-4 transition-all duration-200 border border-gray-100 group rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorGradients[idx % colorGradients.length]} flex items-center justify-center shadow-md`}
                      >
                        {idx === 0 && (
                          <UserCheck size="16" className="text-white" />
                        )}
                        {idx === 1 && (
                          <ClipboardList size="16" className="text-white" />
                        )}
                        {idx === 2 && (
                          <Brain size="16" className="text-white" />
                        )}
                        {idx === 3 && (
                          <Users size="16" className="text-white" />
                        )}
                        {idx === 4 && (
                          <Award size="16" className="text-white" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {comp.name}
                        </span>
                        <p className="text-xs text-gray-400">
                          {comp.keterangan}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-teal-600">
                        {comp.nilai}
                      </span>
                      <span className="text-sm text-gray-400">/100</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress Nilai</span>
                      <span>
                        Bobot: {comp.bobot}% | Kontribusi: {comp.kontribusi}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colorGradients[idx % colorGradients.length]} rounded-full transition-all duration-700`}
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="p-5 transition border border-teal-100 shadow-md bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl hover:shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center shadow-md w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
                <ScrollText size="22" className="text-white" />
              </div>
              <div>
                <p className="text-xs tracking-wider text-gray-500 uppercase">
                  Transkrip Nilai
                </p>
                <p className="text-xl font-bold text-teal-600">{nilai.total}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviewTranskrip}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 transition-all bg-white border border-teal-200 rounded-xl hover:bg-teal-50"
              >
                <Printer size="14" />
                Preview
              </button>
              <button
                onClick={handleDownloadTranskrip}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl hover:shadow-md"
              >
                {downloading ? (
                  <Loader2 size="14" className="animate-spin" />
                ) : (
                  <Download size="14" />
                )}
                Unduh
              </button>
            </div>
          </div>
        </div>

        {nilai.status === "lulus" && nilai.certificate_available && (
          <div className="p-5 transition border border-blue-100 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shadow-md w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <GraduationCap size="22" className="text-white" />
                </div>
                <div>
                  <p className="text-xs tracking-wider text-gray-500 uppercase">
                    Sertifikat Magang
                  </p>
                  <p className="text-xl font-bold text-blue-600">Tersedia</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviewSertifikat}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 transition-all bg-white border border-blue-200 rounded-xl hover:bg-blue-50"
                >
                  <Printer size="14" />
                  Preview
                </button>
                <button
                  onClick={handleDownloadSertifikat}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:shadow-md"
                >
                  {downloading ? (
                    <Loader2 size="14" className="animate-spin" />
                  ) : (
                    <Download size="14" />
                  )}
                  Unduh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-5 border border-teal-100 shadow-md bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div>
            <div className="relative p-2.5 bg-white rounded-xl shadow-md">
              <Shield size="16" className="text-teal-500" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-teal-800">
              Informasi Penilaian
            </p>
            <p className="mt-1 text-xs leading-relaxed text-teal-700">
              Nilai akhir dihitung berdasarkan bobot masing-masing komponen
              penilaian.
              {nilai?.status === "lulus" &&
                " Selamat! Anda dinyatakan lulus dan berhak mendapatkan sertifikat penyelesaian magang."}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Preview Transkrip */}
      {showTranskripModal && previewPdfUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closePreviewModal}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 shadow-md bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl">
                  <ScrollText size="18" className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Preview Transkrip Nilai
                  </h2>
                  <p className="text-xs text-gray-500">
                    Transkrip Nilai Magang (Vertikal)
                  </p>
                </div>
              </div>
              <button
                onClick={closePreviewModal}
                className="p-2 rounded-lg hover:bg-white/50"
              >
                <X size="20" className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 bg-gray-100 overflow-y-auto max-h-[calc(90vh-80px)]">
              <iframe
                src={previewPdfUrl}
                className="w-full h-[calc(90vh-120px)] rounded-lg"
                title="Preview Transkrip"
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closePreviewModal}
                className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Tutup
              </button>
              <button
                onClick={handleDownloadTranskrip}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl hover:shadow-md"
              >
                <Download size="16" /> Unduh Transkrip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Sertifikat */}
      {showSertifikatModal && previewPdfUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closePreviewModal}
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <GraduationCap size="18" className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Preview Sertifikat
                  </h2>
                  <p className="text-xs text-gray-500">
                    Sertifikat Penyelesaian Magang (Horizontal - 2 Halaman)
                  </p>
                </div>
              </div>
              <button
                onClick={closePreviewModal}
                className="p-2 rounded-lg hover:bg-white/50"
              >
                <X size="20" className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 bg-gray-100 overflow-y-auto max-h-[calc(90vh-80px)]">
              <iframe
                src={previewPdfUrl}
                className="w-full h-[calc(90vh-120px)] rounded-lg"
                title="Preview Sertifikat"
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closePreviewModal}
                className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Tutup
              </button>
              <button
                onClick={handleDownloadSertifikat}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:shadow-md"
              >
                <Download size="16" /> Unduh Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NilaiAkhir;
