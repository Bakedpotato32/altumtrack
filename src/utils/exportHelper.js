import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const cleanFilename = (name) =>
  (name || 'altumtrack-doc').replace(/[^a-zA-Z0-9_-]/g, '_');

// Capture any DOM element as a high-res PNG Data URL (supports Tailwind v4 oklch!)
export async function captureElementAsPng(element) {
  if (!element) throw new Error('Target element not found');
  const dataUrl = await domToPng(element, {
    scale: 2.5,
    backgroundColor: '#ffffff',
  });
  return dataUrl;
}

// Convert a PNG Data URL into an A4 PDF Base64 / Blob
async function buildPdfFromPng(pngDataUrl) {
  const img = new Image();
  img.src = pngDataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = (img.height * usableWidth) / img.width;

  pdf.addImage(pngDataUrl, 'PNG', margin, margin, usableWidth, usableHeight);
  return pdf;
}

// 1. Export & Save/Share as PNG Image
export async function exportElementAsPNG(element, filenameBase, title = 'Altumtrack Document') {
  const safeName = `${cleanFilename(filenameBase)}.png`;
  const dataUrl = await captureElementAsPng(element);
  const base64Data = dataUrl.split(',')[1];

  if (Capacitor.isNativePlatform()) {
    const savedFile = await Filesystem.writeFile({
      path: safeName,
      data: base64Data,
      directory: Directory.Cache,
    });
    await Share.share({
      title,
      text: `${title} - Generated via Altumtrack ERP`,
      url: savedFile.uri,
      dialogTitle: 'Save or Share PNG Image',
    });
  } else {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// 2. Export & Save/Share as Official PDF
export async function exportElementAsPDF(element, filenameBase, title = 'Altumtrack PDF') {
  const safeName = `${cleanFilename(filenameBase)}.pdf`;
  const dataUrl = await captureElementAsPng(element);
  const pdf = await buildPdfFromPng(dataUrl);

  if (Capacitor.isNativePlatform()) {
    const pdfDataUri = pdf.output('datauristring');
    const base64Pdf = pdfDataUri.split(',')[1];
    const savedFile = await Filesystem.writeFile({
      path: safeName,
      data: base64Pdf,
      directory: Directory.Cache,
    });
    await Share.share({
      title,
      text: `${title} (PDF) - Generated via Altumtrack ERP`,
      url: savedFile.uri,
      dialogTitle: 'Save or Print PDF Document',
    });
  } else {
    pdf.save(safeName);
  }
}

// 3. Direct WhatsApp Share with Image Already Attached
export async function shareElementToWhatsApp(element, filenameBase, captionText, phone = '') {
  const safeName = `${cleanFilename(filenameBase)}.png`;
  const dataUrl = await captureElementAsPng(element);
  const base64Data = dataUrl.split(',')[1];

  if (Capacitor.isNativePlatform()) {
    const savedFile = await Filesystem.writeFile({
      path: safeName,
      data: base64Data,
      directory: Directory.Cache,
    });
    await Share.share({
      title: 'Share to WhatsApp',
      text: captionText,
      url: savedFile.uri,
      dialogTitle: 'Select WhatsApp to Send Image',
    });
  } else {
    // Browser fallback: try Web Share API with file, else WhatsApp Web link
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], safeName, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Altumtrack Document',
          text: captionText,
        });
        return;
      }
    } catch {
      // Fallback below
    }
    const cleanPhone = (phone || '').replace(/\D/g, '');
    window.open(
      `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(captionText)}`,
      '_blank'
    );
  }
}
