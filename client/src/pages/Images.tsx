import React, { useState } from "react";

const Images = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first!");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadedUrl(data.fileUrl);
        alert("File uploaded successfully!");
      } else {
        alert("Upload failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Error while uploading file!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Images to MinIO</h2>

      {/* File Picker */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 border border-gray-300 rounded-lg p-2"
      />

      {/* Image Preview */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-48 h-48 object-cover rounded-lg mb-4 shadow-md"
        />
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Uploaded File Link */}
      {uploadedUrl && (
        <div className="mt-6 text-center">
          <p className="text-green-500 font-medium">Upload successful!</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Image
          </a>
        </div>
      )}
    </div>
  );
};

export default Images;
