import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  waitForElement?: boolean;
  onShow?: () => void; // Callback when step is shown
}

export interface TourConfig {
  id: string;
  title: string;
  description: string;
  steps: TourStep[];
}

interface TourEngineProps {
  tour: TourConfig;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export function TourEngine({ tour, isActive, onComplete, onSkip, onStepChange }: TourEngineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const step = tour.steps[currentStep];
    if (!step) return;

    const findElement = () => {
      // Execute onShow callback first with a small delay to ensure DOM is ready
      if (step.onShow) {
        setTimeout(() => {
          step.onShow!();
        }, 100);
      }
      
      // Wait a bit longer before finding the element to ensure tab content is loaded
      setTimeout(() => {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          setTargetElement(element);
          updateTooltipPosition(element, step.position || 'bottom');
          
          // Scroll element into view
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center' 
          });
        }
      }, 300);
      
      return true;
    };

    // Always execute findElement for tab switching functionality
    findElement();
    
    // If element not found and we should wait, try again after a short delay
    if (step.waitForElement) {
      const timeout = setTimeout(findElement, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, isActive, tour.steps]);

  const updateTooltipPosition = (element: HTMLElement, position: string) => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 250; // Increased to account for actual tooltip height
      const offset = 20;

      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.top - tooltipHeight - offset;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.bottom + offset;
          break;
        case 'left':
          x = rect.left - tooltipWidth - offset;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
        case 'right':
          x = rect.right + offset;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
      }

      // Keep tooltip within viewport with better boundaries
      x = Math.max(10, Math.min(x, window.innerWidth - tooltipWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - tooltipHeight - 10));

      setTooltipPosition({ x, y });
    }, 100);
  };

  const nextStep = () => {
    if (currentStep < tour.steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
      
      // Force tooltip repositioning after step change
      setTimeout(() => {
        if (targetElement) {
          const step = tour.steps[newStep];
          updateTooltipPosition(targetElement, step.position || 'bottom');
        }
      }, 150);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
      
      // Force tooltip repositioning after step change
      setTimeout(() => {
        if (targetElement) {
          const step = tour.steps[newStep];
          updateTooltipPosition(targetElement, step.position || 'bottom');
        }
      }, 150);
    }
  };

  if (!isActive) return null;

  const step = tour.steps[currentStep];
  if (!step) return null;

  return (
    <>
      {/* Dark overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        style={{ 
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
      
      {/* Spotlight effect */}
      {targetElement && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: targetElement.getBoundingClientRect().left - 8,
            top: targetElement.getBoundingClientRect().top - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            zIndex: 9999
          }}
        />
      )}

      {/* Tooltip */}
      <Card 
        className="fixed w-80 shadow-2xl border-2 border-primary/20"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          zIndex: 10000,
          pointerEvents: 'auto',
          transform: 'none',
          position: 'fixed'
        }}
      >
        <CardContent className="p-6" style={{ pointerEvents: 'auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Step {currentStep + 1} of {tour.steps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tour.steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronLeft className="h-3 w-3" />
              <span>Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-gray-500 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Skip Tour
              </Button>
              <Button
                onClick={nextStep}
                size="sm"
                className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-white cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <span>{currentStep === tour.steps.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}