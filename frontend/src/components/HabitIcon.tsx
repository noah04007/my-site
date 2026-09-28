import React from 'react';
import {
  Dumbbell,
  BookOpen,
  Droplets,
  Languages,
  PenTool,
  Moon,
  Flame,
  Brain,
  Heart,
  Footprints,
  Sparkles,
  Zap,
  Coffee,
  Sun,
  Smile,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell,
  BookOpen,
  Droplets,
  Languages,
  PenTool,
  Moon,
  Flame,
  Brain,
  Heart,
  Footprints,
  Sparkles,
  Zap,
  Coffee,
  Sun,
  Smile,
  CheckCircle2
};

interface HabitIconProps {
  name: string;
  className?: string;
  category?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5', category }) => {
  // Normalize lookup
  const cleanName = Object.keys(ICON_MAP).find(
    k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())
  );

  const IconComponent = cleanName ? ICON_MAP[cleanName] : Flame;

  // Determine category color glow
  let colorClass = 'text-purple-400';
  if (category) {
    const cat = category.toLowerCase();
    if (cat.includes('fitness') || cat.includes('workout')) colorClass = 'text-emerald-400';
    else if (cat.includes('study') || cat.includes('read') || cat.includes('language')) colorClass = 'text-indigo-400';
    else if (cat.includes('mental') || cat.includes('spirit') || cat.includes('journal')) colorClass = 'text-purple-400';
    else if (cat.includes('sleep') || cat.includes('recovery')) colorClass = 'text-violet-300';
    else if (cat.includes('health') || cat.includes('water')) colorClass = 'text-fuchsia-400';
    else if (cat.includes('discipline')) colorClass = 'text-amber-400';
  }

  return <IconComponent className={`${className} ${colorClass}`} />;
};

export const AVAILABLE_ICONS = [
  { name: 'Dumbbell', label: 'Workout', icon: Dumbbell },
  { name: 'BookOpen', label: 'Reading', icon: BookOpen },
  { name: 'Droplets', label: 'Water', icon: Droplets },
  { name: 'Languages', label: 'Languages / Study', icon: Languages },
  { name: 'PenTool', label: 'Journal', icon: PenTool },
  { name: 'Moon', label: 'Sleep', icon: Moon },
  { name: 'Footprints', label: 'Walking', icon: Footprints },
  { name: 'Brain', label: 'Focus / Mind', icon: Brain },
  { name: 'Sparkles', label: 'Self-Care', icon: Sparkles },
  { name: 'Flame', label: 'Discipline', icon: Flame }
];
