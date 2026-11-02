import { isAxiosError } from 'axios';
import { z } from 'zod';

const errorBodySchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

const UNREACHABLE = 'Não foi possível falar com o servidor. Confira a conexão.';
const UNEXPECTED = 'Não foi possível concluir. Tente de novo.';

export class ApiFailure {
  static codeOf(error: unknown): string | undefined {
    if (!isAxiosError(error)) {
      return undefined;
    }

    const parsed = errorBodySchema.safeParse(error.response?.data);

    return parsed.success ? parsed.data.error.code : undefined;
  }

  static message(
    error: unknown,
    byCode: Partial<Record<string, string>> = {},
  ): string {
    const code = ApiFailure.codeOf(error);
    const known = code === undefined ? undefined : byCode[code];

    if (known !== undefined) {
      return known;
    }

    if (isAxiosError(error) && error.response === undefined) {
      return UNREACHABLE;
    }

    return UNEXPECTED;
  }
}
