// 🔓 Role check temporarily disabled for development
// Restore original logic when ready to enforce role-based access
export function RoleRoute({ allowedRoles = [], children }) {
  return children;
}