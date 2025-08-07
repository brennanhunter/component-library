// src/app/map-demo/page.tsx
'use client';

import FranceMap from '@/components/FranceMap';

export default function MapDemo() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">France Map</h1>
      <FranceMap />
    </div>
  );
}