/**
 * Strict role isolation helper:
 * Native mobile PWA shell (top app bar, 4x2 quick-access grid, 5-tab bottom bar, install banner)
 * is enabled ONLY for Teacher/Faculty and Student/Parent roles on mobile (< 768px).
 * Admin and Office Staff roles remain 100% untouched.
 */
export function isNativeMobileRole(user) {
  const role = String(user?.role || '').toLowerCase().trim();
  return ['teacher', 'faculty', 'student', 'parent'].includes(role);
}
