import { File, Plus, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '~/components/ConfirmDialog';
import { AttachmentFormat } from '~/components/lesson/AttachmentFormat';
import { Button } from '~/components/ui/button';
import { FormAlert } from '~/components/visitor/FormMessage';
import { focusLater, focusMark } from '~/instructor/content/contentFocus';
import { ContentOrder } from '~/instructor/content/ContentOrder';
import { MoveButtons } from '~/instructor/content/MoveButtons';
import {
  MATERIAL_ACCEPT,
  MATERIAL_HINT,
  MATERIAL_MAX_FILES,
} from '~/instructor/lesson/materialRules';
import { useMaterialUpload } from '~/instructor/lesson/useMaterialUpload';
import { useDeleteMaterial, useReorderMaterial } from '~/mutations/material';
import { ApiFailure } from '~/services/ApiFailure';
import type { Attachment } from '~/services/LessonService';

export function MaterialCard({
  courseId,
  lessonId,
  files,
  readOnly,
}: {
  courseId: string;
  lessonId: string;
  files: Attachment[];
  readOnly: boolean;
}) {
  const titleId = useId();
  const hintId = useId();
  const input = useRef<HTMLInputElement>(null);
  const { phase, problem, upload, name } = useMaterialUpload(
    courseId,
    lessonId,
  );
  const reorder = useReorderMaterial(courseId, lessonId);
  const [deleting, setDeleting] = useState<Attachment>();
  const remove = useDeleteMaterial(courseId, lessonId);
  const busy = phase.step !== 'idle';
  const full = files.length >= MATERIAL_MAX_FILES;
  const percent =
    phase.step === 'uploading' ? Math.round(phase.progress * 100) : 100;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3.5 rounded-lg border bg-card p-5 text-card-foreground shadow-sm md:p-7"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="font-display text-xl font-bold">
          Material
        </h2>
        <span className="text-muted-foreground">
          {files.length} de {MATERIAL_MAX_FILES}
        </span>
      </div>
      {files.length === 0 && !busy && (
        <p className="text-muted-foreground">
          Nenhum arquivo. O aluno baixa o material na própria aula.
        </p>
      )}
      {files.length > 0 && (
        <ol className="flex flex-col">
          {files.map((file, index) => (
            <li
              key={file.id}
              className="flex min-h-13 items-center gap-2.5 border-t first:border-t-0"
            >
              <File
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground"
              />
              <span className="flex min-w-0 flex-1 flex-col leading-snug">
                <span className="font-semibold break-words">{file.name}</span>
                <span className="text-sm text-muted-foreground">
                  {AttachmentFormat.kind(file.contentType)} ·{' '}
                  {AttachmentFormat.size(file.size)}
                </span>
              </span>
              {!readOnly && (
                <span
                  role="group"
                  aria-label={`Ações de ${file.name}`}
                  className="flex shrink-0 gap-1"
                >
                  <MoveButtons
                    what={file.name}
                    first={index === 0}
                    last={index === files.length - 1}
                    onMove={(offset) => {
                      reorder.mutate(ContentOrder.swap(files, index, offset));
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Apagar ${file.name}`}
                    className="text-destructive"
                    onClick={() => {
                      setDeleting(file);
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
      <div role="status" className="flex flex-col gap-1.5">
        {busy && (
          <>
            {phase.step === 'uploading' && (
              <div
                role="progressbar"
                aria-label={`Envio de ${name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${String(percent)}%` }}
                />
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {phase.step === 'uploading'
                ? `Enviando ${name}…`
                : `Confirmando ${name}…`}
              {phase.step === 'uploading' && (
                <span aria-hidden="true"> {percent}%</span>
              )}
            </span>
          </>
        )}
      </div>
      {problem && <FormAlert>{problem}</FormAlert>}
      {!readOnly && (
        <>
          <input
            ref={input}
            type="file"
            accept={MATERIAL_ACCEPT}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';

              if (file) {
                void upload(file);
              }
            }}
          />
          <div className="flex flex-col items-start gap-2">
            {/* Not disabled while busy: the button keeps the focus it had when the picker closed. */}
            <Button
              variant="outline"
              aria-disabled={busy || full}
              aria-describedby={hintId}
              className="aria-disabled:cursor-progress"
              onClick={() => {
                if (!busy && !full) {
                  input.current?.click();
                }
              }}
              {...focusMark(`material-send-${lessonId}`)}
            >
              <Plus aria-hidden="true" />
              Enviar arquivo
            </Button>
            <p id={hintId} className="text-sm text-muted-foreground">
              {full
                ? 'A aula já tem 20 arquivos. Apague um para enviar outro.'
                : MATERIAL_HINT}
            </p>
          </div>
        </>
      )}
      <ConfirmDialog
        open={deleting !== undefined}
        onClose={() => {
          setDeleting(undefined);
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          focusLater(`material-send-${lessonId}`);
        }}
        pending={remove.isPending}
        error={remove.error && ApiFailure.message(remove.error)}
        onReset={remove.reset}
        title="Apagar o arquivo?"
        description={
          <>
            <strong className="text-foreground">{deleting?.name}</strong> sai do
            material da aula, e os alunos deixam de poder baixá-lo. Isso não
            pode ser desfeito.
          </>
        }
        confirm={{
          label: 'Apagar o arquivo',
          pending: 'Apagando…',
          destructive: true,
        }}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          remove.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(undefined);
              toast.success('Arquivo apagado.');
            },
          });
        }}
      />
    </section>
  );
}
