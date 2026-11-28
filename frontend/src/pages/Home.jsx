import { useAuth } from "../context/AuthContext";
import WorkspaceLayout from "../components/WorkspaceLayout";
import Dashboard from "./Dashboard";
import Login from "./Login";

export default function Home() {
  const { isLoggedIn } = useAuth();

  // The website opens on login for signed-out visitors.
  // Once authenticated, the same entry route becomes the founder workspace.
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <WorkspaceLayout>
      <Dashboard />
    </WorkspaceLayout>
  );
}
