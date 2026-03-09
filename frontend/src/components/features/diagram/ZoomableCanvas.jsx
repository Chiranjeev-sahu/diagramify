import { useEffect, useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, Download, ChevronDown, Palette } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { toast } from 'sonner';
import { useDiagramStore } from '@/store/useDiagramStore';
import { cn } from '@/utils/cn';

export default function ZoomableCanvas({ children, diagramTitle = 'diagram' }) {
  const { currentTheme, setTheme } = useDiagramStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const diagramRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setShowExportMenu(false);

    if (!diagramRef.current) {
      toast.error("No diagram found to export");
      return;
    }

    try {
      let dataUrl;
      const fileName = `${diagramTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${format}`;

      if (format === 'png') {
        dataUrl = await toPng(diagramRef.current, {
          backgroundColor: '#ffffff',
          pixelRatio: 2 // Higher quality
        });
      } else {
        dataUrl = await toSvg(diagramRef.current, {
          backgroundColor: '#ffffff'
        });
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error("Failed to export diagram");
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col">

      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={8}
        centerOnInit={true}
        wheel={{
          step: 0.1,
          smoothStep: 0.002,
        }}
        pinch={{ disabled: false }}
        panning={{
          disabled: false,
          velocityDisabled: true,
        }}
        doubleClick={{ disabled: true }}
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <>
            {/* --- TOOLBAR --- */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

               {/* Theme Switcher */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200"
                >
                  <Palette size={14} />
                  <span className="capitalize">{currentTheme}</span>
                  <ChevronDown size={12} className={`transition-transform duration-300 ${showThemeMenu ? 'rotate-180' : ''}`} />
                </button>

                {showThemeMenu && (
                  <div className="absolute left-0 mt-2 w-40 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/60 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {['default', 'forest', 'dark', 'neutral', 'base'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => {
                          setTheme(theme);
                          setShowThemeMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm font-medium transition-colors border-l-2",
                          currentTheme === theme 
                            ? "bg-blue-50 text-blue-600 border-blue-600" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
                        )}
                      >
                        <span className="capitalize">{theme}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
                <button
                  onClick={() => zoomOut()}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => {
                    resetTransform();
                    centerView();
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
                  title="Reset View"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg active:scale-95 border border-blue-500/20"
                >
                  <Download size={15} />
                  <span>Download</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/60 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="px-3 py-1.5 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image Formats</p>
                    </div>
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                    >
                      PNG Image <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-700">HQ</span>
                    </button>
                    <button
                      onClick={() => handleExport('svg')}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                    >
                      SVG Vector <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Scalable</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* --- CANVAS AREA --- */}
            <div className="flex-1 w-full h-full">
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="w-full h-full flex items-center justify-center"
              >
                {/* This is where the Diagram will be rendered */}
                <div
                  ref={diagramRef}
                  className="w-fit h-fit bg-white rounded-xl shadow-sm border border-slate-100 p-8 cursor-grab active:cursor-grabbing"
                >
                  {children}
                </div>
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
