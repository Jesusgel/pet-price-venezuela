export interface CategoryVisual {
  emoji: string;
  label: string;
  bgGradient: string;
  borderColor: string;
  badgeClass: string;
}

/**
 * Normaliza una categoría y retorna sus metadatos visuales (emoji, paleta y etiqueta).
 * Es insensible a mayúsculas, minúsculas y tildes/acentos diacríticos.
 */
export function getCategoryVisual(category?: string | null): CategoryVisual {
  if (!category || !category.trim()) {
    return {
      emoji: '🐾',
      label: 'General',
      bgGradient: 'from-surface-container-low to-surface-container',
      borderColor: 'border-border',
      badgeClass: 'bg-surface-container text-on-surface-variant border-border',
    };
  }

  const raw = category.trim();
  const norm = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (norm.includes('perr') || norm.includes('canin') || norm.includes('dog') || norm.includes('cachorr')) {
    return {
      emoji: '🐶',
      label: 'Perro',
      bgGradient: 'from-amber-50 to-orange-100/50',
      borderColor: 'border-amber-200/80',
      badgeClass: 'bg-amber-100/80 text-amber-900 border-amber-200',
    };
  }

  if (norm.includes('gat') || norm.includes('felin') || norm.includes('cat') || norm.includes('minin')) {
    return {
      emoji: '🐱',
      label: 'Gato',
      bgGradient: 'from-orange-50 to-amber-100/50',
      borderColor: 'border-orange-200/80',
      badgeClass: 'bg-orange-100/80 text-orange-900 border-orange-200',
    };
  }

  if (
    norm.includes('ganad') ||
    norm.includes('vaca') ||
    norm.includes('bovin') ||
    norm.includes('toro') ||
    norm.includes('vacun') ||
    norm.includes('cow')
  ) {
    return {
      emoji: '🐮',
      label: 'Ganado',
      bgGradient: 'from-emerald-50 to-green-100/50',
      borderColor: 'border-emerald-200/80',
      badgeClass: 'bg-emerald-100/80 text-emerald-900 border-emerald-200',
    };
  }

  if (
    norm.includes('ave') ||
    norm.includes('pajar') ||
    norm.includes('loro') ||
    norm.includes('canari') ||
    norm.includes('peric') ||
    norm.includes('bird') ||
    norm.includes('gallin') ||
    norm.includes('pollo')
  ) {
    return {
      emoji: '🦜',
      label: 'Aves',
      bgGradient: 'from-sky-50 to-blue-100/50',
      borderColor: 'border-sky-200/80',
      badgeClass: 'bg-sky-100/80 text-sky-900 border-sky-200',
    };
  }

  if (
    norm.includes('pez') ||
    norm.includes('pece') ||
    norm.includes('acuari') ||
    norm.includes('fish')
  ) {
    return {
      emoji: '🐟',
      label: 'Peces',
      bgGradient: 'from-cyan-50 to-teal-100/50',
      borderColor: 'border-cyan-200/80',
      badgeClass: 'bg-cyan-100/80 text-cyan-900 border-cyan-200',
    };
  }

  if (
    norm.includes('caball') ||
    norm.includes('equin') ||
    norm.includes('horse') ||
    norm.includes('yegua')
  ) {
    return {
      emoji: '🐴',
      label: 'Equinos',
      bgGradient: 'from-stone-50 to-amber-100/40',
      borderColor: 'border-stone-300/80',
      badgeClass: 'bg-stone-200/80 text-stone-900 border-stone-300',
    };
  }

  if (
    norm.includes('cerd') ||
    norm.includes('porcin') ||
    norm.includes('pig') ||
    norm.includes('cochin')
  ) {
    return {
      emoji: '🐷',
      label: 'Porcino',
      bgGradient: 'from-pink-50 to-rose-100/50',
      borderColor: 'border-pink-200/80',
      badgeClass: 'bg-pink-100/80 text-pink-900 border-pink-200',
    };
  }

  if (
    norm.includes('conej') ||
    norm.includes('roedor') ||
    norm.includes('hamster') ||
    norm.includes('cobay')
  ) {
    return {
      emoji: '🐰',
      label: 'Roedores',
      bgGradient: 'from-purple-50 to-violet-100/50',
      borderColor: 'border-purple-200/80',
      badgeClass: 'bg-purple-100/80 text-purple-900 border-purple-200',
    };
  }

  return {
    emoji: '🐾',
    label: raw,
    bgGradient: 'from-surface-container-low to-surface-container',
    borderColor: 'border-border',
    badgeClass: 'bg-surface-container text-on-surface-variant border-border',
  };
}
