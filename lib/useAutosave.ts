"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SaveResult = { error?: string; success?: boolean } | undefined;
type Status = "idle" | "saving" | "saved" | "error";

/**
 * Wires a <form ref={formRef} onChange={handleChange} onBlur={handleBlur}>
 * up to a server action, saving automatically ~1.2s after the last change
 * (or immediately on blur), instead of relying on an explicit Save button.
 *
 * Also flushes on unmount, so navigating to another page mid-edit (which
 * unmounts this component) still saves whatever was last typed.
 */
export function useAutosave(action: (formData: FormData) => Promise<SaveResult>, delay = 1200) {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const flush = useCallback(async () => {
    if (!formRef.current || !dirty.current) return;
    dirty.current = false;
    const formData = new FormData(formRef.current);
    setStatus("saving");
    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setError(null);
        setStatus("saved");
      }
    } catch {
      setError("Couldn't save — check your connection.");
      setStatus("error");
    }
  }, [action]);

  const handleChange = useCallback(() => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, delay);
  }, [flush, delay]);

  const handleBlur = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    flush();
  }, [flush]);

  // Best-effort save if the user navigates away while a change is pending.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (dirty.current) flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { formRef, status, error, handleChange, handleBlur };
}
