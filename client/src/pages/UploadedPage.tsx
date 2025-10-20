import React, { useState, useEffect } from "react";

interface UploadedFile {
  name: string;
  size: number;
  lastModified: Date;
  url: string;
}

const UploadedPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("http://localhost:5000/upload/files");
      const data = await res.json();
      
      if (data.success) {
        // Convert lastModified string to Date object
        const filesWithDates = data.files.map((file: any) => ({
          ...file,
          lastModified: new Date(file.lastModified)
        }));
        setFiles(filesWithDates);
      } else {
        setError("Failed to fetch files");
      }
    } catch (err) {
      console.error(err);
      setError("Error while fetching files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-foreground">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchUploadedFiles}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Uploaded Images</h1>
          <button
            onClick={fetchUploadedFiles}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl text-gray-500">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(file.url, '_blank')}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>Size: {formatFileSize(file.size)}</p>
                    <p>Uploaded: {formatDate(file.lastModified)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-1 px-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.url);
                        alert('URL copied to clipboard!');
                      }}
                      className="flex-1 bg-gray-600 text-white text-center py-1 px-2 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadedPage;