import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Smartphone, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

interface TransmissionAgentModalProps {
  isOpen: boolean;
  satelliteName: string;
  scopes: string[];
  onOpenWindow: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export const TransmissionAgentModal: React.FC<TransmissionAgentModalProps> = ({ isOpen, satelliteName, scopes, onOpenWindow, onComplete, onCancel }) => {
  const [step, setStep] = useState<'packaging' | 'sending' | 'waiting' | 'success' | 'error'>('packaging');
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'success' | 'error' }[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStep('packaging');
      setLogs([]);
      return;
    }

    let isMounted = true;
    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
      if (isMounted) setLogs(prev => [...prev, { msg, type }]);
    };

    const runSequence = async () => {
      // 1. Packaging
      setStep('packaging');
      addLog('Iniciando empaquetado de datos (S.I.P)...');
      await new Promise(r => setTimeout(r, 800));
      
      for (const scope of scopes) {
        addLog(`Empaquetando bloque: ${scope}...`);
        await new Promise(r => setTimeout(r, 400));
      }
      addLog('Cifrando payload (Token)...', 'success');
      await new Promise(r => setTimeout(r, 600));

      // 2. Sending
      setStep('sending');
      addLog(`Abriendo conexión con ${satelliteName}...`);
      if (isMounted) onOpenWindow();
      await new Promise(r => setTimeout(r, 800));

      // 3. Waiting for ACK
      setStep('waiting');
      addLog('Esperando confirmación de recepción (ACK)...');

      // The actual window opening and URL setting is handled by the parent component.
      // We just wait for the SOLUTIUM_ACK message here.
      const handleMessage = (event: MessageEvent) => {
        const type = event.data?.type;
        // Solo aceptamos ACK como éxito real de procesamiento de datos
        if (type === 'SOLUTIUM_ACK') {
          if (isMounted) {
            setStep('success');
            addLog('Confirmación recibida. Datos sincronizados.', 'success');
            setTimeout(() => {
              if (isMounted) onComplete();
            }, 1500);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Timeout after 10 seconds if no ACK
      const timeoutId = setTimeout(() => {
        if (isMounted && step === 'waiting') {
          setStep('error');
          addLog('Tiempo de espera agotado. El satélite no respondió.', 'error');
        }
      }, 10000);

      return () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeoutId);
      };
    };

    const cleanup = runSequence();
    return () => {
      isMounted = false;
      cleanup.then(clean => clean && clean());
    };
  }, [isOpen, scopes, satelliteName, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Server className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Agente de Transmisión S.I.P.</h3>
                  <p className="text-sm text-slate-500">Conectando con {satelliteName}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white text-slate-700 font-mono text-xs leading-relaxed space-y-2 h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex gap-3 ${log.type === 'success' ? 'text-emerald-600' : log.type === 'error' ? 'text-red-600' : ''}`}
                >
                  <span className="text-slate-400 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log.msg}</span>
                </motion.div>
              ))}
              {step === 'waiting' && (
                <div className="flex gap-3 animate-pulse text-indigo-600">
                  <span className="text-slate-400 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <span>Esperando respuesta del satélite...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Server className={`w-5 h-5 ${step === 'packaging' ? 'text-indigo-600 animate-bounce' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-500">Madre</span>
                </div>
                <ArrowRight className={`w-4 h-4 ${step === 'sending' || step === 'waiting' ? 'text-indigo-500 animate-pulse' : 'text-slate-300'}`} />
                <div className="flex items-center gap-2">
                  <Smartphone className={`w-5 h-5 ${step === 'success' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-500">Satélite</span>
                </div>
              </div>

              {step === 'error' ? (
                <button onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition-colors">
                  Cerrar
                </button>
              ) : step === 'success' ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" /> Completado
                </div>
              ) : (
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" /> Procesando
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
