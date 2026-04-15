import { type ReactNode } from 'react';
import { BreathingProvider } from './BreathingContext';
import { EyeTrackingProvider } from './EyeTrackingContext';
import { RewriterProvider } from './RewriterContext';
import { SettingsProvider } from './SettingsContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SettingsProvider>
      <BreathingProvider>
        <EyeTrackingProvider>
          <RewriterProvider>
            {children}
          </RewriterProvider>
        </EyeTrackingProvider>
      </BreathingProvider>
    </SettingsProvider>
  );
}