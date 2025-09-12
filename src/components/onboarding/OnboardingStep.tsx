import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OnboardingStepProps {
  title: string;
  progress: number;
  children: React.ReactNode;
}

export function OnboardingStep({ title, progress, children }: OnboardingStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-glow border-border/50 bg-card/95">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-primary rounded-full" />
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% complété
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}