"use client";

import { useEffect } from 'react';

interface Restaurant {
  primaryColor?: string;
}

export function ThemeHandler({ restaurant }: { restaurant: Restaurant | null }) {
  useEffect(() => {
    if (restaurant?.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', restaurant.primaryColor);
    }
  }, [restaurant]);

  return null;
}
