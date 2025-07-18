import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './authContext';
import './index.css';

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
 <AuthProvider>
      <App />
  </AuthProvider> 
    
    </BrowserRouter>
)
