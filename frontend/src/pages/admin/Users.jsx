import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

function Users() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("peserta");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisiFilter, setDivisiFilter] = useState("all");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [divisiList, setDivisiList] = useState([]);

  // 🔥 LOAD DATA DARI API
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (tab === "peserta") {
        result = await api.getPeserta();
        console.log("Peserta API response:", result); // Debug log

        // Check if result has data property
        const pesertaData = result.data || result;

        // Transform data peserta ke format yang dibutuhkan
        const formattedData = Array.isArray(pesertaData)
          ? pesertaData.map((item) => ({
              id: item.id_peserta,
              name: item.user?.nama || item.nama || "No Name",
              email: item.user?.email || item.email || "",
              divisi: item.divisi?.nama_divisi || "",
              status:
                item.user?.status_akun || item.status_magang || "non_aktif",
              role: "peserta",
              initials: getInitials(item.user?.nama || item.nama),
              phone: item.user?.no_telepon || "",
              kampus: item.asal_kampus || "",
              prodi: item.prodi || "",
              mentor: item.mentor?.user?.nama || "",
              id_user: item.id_user,
            }))
          : [];

        setData(formattedData);
      } else {
        result = await api.getMentors();
        console.log("Mentor API response:", result); // Debug log

        // Check if result has data property
        const mentorData = result.data || result;

        // Transform data mentor ke format yang dibutuhkan
        const formattedData = Array.isArray(mentorData)
          ? mentorData.map((item) => ({
              id: item.id_mentor || item.id_user,
              name: item.user?.nama || item.name || item.nama || "No Name",
              email: item.user?.email || item.email || "",
              divisi: item.divisi?.nama_divisi || item.divisi || "",
              status:
                item.user?.status_akun === "aktif"
                  ? "aktif"
                  : item.status === true || item.status === "aktif"
                    ? "aktif"
                    : "non_aktif",
              role: "mentor",
              initials: getInitials(item.user?.nama || item.name || item.nama),
              phone: item.user?.no_telepon || item.phone || "",
              id_user: item.id_user,
            }))
          : [];

        setData(formattedData);
      }

      // Load divisi list
      const divisiResult = await api.getDivisiList();
      const divisiData = divisiResult.data || divisiResult;
      setDivisiList(Array.isArray(divisiData) ? divisiData : []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(`Gagal memuat data: ${err.message}. Silakan coba lagi.`);
    } finally {
      setLoading(false);
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  // 🔥 FILTER
  const filtered = data
    .filter((d) => d.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => (divisiFilter === "all" ? true : d.divisi === divisiFilter))
    .filter((d) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "aktif") return d.status === "aktif";
      if (statusFilter === "non_aktif") return d.status === "non_aktif";
      return true;
    });

  // 🔥 STATS
  const total = filtered.length;
  const aktif = filtered.filter((d) => d.status === "aktif").length;
  const non_aktif = filtered.filter((d) => d.status === "non_aktif").length;

  // 🔥 TOGGLE STATUS
  const toggleStatus = async (index) => {
    const user = filtered[index];
    const newStatus = user.status === "aktif" ? "non_aktif" : "aktif";

    try {
      if (tab === "peserta") {
        await api.updatePeserta(user.id, {
          status_magang: newStatus,  
          status_akun: newStatus,     
        });
      } else {
        await api.updateMentor(user.id, {
          status: newStatus === "aktif", 
        });
      }
      await loadData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Gagal mengubah status. Silakan coba lagi.");
    }
  };

  // 🔥 DELETE
  const handleDelete = async (index) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    const user = filtered[index];
    try {
      if (tab === "peserta") {
        await api.deletePeserta(user.id);
      } else {
        await api.deleteMentor(user.id);
      }
      // Reload data setelah delete
      await loadData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Gagal menghapus user. Silakan coba lagi.");
    }
  };

  // 🔥 ADD
  const handleAdd = () => {
    if (tab === "mentor") {
      navigate("/admin/add-mentor");
    } else {
      navigate("/admin/add-peserta");
    }
  };

  // 🔥 EDIT
  const handleEdit = (index) => {
    const user = filtered[index];
    navigate(`/admin/edit-user/${user.id}`, {
      state: { role: tab, userData: user },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#f5f7fb]">
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f5f7fb]">
      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Manajemen Akun</h2>
            <p className="text-sm text-gray-500">
              Kelola akun peserta dan mentor dalam sistem.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + Tambah {tab === "mentor" ? "Mentor" : "Peserta"}
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />

            <select
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
              value={divisiFilter}
            >
              <option value="all">Semua Divisi</option>
              {divisiList.map((divisi) => (
                <option key={divisi.id_divisi} value={divisi.nama_divisi}>
                  {divisi.nama_divisi}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
              value={statusFilter}
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="non_aktif">Nonaktif</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setTab("peserta")}
                className={`px-3 py-2 rounded transition ${
                  tab === "peserta"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Peserta
              </button>

              <button
                onClick={() => setTab("mentor")}
                className={`px-3 py-2 rounded transition ${
                  tab === "mentor"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Mentor
              </button>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Total Akun</p>
            <h2 className="text-xl font-bold">{total}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Akun Aktif</p>
            <h2 className="text-xl font-bold">{aktif}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Akun Nonaktif</p>
            <h2 className="text-xl font-bold text-orange-500">{non_aktif}</h2>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-3">Nama</th>
                <th>Email</th>
                <th>Divisi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {item.initials}
                      </div>
                      {item.name}
                    </td>

                    <td>{item.email}</td>

                    <td>
                      {item.divisi && (
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                          {item.divisi}
                        </span>
                      )}
                    </td>

                    <td>
                      {item.status === "aktif" ? (
                        <span className="text-green-600 text-xs">● Aktif</span>
                      ) : (
                        <span className="text-red-500 text-xs">● Nonaktif</span>
                      )}
                    </td>

                    <td className="flex gap-3 py-3">
                    

                      <button
                        onClick={() => handleEdit(i)}
                        className="hover:opacity-70 transition"
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleDelete(i)}
                        className="hover:opacity-70 transition"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;
