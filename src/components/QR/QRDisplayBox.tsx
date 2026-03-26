import { Copy, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback } from 'react';
import { hideQR, useQRScoutState, getFieldValue } from '../../store/store';
import { Button } from '../ui/button';

export function QRDisplayBox() {
  const showQR = useQRScoutState(state => state.showQR);
  const qrData = useQRScoutState(state => state.qrData);
  
  const title = `${getFieldValue('robot')} - M${getFieldValue(
    'matchNumber',
  )}`.toUpperCase();

  const handleCopyData = useCallback(() => {
    if (qrData) {
      navigator.clipboard.writeText(qrData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [qrData]);

  const handleCopyImage = useCallback(() => {
    const svg = document.querySelector('.qr-display-box svg');
    if (!svg) {
        alert("Error copying image");
        return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }).catch(() => {
            alert("Error copying image");
          });
        }
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }, []);

  if (!showQR || !qrData) return null;

  return (
    <div className="qr-display-box w-full bg-card border-2 border-primary rounded-lg p-6 my-4 shadow-lg animate-in fade-in zoom-in duration-300 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2"
        onClick={() => hideQR()}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-primary tracking-wider uppercase">
          {title}
        </h2>
        
        <div className="bg-white p-4 rounded-md">
          <QRCodeSVG size={256} value={qrData} />
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleCopyImage}
              className="flex-1 min-w-[140px]"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Image
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyData}
              className="flex-1 min-w-[140px]"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Data
            </Button>
        </div>
        
        <p className="text-xs text-muted-foreground break-all text-center">
            {qrData}
        </p>
      </div>
    </div>
  );
}
