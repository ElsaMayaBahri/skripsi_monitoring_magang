// src/pages/peserta/PresensiPeserta.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Camera,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  RefreshCw,
  Wifi,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check,
  Building,
  Video,
  AlertCircle,
  Heart,
  CalendarX,
  Laptop,
  Smartphone as MobileIcon,
  User,
} from "lucide-react";
import jamKerjaApi from "../../api/peserta/jamKerjaApi";
import axiosInstance from "../../api/axios"; // ← TAMBAHKAN IMPORT INI
import {
  postPesertaCheckin,
  postPesertaCheckout,
  getPesertaPresensiToday,
} from "../../api/peserta/presensiService";

function PresensiPeserta() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedPhotoFile, setCapturedPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    jenis_kehadiran: "wfo",
    aktivitas: "",
    alasan_izin: "",
  });
  const [showAlasanIzin, setShowAlasanIzin] = useState(false);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
    fullAddress: "",
    isGetting: false,
    error: null,
  });
  const [photoSuccess, setPhotoSuccess] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const [jamKerja, setJamKerja] = useState({
    jam_masuk: "08:00:00",
    jam_pulang: "17:00:00",
    batas_terlambat: 15,
  });

  // ===== TAMBAHAN: State hari libur =====
  const [isHariLibur, setIsHariLibur] = useState(false);
  const [infoLibur, setInfoLibur] = useState("");
  // ======================================

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    if (photoSuccess) {
      const timer = setTimeout(() => setPhotoSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [photoSuccess]);

  useEffect(() => {
    loadJamKerja();
    checkTodayPresensi();
    getCurrentLocation();
    checkHariLibur(); // ← TAMBAHKAN INI
  }, []);

  // ===== TAMBAHAN: Fungsi cek hari libur =====
  const checkHariLibur = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axiosInstance.get(`/hari-libur/check?tanggal=${today}`);
      if (response.data?.is_libur) {
        setIsHariLibur(true);
        setInfoLibur(response.data?.keterangan || "Hari Libur");
      }
    } catch (err) {
      // Gagal cek hari libur tidak perlu blokir halaman
      console.error("Gagal cek hari libur:", err);
    }
  };
  // ===========================================

  const loadJamKerja = async () => {
    try {
      const response = await jamKerjaApi.getJamKerja();
      if (response.success && response.data) {
        setJamKerja({
          jam_masuk: response.data.jam_masuk || "08:00:00",
          jam_pulang: response.data.jam_pulang || "17:00:00",
          batas_terlambat: response.data.batas_terlambat || 15,
        });
      }
    } catch (err) {
      console.error("Error load jam kerja:", err);
    }
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  const isWithinWorkingHours = () => {
    return true;
  };

  const checkTodayPresensi = async () => {
    try {
      const response = await getPesertaPresensiToday();
      if (response.success && response.data) {
        const presensi = response.data;
        if (presensi.check_in && !presensi.check_out) {
          setCheckinStatus({
            success: true,
            time: presensi.check_in,
            foto: presensi.foto_checkin,
          });
          setCheckoutStatus({ pending: true });
          if (presensi.daily_report) {
            setFormData((prev) => ({
              ...prev,
              aktivitas: presensi.daily_report || "",
            }));
          }
          if (presensi.jenis_kehadiran) {
            setFormData((prev) => ({
              ...prev,
              jenis_kehadiran: presensi.jenis_kehadiran,
            }));
            setShowAlasanIzin(presensi.jenis_kehadiran === "izin");
          }
        } else if (presensi.check_in && presensi.check_out) {
          setCheckinStatus({ success: true, time: presensi.check_in });
          setCheckoutStatus({ success: true, time: presensi.check_out });
        }
      }
    } catch (err) {
      console.error("Gagal cek presensi hari ini:", err);
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id-ID",
            "User-Agent": "PresensiApp/1.0",
          },
        }
      );
      const data = await response.json();

      if (data && data.display_name) {
        const fullAddress = data.display_name;
        const address = data.address;
        const houseNumber = address.house_number || "";
        const road = address.road || address.street || "";
        const village =
          address.village || address.suburb || address.neighbourhood || "";

        let shortAddress = "";
        if (road) {
          shortAddress += road;
          if (houseNumber) shortAddress += " " + houseNumber;
        }
        if (village) {
          if (shortAddress) shortAddress += ", ";
          shortAddress += village;
        }
        if (!shortAddress) {
          shortAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        return { fullAddress, shortAddress };
      }
      return {
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        shortAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
    } catch (error) {
      return {
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        shortAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
    }
  };

  const getCurrentLocation = () => {
    setLocation((prev) => ({ ...prev, isGetting: true, error: null }));

    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        isGetting: false,
        error: "Geolocation tidak didukung",
        address: "Tidak didukung",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const addressData = await getAddressFromCoordinates(latitude, longitude);

        setLocation({
          lat: latitude,
          lng: longitude,
          address: addressData.shortAddress,
          fullAddress: addressData.fullAddress,
          isGetting: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Gagal mendapatkan lokasi";
        if (error.code === error.PERMISSION_DENIED)
          errorMessage = "Izin lokasi ditolak";
        else if (error.code === error.POSITION_UNAVAILABLE)
          errorMessage = "Lokasi tidak tersedia";
        setLocation((prev) => ({
          ...prev,
          isGetting: false,
          error: errorMessage,
          address: errorMessage,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraReady(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      }, 100);
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      } catch (fallbackErr) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Izin kamera ditolak. Izinkan kamera untuk melanjutkan.");
        } else if (err.name === "NotFoundError") {
          setCameraError("Tidak ada kamera yang terdeteksi");
        } else {
          setCameraError("Tidak dapat mengakses kamera");
        }
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setPopup({ show: true, title: "Error", message: "Video atau canvas tidak tersedia", type: "error" });
      return;
    }

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setPopup({ show: true, title: "Error", message: "Kamera belum siap, tunggu sebentar", type: "error" });
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    const photoData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photoData);

    const blob = dataURLtoBlob(photoData);
    const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
    setCapturedPhotoFile(file);

    stopCamera();
    setPhotoSuccess(true);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCapturedPhotoFile(null);
    setPhotoSuccess(false);
    setTimeout(() => startCamera(), 100);
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleJenisKehadiranChange = (value) => {
    setFormData((prev) => ({ ...prev, jenis_kehadiran: value, alasan_izin: "" }));
    setShowAlasanIzin(value === "izin");
  };

  const handleCheckin = async () => {
    if (!capturedPhoto) {
      setPopup({ show: true, title: "Foto diperlukan", message: "Silakan ambil foto selfie terlebih dahulu", type: "error" });
      return;
    }
    if (!location.lat) {
      setPopup({ show: true, title: "Lokasi diperlukan", message: "Mohon tunggu lokasi selesai didapatkan", type: "error" });
      return;
    }
    if (formData.jenis_kehadiran === "izin" && !formData.alasan_izin.trim()) {
      setPopup({ show: true, title: "Alasan diperlukan", message: "Silakan isi alasan izin terlebih dahulu", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const formDataApi = new FormData();
      formDataApi.append("foto", capturedPhotoFile);
      formDataApi.append("lokasi", location.fullAddress || location.address);
      formDataApi.append("lokasi_koordinat", `${location.lat},${location.lng}`);
      formDataApi.append("jenis_kehadiran", formData.jenis_kehadiran);
      if (formData.jenis_kehadiran === "izin") {
        formDataApi.append("alasan_izin", formData.alasan_izin);
      }

      const response = await postPesertaCheckin(formDataApi);

      if (response.success) {
        setCheckinStatus({ success: true, time: response.data.check_in, foto: capturedPhoto });
        setCheckoutStatus({ pending: true });
      } else {
        // ===== TAMBAHAN: Handle response hari libur dari backend =====
        if (response.is_hari_libur) {
          setIsHariLibur(true);
          setInfoLibur(response.message || "Hari Libur");
          return;
        }
        // =============================================================
        throw new Error(response.message || "Check-in gagal");
      }
    } catch (err) {
      const errData = err.response?.data;
      // ===== TAMBAHAN: Handle error 422 hari libur dari backend =====
      if (errData?.is_hari_libur) {
        setIsHariLibur(true);
        setInfoLibur(errData?.message || "Hari Libur");
        return;
      }
      // ==============================================================
      setPopup({
        show: true,
        title: "Check-in Gagal",
        message: errData?.message || err.message || "Terjadi kesalahan",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!formData.aktivitas.trim()) {
      setPopup({ show: true, title: "Aktivitas diperlukan", message: "Aktivitas hari ini wajib diisi", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await postPesertaCheckout({ daily_report: formData.aktivitas });

      if (response.success) {
        setCheckoutStatus({ success: true, time: response.data.check_out });
      } else {
        throw new Error(response.message || "Check-out gagal");
      }
    } catch (err) {
      setPopup({
        show: true,
        title: "Check-out Gagal",
        message: err.response?.data?.message || err.message || "Terjadi kesalahan",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const currentDateFormatted = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const currentDayName = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  const jenisKehadiranOptions = [
    { value: "wfo", label: "WFO", icon: Building },
    { value: "wfh", label: "WFH", icon: Wifi },
    { value: "izin", label: "Izin", icon: CalendarX },
    { value: "sakit", label: "Sakit", icon: Heart },
  ];

  // SUDAH CHECKOUT
  if (checkoutStatus?.success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-3xl shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-cyan-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Check-out Berhasil!</h2>
          <p className="text-slate-500 text-sm mb-6">{checkoutStatus.time}</p>
          <button
            onClick={() => navigate("/peserta/riwayat-presensi")}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-600 transition-all mb-2"
          >
            Lihat Riwayat
          </button>
          <button
            onClick={() => navigate("/peserta/dashboard")}
            className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  // SUDAH CHECK-IN — tidak terpengaruh hari libur karena sudah terlanjur checkin
  if (checkinStatus?.success && checkoutStatus?.pending) {
    return (
      <div className="min-h-screen bg-slate-50 py-4">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl mb-5 shadow-lg">
              <div className="absolute inset-0 bg-[#2563eb] rounded-3xl" />
              <div className="relative px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Daily Report</h1>
                    <p className="text-white/70 text-sm">Isi laporan harian sebelum check-out</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-1.5 border border-white/20 shadow-inner">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/70 uppercase tracking-wide">Status Kehadiran</span>
                    <span className="text-[11px] font-semibold text-white">Sedang Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 mb-6">
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/60 to-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[105px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-cyan-600">Check-in</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-cyan-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-slate-700 tracking-tight">{checkinStatus.time}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[105px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-blue-600">Jenis</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-slate-700 uppercase tracking-tight">{formData.jenis_kehadiran}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[105px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600">Tanggal</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700 tracking-tight leading-tight">{currentDateFormatted}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 leading-none">{currentDayName}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-slate-700">Lokasi Check-in</span>
              </div>
              <p className="text-sm text-slate-600">{location.fullAddress || location.address || "Tidak tersedia"}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 rounded-t-3xl" />
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Daily Report / Aktivitas Hari Ini <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.aktivitas}
                    onChange={(e) => setFormData((prev) => ({ ...prev, aktivitas: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all resize-none"
                    placeholder="Ceritakan aktivitas yang telah Anda lakukan hari ini..."
                  />
                </div>
                {checkinStatus.foto && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={checkinStatus.foto} alt="Check-in" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Foto Check-in</p>
                      <p className="text-xs text-slate-500">Berhasil diverifikasi</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-cyan-500 ml-auto" />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigate("/peserta/dashboard")}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-cyan-100 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? "Memproses..." : "Check-out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BELUM CHECK-IN
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-4">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">

            {/* Hero Header */}
            <div className="relative rounded-3xl mb-5 shadow-lg">
              <div className="absolute inset-0 bg-[#2563eb] rounded-3xl" />
              <div className="relative px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Check-in Magang</h1>
                    <p className="text-white/70 text-sm">{currentDateFormatted} - {currentDayName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== TAMBAHAN: Banner Hari Libur ===== */}
            {isHariLibur && (
              <div className="mb-5 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CalendarX className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 text-base mb-1">Hari Libur</p>
                  <p className="text-sm text-amber-700">
                    {infoLibur} — Hari ini adalah hari libur, tidak perlu melakukan absensi.
                  </p>
                  <p className="text-xs text-amber-500 mt-2">
                    Presensi hari ini tidak akan mempengaruhi penilaian kehadiran kamu.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/peserta/dashboard")}
                  className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-all"
                >
                  Dashboard
                </button>
              </div>
            )}
            {/* ======================================= */}

            {/* Form absensi hanya ditampilkan jika BUKAN hari libur */}
            {!isHariLibur && (
              <>
                {/* Camera Card */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm mb-5">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 rounded-t-3xl" />
                  <div className="p-5">
                    <canvas ref={canvasRef} className="hidden" />

                    {cameraError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-2 mb-3">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-red-700">{cameraError}</p>
                            <button onClick={startCamera} className="text-[10px] text-red-600 font-medium mt-0.5">Coba lagi</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!stream && !capturedPhoto && !cameraError && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-7 h-7 text-cyan-600" />
                        </div>
                        <p className="text-sm text-slate-500 mb-3">Ambil foto selfie sebagai bukti kehadiran</p>
                        <button
                          onClick={startCamera}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-cyan-100 transition-all"
                        >
                          <Video className="w-4 h-4" /> Buka Kamera
                        </button>
                      </div>
                    )}

                    {stream && !capturedPhoto && (
                      <div className="space-y-2">
                        <div className="relative bg-black rounded-xl overflow-hidden">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-[280px] object-cover" />
                          <button
                            onClick={capturePhoto}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-xl font-medium text-sm shadow-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-cyan-600" /> Ambil Foto
                          </button>
                        </div>
                        {!cameraReady && (
                          <p className="text-xs text-center text-amber-500 animate-pulse">Mempersiapkan kamera...</p>
                        )}
                      </div>
                    )}

                    {capturedPhoto && (
                      <div className="space-y-2">
                        <div className="relative bg-slate-100 rounded-xl overflow-hidden">
                          <img src={capturedPhoto} alt="Selfie" className="w-full h-[280px] object-contain" />
                          <button
                            onClick={retakePhoto}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-xl font-medium text-sm shadow-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-500" /> Foto Ulang
                          </button>
                        </div>
                        {photoSuccess && (
                          <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 bg-green-50 p-2 rounded-xl animate-in fade-in duration-300">
                            <Check className="w-4 h-4" /> Foto berhasil diambil
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Jenis Kehadiran Card */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm mb-5">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 rounded-t-3xl" />
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Kehadiran</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {jenisKehadiranOptions.map((option) => {
                          const Icon = option.icon;
                          const isActive = formData.jenis_kehadiran === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleJenisKehadiranChange(option.value)}
                              className={`py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                                  : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm bg-white"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {showAlasanIzin && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Alasan Izin <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.alasan_izin}
                          onChange={(e) => setFormData((prev) => ({ ...prev, alasan_izin: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all resize-none"
                          placeholder="Contoh: Ada keperluan keluarga, sakit, dll..."
                        />
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-medium text-slate-700">Lokasi</span>
                        {location.isGetting && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                        {!location.isGetting && location.lat && (
                          <button onClick={getCurrentLocation} className="ml-auto">
                            <RefreshCw className="w-3 h-3 text-slate-400 hover:text-cyan-600" />
                          </button>
                        )}
                      </div>
                      {location.isGetting ? (
                        <p className="text-xs text-slate-500">Mendapatkan lokasi...</p>
                      ) : location.error ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <p className="text-xs text-red-500 flex-1 truncate">{location.error}</p>
                          <button onClick={getCurrentLocation} className="text-xs text-cyan-600">Coba</button>
                        </div>
                      ) : location.lat ? (
                        <p className="text-sm text-slate-700 break-words">{location.fullAddress}</p>
                      ) : (
                        <button onClick={getCurrentLocation} className="text-xs text-cyan-600">Dapatkan lokasi</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="relative z-20">
                  <button
                    onClick={handleCheckin}
                    disabled={
                      loading ||
                      !capturedPhoto ||
                      !location.lat ||
                      (formData.jenis_kehadiran === "izin" && !formData.alasan_izin.trim())
                    }
                    className="w-full flex items-center justify-center gap-2 py-3 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-cyan-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {loading ? "Memproses..." : "Konfirmasi Check-in"}
                  </button>
                </div>

                {(!capturedPhoto || !location.lat) && (
                  <p className="text-xs text-center text-amber-600 flex items-center justify-center gap-1 mt-3">
                    <AlertTriangle className="w-3 h-3" />
                    {!capturedPhoto && !location.lat && "Ambil foto selfie & dapatkan lokasi terlebih dahulu"}
                    {!capturedPhoto && location.lat && "Ambil foto selfie terlebih dahulu"}
                    {capturedPhoto && !location.lat && "Dapatkan lokasi Anda terlebih dahulu"}
                  </p>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`p-4 ${popup.type === "success" ? "bg-green-50" : popup.type === "error" ? "bg-red-50" : "bg-blue-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${popup.type === "success" ? "bg-green-100" : popup.type === "error" ? "bg-red-100" : "bg-blue-100"}`}>
                  {popup.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {popup.type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                </div>
                <h3 className={`font-semibold ${popup.type === "success" ? "text-green-800" : popup.type === "error" ? "text-red-800" : "text-blue-800"}`}>
                  {popup.title}
                </h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-600 text-sm">{popup.message}</p>
              <button
                onClick={() => setPopup({ show: false, title: "", message: "", type: "info" })}
                className="w-full mt-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PresensiPeserta;