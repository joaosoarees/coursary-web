import { useEffect, useRef, useState } from 'react';

import { ApiFailure } from '~/services/ApiFailure';
import { ExportService } from '~/services/ExportService';

const POLL_MS = 2_000;
const POLL_ATTEMPTS = 30;
// The address is signed for a few minutes; the link goes away a little before it stops working.
const EXPIRY_MARGIN_MS = 10_000;

export const EXPORT_MESSAGES = {
  pending:
    'Um CSV deste curso já está sendo preparado. Tente de novo em alguns minutos.',
  slow: 'O CSV ainda está sendo preparado. Tente de novo em alguns minutos.',
  failed: 'Não deu para preparar o CSV. Tente exportar de novo.',
};

export type StudentExportPhase =
  | { step: 'idle' }
  | { step: 'preparing' }
  | { step: 'ready'; url: string; rowCount: number; expiresIn: number };

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function useStudentExport(courseId: string) {
  const [phase, setPhase] = useState<StudentExportPhase>({ step: 'idle' });
  const [notice, setNotice] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const gone = useRef(false);
  const expiresIn = phase.step === 'ready' ? phase.expiresIn : undefined;

  useEffect(() => {
    gone.current = false;

    return () => {
      gone.current = true;
    };
  }, []);

  useEffect(() => {
    if (expiresIn === undefined) {
      return;
    }

    const timer = setTimeout(
      () => {
        setPhase({ step: 'idle' });
      },
      Math.max(expiresIn * 1000 - EXPIRY_MARGIN_MS, 0),
    );

    return () => {
      clearTimeout(timer);
    };
  }, [expiresIn]);

  const waitForFile = async (exportId: string) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_MS);

      if (gone.current) {
        return undefined;
      }

      // A read that fails is tried again on the next round; only the export's own status ends it.
      const found = await ExportService.get(exportId).catch(() => undefined);

      if (found && found.status !== 'PENDING') {
        return found;
      }
    }

    return 'slow' as const;
  };

  const start = async () => {
    setNotice(undefined);
    setProblem(undefined);
    setPhase({ step: 'preparing' });

    let requested;

    try {
      requested = await ExportService.request(courseId);
    } catch (error) {
      setPhase({ step: 'idle' });

      if (ApiFailure.codeOf(error) === 'EXPORT_PENDING') {
        setNotice(EXPORT_MESSAGES.pending);
      } else {
        setProblem(ApiFailure.message(error));
      }

      return;
    }

    const outcome = await waitForFile(requested.id);

    if (outcome === undefined) {
      return;
    }

    if (outcome === 'slow') {
      setPhase({ step: 'idle' });
      setNotice(EXPORT_MESSAGES.slow);
    } else if (outcome.status === 'READY' && outcome.downloadUrl) {
      setPhase({
        step: 'ready',
        url: outcome.downloadUrl,
        rowCount: outcome.rowCount ?? 0,
        expiresIn: outcome.expiresIn ?? 0,
      });
    } else {
      setPhase({ step: 'idle' });
      setProblem(EXPORT_MESSAGES.failed);
    }
  };

  return { phase, notice, problem, start };
}
