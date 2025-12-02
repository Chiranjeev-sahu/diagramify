import { useEffect, useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, Download, ChevronDown } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { toast } from 'sonner';

export default function ZoomableCanvas({ children, diagramTitle = 'diagram' }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const diagramRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
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
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-2">
                <button
                  onClick={() => zoomOut()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => {
                    resetTransform();
                    centerView();
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  title="Reset View"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                >
                  <Download size={16} />
                  <span>Export</span>
                  <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      Download PNG
                    </button>
                    <button
                      onClick={() => handleExport('svg')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      Download SVG
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
