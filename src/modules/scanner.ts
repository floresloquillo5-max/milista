import { AppState } from '../state';
import { showToast } from '../utils/dom';
import { BARCODE_PRODUCT_DB } from '../config/constants';

export function setupBarcodeScanner(): void {
  const scanBtn = document.getElementById('barcodeScanBtn');
  const overlay = document.getElementById('scannerOverlay');
  const video = document.getElementById('scannerVideo') as HTMLVideoElement | null;

  if (!scanBtn || !overlay || !video) return;

  scanBtn.addEventListener('click', async () => {
    overlay.classList.add('visible');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      AppState.state.scannerStream = stream;
      AppState.state.scannerActive = true;
      video.play();
      scanBarcode(video, stream);
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      showToast(denied ? '⚠️ Permiso de cámara denegado. Actívalo en los ajustes del navegador.' : '⚠️ No se pudo acceder a la cámara');
      overlay.classList.remove('visible');
    }
  });
}

async function scanBarcode(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
  if (!('BarcodeDetector' in window)) {
    showToast('📷 Escáner no soportado en este navegador');
    setTimeout(() => stopScanner(), 2000);
    return;
  }

  try {
    const detector = new (window as unknown as { BarcodeDetector: new (options?: { formats: string[] }) => { detect: (el: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'codabar', 'itf', 'qr_code'] });

    const detectLoop = async () => {
      if (!AppState.state.scannerActive) return;

      try {
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          stopScanner();
          handleBarcodeResult(code);
          return;
        }
      } catch {
        /* detection failed, retry */
      }

      setTimeout(detectLoop, 300);
    };

    detectLoop();
  } catch {
    showToast('⚠️ Error al iniciar detector de códigos');
  }
}

function handleBarcodeResult(code: string): void {
  const input = document.getElementById('barcodeInput') as HTMLInputElement | null;
  if (input) input.value = code;

  const product = BARCODE_PRODUCT_DB[code];
  if (product) {
    const nameInput = document.getElementById('prodName') as HTMLInputElement | null;
    const priceInput = document.getElementById('prodPrice') as HTMLInputElement | null;
    const unitInput = document.getElementById('prodUnit') as HTMLInputElement | null;
    if (nameInput) nameInput.value = product.name;
    if (priceInput) priceInput.value = product.price.toFixed(2);
    if (unitInput) unitInput.value = product.unit;
    showToast(`✅ ${product.name} identificado`);
  } else {
    showToast(`📷 Código: ${code} (no encontrado en BD)`);
  }
}

export function stopScanner(): void {
  AppState.state.scannerActive = false;
  if (AppState.state.scannerStream) {
    AppState.state.scannerStream.getTracks().forEach(track => track.stop());
    AppState.state.scannerStream = null;
  }
  const overlay = document.getElementById('scannerOverlay');
  if (overlay) overlay.classList.remove('visible');
  const video = document.getElementById('scannerVideo') as HTMLVideoElement | null;
  if (video) video.srcObject = null;
}
