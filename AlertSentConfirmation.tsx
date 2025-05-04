import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface AlertSentConfirmationProps {
  onContinueMonitoring: () => void;
}

const AlertSentConfirmation: React.FC<AlertSentConfirmationProps> = ({ onContinueMonitoring }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="bg-[hsl(var(--light-bg))] p-6 rounded-2xl max-w-xs w-full mx-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
          <Check className="text-white h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-[hsl(var(--navy))] mb-2">Alert Sent Successfully</h2>
        <p className="text-sm text-gray-600 mb-6">
          Emergency services have been notified and are responding to your location.
        </p>
        <Button 
          className="w-full bg-[hsl(var(--cool-blue))] text-white font-bold py-3 rounded-xl"
          onClick={onContinueMonitoring}
        >
          Continue Monitoring
        </Button>
      </div>
    </div>
  );
};

export default AlertSentConfirmation;
