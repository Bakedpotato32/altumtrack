import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const cleanFilename = (name) =>
  (name || 'altumtrack-doc').replace(/[^a-zA-Z0-9_-]/g, '_');

// 1. High-DPI capture with font sync and mobile-width unconstraining
export async function captureElementAsPng(element, customWidth = 800) {
  if (!element) throw new Error('Target element not found');

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Snapshot element with unconstrained desktop print width
  const dataUrl = await domToPng(element, {
    scale: 2.2,
    backgroundColor: '#ffffff',
    style: {
      width: `${customWidth}px`,
      maxWidth: `${customWidth}px`,
      minWidth: `${customWidth}px`,
      transform: 'none',
      webkitFontSmoothing: 'antialiased',
      textRendering: 'optimizeLegibility'
    }
  });

  return dataUrl;
}

// 2. Export single element as PNG
export async function exportElementAsPNG(element, filenameBase, title = 'Altumtrack Document') {
  const safeName = `${cleanFilename(filenameBase)}.png`;
  const dataUrl = await captureElementAsPng(element, 800);
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

// 3. Multi-Page A4 PDF Builder (Splits continuous tall pages or iterates array of items)
export async function exportElementAsPDF(element, filenameBase, title = 'Altumtrack PDF') {
  const safeName = `${cleanFilename(filenameBase)}.pdf`;
  const dataUrl = await captureElementAsPng(element, 800);

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const imgPageHeight = (img.height * usableWidth) / img.width;

  // Single page fit if height is within A4 bounds
  if (imgPageHeight <= (pageHeight - margin * 2)) {
    pdf.addImage(dataUrl, 'PNG', margin, margin, usableWidth, imgPageHeight);
  } else {
    // Multi-page vertical slice calculation
    let heightLeft = imgPageHeight;
    let position = margin;

    pdf.addImage(dataUrl, 'PNG', margin, position, usableWidth, imgPageHeight);
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 0) {
      position = position - pageHeight + margin;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', margin, position, usableWidth, imgPageHeight);
      heightLeft -= (pageHeight - margin * 2);
    }
  }

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

// 4. Batch Array-to-PDF Engine (For 50+ individual student Admit Cards)
export async function exportBatchElementsAsPDF(elementsArray, filenameBase, onProgress) {
  if (!elementsArray || elementsArray.length === 0) return;
  const safeName = `${cleanFilename(filenameBase)}.pdf`;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;

  for (let i = 0; i < elementsArray.length; i++) {
    if (onProgress) onProgress(i + 1, elementsArray.length);
    const dataUrl = await captureElementAsPng(elementsArray[i], 800);

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const renderedHeight = (img.height * usableWidth) / img.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'PNG', margin, margin, usableWidth, Math.min(renderedHeight, pageHeight - margin * 2));
  }

  if (Capacitor.isNativePlatform()) {
    const pdfDataUri = pdf.output('datauristring');
    const base64Pdf = pdfDataUri.split(',')[1];
    const savedFile = await Filesystem.writeFile({
      path: safeName,
      data: base64Pdf,
      directory: Directory.Cache,
    });
    await Share.share({
      title: 'Batch PDF Export',
      text: `Batch PDF (${elementsArray.length} items) - Altumtrack ERP`,
      url: savedFile.uri,
      dialogTitle: 'Save Batch PDF',
    });
  } else {
    pdf.save(safeName);
  }
}

// 5. Smart WhatsApp Dispatcher
export async function sendWhatsAppWithImage(element, filenameBase, captionText, phone = '', mode = 'direct') {
  const safeName = `${cleanFilename(filenameBase)}.png`;
  const dataUrl = await captureElementAsPng(element, 800);
  const base64Data = dataUrl.split(',')[1];
  const cleanPhone = (phone || '').replace(/\D/g, '');

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    }
  } catch (e) {
    console.log('Clipboard fallback:', e);
  }

  if (mode === 'native_share' || !cleanPhone) {
    if (Capacitor.isNativePlatform()) {
      const savedFile = await Filesystem.writeFile({
        path: safeName,
        data: base64Data,
        directory: Directory.Cache,
      });
      await Share.share({
        title: 'Share Image to WhatsApp',
        text: captionText,
        url: savedFile.uri,
        dialogTitle: 'Choose WhatsApp to Send',
      });
    } else {
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
      } catch (err) {}
      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(captionText)}`, '_blank');
    }
  } else {
    const targetUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(captionText)}`;
    window.open(targetUrl, '_blank');
  }
}

export const shareElementToWhatsApp = (element, filenameBase, captionText, phone = '') => {
  return sendWhatsAppWithImage(element, filenameBase, captionText, phone, 'native_share');
};
