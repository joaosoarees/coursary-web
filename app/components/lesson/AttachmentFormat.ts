const KINDS: Partial<Record<string, string>> = {
  'application/pdf': 'PDF',
  'application/zip': 'ZIP',
  'text/plain': 'Texto',
  'text/markdown': 'Markdown',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'Apresentação do PowerPoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'Documento do Word',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'Planilha do Excel',
};

const KB = 1024;
const MB = KB * 1024;

const DECIMAL = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export class AttachmentFormat {
  static kind(contentType: string): string {
    return KINDS[contentType] ?? 'Arquivo';
  }

  static size(bytes: number): string {
    if (bytes >= MB) {
      return `${DECIMAL.format(bytes / MB)} MB`;
    }

    return `${WHOLE.format(Math.max(1, Math.ceil(bytes / KB)))} KB`;
  }
}
