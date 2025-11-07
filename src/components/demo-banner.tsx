import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('hideDemoBanner') !== 'true';
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hideDemoBanner', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Info className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Demo Mode:</strong> This app is running with mock AWS services. 
            In production, you need a backend server to securely integrate with AWS S3 and DynamoDB. 
            See <code className="bg-white/20 px-1 py-0.5 rounded">AWS_SETUP_GUIDE.md</code> for details.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="text-white hover:bg-white/20 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
