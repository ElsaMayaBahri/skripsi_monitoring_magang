// src/pages/peserta/DaftarTugas.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Server,
  Lock,
  Eye,
  Upload,
  Link as LinkIcon,
  X,
  Paperclip,
  FolderOpen,
  Download,
  ExternalLink,
} from "lucide-react";

function DaftarTugas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tugasList, setTugasList] = useState([]);
  const [filteredTugas, setFilteredTugas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    loadTugasData();
  }, []);

  const loadTugasData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/peserta/tugas", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      console.log("Tugas data:", data);

      if (data.success && Array.isArray(data.data)) {
        const transformed = data.data.map((t) => ({
          id: t.id_pengumpulan,
          id_tugas: t.id_tugas,
          judul: t.tugas?.judul_tugas || t.judul_tugas || "Tanpa Judul",
          deskripsi_singkat: (
            t.tugas?.deskripsi ||
            t.deskripsi ||
            ""
          ).substring(0, 100),
          deskripsi_lengkap: t.tugas?.deskripsi || t.deskripsi || "-",
          cara_pengerjaan: t.tugas?.cara_pengerjaan || "",
          deadline: t.tugas?.deadline
            ? new Date(t.tugas.deadline).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "-",
          deadline_raw: t.tugas?.deadline || null,
          status: t.status || "pending",
          submitted_at: t.tanggal_kumpul || null,
          nilai: t.nilai || null,
          catatan: t.catatan_mentor || null,
          attachments: buildAttachments(t.tugas),
        }));
        setTugasList(transformed);
        setFilteredTugas(transformed);
      } else {
        console.error("Response tidak sesuai:", data);
        setTugasList([]);
        setFilteredTugas([]);
      }
    } catch (err) {
      console.error("Gagal memuat tugas:", err);
      setTugasList([]);
      setFilteredTugas([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk build attachments dari data tugas
  const buildAttachments = (tugas) => {
    if (!tugas) return [];
    const attachments = [];

    if (tugas.file_tugas) {
      attachments.push({
        type: "pdf",
        name: tugas.file_tugas.split("/").pop(),
        url: `http://localhost:8000/storage/${tugas.file_tugas}`,
        size: "",
      });
    }

    if (tugas.file_link) {
      attachments.push({
        type: "link",
        name: tugas.link_type || "Link Materi",
        url: tugas.file_link,
        external: true,
      });
    }

    return attachments;
  };

  useEffect(() => {
    let filtered = [...tugasList];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.deskripsi_singkat.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    setFilteredTugas(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, tugasList]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "selesai":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: CheckCircle,
          label: "Selesai",
        };
      case "revisi":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          icon: AlertCircle,
          label: "Perlu Revisi",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: Clock,
          label: "Belum Dikumpulkan",
        };
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline || deadline === "-")
      return { text: "text-gray-500", label: "No deadline" };

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "text-red-600", label: "Terlewat" };
    if (diffDays === 0) return { text: "text-red-500", label: "Hari ini!" };
    if (diffDays <= 3)
      return { text: "text-amber-600", label: `${diffDays} hari lagi` };
    return { text: "text-gray-500", label: `${diffDays} hari` };
  };

  const openDetailModal = (tugas) => {
    setSelectedTugas(tugas);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTugas(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTugas.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const stats = {
    total: tugasList.length,
    pending: tugasList.filter((t) => t.status === "pending").length,
    revisi: tugasList.filter((t) => t.status === "revisi").length,
    selesai: tugasList.filter((t) => t.status === "selesai").length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-5 pb-10 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-10 h-10 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-5 pb-10 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                Daftar Tugas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tugas dari mentor yang perlu dikerjakan
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/60 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-gray-700">{stats.total}</p>
            </div>
            <div className="bg-amber-50/60 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xs text-amber-600">Belum</p>
              <p className="font-bold text-amber-700">{stats.pending}</p>
            </div>
            <div className="bg-emerald-50/60 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xs text-emerald-600">Selesai</p>
              <p className="font-bold text-emerald-700">{stats.selesai}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === "all" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === "pending" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Belum ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus("revisi")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === "revisi" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Revisi ({stats.revisi})
            </button>
            <button
              onClick={() => setFilterStatus("selesai")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === "selesai" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Selesai ({stats.selesai})
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">
            {currentItems.length}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-700">
            {filteredTugas.length}
          </span>{" "}
          tugas
        </p>
        {filteredTugas.length > 0 && (
          <p className="text-xs text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </p>
        )}
      </div>

      {/* Tugas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentItems.map((tugas) => {
          const status = getStatusBadge(tugas.status);
          const StatusIcon = status.icon;
          const deadlineStatus = getDeadlineStatus(
            tugas.deadline_raw || tugas.deadline,
          );

          return (
            <div
              key={tugas.id}
              className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  tugas.status === "selesai"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : tugas.status === "revisi"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-teal-500 to-blue-600"
                }`}
              ></div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileText size="16" className="text-teal-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">
                      Tugas
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}
                  >
                    <StatusIcon size="8" />
                    <span className="text-[8px] font-medium">
                      {status.label}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  {tugas.judul}
                </h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {tugas.deskripsi_singkat}
                </p>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <Calendar size="10" />
                    <span>Deadline: {tugas.deadline}</span>
                    <span className={`ml-1 ${deadlineStatus.text}`}>
                      ({deadlineStatus.label})
                    </span>
                  </div>
                  {tugas.nilai && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <Star size="10" className="text-amber-500" />
                      <span>Nilai: {tugas.nilai}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openDetailModal(tugas)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center justify-center gap-1"
                  >
                    <Eye size="12" />
                    Detail
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/peserta/tugas/${tugas.id}/kumpul`)
                    }
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1 ${
                      tugas.status === "selesai"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md"
                    }`}
                    disabled={tugas.status === "selesai"}
                  >
                    <Upload size="12" />
                    {tugas.status === "selesai"
                      ? "Sudah Dikumpul"
                      : tugas.status === "revisi"
                        ? "Revisi"
                        : "Kumpulkan"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTugas.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 py-12 text-center">
          <ClipboardList size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada tugas</p>
          <p className="text-sm text-gray-400 mt-1">
            Tugas akan muncul setelah mentor memberikannya
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size="18" />
          </button>
          <div className="flex gap-1.5">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={idx}
                  className="w-9 h-9 flex items-center justify-center text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {page}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size="18" />
          </button>
        </div>
      )}

      {/* Modal Detail Tugas */}
      {showDetailModal && selectedTugas && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <FileText size="18" className="text-teal-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">
                    {selectedTugas.judul}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Deadline: {selectedTugas.deadline}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 rounded-lg hover:bg-white/50"
              >
                <X size="20" className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* Deskripsi Lengkap */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size="14" className="text-teal-600" />
                  <h3 className="font-semibold text-gray-800">
                    Deskripsi Tugas
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedTugas.deskripsi_lengkap}
                </p>
              </div>

              {/* Cara Pengerjaan */}
              {selectedTugas.cara_pengerjaan && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen size="14" className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">
                      Cara Pengerjaan
                    </h3>
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {selectedTugas.cara_pengerjaan}
                  </div>
                </div>
              )}

              {/* Lampiran dari Mentor */}
              {selectedTugas.attachments &&
                selectedTugas.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip size="14" className="text-purple-600" />
                      <h3 className="font-semibold text-gray-800">
                        Materi Pendukung
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selectedTugas.attachments.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              {item.type === "link" || item.type === "video" ? (
                                <LinkIcon
                                  size="14"
                                  className="text-purple-500"
                                />
                              ) : (
                                <FileText size="14" className="text-teal-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {item.name}
                              </p>
                              {item.size && (
                                <p className="text-xs text-gray-400">
                                  {item.size}
                                </p>
                              )}
                            </div>
                          </div>
                          {item.type === "link" || item.type === "video" ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              <ExternalLink size="12" /> Buka Link
                            </a>
                          ) : (
                            <a
                              href={item.url}
                              download
                              className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              <Download size="12" /> Download
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Catatan Revisi */}
              {selectedTugas.status === "revisi" && selectedTugas.catatan && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size="14" className="text-amber-600" />
                    <h3 className="font-semibold text-amber-800">
                      Catatan Revisi
                    </h3>
                  </div>
                  <p className="text-sm text-amber-700">
                    {selectedTugas.catatan}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closeDetailModal}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Tutup
              </button>
              {selectedTugas.status !== "selesai" && (
                <button
                  onClick={() => {
                    closeDetailModal();
                    navigate(`/peserta/tugas/${selectedTugas.id}/kumpul`);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-md transition flex items-center gap-2"
                >
                  <Upload size="14" />{" "}
                  {selectedTugas.status === "revisi"
                    ? "Unggah Revisi"
                    : "Kumpulkan Tugas"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DaftarTugas;
