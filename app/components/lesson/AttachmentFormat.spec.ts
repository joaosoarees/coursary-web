import { describe, expect, it } from 'vitest';

import { AttachmentFormat } from '~/components/lesson/AttachmentFormat';

describe('AttachmentFormat', () => {
  it('should name the accepted kinds and fall back to a plain word', () => {
    expect(AttachmentFormat.kind('application/pdf')).toBe('PDF');
    expect(
      AttachmentFormat.kind(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ).toBe('Planilha do Excel');
    expect(AttachmentFormat.kind('image/png')).toBe('Arquivo');
  });

  it('should show megabytes with one decimal and kilobytes rounded up', () => {
    expect(AttachmentFormat.size(1.8 * 1024 * 1024)).toBe('1,8 MB');
    expect(AttachmentFormat.size(240 * 1024)).toBe('240 KB');
    expect(AttachmentFormat.size(300)).toBe('1 KB');
    expect(AttachmentFormat.size(0)).toBe('1 KB');
  });
});
