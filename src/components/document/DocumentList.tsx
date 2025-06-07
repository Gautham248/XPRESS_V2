// DocumentList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";

interface DocumentListProps {
  docType: string;
  userId: number;
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
      console.log(response.data.type);

      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      }); // force download
      const downloadUrl = window.URL.createObjectURL(blob);

      const fileName = url.split("/").pop()?.split("?")[0] || "document";

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`; // ensure extension
      link.style.display = "none"; // hide link
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
              <strong>Issuing Post:</strong> {doc.issuingPost || "N/A"}
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
