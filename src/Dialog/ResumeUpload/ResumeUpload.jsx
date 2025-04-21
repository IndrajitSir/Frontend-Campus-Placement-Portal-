import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Icons
import { UploadCloudIcon, Trash2Icon } from "lucide-react";

export default function ResumeUpload({ isOpen, onClose, onUpload }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showIcons, setShowIcons] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [enhancedResumeText, setEnhancedResumeText] = useState("");

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
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
      onUpload(file);
    }
  }

  const simulateATSCheck = () => {
    // Simulate async scoring
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
          className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
            <div className="relative flex flex-col items-center justify-center border-dashed border-2 border-gray-400 p-6 rounded-xl w-full max-w-md mx-auto mt-10 cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="upload-resume-input"
              />
              <label htmlFor="upload-resume-input" className="cursor-pointer">
                Drag & drop or click to select the resume
              </label>
              <div
                className="w-full text-center"
                onMouseEnter={() => setShowIcons(true)}
                onMouseLeave={() => setShowIcons(false)}
              >
                {selectedFile ? (
                  <div className="text-sm font-semibold text-gray-800">
                    <p className="mb-2">{selectedFile.name}</p>
                    <AnimatePresence>
                      {showIcons && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex justify-center gap-4 mt-2"
                        >
                          <UploadCloudIcon
                            className="w-6 h-6 text-green-600 hover:text-green-800 transition-all cursor-pointer"
                            onClick={handleUploadClick}
                          />
                          <Trash2Icon
                            className="w-6 h-6 text-red-600 hover:text-red-800 transition-all cursor-pointer"
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
                          className="mt-4 text-xs text-gray-600"
                        >
                          <p>ATS Score: <span className="font-bold text-blue-600">{atsScore}/100</span></p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {enhancedResumeText && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded"
                        >
                          <p className="font-medium mb-1">Suggestions:</p>
                          {enhancedResumeText.split("\n").map((line, index) => (
                            <p key={index}>• {line}</p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={handleUploadClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                  >
                    Upload Resume
                  </button>
                )}
              </div>

              {selectedFile && (
                <button
                  className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                  onClick={() => {onUpload(selectedFile); onClose(); setSelectedFile(null)}}
                >
                  Submit Resume
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
