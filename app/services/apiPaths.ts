export const courseUrl = (courseId: string) =>
  `/courses/${encodeURIComponent(courseId)}`;

export const adminUserUrl = (accountId: string) =>
  `/admin/users/${encodeURIComponent(accountId)}`;

export const lessonUrl = (courseId: string, lessonId: string) =>
  `${courseUrl(courseId)}/lessons/${encodeURIComponent(lessonId)}`;
