import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// SW update — skip waiting without reload loop
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      reg.update();
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    });
  });
}
