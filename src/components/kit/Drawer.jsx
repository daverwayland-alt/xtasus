'use client';
import { Drawer as Vaul } from 'vaul';
import { LuX } from 'react-icons/lu';
import { useSyncExternalStore } from 'react';

const desktopQuery = '(min-width: 1024px)';
const subscribe = cb => { const media = window.matchMedia(desktopQuery); media.addEventListener('change', cb); return () => media.removeEventListener('change', cb); };
const getDesktop = () => window.matchMedia(desktopQuery).matches;

/* Bottom sheet arrastrable (vaul, igual que el Drawer de shadcn/ui). */
export function Sheet({ open, onOpenChange, title, subtitle, children }) {
  const desktop = useSyncExternalStore(subscribe, getDesktop, () => false);
  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange} direction={desktop ? 'right' : 'bottom'}>
      <Vaul.Portal>
        <Vaul.Overlay className="drawer-overlay" />
        <Vaul.Content className="drawer-content" data-desktop={desktop} aria-describedby={undefined}>
          <div className="drawer-grab" />
          <div className="drawer-body">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <Vaul.Title className="font-display text-base font-extrabold uppercase tracking-tight">{title}</Vaul.Title>
                {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{subtitle}</p>}
              </div>
              <Vaul.Close className="btn btn-ghost btn-sm btn-icon" aria-label="Cerrar">
                <LuX size={16} />
              </Vaul.Close>
            </div>
            {children}
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
