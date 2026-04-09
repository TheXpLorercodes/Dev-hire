import { useState, useRef, useCallback } from "react";
import { submitGenerate, pollJob } from "../utils/api";

const POLL_INTERVAL = 2000; // 2s
const MAX_POLLS = 90;       // 3 minutes max

export function useGenerate() {
  const [status, setStatus] = useState("idle"); // idle | queued | processing | completed | failed
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef(null);
  const countRef = useRef(0);
  const startRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((id) => {
    countRef.current = 0;
    startRef.current = Date.now();

    pollRef.current = setInterval(async () => {
      countRef.current += 1;
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));

      if (countRef.current > MAX_POLLS) {
        stopPolling();
        setStatus("failed");
        setError("Timed out waiting for generation");
        return;
      }

      try {
        const data = await pollJob(id);
        if (data.status === "completed") {
          stopPolling();
          setResult(data);
          setStatus("completed");
        } else if (data.status === "failed") {
          stopPolling();
          setError(data.error || "Generation failed");
          setStatus("failed");
        } else {
          setStatus(data.status === "processing" ? "processing" : "queued");
        }
      } catch (err) {
        // network blip — keep polling
      }
    }, POLL_INTERVAL);
  }, [stopPolling]);

  const generate = useCallback(async (payload) => {
    stopPolling();
    setStatus("queued");
    setResult(null);
    setError(null);
    setElapsed(0);

    try {
      const res = await submitGenerate(payload);
      setJobId(res.job_id);
      startPolling(res.job_id);
    } catch (err) {
      setStatus("failed");
      setError(err?.response?.data?.detail || err.message || "Submission failed");
    }
  }, [startPolling, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setJobId(null);
    setResult(null);
    setError(null);
    setElapsed(0);
  }, [stopPolling]);

  return { generate, reset, status, jobId, result, error, elapsed };
}
