import React, { useState, useEffect } from 'react';
import { SolutiumPayload } from '../utils/satelliteConnection';

interface SatelliteDebuggerProps {
  onClose: () => void;
}

export const SatelliteDebugger: React.FC<SatelliteDebuggerProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<Array<{time: string, msg: string, type: 'sent' | 'received' | 'error'}>>([]);
  const [lastAck, setLastAck] = useState<any>(null);
  
  // Default Payload to Send
  const [payload, setPayload] = useState<SolutiumPayload>({
    userId: 'usr_master_01',
    projectId: 'prj_master_01',
    role: 'admin',
    timestamp: Date.now(),
    scopes: ['profile', 'project'],
    userProfile: {
        id: 'usr_master_01',
        name: 'Admin User',
        email: 'admin@master-test.com',
        role: 'admin',
        preferences: { theme: 'light', density: 'comfortable' }
    },
    teamMembers: [],
    activeProjects: [{ id: 'prj_master_01', name: 'Master Console Test Corp' }],
    businessConfig: {
        industry: 'Technology',
        email: 'admin@master-test.com',
        address: '123 Master Blvd'
    },
    projectData: {
      name: 'Master Console Test Corp',
      colors: ['#005e79', '#ffffff', '#000000'],
      logoUrl: '',
      contact: {
        email: 'admin@master-test.com',
        phone: '+1 555 999 999',
        address: '123 Master Blvd'
      }
    },
    crmData: [],
    productsData: [],
    calendarConfig: { enabled: false },
    currentAsset: undefined,
    crmConfig: { apiUrl: '', authToken: '' },
    productsConfig: { apiUrl: '', authToken: '' },
    enableBootObserver: true
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SOLUTIUM_ACK') {
            const ack = event.data.payload;
            setLastAck(ack);
            addLog(`ACK RECEIVED from Satellite! Status: ${ack.status}`, 'received');
            if (ack.error) {
                addLog(`Satellite Error: ${ack.error}`, 'error');
            } else {
                addLog(`Satellite confirmed receipt for project: ${ack.receivedDataSummary?.name}`, 'received');
            }
        }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const addLog = (msg: string, type: 'sent' | 'received' | 'error') => {
      setLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          msg,
          type
      }]);
  };

  const launchSatellite = () => {
      // 1. Open the window
      const width = 1000;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      // NOTE: In a real scenario, we might append ?token=... here too for redundancy
      // For this test, we rely on the postMessage handshake
      const win = window.open(
          '/invoicer-demo', // Using the special route defined in App.tsx
          'SolutiumSatellite', 
          `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!win) {
          addLog("Popup blocked! Please allow popups.", 'error');
          return;
      }

      addLog("Satellite Window Opened. Waiting for load...", 'sent');

      // 2. Wait a moment for it to load, then send the handshake
      // In production, we might poll or wait for a "READY" signal from the child
      let attempts = 0;
      const interval = setInterval(() => {
          attempts++;
          if (win.closed) {
              clearInterval(interval);
              addLog("Satellite window closed by user.", 'error');
              return;
          }

          addLog(`Sending Handshake Attempt #${attempts}...`, 'sent');
          win.postMessage({
              type: 'SOLUTIUM_CONFIG',
              payload: { ...payload, timestamp: Date.now() }
          }, '*');

          if (attempts >= 5) {
              clearInterval(interval);
              addLog("Stopped sending handshakes. Waiting for ACK...", 'sent');
          }
      }, 2000); // Send every 2 seconds, 5 times
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-solutium-dark text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Satellite Connection Debugger</h2>
                    <p className="text-xs text-slate-400">Master Console Diagnostic Tool</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Configuration */}
                <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
                    <h3 className="text-sm font-bold text-solutium-dark uppercase mb-4">Payload Configuration</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Project Name</label>
                            <input 
                                type="text" 
                                value={payload.projectData?.name}
                                onChange={(e) => setPayload({...payload, projectData: {...payload.projectData!, name: e.target.value}})}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Primary Color</label>
                            <div className="flex space-x-2">
                                <input 
                                    type="color" 
                                    value={payload.projectData?.colors[0]}
                                    onChange={(e) => {
                                        const newColors = [...(payload.projectData?.colors || [])];
                                        newColors[0] = e.target.value;
                                        setPayload({...payload, projectData: {...payload.projectData!, colors: newColors}});
                                    }}
                                    className="h-9 w-12 p-0 border border-slate-300 rounded cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    value={payload.projectData?.colors[0]}
                                    readOnly
                                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={launchSatellite}
                                className="w-full bg-solutium-blue hover:bg-solutium-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                Launch & Connect
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Logs & Status */}
                <div className="flex-1 bg-slate-900 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Connection Log</h3>
                        {lastAck && (
                            <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded font-bold border border-green-700">
                                CONNECTION ESTABLISHED
                            </span>
                        )}
                    </div>

                    <div className="flex-1 bg-black/30 rounded-lg border border-slate-700 p-4 font-mono text-xs overflow-y-auto space-y-2">
                        {logs.length === 0 && (
                            <div className="text-slate-600 italic text-center mt-10">Ready to launch satellite...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-start">
                                <span className="text-slate-600 mr-3 w-16 shrink-0">{log.time}</span>
                                <span className={`flex-1 ${
                                    log.type === 'sent' ? 'text-blue-400' : 
                                    log.type === 'received' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {log.type === 'sent' && '→ '}
                                    {log.type === 'received' && '← '}
                                    {log.type === 'error' && '✕ '}
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>

                    {lastAck && (
                        <div className="mt-4 bg-slate-800 rounded p-3 border border-slate-700">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Last Acknowledgement Data</h4>
                            <pre className="text-[10px] text-green-300 overflow-x-auto">
                                {JSON.stringify(lastAck, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
