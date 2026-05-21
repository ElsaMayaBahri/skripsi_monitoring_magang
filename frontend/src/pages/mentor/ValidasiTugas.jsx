// src/pages/mentor/ValidasiTugas.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Send,
  X,
  Eye,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  Award,
  Shield,
  Sparkles,
  Zap,
  Target,
  Activity,
  Filter,
  SortAsc,
  SortDesc,
  CheckCheck,
} from "lucide-react";

function ValidasiTugas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    catatan: "",
    status: "selesai",
  });

  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [tugasList, setTugasList] = useState([]);
  const [selectedTugasId, setSelectedTugasId] = useState(id || null);

  useEffect(() => {
    loadSubmissions();
  }, [id]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Jika ada id tugas spesifik dari URL params
      if (id) {
        const res = await fetch(
          `http://localhost:8000/api/mentor/tugas/${id}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        const data = await res.json();
        console.log("Submissions data:", data);

        if (data.success && Array.isArray(data.data)) {
          const transformed = data.data
            .filter((s) => s.submitted_at !== null)
            .map((s) => ({
              id: s.id_pengumpulan,
              peserta_id: s.id_peserta,
              peserta_nama: s.peserta_nama || "Unknown",
              peserta_divisi: s.peserta_divisi || "-",
              tugas_judul: s.tugas_judul || "-",
              status: s.status,
              submitted_at: s.submitted_at,
              file_url: s.file_url || null,
              file_name: s.file_tugas || null,
              submission_link: s.submission_link || null,
              catatan: s.catatan_mentor || null,
              nilai: s.nilai || null,
              progress: 0,
            }));
          setSubmissions(transformed);
          setFilteredSubmissions(transformed);
        }
      } else {
        // Jika tidak ada id, ambil semua tugas mentor lalu semua submissionsnya
        const resTugas = await fetch("http://localhost:8000/api/mentor/tugas", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const dataTugas = await resTugas.json();

        if (dataTugas.success && Array.isArray(dataTugas.data)) {
          // Gabungkan semua submissions dari semua tugas
          const allSubmissions = [];
          for (const tugas of dataTugas.data) {
            const resSub = await fetch(
              `http://localhost:8000/api/mentor/tugas/${tugas.id_tugas}/submissions`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              },
            );
            const dataSub = await resSub.json();
            if (dataSub.success && Array.isArray(dataSub.data)) {
              dataSub.data
                .filter((s) => s.submitted_at !== null)
                .forEach((s) => {
                  allSubmissions.push({
                    id: s.id_pengumpulan,
                    peserta_id: s.id_peserta,
                    peserta_nama: s.peserta_nama || "Unknown",
                    peserta_divisi: "-",
                    tugas_judul: tugas.judul || "-",
                    id_tugas: tugas.id_tugas,
                    status: s.status,
                    submitted_at: s.submitted_at,
                    file_url: s.file_url || null,
                    file_name: s.file_tugas || null,
                    submission_link: s.submission_link || null,
                    catatan: s.catatan_mentor || null,
                    nilai: s.nilai || null,
                    progress: 0,
                  });
                });
            }
          }
          setSubmissions(allSubmissions);
          setFilteredSubmissions(allSubmissions);
        }
      }
    } catch (err) {
      console.error("Gagal memuat submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...submissions];

    // Filter search
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.peserta_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.tugas_judul.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter status
    if (filterStatus !== "all") {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    // Hanya tampilkan yang sudah submit (submitted_at tidak null)
    filtered = filtered.filter((s) => s.submitted_at !== null);

    // Sorting berdasarkan tanggal submit
    filtered.sort((a, b) => {
      if (!a.submitted_at) return 1;
      if (!b.submitted_at) return -1;
      const dateA = new Date(a.submitted_at);
      const dateB = new Date(b.submitted_at);
      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredSubmissions(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortOrder, submissions]);

  const handleOpenModal = (submission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      catatan: submission.catatan || "",
      status:
        submission.status === "dikumpulkan" || submission.status === "terlambat"
          ? "selesai"
          : submission.status,
    });
    setShowModal(true);
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/mentor/tugas/submissions/${selectedSubmission.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: reviewForm.status,
            catatan_mentor: reviewForm.catatan,
            // tidak ada nilai, sudah otomatis
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === selectedSubmission.id
              ? { ...s, status: reviewForm.status, catatan: reviewForm.catatan }
              : s,
          ),
        );
        setShowModal(false);
        const statusText =
          reviewForm.status === "selesai" ? "diselesaikan" : "diminta revisi";
        setSuccessMessage(
          `Tugas ${selectedSubmission.peserta_nama} berhasil ${statusText}!`,
        );
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        alert("Gagal menyimpan validasi: " + data.message);
      }
    } catch (err) {
      console.error("Submit review error:", err);
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "selesai":
      case "dinilai":
        return {
          bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20",
          text: "text-emerald-600",
          icon: CheckCircle,
          label: "Selesai",
          border: "border-emerald-200",
        };
      case "revisi":
        return {
          bg: "bg-gradient-to-r from-purple-500/20 to-purple-600/20",
          text: "text-purple-600",
          icon: AlertCircle,
          label: "Revisi",
          border: "border-purple-200",
        };
      case "terlambat":
        return {
          bg: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
          text: "text-red-600",
          icon: AlertCircle,
          label: "Terlambat",
          border: "border-red-200",
        };
      case "dikumpulkan":
      default:
        return {
          bg: "bg-gradient-to-r from-slate-500/10 to-slate-600/10",
          text: "text-slate-500",
          icon: Clock,
          label: "Menunggu Review",
          border: "border-slate-200",
        };
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return null;
    return new Date(dateTime).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  // Hitung statistik untuk badge count
  const submittedSubmissions = submissions.filter(
    (s) => s.submitted_at !== null,
  );
  const statsCount = {
    all: submittedSubmissions.length,
    pending: submittedSubmissions.filter((s) => s.status === "pending").length,
    revisi: submittedSubmissions.filter((s) => s.status === "revisi").length,
    selesai: submittedSubmissions.filter((s) => s.status === "selesai").length,
  };

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.submitted_at).length,
    pending: submissions.filter((s) => s.status === "pending" && s.submitted_at)
      .length,
    completed: submissions.filter((s) => s.status === "selesai").length,
    revision: submissions.filter((s) => s.status === "revisi").length,
  };

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
      {/* Background Decoration */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-4 flex items-center gap-3 min-w-[320px]">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                Validasi Berhasil!
              </p>
              <p className="text-white/80 text-xs">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="text-white/70 hover:text-white"
            >
              <X size="16" />
            </button>
          </div>
        </div>
      )}

      <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ClipboardList className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Validasi Tugas
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Review dan validasi tugas yang telah dikumpulkan peserta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {stats.total}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total Peserta</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {stats.submitted}
              </p>
              <p className="text-xs text-slate-500 mt-1">Sudah Kumpul</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <p className="text-3xl font-bold text-teal-600">
                {stats.pending}
              </p>
              <p className="text-xs text-slate-500 mt-1">Menunggu Review</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-white/80 mt-1">Selesai</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Cari peserta atau judul tugas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setSortOrder("newest")}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${sortOrder === "newest" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <SortDesc size="12" />
                  Terbaru
                </button>
                <button
                  onClick={() => setSortOrder("oldest")}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${sortOrder === "oldest" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <SortAsc size="12" />
                  Terlama
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${filterStatus === "all" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Semua
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${filterStatus === "all" ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-500"}`}
                  >
                    {statsCount.all}
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${filterStatus === "pending" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Menunggu
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${filterStatus === "pending" ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-500"}`}
                  >
                    {statsCount.pending}
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus("revisi")}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${filterStatus === "revisi" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Revisi
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${filterStatus === "revisi" ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-500"}`}
                  >
                    {statsCount.revisi}
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus("selesai")}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${filterStatus === "selesai" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Selesai
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${filterStatus === "selesai" ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-500"}`}
                  >
                    {statsCount.selesai}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Sparkles size="14" className="text-teal-500" />
            Menampilkan{" "}
            <span className="font-bold text-slate-700">
              {currentItems.length}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-slate-700">
              {filteredSubmissions.length}
            </span>{" "}
            pengumpulan
          </p>
        </div>

        {/* Submissions Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Peserta
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tugas
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tgl Kumpul
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((sub) => {
                  const status = getStatusBadge(sub.status);
                  const StatusIcon = status.icon;
                  const isHovered = hoveredRow === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className="transition-all duration-300 group cursor-pointer"
                      onMouseEnter={() => setHoveredRow(sub.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        backgroundColor: isHovered
                          ? "rgba(20, 184, 166, 0.02)"
                          : "transparent",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {sub.peserta_nama.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                              {sub.peserta_nama}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-400">
                                {sub.peserta_divisi}
                              </span>
                              <span className="text-[9px] text-slate-300">
                                •
                              </span>
                              <span className="text-[9px] text-slate-400">
                                Progress {sub.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {sub.tugas_judul}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sub.submitted_at ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                              <Calendar size="12" className="text-teal-500" />
                            </div>
                            <span className="text-xs font-medium text-slate-600">
                              {formatDateTime(sub.submitted_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                              <Clock size="12" className="text-slate-400" />
                            </div>
                            Belum kumpul
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border ${status.border} shadow-sm`}
                        >
                          <StatusIcon size="10" />
                          <span className="text-[10px] font-semibold">
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenModal(sub)}
                          className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-xs font-semibold text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          disabled={!sub.submitted_at}
                        >
                          <span className="relative z-10 flex items-center gap-1.5">
                            <Eye size="12" />
                            {sub.status === "pending"
                              ? "Review"
                              : sub.status === "revisi"
                                ? "Review Ulang"
                                : "Lihat"}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="py-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <FileText size="32" className="text-slate-400" />
                </div>
              </div>
              <p className="text-slate-600 font-semibold mt-4">
                Belum ada pengumpulan
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Tidak ada tugas yang dikumpulkan peserta
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Zap size="14" className="text-teal-500" />
                Halaman{" "}
                <span className="font-bold text-slate-700">
                  {currentPage}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft size="18" />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {currentPage === pageNum && (
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 -z-10"></div>
                        )}
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"
                >
                  <ChevronRight size="18" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div>
              <div className="relative p-2.5 bg-white rounded-xl shadow-md">
                <Shield size="16" className="text-teal-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-800">
                Informasi Validasi
              </p>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                Berikan catatan yang konstruktif untuk setiap tugas. Peserta
                akan menerima notifikasi setelah Anda melakukan validasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-md">
                    <ClipboardList size="16" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Review Tugas
                  </h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedSubmission.peserta_nama} -{" "}
                  {selectedSubmission.tugas_judul}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size="18" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview File */}
              {selectedSubmission.file_url && (
                <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-50">
                      <FileText size="20" className="text-teal-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        File Tugas
                      </p>
                      <p className="text-xs text-slate-400">
                        Lihat file yang diupload peserta
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        window.open(selectedSubmission.file_url, "_blank")
                      }
                      className="ml-auto px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
                    >
                      <Download size="12" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Informasi Pengumpulan */}
              {selectedSubmission.submitted_at && (
                <div className="bg-gradient-to-r from-teal-50 to-white rounded-xl p-4 border border-teal-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <Calendar size="16" className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Tanggal Pengumpulan
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatDateTime(selectedSubmission.submitted_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-50">
                    <Activity size="12" className="text-teal-500" />
                  </div>
                  Status Validasi <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewForm((prev) => ({ ...prev, status: "selesai" }))
                    }
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      reviewForm.status === "selesai"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle size="16" />
                    Selesai
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReviewForm((prev) => ({ ...prev, status: "revisi" }))
                    }
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      reviewForm.status === "revisi"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <AlertCircle size="16" />
                    Revisi
                  </button>
                </div>
              </div>

              {/* Info Nilai Otomatis */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-lg bg-blue-100">
                    <Star size="12" className="text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-blue-800">
                    Nilai Otomatis
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`p-3 rounded-xl text-center border-2 ${
                      selectedSubmission?.nilai === 100
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-200 bg-white/60"
                    }`}
                  >
                    <p className="text-2xl font-bold text-emerald-600">100</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Tepat Waktu
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl text-center border-2 ${
                      selectedSubmission?.nilai === 50
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200 bg-white/60"
                    }`}
                  >
                    <p className="text-2xl font-bold text-amber-600">50</p>
                    <p className="text-[10px] text-gray-500 mt-1">Terlambat</p>
                  </div>
                  <div
                    className={`p-3 rounded-xl text-center border-2 ${
                      selectedSubmission?.nilai === 0 ||
                      !selectedSubmission?.nilai
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white/60"
                    }`}
                  >
                    <p className="text-2xl font-bold text-red-600">0</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Tidak Mengumpulkan
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-blue-600 mt-3 text-center">
                  Nilai peserta ini:{" "}
                  <span className="font-bold text-lg">
                    {selectedSubmission?.nilai ?? 0}
                  </span>
                </p>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-50">
                    <MessageSquare size="12" className="text-blue-500" />
                  </div>
                  Catatan / Feedback
                </label>
                <textarea
                  value={reviewForm.catatan}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      catatan: e.target.value,
                    }))
                  }
                  rows="4"
                  placeholder="Berikan catatan atau masukan yang konstruktif untuk peserta..."
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {submitting ? (
                    <Loader2 size="16" className="animate-spin" />
                  ) : (
                    <Send size="16" />
                  )}
                  {submitting ? "Menyimpan..." : "Simpan Review"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
        .slide-in-from-right {
          animation-name: slide-in-from-right;
        }
      `}</style>
    </div>
  );
}

export default ValidasiTugas;
