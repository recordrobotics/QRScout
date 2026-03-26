import { QRDisplayBox } from '@/components/QR';
import { useCallback, useMemo } from 'react';
import { getFieldValue, resetFields, setQRData, useQRScoutState } from '../../../store/store';
import { Section } from '../../core/Section';
import { ResetButton } from './ResetButton';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { queueMatchForSync, MatchDataPayload } from '../../../util/idb';

export function CommitAndResetSection() {
  const formData = useQRScoutState(state => state.formData);
  const fieldValues = useQRScoutState(state => state.fieldValues);

  const requiredFields = useMemo(() => {
    return formData.sections
      .map(s => s.fields)
      .flat()
      .filter(f => f.required)
      .map(f => f.code);
  }, [formData]);

  const missingRequiredFields = useMemo(() => {
    return fieldValues
      .filter(f => requiredFields.includes(f.code))
      .some(f => f.value === undefined || f.value === '' || f.value === null);
  }, [requiredFields, fieldValues]);

  const handleCommit = useCallback(async () => {
    const teamNumberVal = getFieldValue('robot');
    const matchNumberVal = getFieldValue('matchNumber');
    const scouterVal = getFieldValue('scouter');

    const payload: Record<string, any> = {};
    fieldValues.forEach(f => {
      payload[f.code] = f.value;
    });

    const matchData: MatchDataPayload = {
      teamNumber: typeof teamNumberVal === 'number' ? teamNumberVal : 0,
      matchNumber: typeof matchNumberVal === 'number' ? matchNumberVal : 0,
      scouter: typeof scouterVal === 'string' ? scouterVal : '',
      timestamp: Date.now(),
      payload,
    };

    const qrCodeData = fieldValues.map(f => f.value).join(formData.delimiter);
    const title = `${teamNumberVal} - M${matchNumberVal}`.toUpperCase();

    await queueMatchForSync(matchData);
    setQRData(qrCodeData, title);
    resetFields();
    
    // Smooth scroll to the QR display area if needed, 
    // but the QRDisplayBox is usually below the commit button.
  }, [fieldValues, formData]);

  return (
    <Section>
      <div className="flex flex-col gap-4 w-full">
        <Button 
          disabled={missingRequiredFields} 
          onClick={handleCommit}
          className="w-full py-6 text-xl font-bold"
        >
          <QrCode className="mr-2 h-6 w-6" />
          Commit
        </Button>
        <QRDisplayBox />
        <ResetButton />
      </div>
    </Section>
  );
}
