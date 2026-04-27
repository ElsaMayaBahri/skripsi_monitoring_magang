import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../utils/api";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role || "peserta";
  const existingUserData = location.state?.userData;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [mentorList, setMentorList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    divisi: "",
    divisi_id: "",
    mentor: "",
    mentor_id: "",
    kampus: "",
    prodi: "",
    status: "aktif",
  });

  // LOAD DATA DARI API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load divisi list
        const divisiResult = await api.getDivisi();
        const divisiData = divisiResult.data || divisiResult;
        setDivisiList(Array.isArray(divisiData) ? divisiData : []);

        // Load mentor list untuk peserta - PERBAIKAN: gunakan getMentorList()
        if (userRole === "peserta") {
          console.log("Loading mentor list...");
          const mentorResult = await api.getMentors();
          console.log("Mentor result:", mentorResult);
          const mentorData = mentorResult.data || mentorResult;
          setMentorList(Array.isArray(mentorData) ? mentorData : []);
          console.log("Mentor list set:", mentorData);
        }

        // Jika data sudah dikirim dari Users page, gunakan itu
        if (existingUserData) {
          setForm({
            name: existingUserData.name || "",
            email: existingUserData.email || "",
            phone: existingUserData.phone || "",
            divisi: existingUserData.divisi || "",
            divisi_id: existingUserData.divisi_id || "",
            mentor: existingUserData.mentor || "",
            mentor_id: existingUserData.mentor_id || "",
            kampus: existingUserData.kampus || "",
            prodi: existingUserData.prodi || "",
            status: existingUserData.status || "aktif",
          });
        } else {
          // Load data berdasarkan role
          if (userRole === "peserta") {
            const result = await api.getPeserta();
            const pesertaData = result.data || result;
            const userData = Array.isArray(pesertaData)
              ? pesertaData.find((item) => item.id_peserta == id)
              : null;
            if (userData) {
              console.log("Loaded peserta data:", userData);
              setForm({
                name: userData.user?.nama || "",
                email: userData.user?.email || "",
                phone: userData.user?.no_telepon || "",
                divisi: userData.divisi?.nama_divisi || "",
                divisi_id: userData.id_divisi || "",
                mentor: userData.mentor?.user?.nama || "",
                mentor_id: userData.id_mentor || "",
                kampus: userData.asal_kampus || "",
                prodi: userData.prodi || "",
                status: userData.user?.status_akun || "aktif",
              });
            }
          } else {
            const result = await api.getMentors();
            const mentorData = result.data || result;
            const userData = Array.isArray(mentorData)
              ? mentorData.find(
                  (item) => item.id_mentor == id || item.id_user == id,
                )
              : null;
            if (userData) {
              setForm({
                name: userData.user?.nama || userData.name || "",
                email: userData.user?.email || userData.email || "",
                phone: userData.user?.no_telepon || userData.phone || "",
                divisi: userData.divisi?.nama_divisi || userData.divisi || "",
                divisi_id: userData.id_divisi || "",
                mentor: "",
                mentor_id: "",
                kampus: "",
                prodi: "",
                status: userData.user?.status_akun === "aktif" ? "aktif" : "non_aktif",
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Gagal memuat data: ${err.message}. Silakan coba lagi.`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, userRole, existingUserData]);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Jika memilih divisi, ambil juga ID-nya
    if (name === "divisi") {
      const selectedDivisi = divisiList.find((d) => d.nama_divisi === value);
      setForm({
        ...form,
        divisi: value,
        divisi_id: selectedDivisi ? selectedDivisi.id_divisi : "",
      });
    }
    // Jika memilih mentor, ambil juga ID-nya - PERBAIKAN: akses user.nama
    else if (name === "mentor") {
      const selectedMentor = mentorList.find((m) => {
        // Cek struktur data mentor yang benar
        const mentorName = m.user?.nama || m.nama || m.name;
        return mentorName === value;
      });
      setForm({
        ...form,
        mentor: value,
        mentor_id: selectedMentor ? (selectedMentor.id_mentor || selectedMentor.id) : "",
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // SAVE TO API
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Validasi form sebelum submit
    if (!form.name || form.name.trim() === "") {
      setError("Nama lengkap harus diisi");
      setSaving(false);
      return;
    }

    if (!form.email || form.email.trim() === "") {
      setError("Email harus diisi");
      setSaving(false);
      return;
    }

    try {
      // Prepare data berdasarkan role
      let updateData = {};

      if (userRole === "peserta") {
        updateData = {
          nama: form.name, // Gunakan 'nama' sesuai backend
          email: form.email,
          no_telepon: form.phone,
          status_akun: form.status,
          asal_kampus: form.kampus,
          prodi: form.prodi,
          id_divisi: form.divisi_id || null,
          id_mentor: form.mentor_id || null,
          status_magang: form.status,
        };

        // Hapus field yang tidak diperlukan atau null
        Object.keys(updateData).forEach((key) => {
          if (
            updateData[key] === undefined ||
            updateData[key] === "" ||
            updateData[key] === null
          ) {
            delete updateData[key];
          }
        });

        console.log("Updating peserta with data:", updateData);
        await api.updatePeserta(id, updateData);
      } else {
        // Untuk MENTOR
        updateData = {
          nama: form.name,
          email: form.email,
          no_telepon: form.phone,
          status_akun: form.status,
          id_divisi: form.divisi_id || null,
        };

        Object.keys(updateData).forEach((key) => {
          if (updateData[key] === undefined || updateData[key] === null) {
            delete updateData[key];
          }
        });

        console.log("Updating mentor with data:", updateData);
        await api.updateMentor(id, updateData);
      }

      alert("Perubahan berhasil disimpan");
      navigate("/admin/users");
    } catch (err) {
      console.error("Error saving data:", err);
      let errorMessage =
        err.message || "Gagal menyimpan perubahan. Silakan coba lagi.";

      if (err.errors) {
        const validationErrors = Object.values(err.errors).flat().join(", ");
        errorMessage = `Validasi gagal: ${validationErrors}`;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Edit Data {userRole === "peserta" ? "Peserta" : "Mentor"}
        </h1>
        <p className="text-sm text-gray-500">
          Perbarui informasi akun pengguna.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* INFORMASI AKUN */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Informasi Akun</h2>

          <div className="space-y-3">
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />

            {/* STATUS */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    status: form.status === "aktif" ? "non_aktif" : "aktif",
                  })
                }
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                  form.status === "aktif" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition-transform ${
                    form.status === "aktif" ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

            <input
              value={userRole}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />

            <input
              type="password"
              value="********"
              disabled
              className="border p-2 rounded w-full bg-gray-100"
              placeholder="Password (ubah melalui menu ganti password)"
            />
          </div>
        </div>

        {/* IDENTITAS */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Identitas</h2>

          <div className="space-y-3">
            <input
              name="name"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />

            <input
              name="phone"
              placeholder="No. Telepon"
              value={form.phone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* AKADEMIK - Only for Peserta */}
        {userRole === "peserta" && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Informasi Akademik</h2>

            <div className="space-y-3">
              <input
                name="kampus"
                placeholder="Asal Kampus"
                value={form.kampus}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />

              <input
                name="prodi"
                placeholder="Program Studi"
                value={form.prodi}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        )}

        {/* MAGANG */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Informasi Magang</h2>

          <div className="space-y-3">
            <select
  name="divisi"
  value={form.divisi || ""}
  onChange={handleChange}
  className="border p-2 rounded w-full"
>
  <option key="divisi-default" value="">Pilih Divisi</option>
  {divisiList.map((divisi) => (
    <option key={divisi.id_divisi} value={divisi.nama_divisi}>
      {divisi.nama_divisi}
    </option>
  ))}
</select>

            {userRole === "peserta" && (
  <select
    name="mentor"
    value={form.mentor || ""}
    onChange={handleChange}
    className="border p-2 rounded w-full"
  >
    <option key="mentor-default" value="">Pilih Mentor</option>
    {mentorList.map((mentor) => {
      const mentorName = mentor.user?.nama || mentor.nama || mentor.name;
      const mentorId = mentor.id_mentor || mentor.id;
      return (
        <option key={mentorId} value={mentorName}>
          {mentorName}
        </option>
      );
    })}
  </select>
)}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex justify-end mt-8 gap-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 transition"
          disabled={saving}
        >
          Batal
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg transition ${
            saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

export default EditUser;