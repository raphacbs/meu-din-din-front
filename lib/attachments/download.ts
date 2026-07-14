/** Converte data URL em Blob para download confiável no navegador. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data = ""] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const isBase64 = header.includes(";base64");
  const decoded = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function triggerBrowserDownload(objectUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName || "anexo";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Baixa um anexo a partir de data URL ou URL HTTP.
 * Evita abrir aba vazia quando o arquivo está embutido como data URL.
 */
export async function downloadAttachmentFile(
  fileUrl: string,
  fileName: string,
): Promise<void> {
  if (fileUrl.startsWith("data:")) {
    const objectUrl = URL.createObjectURL(dataUrlToBlob(fileUrl));
    try {
      triggerBrowserDownload(objectUrl, fileName);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    return;
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerBrowserDownload(objectUrl, fileName);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    // Fallback para URLs externas com CORS bloqueado.
    triggerBrowserDownload(fileUrl, fileName);
  }
}
