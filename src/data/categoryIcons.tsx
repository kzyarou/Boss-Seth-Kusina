import React, { Component } from 'react';
import { Flame, FlaskConical, Wallet, Utensils } from 'lucide-react';
const ICON_MAP: Record<
  string,
  ComponentType<{
    className?: string;
  }>> =
{
  'boss-seth': Flame,
  community: FlaskConical,
  budget: Wallet,
  traditional: Utensils
};
export function CategoryIcon({
  id,
  className = 'w-5 h-5'



}: {id: string;className?: string;}) {
  const Icon = ICON_MAP[id] ?? Utensils;
  return <Icon className={className} />;
}