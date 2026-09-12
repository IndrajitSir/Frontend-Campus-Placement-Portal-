import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Shared motion presets
import { popSpring, EASE } from "../../lib/motion";
// Icons
import { ImageIcon, Loader2 } from "lucide-react";

const ImageUploadDialog = ({ isOpen, onClose, onUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  const handleDone = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onClose();
      setSelectedImage(null);
    }, 400);
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
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upload Image</h2>

            {/* Drag & drop zone */}
            <div
              className={`mt-4 w-full rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors duration-200 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-500/10"
                  : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-indigo-400/60 dark:hover:bg-indigo-500/5"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="upload-image-input"
              />
              <label htmlFor="upload-image-input" className="cursor-pointer text-sm text-slate-500 dark:text-slate-400">
                <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500 dark:text-indigo-300">
                  <ImageIcon className="h-5 w-5" />
                </span>
                Drag & drop or click to select an image
              </label>
            </div>

            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="mt-4"
                >
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full max-h-64 rounded-2xl border border-slate-200/80 object-cover dark:border-white/10"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-end gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
                onClick={()=>{ onClose(); setSelectedImage(null)}}
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!selectedImage || uploading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
                onClick={handleDone}
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? "Saving…" : "Done"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageUploadDialog;
