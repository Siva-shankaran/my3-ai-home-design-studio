import React, { useState } from 'react';
import { Project } from '../types';
import { aiService } from '../services/aiService';
import { 
  X, UploadCloud, FileImage, Sparkles, Loader2, 
  CheckCircle2, ArrowRight
} from 'lucide-react';

interface PlanUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanDigitized: (project: Partial<Project>) => void;
}

export const PlanUploaderModal: React.FC<PlanUploaderModalProps> = ({
  isOpen,
  onClose,
  onPlanDigitized
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDigitizing, setIsDigitizing] = useState<boolean>(false);
  const [digitizeProgress, setDigitizeProgress] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartDigitize = async () => {
    if (!previewUrl || !selectedFile) return;

    setIsDigitizing(true);
    setDigitizeProgress('Analyzing room contours and wall thicknesses with DeepSeek V4.1 Vision...');

    try {
      const digitizedProject = await aiService.digitizePlan(previewUrl, selectedFile.name);
      onPlanDigitized(digitizedProject);
      onClose();
    } catch (err) {
      console.error('Digitize error:', err);
    } finally {
      setIsDigitizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload Existing Floor Plan</h3>
              <p className="text-xs text-slate-400">AI Floor Plan Recognizer powered by DeepSeek V4.1 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!previewUrl ? (
          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/60 group">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 group-hover:scale-110 transition mb-3">
              <FileImage className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-200 text-sm mb-1">Click to upload or drag & drop</h4>
            <p className="text-xs text-slate-500">Supports PDF blueprints, PNG, JPG, or hand-drawn sketches (up to 10MB)</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <img src={previewUrl} alt="Blueprint Preview" className="max-h-full max-w-full object-contain" />
              <button
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-3 right-3 p-1.5 bg-slate-900/90 text-slate-300 hover:text-white rounded-lg border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <FileImage className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-slate-300 truncate max-w-xs">{selectedFile?.name}</span>
              </div>
              <span className="text-slate-500 font-mono">{(selectedFile?.size ? (selectedFile.size / 1024).toFixed(0) : 0)} KB</span>
            </div>

            {isDigitizing && (
              <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl flex items-center space-x-3 text-xs text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>{digitizeProgress}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium transition"
          >
            Cancel
          </button>

          <button
            disabled={!previewUrl || isDigitizing}
            onClick={handleStartDigitize}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
          >
            {isDigitizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Digitizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Digitize into Editable CAD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
