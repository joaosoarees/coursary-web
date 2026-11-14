import { useEffect, useRef, useState } from 'react';

import { ApiFailure } from '~/services/ApiFailure';
import { ExportService, type StudentExport } from '~/services/ExportService';

const POLL_MS = 2_000;
const POLL_ATTEMPTS = 30;
// The address is signed for a few minutes; the link goes away a little before it stops working.
const EXPIRY_MARGIN_MS = 10_000;

export const EXPORT_MESSAGES = {
  pending:
    'Um CSV deste curso já está sendo preparado. Tente de novo em alguns minutos.',
  slow: 'O CSV ainda está sendo preparado. Clique em Exportar CSV de novo para conferir.',
  expired: 'O link expirou. Exporte de novo.',
  failed: 'Não deu para preparar o CSV. Tente exportar de novo.',
  gone: 'Este CSV expirou. Exporte de novo.',
};

export type StudentExportPhase =
  | { step: 'idle' }
  | { step: 'preparing' }
  | {
      step: 'ready';
      url: string;
      rowCount: number | null;
      expiresIn: number;
      // A timer stops while the laptop sleeps; the link checks the clock before it is followed.
      expiresAt: number;
    };

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function useStudentExport(courseId: string) {
  const [phase, setPhase] = useState<StudentExportPhase>({ step: 'idle' });
  const [notice, setNotice] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const gone = useRef(false);
  // Kept after the wait runs out, so the next click picks up this export instead of a 409.
  const waiting = useRef<string>(undefined);
  const expiresAt = phase.step === 'ready' ? phase.expiresAt : undefined;

  useEffect(() => {
    gone.current = false;

    return () => {
      gone.current = true;
    };
  }, []);

  useEffect(() => {
    if (expiresAt === undefined) {
      return;
    }

    const timer = setTimeout(
      () => {
        setPhase({ step: 'idle' });
        setNotice(EXPORT_MESSAGES.expired);
      },
      Math.max(expiresAt - Date.now(), 0),
    );

    return () => {
      clearTimeout(timer);
    };
  }, [expiresAt]);

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

  const finish = (outcome: StudentExport | 'slow' | undefined) => {
    if (outcome === undefined) {
      return;
    }

    if (outcome === 'slow') {
      setPhase({ step: 'idle' });
      setNotice(EXPORT_MESSAGES.slow);
      return;
    }

    waiting.current = undefined;

    if (
      outcome.status === 'READY' &&
      outcome.downloadUrl &&
      outcome.expiresIn !== undefined
    ) {
      setPhase({
        step: 'ready',
        url: outcome.downloadUrl,
        rowCount: outcome.rowCount,
        expiresIn: outcome.expiresIn,
        expiresAt: Date.now() + outcome.expiresIn * 1000 - EXPIRY_MARGIN_MS,
      });
    } else {
      setPhase({ step: 'idle' });
      setProblem(EXPORT_MESSAGES.failed);
    }
  };

  const resume = async (exportId: string) => {
    const found = await ExportService.get(exportId).catch(() => undefined);

    if (found?.status === 'READY') {
      finish(found);
      return true;
    }

    if (found?.status === 'PENDING') {
      finish(await waitForFile(exportId));
      return true;
    }

    waiting.current = undefined;

    return false;
  };

  const start = async () => {
    setNotice(undefined);
    setProblem(undefined);
    setPhase({ step: 'preparing' });

    if (waiting.current && (await resume(waiting.current))) {
      return;
    }

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

    waiting.current = requested.id;
    finish(await waitForFile(requested.id));
  };

  // From the bell's notice: the export may have expired since.
  const open = async (exportId: string) => {
    setNotice(undefined);
    setProblem(undefined);
    setPhase({ step: 'preparing' });
    waiting.current = exportId;

    if (!(await resume(exportId))) {
      setPhase({ step: 'idle' });
      setNotice(EXPORT_MESSAGES.gone);
    }
  };

  const expire = () => {
    setPhase({ step: 'idle' });
    setNotice(EXPORT_MESSAGES.expired);
  };

  return { phase, notice, problem, start, open, expire };
}
