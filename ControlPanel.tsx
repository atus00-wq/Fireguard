import React, { useState, useRef, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ControlPanelProps {
  locationText: string;
  emergencyContact: string;
  sensitivity: string;
  onSensitivityChange: (value: string) => void;
  aiActive: boolean;
  onToggleAI: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  locationText,
  emergencyContact,
  sensitivity,
  onSensitivityChange,
  aiActive,
  onToggleAI
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const currentTranslateY = useRef<number>(0);

  useEffect(() => {
    if (panelRef.current) {
      // Set initial position (collapsed)
      const panelHeight = panelRef.current.scrollHeight;
      currentTranslateY.current = panelHeight - 100;
      panelRef.current.style.transform = `translateY(${currentTranslateY.current}px)`;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !panelRef.current) return;
    
    const deltaY = e.touches[0].clientY - dragStartY.current;
    let newY = currentTranslateY.current + deltaY;
    
    // Constrain movement
    const panelHeight = panelRef.current.scrollHeight;
    if (newY < 0) newY = 0;
    if (newY > panelHeight - 100) newY = panelHeight - 100;
    
    panelRef.current.style.transform = `translateY(${newY}px)`;
  };

  const handleTouchEnd = () => {
    if (!panelRef.current) return;
    
    panelRef.current.style.transition = 'transform 0.3s ease';
    const panelHeight = panelRef.current.scrollHeight;
    
    // Determine whether to snap to expanded or collapsed state
    if (currentTranslateY.current < panelHeight / 2) {
      currentTranslateY.current = 0;
      setIsExpanded(true);
    } else {
      currentTranslateY.current = panelHeight - 100;
      setIsExpanded(false);
    }
    
    panelRef.current.style.transform = `translateY(${currentTranslateY.current}px)`;
    dragStartY.current = null;
  };

  return (
    <div 
      ref={panelRef}
      className="absolute bottom-0 left-0 right-0 bg-[hsl(var(--light-bg))] rounded-t-3xl shadow-lg z-40 transition-all duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto my-3"></div>
      <div className="px-6 pt-2 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[hsl(var(--navy))]">FireGuard AI</h2>
          <div className="flex items-center">
            <span className="text-xs mr-2">AI: {aiActive ? 'Active' : 'Inactive'}</span>
            <Switch checked={aiActive} onCheckedChange={onToggleAI} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center mb-2">
              <i className="material-icons text-[hsl(var(--cool-blue))] mr-2">location_on</i>
              <h3 className="font-medium">Location</h3>
            </div>
            <p className="text-xs text-gray-600">{locationText}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center mb-2">
              <i className="material-icons text-[hsl(var(--cool-blue))] mr-2">contact_phone</i>
              <h3 className="font-medium">Emergency</h3>
            </div>
            <p className="text-xs text-gray-600">{emergencyContact}</p>
          </div>
        </div>
        
        <div className="bg-[hsl(var(--cool-blue))] text-white rounded-xl p-4 mb-4 shadow flex items-center justify-between">
          <div>
            <h3 className="font-medium">Detection Sensitivity</h3>
            <p className="text-xs">Higher sensitivity may cause false alarms</p>
          </div>
          <Select 
            value={sensitivity} 
            onValueChange={onSensitivityChange}
          >
            <SelectTrigger className="bg-white text-[hsl(var(--navy))] h-8 w-24">
              <SelectValue placeholder="Medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full bg-[hsl(var(--navy))] text-white rounded-xl py-3 flex items-center justify-center font-medium"
          variant="default"
        >
          <i className="material-icons mr-2">settings</i>
          Advanced Settings
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
