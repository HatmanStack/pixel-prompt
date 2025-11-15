/**
 * useJobPolling Hook
 * Polls job status at regular intervals until completion
 */

import { useState, useEffect, useRef } from 'react';
import { getJobStatus } from '../api/client';

// Polling configuration
const DEFAULT_INTERVAL = 2000; // 2 seconds
const TIMEOUT_DURATION = 300000; // 5 minutes
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Custom hook for polling job status
 * @param {string} jobId - The job ID to poll
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Object} { jobStatus, isPolling, error }
 */
function useJobPolling(jobId, interval = DEFAULT_INTERVAL) {
  const [jobStatus, setJobStatus] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  const pollingIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const consecutiveErrorsRef = useRef(0);
  const currentIntervalRef = useRef(interval);

  useEffect(() => {
    // Reset state when jobId changes
    if (!jobId) {
      setJobStatus(null);
      setIsPolling(false);
      setError(null);
      return;
    }

    // Start polling
    setIsPolling(true);
    setError(null);
    startTimeRef.current = Date.now();
    consecutiveErrorsRef.current = 0;
    currentIntervalRef.current = interval;

    const pollStatus = async () => {
      try {
        // Check for timeout (5 minutes)
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed > TIMEOUT_DURATION) {
          setError('Job polling timed out after 5 minutes');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          return;
        }

        // Fetch job status
        const status = await getJobStatus(jobId);
        setJobStatus(status);

        // Reset consecutive errors on success
        consecutiveErrorsRef.current = 0;
        currentIntervalRef.current = interval;

        // Stop polling if job is complete, partial, or failed
        if (status.status === 'completed' || status.status === 'partial' || status.status === 'failed') {
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);

        // Increment consecutive errors
        consecutiveErrorsRef.current += 1;

        // Exponential backoff for errors
        if (consecutiveErrorsRef.current <= MAX_CONSECUTIVE_ERRORS) {
          currentIntervalRef.current = Math.min(
            interval * Math.pow(2, consecutiveErrorsRef.current - 1),
            8000 // Max 8 seconds
          );

          // Clear old interval and set new one with backoff
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          pollingIntervalRef.current = setInterval(pollStatus, currentIntervalRef.current);
        } else {
          // Stop polling after max consecutive errors
          setError(`Failed to fetch job status after ${MAX_CONSECUTIVE_ERRORS} attempts`);
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval for subsequent polls
    pollingIntervalRef.current = setInterval(pollStatus, interval);

    // Cleanup on unmount or when jobId changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setIsPolling(false);
    };
  }, [jobId, interval]);

  return {
    jobStatus,
    isPolling,
    error,
  };
}

export default useJobPolling;
