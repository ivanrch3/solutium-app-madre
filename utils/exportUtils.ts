import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer } from '../types';

export const exportCustomersToCSV = (customers: Customer[]) => {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Role', 'Status', 'Source', 'Last Activity', 'Notes'];
  const csvContent = [
    headers.join(','),
    ...customers.map(c => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.phone || '',
      `"${c.company || ''}"`,
      c.role || '',
      c.status,
      c.source,
      c.lastActivity,
      `"${c.notes || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `solutium_customers_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCustomersToExcel = (customers: Customer[]) => {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Role', 'Status', 'Source', 'Last Activity', 'Notes'];
  const data = customers.map(c => [
    c.id,
    c.name,
    c.email,
    c.phone || '',
    c.company || '',
    c.role || '',
    c.status,
    c.source,
    c.lastActivity,
    c.notes || ''
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  
  XLSX.writeFile(wb, `solutium_customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCustomersToPDF = (customers: Customer[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Reporte de Clientes - Solutium', 14, 22);
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

  const headers = [['Nombre', 'Email', 'Empresa', 'Estado', 'Fuente', 'Última Actividad']];
  const data = customers.map(c => [
    c.name,
    c.email,
    c.company || '-',
    c.status,
    c.source,
    c.lastActivity
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [63, 81, 181] } // Indigo color
  });

  doc.save(`solutium_customers_export_${new Date().toISOString().split('T')[0]}.pdf`);
};
