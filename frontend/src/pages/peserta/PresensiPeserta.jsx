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
  Smartphone,
  FileText,
  AlertTriangle,
  RotateCcw,
  CameraOff,
  Check,
  Navigation,
  Building,
  Home,
  Video,
  VideoOff,
  AlertCircle,
  Info,
  Heart,
  CalendarX,
  Laptop,
  Smartphone as MobileIcon,
} from "lucide-react";
import jamKerjaApi from "../../api/peserta/jamKerjaApi";
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
    kendala: "",
    rencana: "",
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

  // State untuk modal popup
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  // State untuk jam kerja
  const [jamKerja, setJamKerja] = useState({
    jam_masuk: "08:00:00",
    jam_pulang: "17:00:00",
    batas_terlambat: 15,
  });
  const [jamKerjaLoading, setJamKerjaLoading] = useState(true);

  // Load jam kerja dari API
  useEffect(() => {
    loadJamKerja();
    checkTodayPresensi();
    getCurrentLocation();
  }, []);

  const loadJamKerja = async () => {
    try {
      setJamKerjaLoading(true);
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
    } finally {
      setJamKerjaLoading(false);
    }
  };

  // Helper function untuk validasi jam kerja
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  const isWithinWorkingHours = (date = null) => {
    const now = date ? new Date(date) : new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const masukTotalMinutes = timeToMinutes(jamKerja.jam_masuk);
    const pulangTotalMinutes = timeToMinutes(jamKerja.jam_pulang);

    // Jika jam kerja normal, contoh 08:00 - 17:00
    if (masukTotalMinutes <= pulangTotalMinutes) {
      return (
        currentTotalMinutes >= masukTotalMinutes &&
        currentTotalMinutes <= pulangTotalMinutes
      );
    }

    // Jika jam kerja melewati tengah malam, contoh 21:00 - 05:00
    return (
      currentTotalMinutes >= masukTotalMinutes ||
      currentTotalMinutes <= pulangTotalMinutes
    );
  };

  const formatJamKerja = () => {
    const masuk = jamKerja.jam_masuk.substring(0, 5);
    const pulang = jamKerja.jam_pulang.substring(0, 5);
    return `${masuk} - ${pulang} WIB`;
  };

  // ============ CEK PRESENSI HARI INI DARI API ============
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
            try {
              const report = JSON.parse(presensi.daily_report);
              setFormData((prev) => ({
                ...prev,
                aktivitas: report.aktivitas || "",
                kendala: report.kendala || "",
                rencana: report.rencana || "",
              }));
            } catch (e) {}
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

  const stopCameraTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }
    setCameraReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
        },
      );
      const data = await response.json();

      if (data && data.display_name) {
        const address = data.address;
        const road = address.road || address.street || "";
        const suburb = address.suburb || address.neighbourhood || "";
        const city = address.city || address.town || address.village || "";

        let shortAddress = "";
        if (road) shortAddress += road;
        if (suburb) shortAddress += (shortAddress ? ", " : "") + suburb;
        if (!shortAddress && city) shortAddress = city;
        if (!shortAddress)
          shortAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        return { fullAddress: data.display_name, shortAddress: shortAddress };
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
        const addressData = await getAddressFromCoordinates(
          latitude,
          longitude,
        );

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
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ============ KAMERA DENGAN ZOOM ============
  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraReady(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      console.log("Requesting camera with zoom...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          zoom: { ideal: 1.5 },
        },
        audio: false,
      });

      console.log("STREAM obtained:", mediaStream.getTracks().length, "tracks");
      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          videoRef.current.onloadedmetadata = () => {
            console.log(
              "VIDEO READY - dimensions:",
              videoRef.current.videoWidth,
              "x",
              videoRef.current.videoHeight,
            );
            setCameraReady(true);
          };
        }
      }, 100);
    } catch (err) {
      console.error("CAMERA ERROR:", err);

      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      } catch (fallbackErr) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setCameraError(
            "Izin kamera ditolak. Klik icon gembok di address bar, izinkan kamera, lalu refresh.",
          );
        } else if (err.name === "NotFoundError") {
          setCameraError("Tidak ada kamera yang terdeteksi di perangkat Anda");
        } else {
          setCameraError(
            "Tidak dapat mengakses kamera: " + (err.message || "Unknown error"),
          );
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
      setPopup({
        show: true,
        title: "Error",
        message: "Video atau canvas tidak tersedia",
        type: "error",
      });
      return;
    }

    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setPopup({
        show: true,
        title: "Kamera Belum Siap",
        message:
          "Kamera belum siap, tunggu sebentar... Pastikan video terlihat di layar",
        type: "error",
      });
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
    const file = new File([blob], `selfie_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    setCapturedPhotoFile(file);

    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCapturedPhotoFile(null);
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

  // Handle ketika jenis kehadiran berubah
  const handleJenisKehadiranChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      jenis_kehadiran: value,
      alasan_izin: "",
    }));
    setShowAlasanIzin(value === "izin");
  };

  // ============ CHECK-IN ============
  const handleCheckin = async () => {
    if (!isWithinWorkingHours()) {
      setPopup({
        show: true,
        title: "Check-in Gagal",
        message: "Maaf, check-in hanya bisa dilakukan pada jam kerja!",
        type: "error",
      });
      return;
    }

    if (!capturedPhoto) {
      setPopup({
        show: true,
        title: "Check-in Gagal",
        message: "Silakan ambil foto selfie terlebih dahulu sebelum check-in.",
        type: "error",
      });
      return;
    }

    if (!location.lat) {
      setPopup({
        show: true,
        title: "Check-in Gagal",
        message:
          "Mohon tunggu lokasi selesai didapatkan atau klik refresh lokasi.",
        type: "error",
      });
      return;
    }

    if (formData.jenis_kehadiran === "izin" && !formData.alasan_izin.trim()) {
      setPopup({
        show: true,
        title: "Check-in Gagal",
        message: "Silakan isi alasan izin terlebih dahulu.",
        type: "error",
      });
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
        setPopup({
          show: true,
          title: "Check-in Berhasil!",
          message: `Check-in berhasil pada pukul ${response.data.check_in}!`,
          type: "success",
        });

        setCheckinStatus({
          success: true,
          time: response.data.check_in,
          foto: capturedPhoto,
        });
        setCheckoutStatus({ pending: true });
      } else {
        throw new Error(response.message || "Check-in gagal");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setPopup({
        show: true,
        title: "Check-in Gagal",
        message:
          err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat check-in. Silakan coba lagi.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============ CHECK-OUT ============
  const handleCheckout = async () => {
    if (!isWithinWorkingHours()) {
      setPopup({
        show: true,
        title: "Check-out Gagal",
        message: "Maaf, check-out hanya bisa dilakukan pada jam kerja!",
        type: "error",
      });
      return;
    }

    if (!formData.aktivitas.trim()) {
      setPopup({
        show: true,
        title: "Check-out Gagal",
        message: "Aktivitas hari ini wajib diisi sebelum check-out.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const dailyReport = JSON.stringify({
        aktivitas: formData.aktivitas,
        kendala: formData.kendala,
        rencana: formData.rencana,
      });

      const response = await postPesertaCheckout({ daily_report: dailyReport });

      if (response.success) {
        setPopup({
          show: true,
          title: "Check-out Berhasil!",
          message: `Check-out berhasil pada pukul ${response.data.check_out}!`,
          type: "success",
        });

        setCheckoutStatus({ success: true, time: response.data.check_out });
      } else {
        throw new Error(response.message || "Check-out gagal");
      }
    } catch (err) {
      console.error("Check-out error:", err);
      setPopup({
        show: true,
        title: "Check-out Gagal",
        message:
          err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat check-out. Silakan coba lagi.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentTime = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tomorrowDate = new Date(Date.now() + 86400000).toLocaleDateString(
    "id-ID",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  // Jenis kehadiran options
  const jenisKehadiranOptions = [
    {
      value: "wfo",
      label: "WFO",
      icon: Building,
      color: "from-teal-500 to-emerald-500",
    },
    {
      value: "wfh",
      label: "WFH",
      icon: Wifi,
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "izin",
      label: "Izin",
      icon: CalendarX,
      color: "from-blue-600 to-indigo-600",
    },
    {
      value: "sakit",
      label: "Sakit",
      icon: Heart,
      color: "from-rose-500 to-red-500",
    },
  ];

  // Device detection
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // ============ CONDITIONAL RENDER ============
  // SUDAH CHECKOUT
  if (checkoutStatus?.success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md p-6 mx-auto text-center bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <CheckCircle size="32" className="text-white" />
          </div>
          <h2 className="mb-1 text-lg font-bold text-gray-800">
            Check-out Berhasil!
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            Check-out: {checkoutStatus.time}
          </p>

          <div className="space-y-2">
            <button
              onClick={() => navigate("/peserta/riwayat-presensi")}
              className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-teal-500 to-blue-600"
            >
              Lihat Riwayat
            </button>
            <button
              onClick={() => navigate("/peserta/dashboard")}
              className="w-full px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg"
            >
              Dashboard
            </button>
          </div>

          <div className="p-3 mt-4 text-left rounded-lg bg-teal-50">
            <p className="text-xs text-gray-600">
              ✅ Anda sudah menyelesaikan presensi hari ini.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Silakan kembali besok, <strong>{tomorrowDate}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SUDAH CHECK-IN (tapi belum checkout)
  if (checkinStatus?.success && checkoutStatus?.pending) {
    return (
      <div className="px-5 py-4 space-y-5 md:px-6">
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Daily Report</h1>
              <p className="text-xs text-gray-500">
                Isi laporan harian Anda sebelum check-out
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="p-3 text-center border border-teal-200 rounded-xl bg-teal-50">
            <p className="text-xs font-medium text-teal-600">CHECK-IN</p>
            <p className="text-lg font-bold text-teal-700">
              {checkinStatus.time}
            </p>
          </div>
          <div className="p-3 text-center border rounded-xl bg-emerald-50 border-emerald-200">
            <p className="text-xs font-medium text-emerald-600">STATUS</p>
            <p className="text-sm font-bold text-emerald-700">Sedang Magang</p>
          </div>
          <div className="p-3 text-center border border-blue-200 rounded-xl bg-blue-50">
            <p className="text-xs font-medium text-blue-600">JENIS</p>
            <p className="text-sm font-bold text-blue-700 uppercase">
              {formData.jenis_kehadiran}
            </p>
          </div>
          <div className="p-3 text-center border border-gray-200 rounded-xl bg-gray-50">
            <p className="text-xs font-medium text-gray-600">TANGGAL</p>
            <p className="text-xs font-semibold text-gray-700">
              {currentDate.split(",")[0]}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="relative h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Aktivitas Hari Ini <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.aktivitas}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    aktivitas: e.target.value,
                  }))
                }
                rows="3"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-teal-400"
                placeholder="Ceritakan aktivitas yang Anda lakukan hari ini..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Kendala (opsional)
                </label>
                <textarea
                  value={formData.kendala}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kendala: e.target.value,
                    }))
                  }
                  rows="2"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-teal-400"
                  placeholder="Ada kendala? Ceritakan di sini..."
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Rencana Besok (opsional)
                </label>
                <textarea
                  value={formData.rencana}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rencana: e.target.value,
                    }))
                  }
                  rows="2"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-teal-400"
                  placeholder="Target dan rencana untuk esok hari..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => navigate("/peserta/dashboard")}
                className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || !formData.aktivitas.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {loading ? (
                  <Loader2 size="16" className="animate-spin" />
                ) : (
                  <Send size="16" />
                )}
                {loading ? "Memproses..." : "Check-out & Simpan"}
              </button>
            </div>
          </div>
        </div>

        {checkinStatus.foto && (
          <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-xl">
            <p className="flex items-center gap-1 mb-1 text-xs font-semibold text-gray-700">
              <Camera size="12" className="text-teal-500" /> Foto Check-in Anda
            </p>
            <img
              src={checkinStatus.foto}
              alt="Check-in selfie"
              className="object-cover w-16 h-16 border border-teal-200 rounded-lg"
            />
          </div>
        )}
      </div>
    );
  }

  // BELUM CHECK-IN - DENGAN BACKGROUND PREMIUM
  return (
    <>
      <div className="w-full min-h-screen px-5 py-4 pb-10 space-y-5 md:px-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
        {/* Header premium dengan shadow */}
        <div className="w-full overflow-hidden shadow-lg rounded-xl">
          <div className="p-5 text-white bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">Check-in Magang</h1>
                <p className="text-white/80 text-xs mt-0.5">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* INFO JAM KERJA */}
        <div className="p-3 border border-teal-100 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex items-center gap-2">
            <Clock size="16" className="text-teal-600" />
            <div>
              <p className="text-xs font-semibold text-teal-800">
                Jam Kerja: {formatJamKerja()}
              </p>
              <p className="text-xs text-teal-600">
                Batas keterlambatan: {jamKerja.batas_terlambat} menit
              </p>
            </div>
          </div>
        </div>

        {/* Camera Card */}
        <div className="bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Camera size="16" className="text-teal-500" /> Foto Selfie
                Kehadiran<span className="text-xs text-red-500">wajib</span>
              </h3>
              {stream && (
                <button
                  onClick={stopCamera}
                  className="p-1 text-red-500 rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <CameraOff size="14" />
                </button>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {cameraError && (
              <div className="p-3 mb-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size="16"
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-semibold text-red-700">
                      Izin Kamera Diperlukan
                    </p>
                    <p className="text-xs text-red-600">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1 mt-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!stream && !capturedPhoto && !cameraError && (
              <div className="py-10 text-center border border-gray-300 border-dashed rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl">
                  <Video size="28" className="text-teal-500" />
                </div>
                <p className="mb-3 text-sm font-medium text-gray-600">
                  Ambil foto selfie sebagai bukti kehadiran
                </p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-md transition-all flex items-center gap-1.5 mx-auto text-sm"
                >
                  <Camera size="14" /> Buka Kamera
                </button>
              </div>
            )}

            {stream && !capturedPhoto && (
              <div className="space-y-3">
                <div className="relative overflow-hidden bg-black rounded-lg shadow-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-[360px] object-cover"
                  />
                  <div className="absolute left-0 right-0 flex justify-center gap-2 bottom-3">
                    <button
                      onClick={capturePhoto}
                      className="px-5 py-2 bg-white rounded-full shadow-md font-semibold flex items-center gap-1.5 hover:bg-gray-100 transition-all text-sm"
                    >
                      <Camera size="14" className="text-teal-500" />
                      Ambil Foto
                    </button>
                  </div>
                </div>
                {!cameraReady && (
                  <p className="text-xs text-center text-orange-500 animate-pulse">
                    Mempersiapkan kamera, tunggu sebentar...
                  </p>
                )}
                {cameraReady && (
                  <p className="text-xs text-center text-green-500">
                    ✓ Kamera siap, silakan ambil foto
                  </p>
                )}
              </div>
            )}

            {capturedPhoto && (
              <div className="space-y-3">
                <div className="relative overflow-hidden bg-gray-100 rounded-lg shadow-md">
                  <img
                    src={capturedPhoto}
                    alt="Selfie"
                    className="w-full max-h-[360px] object-contain"
                  />
                  <div className="absolute left-0 right-0 flex justify-center gap-2 bottom-3">
                    <button
                      onClick={retakePhoto}
                      className="px-4 py-1.5 bg-white rounded-full shadow-md font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-all text-sm"
                    >
                      <RotateCcw size="14" className="text-orange-500" />
                      Foto Ulang
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                  <Check size="12" /> Foto berhasil diambil
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="p-5 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Jenis Kehadiran
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {jenisKehadiranOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleJenisKehadiranChange(option.value)}
                      className={`py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                        formData.jenis_kehadiran === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-md`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Icon size="16" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alasan Izin */}
            {showAlasanIzin && (
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <label className="block text-sm font-semibold text-blue-800 mb-1.5 flex items-center gap-1.5">
                  <CalendarX size="14" />
                  Alasan Izin <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.alasan_izin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      alasan_izin: e.target.value,
                    }))
                  }
                  rows="2"
                  className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-blue-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: Ada keperluan keluarga, sakit, dll..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Navigation size="14" className="text-teal-500" />
                Lokasi Saat Ini
              </label>
              <div
                className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${location.lat ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
              >
                <MapPin
                  size="16"
                  className={`flex-shrink-0 mt-0.5 ${location.lat ? "text-green-500" : "text-gray-400"}`}
                />
                <div className="flex-1">
                  {location.isGetting ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Loader2 size="12" className="animate-spin" /> Mendapatkan
                      lokasi...
                    </div>
                  ) : location.error ? (
                    <div>
                      <p className="text-xs text-red-600">{location.error}</p>
                      <button
                        onClick={getCurrentLocation}
                        className="flex items-center gap-1 mt-1 text-xs text-teal-500"
                      >
                        <RefreshCw size="10" /> Coba lagi
                      </button>
                    </div>
                  ) : location.lat ? (
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {location.address ||
                          `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Koordinat: {location.lat.toFixed(6)},{" "}
                        {location.lng.toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Klik refresh untuk mendapatkan lokasi
                    </p>
                  )}
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="p-1.5 rounded-lg bg-white hover:bg-gray-100 shadow-sm"
                  disabled={location.isGetting}
                >
                  <RefreshCw
                    size="14"
                    className={`text-teal-500 ${location.isGetting ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-500">
                    <Clock size="14" className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">WAKTU CHECK-IN</p>
                    <p className="text-base font-bold text-teal-600">
                      {currentTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 rounded-lg">
                  {isMobile ? (
                    <MobileIcon size="12" className="text-teal-500" />
                  ) : (
                    <Laptop size="12" className="text-teal-500" />
                  )}
                  <span className="text-xs text-gray-600">
                    {isMobile ? "Mobile" : "Desktop"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => navigate("/peserta/dashboard")}
                className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCheckin}
                disabled={
                  loading ||
                  !capturedPhoto ||
                  !location.lat ||
                  (formData.jenis_kehadiran === "izin" &&
                    !formData.alasan_izin.trim())
                }
                className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-teal-500 to-blue-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size="14" className="animate-spin" />
                ) : (
                  <CheckCircle size="14" />
                )}
                {loading ? "Memproses..." : "Konfirmasi Check-in"}
              </button>
            </div>

            {(!capturedPhoto || !location.lat) && (
              <div className="p-2 border rounded-lg bg-amber-50 border-amber-200">
                <p className="flex items-center gap-1 text-xs text-amber-700">
                  <AlertTriangle size="12" />
                  {!capturedPhoto &&
                    !location.lat &&
                    "Silakan ambil foto selfie dan klik refresh lokasi"}
                  {!capturedPhoto &&
                    location.lat &&
                    "Silakan ambil foto selfie terlebih dahulu"}
                  {capturedPhoto &&
                    !location.lat &&
                    "Klik refresh untuk mendapatkan lokasi Anda"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POPUP */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-xl">
            <div
              className={`p-4 ${
                popup.type === "success"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : popup.type === "error"
                    ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : "bg-gradient-to-r from-teal-500 to-blue-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
                  {popup.type === "success" && (
                    <CheckCircle size="16" className="text-white" />
                  )}
                  {popup.type === "error" && (
                    <AlertCircle size="16" className="text-white" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white">
                  {popup.title}
                </h3>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {popup.message}
              </p>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() =>
                    setPopup({
                      show: false,
                      title: "",
                      message: "",
                      type: "info",
                    })
                  }
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-teal-500 to-blue-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PresensiPeserta;
