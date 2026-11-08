export const courseUrl = (courseId: string) =>
  `/courses/${encodeURIComponent(courseId)}`;

export const adminUserUrl = (accountId: string) =>
  `/admin/users/${encodeURIComponent(accountId)}`;
