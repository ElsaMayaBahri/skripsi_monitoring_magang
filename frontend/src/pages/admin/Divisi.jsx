import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { api } from "../../utils/api"
import { logActivity } from "../../utils/activityLogger"
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  X,
  Save,
  AlertCircle,
  Sparkles,
  Layers,
  Briefcase,
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  BadgeCheck,
  CalendarDays,
  Clock,
  Rocket,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Info
} from "lucide-react"

function Divisi() {
  const location = useLocation()
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [divisi, setDivisi] = useState([])
  const [mentors, setMentors] = useState([])
  const [peserta, setPeserta] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("peserta_terbanyak")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successType, setSuccessType] = useState("success")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [form, setForm] = useState({
    nama_divisi: "",
    deskripsi: "",
    status: "aktif",
  })

  const [editId, setEditId] = useState(null)
  const itemsPerPage = 6

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      setSuccessType("success")
      setShowSuccessModal(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const divisiResponse = await api.getDivisi()
      console.log("Divisi response from API:", divisiResponse)
      
      let divisiData = []
      if (divisiResponse && divisiResponse.success && Array.isArray(divisiResponse.data)) {
        divisiData = divisiResponse.data
      } else if (Array.isArray(divisiResponse)) {
        divisiData = divisiResponse
      }
      
      const divisiWithStatus = divisiData.map(d => ({
        ...d,
        status: d.status || "aktif",
        id_divisi: d.id_divisi || d.id
      }))
      setDivisi(divisiWithStatus)
      
      const [mentorsRes, pesertaRes] = await Promise.all([
        api.getMentors(),
        api.getPeserta()
      ])
      
      let mentorsData = []
      if (mentorsRes && mentorsRes.success && Array.isArray(mentorsRes.data)) {
        mentorsData = mentorsRes.data
      } else if (Array.isArray(mentorsRes)) {
        mentorsData = mentorsRes
      }
      
      let pesertaData = []
      if (pesertaRes && pesertaRes.success && Array.isArray(pesertaRes.data)) {
        pesertaData = pesertaRes.data
      } else if (Array.isArray(pesertaRes)) {
        pesertaData = pesertaRes
      }
      
      setMentors(mentorsData)
      setPeserta(pesertaData)
      
    } catch (err) {
      console.error("Error loading data:", err)
      setError(err.message || "Failed to load data")
      
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStats = (namaDivisi) => {
    const pesertaCount = peserta.filter((p) => {
      if (p.divisi && typeof p.divisi === 'object' && p.divisi.nama_divisi === namaDivisi) return true
      if (p.divisi === namaDivisi) return true
      if (p.nama_divisi === namaDivisi) return true
      if (p.divisi_name === namaDivisi) return true
      return false
    }).length

    const mentorCount = mentors.filter((m) => {
      if (m.divisi && typeof m.divisi === 'object' && m.divisi.nama_divisi === namaDivisi) return true
      if (m.divisi === namaDivisi) return true
      if (m.nama_divisi === namaDivisi) return true
      if (m.divisi_name === namaDivisi) return true
      return false
    }).length

    return { peserta: pesertaCount, mentor: mentorCount }
  }

  const handleEdit = (item) => {
    setForm({
      nama_divisi: item.nama_divisi,
      deskripsi: item.deskripsi || "",
      status: item.status || "aktif",
    })
    setEditId(item.id_divisi)
    setShowForm(true)
    setError("")
  }

  const handleSave = async () => {
    if (!form.nama_divisi.trim()) {
      setError("Nama divisi wajib diisi")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (editId !== null) {
        const updateData = {
          nama_divisi: form.nama_divisi.trim(),
          deskripsi: form.deskripsi || "",
          status: form.status
        }
        
        console.log("Updating divisi:", { id: editId, ...updateData })
        const response = await api.updateDivisi(editId, updateData)
        console.log("Update response:", response)
        
        if (response && response.success === false) {
          throw new Error(response.message || "Gagal memperbarui divisi")
        }
        
        logActivity("update", "divisi", form.nama_divisi)
        
        const statusText = form.status === "aktif" ? "diaktifkan" : "dinonaktifkan"
        setSuccessMessage(`Divisi "${form.nama_divisi}" berhasil ${statusText}!`)
        setSuccessType("update")
      } else {
        const addData = {
          nama_divisi: form.nama_divisi.trim(),
          deskripsi: form.deskripsi || "",
          status: form.status
        }
        
        console.log("Adding new divisi:", addData)
        const response = await api.addDivisi(addData)
        console.log("Add response:", response)
        
        if (response && response.success === false) {
          throw new Error(response.message || "Gagal menambahkan divisi")
        }
        
        logActivity("create", "divisi", form.nama_divisi)
        
        setSuccessMessage(`Divisi "${form.nama_divisi}" berhasil ditambahkan!`)
        setSuccessType("success")
      }
      
      await loadData()
      
      setForm({ nama_divisi: "", deskripsi: "", status: "aktif" })
      setEditId(null)
      setShowForm(false)
      setShowSuccessModal(true)
      
    } catch (err) {
      console.error("Error saving divisi:", err)
      setError(err.message || "Failed to save divisi")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (item) => {
    const stats = getStats(item.nama_divisi)
    if (stats.peserta > 0 || stats.mentor > 0) {
      setError(`Tidak dapat menghapus divisi "${item.nama_divisi}" karena masih memiliki ${stats.peserta} peserta dan ${stats.mentor} mentor. Nonaktifkan saja divisi ini.`)
      setTimeout(() => setError(""), 5000)
      return
    }
    setDeleteTarget(item)
    setShowDeleteModal(true)
    setError("")
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    
    setDeleteLoading(true)
    try {
      await api.deleteDivisi(deleteTarget.id_divisi)
      
      logActivity("delete", "divisi", deleteTarget.nama_divisi)
      
      await loadData()
      setShowDeleteModal(false)
      setSuccessMessage(`Divisi "${deleteTarget.nama_divisi}" berhasil dihapus!`)
      setSuccessType("delete")
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error deleting divisi:", err)
      setError(err.message || "Failed to delete divisi")
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
  }

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(type)
      if (type === "nama") {
        setSortOrder("asc")
      } else {
        setSortOrder("desc")
      }
    }
    setCurrentPage(1)
    setShowFilterDropdown(false)
  }

  const divisiWithStats = divisi.map(d => ({
    ...d,
    stats: getStats(d.nama_divisi)
  }))

  let filteredDivisi = divisiWithStats.filter((d) =>
    d.nama_divisi.toLowerCase().includes(search.toLowerCase())
  )

  filteredDivisi = filteredDivisi.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case "peserta_terbanyak":
        comparison = a.stats.peserta - b.stats.peserta
        break
      case "mentor_terbanyak":
        comparison = a.stats.mentor - b.stats.mentor
        break
      case "nama":
        comparison = a.nama_divisi.localeCompare(b.nama_divisi)
        break
      default:
        comparison = a.stats.peserta - b.stats.peserta
    }
    return sortOrder === "desc" ? -comparison : comparison
  })

  const totalPages = Math.ceil(filteredDivisi.length / itemsPerPage)
  const paginatedDivisi = filteredDivisi.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPeserta = divisi.reduce((acc, d) => acc + getStats(d.nama_divisi).peserta, 0)
  const totalMentor = divisi.reduce((acc, d) => acc + getStats(d.nama_divisi).mentor, 0)
  const totalAktif = divisi.filter(d => d.status === "aktif").length

  if (loading && divisi.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data divisi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Manajemen Divisi
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Kelola divisi dan distribusi peserta serta mentor
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setForm({ nama_divisi: "", deskripsi: "", status: "aktif" })
                setEditId(null)
                setShowForm(true)
                setError("")
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              disabled={loading}
            >
              <Plus size={16} />
              Tambah Divisi
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => setError("")} className="p-1 hover:bg-red-100 rounded-lg transition">
              <X size={14} className="text-red-500" />
            </button>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{divisi.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Divisi</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{totalPeserta}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Peserta</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2">
              <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{totalMentor}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Mentor</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{totalAktif}</p>
                <p className="text-xs text-slate-500 mt-0.5">Divisi Aktif</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2">
              <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari divisi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm text-slate-700 shadow-sm"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <Filter size={16} />
              <span>Sortir</span>
            </button>
            
            {showFilterDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                      <BarChart3 size={12} />
                      Urutkan Berdasarkan
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => handleSort("nama")}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${
                        sortBy === "nama" ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={14} />
                        <span>Nama Divisi (A-Z)</span>
                      </div>
                      {sortBy === "nama" && (
                        sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleSort("peserta_terbanyak")}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${
                        sortBy === "peserta_terbanyak" ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>Jumlah Peserta</span>
                      </div>
                      {sortBy === "peserta_terbanyak" && (
                        sortOrder === "desc" ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleSort("mentor_terbanyak")}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${
                        sortBy === "mentor_terbanyak" ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} />
                        <span>Jumlah Mentor</span>
                      </div>
                      {sortBy === "mentor_terbanyak" && (
                        sortOrder === "desc" ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                      )}
                    </button>
                  </div>
                  <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] text-slate-400 text-center">
                      {sortBy === "peserta_terbanyak" && sortOrder === "desc" && "Menampilkan divisi dengan peserta terbanyak di atas (↑)"}
                      {sortBy === "peserta_terbanyak" && sortOrder === "asc" && "Menampilkan divisi dengan peserta paling sedikit di atas (↓)"}
                      {sortBy === "mentor_terbanyak" && sortOrder === "desc" && "Menampilkan divisi dengan mentor terbanyak di atas (↑)"}
                      {sortBy === "mentor_terbanyak" && sortOrder === "asc" && "Menampilkan divisi dengan mentor paling sedikit di atas (↓)"}
                      {sortBy === "nama" && sortOrder === "asc" && "Menampilkan divisi dari A-Z (↑)"}
                      {sortBy === "nama" && sortOrder === "desc" && "Menampilkan divisi dari Z-A (↓)"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1.5 cursor-pointer" onClick={() => handleSort("peserta_terbanyak")}>
                      <Users size={12} />
                      Peserta
                      {sortBy === "peserta_terbanyak" && (
                        <span className="text-blue-500">
                          {sortOrder === "desc" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1.5 cursor-pointer" onClick={() => handleSort("mentor_terbanyak")}>
                      <UserCheck size={12} />
                      Mentor
                      {sortBy === "mentor_terbanyak" && (
                        <span className="text-blue-500">
                          {sortOrder === "desc" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDivisi.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                          <Building2 size="32" className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Belum ada data divisi</p>
                        <button
                          onClick={() => {
                            setForm({ nama_divisi: "", deskripsi: "", status: "aktif" })
                            setEditId(null)
                            setShowForm(true)
                            setError("")
                          }}
                          className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                        >
                          <Plus size={14} />
                          Tambah divisi pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDivisi.map((d) => {
                    const isActive = d.status === "aktif"
                    const stats = d.stats
                    const globalIndex = filteredDivisi.findIndex(item => item.id_divisi === d.id_divisi)
                    const isTopRank = sortBy === "peserta_terbanyak" && sortOrder === "desc" && globalIndex < 3
                    
                    return (
                      <tr key={d.id_divisi} className={`hover:bg-slate-50/50 transition-all duration-200 group ${isTopRank ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                              isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                            }`}>
                              <Building2 size={16} className="text-white" />
                            </div>
                            <span className={`font-semibold text-slate-800 text-sm ${isTopRank ? 'text-blue-600' : ''}`}>
                              {d.nama_divisi}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-slate-500 line-clamp-2 max-w-xs">
                            {d.deskripsi || "-"}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                            stats.peserta > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                            <Users size={12} />
                            <span className="text-sm font-bold">{stats.peserta}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                            stats.mentor > 0 ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                            <UserCheck size={12} />
                            <span className="text-sm font-bold">{stats.mentor}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                              <EyeOff size={10} />
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(d)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(d)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/30 to-white">
              <p className="text-[10px] text-slate-400">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredDivisi.length)} dari {filteredDivisi.length} divisi
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i
                      if (pageNum > totalPages) return null
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                            : "text-slate-600 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-white rounded-xl shadow-sm">
              <Shield size={16} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-800">
                <strong className="font-semibold">Informasi:</strong> Divisi yang memiliki peserta atau mentor tidak dapat dihapus. 
                Gunakan fitur <strong className="text-indigo-600">"Nonaktifkan"</strong> melalui menu Edit untuk menyembunyikan divisi dari form pendaftaran baru.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL FORM */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowForm(false)
              setEditId(null)
              setError("")
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                    {editId !== null ? <Edit2 size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    {editId !== null ? "Edit Divisi" : "Tambah Divisi Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditId(null)
                    setError("")
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-xl transition"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Nama Divisi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Contoh: Teknologi Informasi"
                      value={form.nama_divisi}
                      onChange={(e) => setForm({ ...form, nama_divisi: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Deskripsi
                  </label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      placeholder="Deskripsi singkat tentang divisi ini..."
                      value={form.deskripsi}
                      onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Status Divisi
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value="aktif"
                        checked={form.status === "aktif"}
                        onChange={() => setForm({ ...form, status: "aktif" })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-1.5">
                        <Eye size={14} className="text-emerald-600" />
                        <span className="text-sm text-slate-700 group-hover:text-emerald-600 transition">Aktif</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value="non_aktif"
                        checked={form.status === "non_aktif"}
                        onChange={() => setForm({ ...form, status: "non_aktif" })}
                        className="w-4 h-4 text-slate-500 focus:ring-slate-500"
                      />
                      <div className="flex items-center gap-1.5">
                        <EyeOff size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-700 group-hover:text-red-600 transition">Nonaktif</span>
                      </div>
                    </label>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[11px] text-blue-700 flex items-start gap-1.5">
                      <Info size={12} className="flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Catatan:</strong> Jika divisi dinonaktifkan, divisi ini tidak akan muncul di pilihan saat menambah/mengedit peserta atau mentor baru. 
                        Data peserta dan mentor yang sudah terdaftar di divisi ini tetap aman dan tidak terpengaruh.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditId(null)
                    setError("")
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition"
                  disabled={loading}
                >
                  Batal
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Simpan Divisi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && deleteTarget && (
          <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="w-full max-w-md pointer-events-auto">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500"></div>
                  
                  <div className="relative pt-6 pb-2 px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                      <Trash2 size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Hapus Divisi?</h3>
                    <p className="text-sm text-slate-500 mt-2">
                      Apakah Anda yakin ingin menghapus divisi <br />
                      <span className="font-semibold text-red-600">"{deleteTarget.nama_divisi}"</span>?
                    </p>
                    <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-[10px] text-amber-700">
                        ⚠️ Tindakan ini tidak dapat dibatalkan. Data yang terkait dengan divisi ini akan terpengaruh.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-4 flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Hapus
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleModalClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="w-full max-w-md pointer-events-auto">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <div className={`h-1.5 bg-gradient-to-r ${
                    successType === "delete" 
                      ? "from-red-500 via-rose-500 to-orange-500"
                      : "from-emerald-500 via-teal-500 to-cyan-500"
                  }`} />
                  
                  <div className="relative pt-8 pb-4 px-6 text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-xl ${
                      successType === "delete"
                        ? "bg-gradient-to-br from-red-500 via-rose-500 to-orange-500"
                        : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
                    }`}>
                      <CheckCircle size={42} className="text-white" strokeWidth={1.5} />
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-slate-800">
                        {successType === "delete" ? "Berhasil Dihapus!" : "Berhasil!"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{successMessage}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 px-6">
                    <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400">
                      <CalendarDays size={10} />
                      <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <Clock size={10} />
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-4">
                    <button
                      onClick={handleModalClose}
                      className="group relative w-full py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        <Rocket size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        Tutup
                      </span>
                    </button>
                  </div>
                  
                  <div className="pb-5 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full">
                      <BadgeCheck size={10} className="text-emerald-600" />
                      <span className="text-[9px] text-slate-500">
                        {successType === "delete" ? "Divisi telah dihapus" : "Operasi berhasil"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Divisi