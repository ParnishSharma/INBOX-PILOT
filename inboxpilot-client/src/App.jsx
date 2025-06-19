import { Route, Routes } from "react-router-dom";
import { useAuth } from "./authContext";
import Layout from "./Components/Layout";
import Dashboard from "./pages/Dashboard";
import Labels from "./pages/Labels";
import Login from "./pages/Login";
import PrivateRoute from "./pages/PrivateRoute";
import Rollup from "./pages/Rollup";
import Settings from "./pages/Settings";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/" element={<PrivateRoute user={user}><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rollup" element={<Rollup />} />
        <Route path="labels" element={<Labels />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
