import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Coffee,
  ShoppingBag,
  Film,
  BookOpen,
  Smartphone,
  HeartPulse,
  Wallet,
  Laptop,
  Briefcase,
  GraduationCap,
  Sparkles,
  Tag,
  CreditCard,
  Zap,
  TrendingDown,
  TrendingUp,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  iconName?: string;
  type?: 'income' | 'expense';
  className?: string;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Utensils,
  Car,
  Home,
  Coffee,
  ShoppingBag,
  Film,
  BookOpen,
  Smartphone,
  HeartPulse,
  Wallet,
  Laptop,
  Briefcase,
  GraduationCap,
  Sparkles,
  Tag,
  CreditCard,
  Zap,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName = 'Tag',
  type = 'expense',
  className = 'w-5 h-5',
  ...props
}) => {
  const IconComponent = ICON_MAP[iconName] || (type === 'income' ? TrendingUp : Tag);
  return <IconComponent className={className} {...props} />;
};
