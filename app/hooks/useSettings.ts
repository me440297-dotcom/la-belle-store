"use client";

import { useEffect, useState } from "react";

export type ClientSettings = {
  whatsappNumber: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

// رقم الواتساب الافتراضي لحد ما الإعدادات تتحمل من الداتابيز
const FALLBACK: ClientSettings = {
  whatsappNumber: "201227840123",
  facebookUrl: null,
  instagramUrl: null,
};

export function useSettings(): ClientSettings {
  const [settings, setSettings] = useState<ClientSettings>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.whatsappNumber) setSettings(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
