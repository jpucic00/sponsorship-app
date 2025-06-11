import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";

interface ExcelImportProps {
  onImport: (data: any[]) => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImport }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setErrors([]);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setErrors(["The Excel file appears to be empty."]);
          setIsProcessing(false);
          return;
        }

        // Map Excel columns to our database schema
        const mappedData = jsonData.map((row: any, index: number) => {
          const mapped = {
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
            rowIndex: index + 2, // Excel row number (starting from 2, accounting for header)
          };

          return mapped;
        });

        // Validate critical fields
        const validationErrors: string[] = [];
        mappedData.forEach((row) => {
          if (!row.firstName || !row.lastName) {
            validationErrors.push(
              `Row ${row.rowIndex}: Missing first name or last name`
            );
          }
          if (!row.fatherFullName || !row.motherFullName) {
            validationErrors.push(
              `Row ${row.rowIndex}: Missing parent information`
            );
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors.slice(0, 10)); // Show first 10 errors
        }

        setPreview(mappedData.slice(0, 10)); // Show first 10 rows for preview
        setIsProcessing(false);
      } catch (error) {
        console.error("Error processing file:", error);
        setErrors([
          "Error processing Excel file. Please check the format and try again.",
        ]);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setPreview([]);
      setFileName("");
      setErrors([]);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "First Name": "John",
        "Last Name": "Doe",
        "Date of Birth": "2015-03-15",
        Gender: "Male",
        School: "Kampala Primary School",
        Class: "P3",
        "Father Name": "Michael Doe",
        "Father Address": "Kampala, Uganda",
        "Father Contact": "+256700123456",
        "Mother Name": "Sarah Doe",
        "Mother Address": "Kampala, Uganda",
        "Mother Contact": "+256700123457",
        Story: "John is a bright student who loves mathematics...",
        Comment: "Needs support with school fees",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Children Template");
    XLSX.writeFile(wb, "children_import_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Template Download */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Download className="text-purple-600" size={28} />
            <h2 className="text-3xl font-bold text-gray-900">
              Download Template
            </h2>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <p className="text-gray-700 mb-4">
              Download our Excel template to ensure your data is formatted
              correctly for import.
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Download size={20} />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="text-blue-600" size={28} />
            <h2 className="text-3xl font-bold text-gray-900">
              Upload Excel File
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
              <FileSpreadsheet
                className="mx-auto text-gray-400 mb-4"
                size={48}
              />
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-700 mb-2 block">
                  Click to select Excel file or drag and drop
                </span>
                <span className="text-sm text-gray-500 block mb-4">
                  Supports .xlsx and .xls files
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
                <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <Upload size={20} className="mr-2" />
                  Select File
                </span>
              </label>
            </div>

            {fileName && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-900">
                    Selected file: {fileName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <h3 className="text-xl font-semibold text-gray-900">
                Processing Excel file...
              </h3>
              <p className="text-gray-600">
                Please wait while we analyze your data
              </p>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <AlertCircle className="text-red-600" size={28} />
              <h3 className="text-2xl font-bold text-red-900">
                Validation Issues Found
              </h3>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <p className="text-red-700 mb-4 font-medium">
                Please fix these issues before importing:
              </p>
              <ul className="space-y-2">
                {errors.map((error, index) => (
                  <li
                    key={index}
                    className="text-red-600 text-sm flex items-start space-x-2"
                  >
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
              {errors.length === 10 && (
                <p className="text-red-600 text-sm mt-3 italic">
                  ... and possibly more issues. Please review your file.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Eye className="text-green-600" size={28} />
                <h3 className="text-2xl font-bold text-gray-900">
                  Data Preview
                </h3>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {preview.length} records ready
              </span>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-6">
              <p className="text-green-700 font-medium">
                ✅ Data processed successfully! Review the preview below and
                click import when ready.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Row
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Last Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Father
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Mother
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {row.rowIndex}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {row.firstName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {row.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.gender}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.schoolName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.class}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.fatherFullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.motherFullName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleImport}
                disabled={errors.length > 0}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-xl disabled:hover:scale-100"
              >
                <Check size={24} />
                <span>Import {preview.length} Records</span>
              </button>
            </div>
          </div>
        )}

        {/* Column Mapping Guide */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Expected Excel Columns
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "First Name", required: true, example: "John" },
              { name: "Last Name", required: true, example: "Doe" },
              { name: "Date of Birth", required: false, example: "2015-03-15" },
              { name: "Gender", required: false, example: "Male" },
              { name: "School", required: false, example: "Kampala Primary" },
              { name: "Class", required: false, example: "P3" },
              { name: "Father Name", required: true, example: "Michael Doe" },
              {
                name: "Father Address",
                required: false,
                example: "Kampala, Uganda",
              },
              {
                name: "Father Contact",
                required: false,
                example: "+256700123456",
              },
              { name: "Mother Name", required: true, example: "Sarah Doe" },
              {
                name: "Mother Address",
                required: false,
                example: "Kampala, Uganda",
              },
              {
                name: "Mother Contact",
                required: false,
                example: "+256700123457",
              },
              { name: "Story", required: false, example: "Bright student..." },
              { name: "Comment", required: false, example: "Needs support..." },
            ].map((column, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  column.required
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`text-sm font-bold ${
                      column.required ? "text-red-700" : "text-blue-700"
                    }`}
                  >
                    {column.name}
                  </span>
                  {column.required && (
                    <span className="text-red-600 text-xs">*Required</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Example: {column.example}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <strong>Tip:</strong> Column names are not case-sensitive. "First
              Name", "first name", and "firstName" will all work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
