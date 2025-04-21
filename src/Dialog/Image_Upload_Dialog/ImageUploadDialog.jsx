import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ImageUploadDialog = ({ isOpen, onClose, onUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      onUpload(file);
    }
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
            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
            <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="upload-image-input"
              />
              <label htmlFor="upload-image-input" className="cursor-pointer">
                Drag & drop or click to select an image
              </label>
            </div>

            {selectedImage && (
              <div className="mt-4">
                <img src={selectedImage} alt="Preview" className="rounded-md w-full object-cover max-h-64" />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                onClick={()=>{ onClose(); setSelectedImage(null)}}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                onClick={()=>{onClose(); setSelectedImage(null)}}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageUploadDialog;
