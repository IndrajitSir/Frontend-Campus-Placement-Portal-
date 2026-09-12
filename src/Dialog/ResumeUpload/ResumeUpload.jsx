import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Shared motion presets
import { popSpring, EASE } from "../../lib/motion";
// Icons
import { UploadCloudIcon, Trash2Icon, FileText, Sparkles } from "lucide-react";

export default function ResumeUpload({ isOpen, onClose, onUpload }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showIcons, setShowIcons] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [enhancedResumeText, setEnhancedResumeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setAtsScore(null);
      setEnhancedResumeText("");
      simulateATSCheck();
      simulateEnhancement();
    } else {
      alert("Please upload a valid PDF file");
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
      onUpload(file);
    }
  }

  const simulateATSCheck = () => {
    // Simulate async scoring
    setAtsScore(null);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      setAtsScore(score);
    }, 1000);
  };

  const simulateEnhancement = () => {
    setTimeout(() => {
      setEnhancedResumeText("• Optimized work experience section\n• Rewritten objective for clarity\n• Added measurable achievements");
    }, 1500);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setAtsScore(null);
    setEnhancedResumeText("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={popSpring}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upload Resume</h2>

            {/* Drag & drop zone */}
            <div
              className={`relative mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-200 cursor-pointer ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-500/10"
                  : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-indigo-400/60 dark:hover:bg-indigo-500/5"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="upload-resume-input"
              />
              <label htmlFor="upload-resume-input" className="cursor-pointer text-sm text-slate-500 dark:text-slate-400">
                <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500 dark:text-indigo-300">
                  <UploadCloudIcon className="h-5 w-5" />
                </span>
                Drag & drop or click to select the resume
              </label>
              <div
                className="w-full text-center"
                onMouseEnter={() => setShowIcons(true)}
                onMouseLeave={() => setShowIcons(false)}
              >
                {selectedFile ? (
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <p className="mt-3 flex items-center justify-center gap-2 break-all">
                      <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
                      {selectedFile.name}
                    </p>
                    <AnimatePresence>
                      {showIcons && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="flex justify-center gap-4 mt-2"
                        >
                          <UploadCloudIcon
                            className="h-6 w-6 cursor-pointer text-emerald-600 transition-all hover:scale-110 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            onClick={handleUploadClick}
                          />
                          <Trash2Icon
                            className="h-6 w-6 cursor-pointer text-red-600 transition-all hover:scale-110 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={handleRemove}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {atsScore && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="mt-4 text-xs text-slate-600 dark:text-slate-300"
                        >
                          <p>
                            ATS Score:{" "}
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{atsScore}/100</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {enhancedResumeText && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="mt-3 rounded-xl bg-emerald-50 p-3 text-left text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        >
                          <p className="mb-1 flex items-center gap-1.5 font-medium">
                            <Sparkles className="h-3.5 w-3.5" /> Suggestions:
                          </p>
                          {enhancedResumeText.split("\n").map((line, index) => (
                            <p key={index}>• {line}</p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Button_Shim onClick={handleUploadClick} />
                )}
              </div>

              {selectedFile && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 w-full cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110"
                  onClick={() => {onUpload(selectedFile); onClose(); setSelectedFile(null)}}
                >
                  Submit Resume
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Small shared-style upload button (kept separate so the picker logic stays untouched).
function Button_Shim({ onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110"
    >
      Upload Resume
    </motion.button>
  );
}
