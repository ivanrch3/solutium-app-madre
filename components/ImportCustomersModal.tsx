import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Icons } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../types';
import * as XLSX from 'xlsx';

interface ImportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (customers: Customer[]) => void;
}

export const ImportCustomersModal: React.FC<ImportCustomersModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const headers = ['Nombre', 'Correo', 'Teléfono', 'Empresa', 'Cargo', 'Estado', 'Fuente', 'Notas'];
    const example = ['Juan Perez', 'juan@ejemplo.com', '+521234567890', 'Tech Corp', 'Director', 'prospecto', 'Referido', 'Interesado en plan premium'];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Contactos");
    
    XLSX.writeFile(wb, "solutium_plantilla_contactos.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Por favor sube un archivo Excel (.xlsx, .xls) o CSV válido.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
         setError('El archivo parece estar vacío o no tiene el formato correcto.');
         setIsProcessing(false);
         return;
      }

      const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
      const newCustomers: Customer[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const customer: any = {
          id: crypto.randomUUID(),
          lastActivity: new Date().toISOString().split('T')[0],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'lead', // Default
          source: 'Import'
        };

        headers.forEach((header, index) => {
          const value = row[index] !== undefined ? String(row[index]).trim() : '';
          
          if (header === 'nombre' || header === 'name') customer.name = value;
          else if (header === 'correo' || header === 'email') customer.email = value;
          else if (header === 'teléfono' || header === 'telefono' || header === 'phone') customer.phone = value;
          else if (header === 'empresa' || header === 'company') customer.company = value;
          else if (header === 'cargo' || header === 'role') customer.role = value;
          else if (header === 'estado' || header === 'status') {
             // Map Spanish status to internal English keys
             const statusMap: Record<string, string> = {
                 'cliente': 'customer',
                 'prospecto': 'prospect',
                 'lead': 'lead',
                 'inactivo': 'inactive'
             };
             customer.status = statusMap[value.toLowerCase()] || (['lead', 'customer', 'prospect', 'inactive'].includes(value) ? value : 'lead');
          }
          else if (header === 'fuente' || header === 'source') customer.source = value || 'Import';
          else if (header === 'notas' || header === 'notes') customer.notes = value;
        });

        if (customer.name || customer.email) {
          newCustomers.push(customer as Customer);
        }
      }

      if (newCustomers.length === 0) {
        setError('No se encontraron contactos válidos en el archivo.');
      } else {
        onImport(newCustomers);
        onClose();
      }
    } catch (err) {
      setError('Error al procesar el archivo. Verifica el formato.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Importar Contactos</h3>
              <p className="text-sm text-slate-500">Sube un archivo Excel o CSV con tus clientes.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {/* Step 1: Download Template */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
              <Icons.FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-800">1. Descarga la plantilla</h4>
                <p className="text-xs text-blue-600 mt-1 mb-2">Usa este formato Excel para asegurar que tus datos se importen correctamente.</p>
                <button 
                  onClick={handleDownloadTemplate}
                  className="text-xs font-bold text-blue-700 underline hover:text-blue-900"
                >
                  Descargar Plantilla Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* Step 2: Upload File */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-solutium-blue hover:bg-slate-50'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  // Reuse validation logic
                  const selectedFile = e.dataTransfer.files[0];
                  const validTypes = [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                    'application/vnd.ms-excel', // .xls
                    'text/csv' // .csv
                  ];
                  
                  if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
                    setError('Por favor sube un archivo Excel (.xlsx, .xls) o CSV válido.');
                    return;
                  }
                  setFile(selectedFile);
                  setError(null);
                }
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {file ? (
                <>
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                    <Icons.Check className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-xs text-red-500 font-bold mt-3 hover:underline"
                  >
                    Eliminar archivo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                    <Icons.Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-700">Arrastra tu archivo Excel o CSV aquí</p>
                  <p className="text-xs text-slate-400 mt-1">o haz clic para buscar en tu equipo</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar Archivo
                  </Button>
                </>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                <Icons.AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={processFile}
              disabled={!file || isProcessing}
              isLoading={isProcessing}
            >
              Importar Contactos
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
