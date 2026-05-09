export interface MachineEntry {
  id: string;
  farmerName: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  totalHours: number;
  totalAmount: number;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  emoji: string;
  entries: MachineEntry[];
}

export const TYPE_EMOJIS: Record<string, string> = {
  tractor: '🚜', rotavator: '⚙️', harvester: '🌾',
  pump: '💧', thresher: '🔧', other: '🛠️',
};

export const MACHINE_TYPES = ['tractor','rotavator','harvester','pump','thresher','other'];

export function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(eh)) return 0;
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? Math.round((diff / 60) * 10) / 10 : 0;
}
