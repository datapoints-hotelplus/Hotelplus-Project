import { useAuth } from "../../AuthProvider";
import "./UserRoleBadge.css";

export default function UserRoleBadge() {
  
const { role, loading } = useAuth();

  if (loading || !role) return null;

  return <div className={`role-badge role-${role}`}>{role}</div>;
}
