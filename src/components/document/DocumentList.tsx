// DocumentList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";

interface DocumentListProps {
  docType: string;
  userId: number|undefined;
}

interface Document {
  id: number;
  documentPath: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  issuingCountry?: string;
  visaNumber?: string;
  visaExpiryDate?: string;
  visaClass?: string;
  issuingPost?: string;
  aadharNumber?: string;
  aadharName?: string;
}

const formatDate = (date: string | undefined): string => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleDateString();
};

const DocumentList: React.FC<DocumentListProps> = ({ docType, userId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!userId || !docType) return;
    axios
      .get(`http://localhost:5030/api/Documents/user/${userId}/type/${docType}`)
      .then((response) => {
        setDocuments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
        toast.error("Failed to fetch documents");
      });
  }, [docType, userId]);

  const confirmDelete = (doc: Document) => {
    setDocToDelete(doc);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!docToDelete) return;

    try {
      await axios.delete(
        `http://localhost:5030/api/Documents/${docToDelete.id}/type/${docType}`
      );
      toast.success("Document deleted successfully");
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== docToDelete.id)
      );
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete the document.");
    } finally {
      setDocToDelete(null);
      setShowConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDocToDelete(null);
    setShowConfirm(false);
  };

const handleDownload = async (url: string) => {
  try {
    const response = await axios.get(url, {
      responseType: "blob",
    });

    const mimeType = response.data.type;
    console.log("Detected MIME type:", mimeType);

    const blob = new Blob([response.data], {
      type: "application/octet-stream",
    });
    const downloadUrl = window.URL.createObjectURL(blob);

    const fileNameFromUrl = url.split("/").pop()?.split("?")[0] || "download";

    const mimeTypeToExtension: { [key: string]: string } = {
      "application/pdf": ".pdf",
      "image/jpeg": ".jpeg",
      "image/png": ".png",
    };
    
    let finalFileName = fileNameFromUrl;
    const knownExtensions = [".pdf", ".jpeg", ".jpg", ".png"];

    const hasExtension = knownExtensions.some(ext => fileNameFromUrl.toLowerCase().endsWith(ext));

    if (!hasExtension) {
      const extension = mimeTypeToExtension[mimeType];
      if (extension) {
        finalFileName = `${fileNameFromUrl}${extension}`;
      }
    }
    

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = finalFileName; 
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download document");
  }
};

  const renderDetails = (doc: Document) => {
    switch (docType) {
      case "Passport":
        return (
          <>
            <p>
              <strong>Passport No:</strong> {doc.passportNumber || "N/A"}
            </p>
            <p>
              <strong>Issuing Country:</strong> {doc.issuingCountry || "N/A"}
            </p>
            <p>
              <strong>Expiry Date:</strong> {formatDate(doc.passportExpiryDate)}
            </p>
          </>
        );
      case "Visa":
        return (
          <>
            <p>
              <strong>Visa No:</strong> {doc.visaNumber || "N/A"}
            </p>
            <p>
              <strong>Visa Class:</strong> {doc.visaClass || "N/A"}
            </p>
            <p>
              <strong>Issuing Country:</strong> {doc.issuingCountry || "N/A"}
            </p>
            <p>
              <strong>Expiry Date:</strong> {formatDate(doc.visaExpiryDate)}
            </p>
          </>
        );
      case "Aadhar":
        return (
          <>
            <p>
              <strong>Aadhar No:</strong> {doc.aadharNumber || "N/A"}
            </p>
            <p>
              <strong>Full Name:</strong> {doc.aadharName || "N/A"}
            </p>
          </>
        );
      default:
        return <p>Unknown document type</p>;
    }
  };

  return (
    <>
      {documents.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-600 mb-2">No {docType.toLowerCase()} documents yet</p>
          <p className="text-sm text-gray-500">Upload your first document above to get started</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex justify-between items-start p-4 bg-gray-100 rounded shadow-sm"
            >
              <div className="text-sm text-gray-800 space-y-1">
                {renderDetails(doc)}
              </div>
              <div className="flex gap-3 mt-1">
                <Download
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                  onClick={() => handleDownload(doc.documentPath)}
                />
                <Trash2
                  className="w-5 h-5 text-red-600 cursor-pointer"
                  onClick={() => confirmDelete(doc)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {showConfirm && docToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p>Are you sure you want to delete this document?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentList;
