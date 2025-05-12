import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes' // Added import
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem> {/* Added ThemeProvider */} 
      <App />
    </ThemeProvider> {/* Added ThemeProvider */}
  </BrowserRouter>
);
