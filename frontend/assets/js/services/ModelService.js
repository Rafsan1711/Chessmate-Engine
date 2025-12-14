class ModelService {
    constructor() {
        this.worker = null;
        this.modelLoaded = false;
        this.currentModelKey = null;
        this.worker = new Worker('assets/js/services/engine.worker.js');
        
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            if (type === 'MODEL_LOADED') {
                this.modelLoaded = true;
                if (this.statusCallback) this.statusCallback(`Engine Ready (${this.currentModelKey.toUpperCase()}).`);
            } else if (type === 'ERROR') {
                if (this.statusCallback) this.statusCallback("Error: " + data);
            }
        };
    }

    async loadModel(modelKey, statusCallback) {
        this.statusCallback = statusCallback;
        
        // If already loaded same model
        if (this.modelLoaded && this.currentModelKey === modelKey) {
            statusCallback(`Engine Ready (${modelKey.toUpperCase()}).`);
            return true;
        }

        this.currentModelKey = modelKey;
        this.modelLoaded = false;
        statusCallback(`Initializing ${modelKey.toUpperCase()} Engine...`);
        
        // Send Model Key to Worker
        this.worker.postMessage({ type: 'LOAD_MODEL', modelKey: modelKey });
        
        return new Promise(resolve => setTimeout(() => resolve(true), 1500));
    }

    // ... (getBookMove, fenToTensor, evaluate, getBestMove, alphaBeta - KEEP THESE SAME AS BEFORE) ...
    // Note: Copy the 100% fixed getBestMove/alphaBeta logic from previous successful artifact here.
    // For brevity, I am not repeating the unmodified logic functions, just the loadModel change.
    
    // --- Opening Book (Reuse your existing working code) ---
    async getBookMove(game) { /* ... Previous Code ... */ }
    fenToTensor(fen) { /* ... Previous Code ... */ }
    async evaluate(game) { /* ... Previous Code ... */ }
    async getBestMove(game) { 
        // Just ensure you pass the right data to worker
        return new Promise((resolve) => {
            const handleResult = (e) => {
                if (e.data.type === 'BEST_MOVE') {
                    this.worker.removeEventListener('message', handleResult);
                    resolve(e.data.data);
                }
            };
            this.worker.addEventListener('message', handleResult);
            this.worker.postMessage({ type: 'THINK', data: { fen: game.fen(), depth: 3 } });
        });
    }
}
window.modelService = new ModelService();
