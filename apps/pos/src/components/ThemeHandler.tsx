"use client";

import { useEffect } from 'react';

export function ThemeHandler({ restaurant }: { restaurant: any }) {
  useEffect(() => {
    if (restaurant?.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', restaurant.primaryColor);
    }
  }, [restaurant]);

  return null;
}
