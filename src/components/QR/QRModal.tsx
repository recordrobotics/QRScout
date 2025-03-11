import { Copy, QrCode } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useEffect, useMemo, useRef } from 'react';
import { getFieldValue, useQRScoutState } from '../../store/store';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { PreviewText } from './PreviewText';

export interface QRModalProps {
  disabled?: boolean;
}

function canvasToBlobAsync(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(function(resolve, _) {
      canvas.toBlob(resolve);
  });
}

export function QRModal(props: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef = useRef<Blob | null>(null);
  const fieldValues = useQRScoutState(state => state.fieldValues);
  const formData = useQRScoutState(state => state.formData);
  const title = `${getFieldValue('robot')} - M${getFieldValue(
    'matchNumber',
  )}`.toUpperCase();

  const qrCodeData = useMemo(
    () => fieldValues.map(f => f.value).join(formData.delimiter),
    [fieldValues],
  );

  useEffect(() => {
    const node = canvasRef.current;
    if (node == null) {
      return;
    }

    (async () => {
      // For canvas, we just extract the image data and send that directly.
      const blob = await canvasToBlobAsync(node);
      blobRef.current = blob;
    })();
  }, [canvasRef.current]);
  //Two seperate values are required- qrCodePreview is what is shown to the user beneath the QR code, qrCodeData is the actual data.

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={props.disabled}>
          <QrCode className="size-5" />
          Commit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-3xl text-primary text-center font-rhr-ns tracking-wider ">
          {title}
        </DialogTitle>
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-md">
            <QRCodeSVG className="m-2 mt-4" size={256} value={qrCodeData} />
            <QRCodeCanvas ref={canvasRef} size={256} value={qrCodeData} marginSize={4} style={{display: 'none'}} />
          </div>
          <PreviewText data={qrCodeData} />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              const blob = blobRef.current;

              if (blob == null) {
                alert("Error copying image");
                return;
              }
            
              const item = new ClipboardItem({ "image/png": blob });
              try {
                navigator.clipboard.write([item]);
              } catch {
                alert("Error copying image");
              }
            }}
          >
            <Copy className="size-4" /> Copy Image
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(qrCodeData)}
          >
            <Copy className="size-4" /> Copy Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
