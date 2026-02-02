import { useState, useCallback, useRef } from 'react';

export type ProcessingStep =
  | 'validating_receipt'
  | 'fetching_user_data'
  | 'checking_session'
  | 'invoking_ai'
  | 'analyzing_transactions'
  | 'executing_tools'
  | 'creating_session'
  | 'enriching_data'
  | 'finalizing_extraction'
  | 'complete';

export interface ProgressData {
  step: ProcessingStep;
  message: string;
  progress: number;
}

export interface ProcessingResult {
  batch_session_id: string;
  total_transactions: number;
  successfully_initiated: number;
  transactions: any[];
  overall_confidence: number;
  processing_notes: string;
}

export interface UseSequentialProcessingReturn {
  progress: number;
  message: string;
  step: ProcessingStep | null;
  isProcessing: boolean;
  result: ProcessingResult | null;
  error: string | null;
  initiateProcessing: (receiptId: string, userBankAccountId: string) => Promise<void>;
  cancel: () => void;
}

export function useSequentialProcessing(): UseSequentialProcessingReturn {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<ProcessingStep | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setProgress(0);
    setMessage('');
    setStep(null);
  }, []);

  const initiateProcessing = useCallback(async (receiptId: string, userBankAccountId: string) => {
    setIsProcessing(true);
    setProgress(0);
    setMessage('');
    setStep(null);
    setError(null);
    setResult(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

      const response = await fetch(
        `${apiUrl}/transaction/sequential/initiate-with-progress/${receiptId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ userBankAccountId }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to initiate processing' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'connected':
                  console.log('Connected to progress stream');
                  break;

                case 'progress':
                  setProgress(data.progress);
                  setMessage(data.message);
                  setStep(data.step);
                  break;

                case 'complete':
                  setResult(data.data);
                  setProgress(100);
                  setMessage('Processing complete!');
                  setStep('complete');
                  setIsProcessing(false);
                  break;

                case 'error':
                  throw new Error(data.message);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Processing cancelled by user');
        setError('Processing cancelled');
      } else {
        console.error('Processing error:', err);
        setError(err.message || 'An error occurred during processing');
      }
      setIsProcessing(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  return {
    progress,
    message,
    step,
    isProcessing,
    result,
    error,
    initiateProcessing,
    cancel,
  };
}
