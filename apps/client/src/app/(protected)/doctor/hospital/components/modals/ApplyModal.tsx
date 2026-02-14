"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/axios";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type HospitalOption = { id: string; name: string };

export default function ApplyModal({ open, onClose, onSuccess }: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<HospitalOption[]>([]);
  const [selected, setSelected] = useState<HospitalOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      setLoadingOptions(true);
      try {
        const res = await api.get("/hospital");
        const list = res?.data?.data ?? res?.data ?? [];
        if (!mounted) return;
        const mapped = (list || []).map((h: any) => ({
          id: h.id,
          name: h.name,
        }));
        setOptions(mapped);
      } catch (e) {
        console.error(e);
        toast.addToast({
          title: "Failed to load hospitals",
          message: (e as any)?.response?.data?.message || (e as any)?.message,
          variant: "danger",
        } as any);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Only show suggestions when user has typed at least 2 characters
    if (q.length < 2) return [];
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) &&
        !selected.some((s) => s.id === o.id),
    );
  }, [options, query, selected]);

  if (!open) return null;

  const addOption = (opt: HospitalOption) => {
    setSelected((s) => [...s, opt]);
    setQuery("");
    setShowDropdown(false);
  };

  const removeOption = (id: string) => {
    setSelected((s) => s.filter((x) => x.id !== id));
  };

  const submit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      const hospitalIds = selected.map((s) => s.id);
      const res = await api.post("/doctor/apply/hospital", { hospitalIds });
      const message = res?.data?.message || "Applied successfully";
      toast.addToast({ title: message, variant: "success" } as any);
      onSuccess?.();
      onClose();
    } catch (e) {
      const errMsg = (e as any)?.response?.data?.message || (e as any)?.message;
      toast.addToast({
        title: "Failed to apply",
        message: errMsg,
        variant: "danger",
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="bg-black/40 absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-md shadow-md p-6 z-50 w-full max-w-lg">
        <h3 className="text-lg font-medium text-slate-900">
          Apply to Hospitals
        </h3>

        <div className="mt-4">
          <label className="block text-sm text-slate-700 mb-2">
            Select hospitals
          </label>

          <div className="border rounded p-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {selected.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-2 bg-blue-50 text-blue-800 px-2 py-1 rounded"
                >
                  <span className="text-sm">{s.name}</span>
                  <button
                    onClick={() => removeOption(s.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${s.name}`}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                setShowDropdown(v.trim().length >= 2);
              }}
              onFocus={() => setShowDropdown(query.trim().length >= 2)}
              placeholder={
                loadingOptions
                  ? "Loading hospitals..."
                  : "Type to search hospitals"
              }
              className="w-full border-none outline-none"
            />
          </div>

          {showDropdown && filtered.length > 0 && (
            <ul>
              {filtered.map((o) => (
                <li key={o.id} className="p-2">
                  <button
                    type="button"
                    onClick={() => addOption(o)}
                    className="inline-block px-3 py-1 rounded-full bg-green-400 text-sm text-blue-950 cursor-pointer transition-transform duration-150 transform hover:scale-95"
                  >
                    {o.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-1 text-sm text-slate-700 bg-slate-50 rounded-md border"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || selected.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-100"
            type="button"
          >
            {submitting ? "Submitting..." : `Apply (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
