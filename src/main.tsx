import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app.tsx';
import './index.css';

registerSW({ immediate: true });

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
