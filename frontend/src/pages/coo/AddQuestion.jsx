import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit,
  Save,
  CheckCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

function AddQuestion({ isOpen, onClose, onSave, editingData }) {
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingData) {
      setForm({
        question: editingData.question,
        options: [...editingData.options],
        correct: editingData.correct,
      });
    } else {
      setForm({
        question: "",
        options: ["", "", "", ""],
        correct: null,
      });
    }
    setError("");
  }, [editingData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setError("");

    if (!form.question.trim()) {
      setError("Pertanyaan harus diisi");
      return;
    }
    if (form.options.some((opt) => !opt.trim())) {
      setError("Semua pilihan jawaban harus diisi");
      return;
    }
    if (form.correct === null) {
      setError("Pilih jawaban yang benar terlebih dahulu");
      return;
    }

    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                {editingData ? (
                  <Edit size={14} className="text-white" />
                ) : (
                  <Plus size={14} className="text-white" />
                )}
              </div>
              <h2 className="font-bold text-slate-800">
                {editingData ? "Edit Soal" : "Tambah Soal Baru"}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-8">
              {editingData
                ? "Ubah pertanyaan dan pilihan jawaban"
                : "Isi pertanyaan dan pilihan jawaban"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 flex-1">{error}</p>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Pertanyaan <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Masukkan pertanyaan di sini..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
              value={form.question}
              onChange={(e) => {
                setForm({ ...form, question: e.target.value });
                if (error) setError("");
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Pilihan Jawaban <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-semibold text-slate-600 text-sm">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm"
                    placeholder={`Jawaban ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpt = [...form.options];
                      newOpt[i] = e.target.value;
                      setForm({ ...form, options: newOpt });
                      if (error) setError("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, correct: i });
                      if (error) setError("");
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      form.correct === i
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm scale-105"
                        : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                    }`}
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <HelpCircle size={10} /> Klik tombol centang hijau untuk menandai
              jawaban benar
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition text-sm font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg hover:scale-105"
          >
            <Save size={14} /> {editingData ? "Update Soal" : "Simpan Soal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddQuestion;