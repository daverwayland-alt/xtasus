'use client';
import { Sheet } from './Drawer';
import { Switch } from './Switch';
import { useSettings, setSetting } from '@/lib/settings';
import { sfx, speak } from '@/lib/feedback';

export function SettingsSheet({ open, onOpenChange }) {
  const s = useSettings();
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Ajustes" subtitle="Se guardan en este dispositivo">
      <div className="flex flex-col gap-2.5">
        <Switch
          icon="🔊"
          label="Efectos de sonido"
          hint="Sintetizados, sin descargas"
          checked={s.sound}
          onChange={v => {
            setSetting('sound', v);
            if (v) setTimeout(() => sfx('pop'), 30);
          }}
        />
        <Switch
          icon="📳"
          label="Vibración"
          hint="Feedback háptico en acciones clave"
          checked={s.haptics}
          onChange={v => {
            setSetting('haptics', v);
            if (v) navigator.vibrate?.(30);
          }}
        />
        <Switch
          icon="🎙️"
          label="Narrador"
          hint="Lee las cartas en voz alta"
          checked={s.narrator}
          onChange={v => {
            setSetting('narrator', v);
            if (v) setTimeout(() => speak('Narrador activado. Que comience la noche.'), 60);
          }}
        />
        <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--subtle)' }}>
          Disfruta con medida. Si dudas, cambia la copa por agua: el juego funciona igual. Nunca manejes después de beber.
        </p>
      </div>
    </Sheet>
  );
}
