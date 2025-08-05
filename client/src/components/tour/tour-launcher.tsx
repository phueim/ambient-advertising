import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, BookOpen, Users, Upload } from 'lucide-react';

interface TourOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface TourLauncherProps {
  availableTours: TourOption[];
  onStartTour: (tourId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function TourLauncher({ availableTours, onStartTour, isOpen, onClose }: TourLauncherProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Interactive Guided Tours</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Choose a guided tour to learn how to use different features of the platform.
          </p>
          
          <div className="grid gap-4">
            {availableTours.map((tour) => {
              const IconComponent = tour.icon;
              return (
                <Card 
                  key={tour.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => {
                    onStartTour(tour.id);
                    onClose();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{tour.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(tour.difficulty)}`}>
                              {tour.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">{tour.duration}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{tour.description}</p>
                        
                        <div className="flex items-center justify-end pt-2">
                          <Button size="sm" className="flex items-center space-x-1">
                            <Play className="h-3 w-3" />
                            <span>Start Tour</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}