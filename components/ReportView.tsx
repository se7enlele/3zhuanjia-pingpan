import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Copy, Check, MessageSquare } from 'lucide-react';
import { Button, Card } from './ui';

interface ReportViewProps {
  report: string;
  onReset: () => void;
  isStreaming: boolean;
  images?: string[];
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onReset, isStreaming, images = [] }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 py-4 mb-8">
        <div className="flex items-center justify-between px-4 max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 text-slate-500">
            <ArrowLeft size={16} /> Back to Inputs
          </Button>
          
          <div className="flex items-center gap-3">
            {isStreaming && (
              <span className="text-xs font-medium text-brand-600 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                Generating Report...
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Report'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
            {/* Visual Context Reference */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {images.map((img, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden bg-white aspect-video shadow-sm">
                            <img src={img} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <Card className="p-8 lg:p-12 min-h-[60vh] shadow-sm">
                {report ? (
                    <article className="markdown-body font-sans">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report}
                        </ReactMarkdown>
                    </article>
                ) : (
                    <div className="text-center text-slate-400 py-20">Waiting for data...</div>
                )}
                {isStreaming && <div className="mt-4 h-4 w-4 bg-brand-500 rounded-full animate-bounce"></div>}
            </Card>
        </div>

        {/* Sidebar / TOC */}
        <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-4">
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Structure</div>
                <nav className="space-y-1 border-l border-slate-200 pl-4">
                    <div className="text-sm text-slate-600 py-1">1. 深度诊断 (Diagnosis)</div>
                    <div className="text-sm text-slate-600 py-1">2. 解决方案 (Solution Paths)</div>
                    <div className="text-sm text-slate-600 py-1">3. 决策矩阵 (Decision Matrix)</div>
                    <div className="text-sm text-slate-600 py-1">4. 执行建议 (Next Steps)</div>
                </nav>

                <div className="pt-8">
                    <div className="bg-brand-50 rounded-lg p-4 border border-brand-100">
                        <h4 className="font-medium text-brand-900 text-sm mb-2 flex items-center gap-2">
                             <MessageSquare size={14} /> Product Coach
                        </h4>
                        <p className="text-xs text-brand-700 leading-relaxed">
                            Tip: 你可以将右侧的决策矩阵复制到 Excel 或 Lark 文档中，以便与团队进行更深入的讨论。
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};