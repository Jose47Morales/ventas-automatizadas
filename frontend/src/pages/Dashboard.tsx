import { Navigate } from 'react-router-dom';

// Dashboard ahora redirige a Analytics ya que se fusionaron las secciones
function Dashboard() {
  return <Navigate to="/analytics" replace />;
}

export default Dashboard;
