import { useUserRole } from "../../hooks/useUserRole";
import "./UserRoleBadge.css";

export default function UserRoleBadge() {
  const { role, loading } = useUserRole();

  if (loading || !role) return null;

  return <div className={`role-badge role-${role}`}>{role}</div>;
}
