// The browser takes File.type from the extension and leaves it empty for some (".md" on Windows),
// so the extension decides; the API checks the type it is told against the same list.
const TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  txt: 'text/plain',
  md: 'text/markdown',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const MATERIAL_ACCEPT = Object.keys(TYPES)
  .map((extension) => `.${extension}`)
  .join(',');

export const MATERIAL_MAX_FILES = 20;

export const MATERIAL_FULL =
  'A aula já tem 20 arquivos. Apague um para enviar outro.';

export const MATERIAL_HINT =
  'PDF, ZIP, texto, Markdown, Word, PowerPoint ou Excel, até 50 MB cada.';

const MAX_BYTES = 50 * 1024 * 1024;

export const checkMaterial = (
  file: File,
): Promise<{ type: string } | { problem: string }> => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const type = TYPES[extension];

  if (!type) {
    return Promise.resolve({
      problem: 'Esse tipo de arquivo não entra no material. ' + MATERIAL_HINT,
    });
  }

  if (file.size > MAX_BYTES) {
    return Promise.resolve({ problem: 'Escolha um arquivo de até 50 MB.' });
  }

  return Promise.resolve({ type });
};
