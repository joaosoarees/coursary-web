import { describe, expect, it } from 'vitest';

import { AccountsFilterParams } from '~/admin/users/AccountsFilterParams';

describe('AccountsFilterParams', () => {
  it('should read the role and the status in Portuguese', () => {
    expect(
      AccountsFilterParams.read(
        new URLSearchParams('papel=instrutores&status=pendentes'),
      ),
    ).toEqual({ role: 'instructor', status: 'PENDING' });
  });

  it('should fall back to all students for values it does not know', () => {
    expect(
      AccountsFilterParams.read(new URLSearchParams('papel=x&status=ACTIVE')),
    ).toEqual({ role: 'student', status: undefined });
  });

  it('should leave the defaults out of the address', () => {
    expect(
      AccountsFilterParams.write({
        role: 'student',
        status: undefined,
      }).toString(),
    ).toBe('');
    expect(
      AccountsFilterParams.write({
        role: 'admin',
        status: 'DISABLED',
      }).toString(),
    ).toBe('papel=admins&status=desativadas');
  });
});
