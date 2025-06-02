import React, { useState } from "react";
import * as XLSX from "xlsx";

interface ExcelImportProps {
  onImport: (data: any[]) => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImport }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to our database schema
        const mappedData = jsonData.map((row: any) => ({
          firstName: row["First Name"] || row["firstName"] || "",
          lastName: row["Last Name"] || row["lastName"] || "",
          dateOfBirth: row["Date of Birth"] || row["dateOfBirth"] || "",
          gender: row["Gender"] || row["gender"] || "",
          schoolName: row["School"] || row["school"] || "",
          class: row["Class"] || row["class"] || "",
          fatherFullName: row["Father Name"] || row["fatherFullName"] || "",
          fatherAddress: row["Father Address"] || row["fatherAddress"] || "",
          fatherContact: row["Father Contact"] || row["fatherContact"] || "",
          motherFullName: row["Mother Name"] || row["motherFullName"] || "",
          motherAddress: row["Mother Address"] || row["motherAddress"] || "",
          motherContact: row["Mother Contact"] || row["motherContact"] || "",
          story: row["Story"] || row["story"] || "",
          comment: row["Comment"] || row["comment"] || "",
        }));

        setPreview(mappedData.slice(0, 5)); // Show first 5 rows for preview
        setIsProcessing(false);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing Excel file. Please check the format.");
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setPreview([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Import from Excel</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Upload Excel File (.xlsx, .xls)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Processing Excel file...</p>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Preview (First 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-1 text-xs">First Name</th>
                  <th className="border px-2 py-1 text-xs">Last Name</th>
                  <th className="border px-2 py-1 text-xs">Gender</th>
                  <th className="border px-2 py-1 text-xs">School</th>
                  <th className="border px-2 py-1 text-xs">Class</th>
                  <th className="border px-2 py-1 text-xs">Father</th>
                  <th className="border px-2 py-1 text-xs">Mother</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1 text-xs">
                      {row.firstName}
                    </td>
                    <td className="border px-2 py-1 text-xs">{row.lastName}</td>
                    <td className="border px-2 py-1 text-xs">{row.gender}</td>
                    <td className="border px-2 py-1 text-xs">
                      {row.schoolName}
                    </td>
                    <td className="border px-2 py-1 text-xs">{row.class}</td>
                    <td className="border px-2 py-1 text-xs">
                      {row.fatherFullName}
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      {row.motherFullName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Import {preview.length} Records
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-medium mb-2">Expected Excel Columns:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <span>• First Name</span>
          <span>• Last Name</span>
          <span>• Date of Birth</span>
          <span>• Gender</span>
          <span>• School</span>
          <span>• Class</span>
          <span>• Father Name</span>
          <span>• Father Address</span>
          <span>• Father Contact</span>
          <span>• Mother Name</span>
          <span>• Mother Address</span>
          <span>• Mother Contact</span>
          <span>• Story</span>
          <span>• Comment</span>
        </div>
      </div>
    </div>
  );
};
