// Format monetary amounts e.g. 25000000 -> "$25.0M", 500000 -> "$500K"
export function formatMoney(amount) {
  if (amount === undefined || amount === null) return '$0';
  const num = Number(amount);
  if (isNaN(num)) return '$0';

  if (num >= 1000000) {
    const millions = num / 1000000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  } else if (num >= 1000) {
    const thousands = num / 1000;
    return `$${thousands.toFixed(0)}K`;
  }
  return `$${num.toLocaleString()}`;
}

// Color badges based on football position
export function getPositionBadge(position) {
  switch (position) {
    case 'GK':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        label: 'Goalkeeper'
      };
    case 'DEF':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        label: 'Defender'
      };
    case 'MID':
      return {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        label: 'Midfielder'
      };
    case 'FWD':
      return {
        bg: 'bg-rose-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        label: 'Forward'
      };
    default:
      return {
        bg: 'bg-slate-500/20',
        text: 'text-slate-400',
        border: 'border-slate-500/40',
        label: position || 'Player'
      };
  }
}

// Rating color classes
export function getRatingColor(rating) {
  const r = Number(rating) || 0;
  if (r >= 90) return 'text-amber-400 border-amber-400/50 bg-amber-500/10';
  if (r >= 85) return 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10';
  if (r >= 80) return 'text-cyan-400 border-cyan-400/50 bg-cyan-500/10';
  return 'text-slate-300 border-slate-600 bg-slate-800/40';
}
