"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/app/components/ImageUploader";

type SettingsForm = {
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  contactEmail: string;
  topBarText: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroImage: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeButtonText: string;
  welcomeImage: string;
  sizeChart: string;
};

const EMPTY: SettingsForm = {
  whatsappNumber: "",
  facebookUrl: "",
  instagramUrl: "",
  contactEmail: "",
  topBarText: "",
  heroTag: "",
  heroTitle: "",
  heroSubtitle: "",
  heroDescription: "",
  heroButtonText: "",
  heroImage: "",
  welcomeTitle: "",
  welcomeSubtitle: "",
  welcomeButtonText: "",
  welcomeImage: "",
  sizeChart: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsForm>(EMPTY);

  const set = (key: keyof SettingsForm) => (v: string) => setSettings((s) => ({ ...s, [key]: v }));

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const next = { ...EMPTY };
        (Object.keys(EMPTY) as (keyof SettingsForm)[]).forEach((k) => {
          next[k] = data[k] ?? "";
        });
        setSettings(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) alert("Settings saved successfully!");
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error saving settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-serif">Site Settings</h1>

      <section className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Contact &amp; social</h2>
        <Field label="WhatsApp Number (with country code)" value={settings.whatsappNumber} onChange={set("whatsappNumber")} placeholder="201227840123" />
        <Field label="Facebook URL" value={settings.facebookUrl} onChange={set("facebookUrl")} />
        <Field label="Instagram URL" value={settings.instagramUrl} onChange={set("instagramUrl")} />
        <Field label="Contact Email (optional)" type="email" value={settings.contactEmail} onChange={set("contactEmail")} />
      </section>

      <section className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Top bar (black strip)</h2>
        <Field label="Text (leave empty to hide the bar)" value={settings.topBarText} onChange={set("topBarText")} />
      </section>

      <section className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Main hero (first banner)</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <ImageUploader value={settings.heroImage} onChange={set("heroImage")} />
        </div>
        <Field label="Small label (above title)" value={settings.heroTag} onChange={set("heroTag")} />
        <Field label="Title" value={settings.heroTitle} onChange={set("heroTitle")} />
        <Field label="Subtitle (script font)" value={settings.heroSubtitle} onChange={set("heroSubtitle")} />
        <Field label="Description line" value={settings.heroDescription} onChange={set("heroDescription")} />
        <Field label="Button text" value={settings.heroButtonText} onChange={set("heroButtonText")} />
      </section>

      <section className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Welcome banner (second banner)</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <ImageUploader value={settings.welcomeImage} onChange={set("welcomeImage")} />
        </div>
        <Field label="Title" value={settings.welcomeTitle} onChange={set("welcomeTitle")} />
        <Field label="Subtitle" value={settings.welcomeSubtitle} onChange={set("welcomeSubtitle")} />
        <Field label="Button text" value={settings.welcomeButtonText} onChange={set("welcomeButtonText")} />
      </section>

      <section className="space-y-3 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Size chart</h2>
        <p className="text-xs text-gray-500">
          Each line is a row, values separated by commas. The first line is the column titles. Leave empty to use the default chart.
        </p>
        <textarea
          value={settings.sizeChart}
          onChange={(e) => set("sizeChart")(e.target.value)}
          rows={8}
          dir="ltr"
          className="w-full border p-2 rounded font-mono text-sm"
          placeholder={"Size,Chest (cm),Length (cm)\nS,96,68\nM,100,70\nL,104,72"}
        />
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
