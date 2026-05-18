// src/components/InputNilaiModal.jsx
import React, { useState, useCallback } from "react";
import { saveMentorNilai } from "../api/mentor/nilaiService";

function InputNilaiModal({ peserta, onClose, onSaveSuccess }) {
  const [nilaiForm, setNilaiForm] = useState({
    sikap: peserta.sikap || 80,
    kualitas_kerja: peserta.kualitas_kerja || 80,
    komunikasi: peserta.komunikasi || 80,
    kreativitas: peserta.kreativitas || 80,
    kerjasama: peserta.kerjasama || 80,
    inisiatif: peserta.inisiatif || 80,
    catatan: peserta.catatan || ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNilaiChange = useCallback((field, value) => {
    const numValue = parseInt(value) || 0;
    const validValue = Math.min(100, Math.max(0, numValue));
    setNilaiForm(prev => ({ ...prev, [field]: validValue }));
  }, []);

  const hitungRataRata = useCallback(() => {
    const values = [
      nilaiForm.sikap,
      nilaiForm.kualitas_kerja,
      nilaiForm.komunikasi,
      nilaiForm.kreativitas,
      nilaiForm.kerjasama,
      nilaiForm.inisiatif
    ];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [nilaiForm]);

  const getGrade = useCallback((nilai) => {
    if (nilai >= 85) return { label: "A", color: "text-teal-600", bg: "bg-teal-50", desc: "Sangat Baik" };
    if (nilai >= 75) return { label: "B", color: "text-blue-600", bg: "bg-blue-50", desc: "Baik" };
    if (nilai >= 65) return { label: "C", color: "text-purple-600", bg: "bg-purple-50", desc: "Cukup" };
    if (nilai >= 50) return { label: "D", color: "text-amber-600", bg: "bg-amber-50", desc: "Kurang" };
    return { label: "E", color: "text-slate-500", bg: "bg-slate-100", desc: "Sangat Kurang" };
  }, []);

  const handleSave = async () => {
    setSubmitting(true);
    setErrorMessage("");
    
    try {
      const payload = {
        id_peserta: peserta.id,
        sikap: nilaiForm.sikap,
        kualitas_kerja: nilaiForm.kualitas_kerja,
        komunikasi: nilaiForm.komunikasi,
        kreativitas: nilaiForm.kreativitas,
        kerjasama: nilaiForm.kerjasama,
        inisiatif: nilaiForm.inisiatif,
        catatan: nilaiForm.catatan
      };
      
      const response = await saveMentorNilai(payload);
      
      if (response.success) {
        const updatedPeserta = {
          ...peserta,
          sikap: nilaiForm.sikap,
          kualitas_kerja: nilaiForm.kualitas_kerja,
          komunikasi: nilaiForm.komunikasi,
          kreativitas: nilaiForm.kreativitas,
          kerjasama: nilaiForm.kerjasama,
          inisiatif: nilaiForm.inisiatif,
          catatan: nilaiForm.catatan,
          status: "sudah_dinilai"
        };
        onSaveSuccess(updatedPeserta);
      } else {
        setErrorMessage(response.message || "Gagal menyimpan nilai");
      }
    } catch (error) {
      console.error("Error saving nilai:", error);
      setErrorMessage("Terjadi kesalahan saat menyimpan nilai");
    } finally {
      setSubmitting(false);
    }
  };

  const rataRataPreview = hitungRataRata();
  const gradePreview = getGrade(rataRataPreview);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Input Nilai Manual</h3>
              <p className="text-sm text-slate-500 mt-1">{peserta.nama} • {peserta.divisi}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-all">
              ✕
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 mb-6 border border-teal-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Rata-rata Nilai Sementara</span>
              <span className="text-sm font-bold text-teal-600">{rataRataPreview}/100</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all" style={{ width: `${rataRataPreview}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradePreview.bg} ${gradePreview.color}`}>{gradePreview.label}</span>
              <span className="text-xs text-slate-500">{gradePreview.desc}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Sikap</label>
              <input 
                type="number" 
                value={nilaiForm.sikap} 
                onChange={(e) => handleNilaiChange("sikap", e.target.value)} 
                min="0" 
                max="100" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
              />
              <p className="text-[10px] text-slate-400">Disiplin, tanggung jawab, etika kerja</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Kualitas Kerja</label>
              <input 
                type="number" 
                value={nilaiForm.kualitas_kerja} 
                onChange={(e) => handleNilaiChange("kualitas_kerja", e.target.value)} 
                min="0" 
                max="100" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
              />
              <p className="text-[10px] text-slate-400">Ketelitian, hasil kerja, problem solving</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Komunikasi</label>
              <input 
                type="number" 
                value={nilaiForm.komunikasi} 
                onChange={(e) => handleNilaiChange("komunikasi", e.target.value)} 
                min="0" 
                max="100" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
              />
              <p className="text-[10px] text-slate-400">Penyampaian ide, pelaporan</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Kreativitas</label>
              <input 
                type="number" 
                value={nilaiForm.kreativitas} 
                onChange={(e) => handleNilaiChange("kreativitas", e.target.value)} 
                min="0" 
                max="100" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
              />
              <p className="text-[10px] text-slate-400">Inovasi, ide baru</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Kerjasama Tim</label>
              <input 
                type="number" 
                value={nilaiForm.kerjasama} 
                onChange={(e) => handleNilaiChange("kerjasama", e.target.value)} 
                min="0" 
                max="100" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
              />
              <p className="text-[10px] text-slate-400">Kolaborasi, koordinasi</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Inisiatif</label>
              <input 
                type="number" 
                value={nilaiForm.inisiatif} 
                onChange={(e) => handleNilaiChange("inisiatif", e.target.value)} 
                min="0" 
                max="100" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
              />
              <p className="text-[10px] text-slate-400">Proaktif, kemauan belajar</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-white transition-all">
            Batal
          </button>
          <button onClick={handleSave} disabled={submitting} className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50">
            {submitting ? "Menyimpan..." : "Simpan Nilai"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputNilaiModal;