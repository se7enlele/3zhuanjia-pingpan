import React, { useState, useEffect } from 'react';
import { 
  AppState, 
  ProductContext,
  ApiConfig
} from './types';
import { 
  CURRENT_STATE_OPTIONS, 
  PRODUCT_TYPE_OPTIONS 
} from './constants';
import { generateProductCritiqueStream } from './services/geminiService';
import { Button, Input, Select, Textarea, Card } from './components/ui';
import { ImageUploader } from './components/ImageUploader';
import { LoadingScreen } from './components/LoadingScreen';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { LayoutGrid, Sparkles, ChevronRight, Settings } from 'lucide-react';

const INITIAL_CONTEXT: ProductContext = {
  targetAudience: '',
  currentState: '',
  primaryGoal: '',
  productType: '',
  images: []
};

const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: '', // User must input this
  model: 'gemini-1.5-flash-latest'
};

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [context, setContext] = useState<ProductContext>(INITIAL_CONTEXT);
  const [reportText, setReportText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);

  // Load settings from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('pc_ai_config');
    if (savedConfig) {
      try {
        setApiConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

  const handleSaveSettings = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('pc_ai_config', JSON.stringify(newConfig));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setContext(prev => ({ ...prev, [id]: value }));
  };

  const handleImagesChange = (images: string[]) => {
    setContext(prev => ({ ...prev, images }));
  };

  const runAnalysis = async () => {
    if (!context.targetAudience || !context.primaryGoal) {
      alert("Please fill in the core context fields.");
      return;
    }

    if (!apiConfig.apiKey) {
      setIsSettingsOpen(true);
      alert("Please configure your API Key first.");
      return;
    }

    setAppState(AppState.PROCESSING);
    setReportText('');
    setError(null);

    try {
      await generateProductCritiqueStream(context, apiConfig, (chunk) => {
        setAppState(AppState.REPORT);
        setReportText(prev => prev + chunk);
      });
    } catch (err: any) {
      console.error(err);
      setError(`Failed to generate report: ${err.message || 'Unknown error'}. Check Settings.`);
      setAppState(AppState.INPUT);
    }
  };

  const resetApp = () => {
    setAppState(AppState.INPUT);
    setReportText('');
  };

  // Render Logic
  if (appState === AppState.REPORT || (appState === AppState.PROCESSING && reportText.length > 0)) {
    return (
      <ReportView 
        report={reportText} 
        onReset={resetApp} 
        isStreaming={appState === AppState.PROCESSING}
        images={context.images}
      />
    );
  }

  if (appState === AppState.PROCESSING) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      
      {/* Settings Button (Top Right) */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsSettingsOpen(true)}
          className="text-slate-400 hover:text-slate-600"
        >
          <Settings size={20} />
        </Button>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <header className="mb-8 text-center space-y-2 max-w-2xl mt-8 sm:mt-0">
        <div className="inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
          <LayoutGrid className="text-brand-600 mr-2" size={20} />
          <span className="font-bold text-slate-900 tracking-tight">Product Council AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Validate your product intuition.
        </h1>
        <p className="text-slate-500 text-lg">
          Upload screenshots, define the context, and get a Senior PM level critique in seconds.
        </p>
      </header>

      {/* Main Form */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* Left Column: Context */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
            <h2 className="text-lg font-semibold text-slate-900">Define Context</h2>
          </div>
          
          <Card className="p-6 space-y-5 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Input 
              id="targetAudience" 
              label="Who is it for? (目标用户)" 
              placeholder="e.g., Enterprise IT Admins, Gen Z Gamers..." 
              value={context.targetAudience}
              onChange={handleInputChange}
            />
            
            <Select 
              id="productType"
              label="Product Type (产品类型)"
              options={PRODUCT_TYPE_OPTIONS}
              value={context.productType}
              onChange={handleInputChange}
            />

             <Select 
              id="currentState"
              label="Current State (当前状态)"
              options={CURRENT_STATE_OPTIONS}
              value={context.currentState}
              onChange={handleInputChange}
            />

            <Textarea 
              id="primaryGoal" 
              label="What are we solving? (核心目标)" 
              placeholder="Be specific about metrics (e.g., Reduce churn by 5%, Improve onboarding completion...)" 
              className="min-h-[100px]"
              value={context.primaryGoal}
              onChange={handleInputChange}
            />
          </Card>
        </div>

        {/* Right Column: Visuals */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 lg:mb-2 mt-4 lg:mt-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
            <h2 className="text-lg font-semibold text-slate-900">Visual Input</h2>
          </div>

          <Card className="p-6 flex-grow flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex-grow flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-3 block">Screenshots or Wireframes (Optional)</label>
              <div className="flex-grow">
                 <ImageUploader images={context.images} onImagesChange={handleImagesChange} />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Button 
                className="w-full h-12 text-base shadow-lg shadow-brand-500/20" 
                onClick={runAnalysis}
                disabled={!context.targetAudience || !context.primaryGoal}
              >
                <Sparkles size={18} className="mr-2" /> 
                Run Expert Analysis
                <ChevronRight size={18} className="ml-1 opacity-60" />
              </Button>
              {error && (
                <div className="mt-3 text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-100">
                  {error} 
                  <button onClick={() => setIsSettingsOpen(true)} className="underline ml-1 font-medium">Check Settings</button>
                </div>
              )}
            </div>
          </Card>
        </div>

      </main>

      <footer className="fixed bottom-0 w-full py-2 bg-slate-50/80 backdrop-blur-sm border-t border-slate-200 text-slate-400 text-xs text-center z-0">
        <p>Configured API: {apiConfig.baseUrl ? new URL(apiConfig.baseUrl).hostname : 'None'} • Model: {apiConfig.model}</p>
      </footer>
    </div>
  );
}

export default App;