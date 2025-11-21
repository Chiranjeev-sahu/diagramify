import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, Download, Save } from 'lucide-react';

export default function ZoomableCanvas({ children }) {
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col">

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
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
                  onClick={() => resetTransform()}
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

              {/* Action Buttons */}
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Save size={16} />
                <span>Save</span>
              </button>

              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-sm"
              >
                <Download size={16} />
                <span>Export</span>
              </button>

            </div>

            {/* --- CANVAS AREA --- */}
            <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full flex items-center justify-center"
              >
                {/* This is where the Diagram will be rendered */}
                <div className="min-w-[500px] min-h-[500px] bg-white rounded-xl shadow-sm border border-slate-100 p-8">
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
