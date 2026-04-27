import React from 'react';
import { PageShell } from '../../components/PageShell';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { useAppSelector } from '../../store/hooks';

export function MitraEnginePage() {
  const currentScreen = useAppSelector((s) => s.screen.currentScreen);
  const screenData = useAppSelector((s) => s.screen.screenData);

  return (
    <PageShell>
      <ScreenRenderer schema={currentScreen} screenData={screenData} />
    </PageShell>
  );
}
