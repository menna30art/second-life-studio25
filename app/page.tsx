"use client";

import { useState } from "react";
import { Recycle, Sparkles, Clock, Wrench, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

interface Project {
  title: string;
  difficulty: string;
  timeEstimate: string;
  description: string;
  previewImage: string | null;
  materials: string[];
  steps: string[];
}

export default function SecondLifeStudio() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ objectName: string; projects: Project[] } | null>(null);
  const [activeProject, setActiveProject] = useState<number>(0);

  const processFile = async (file: File) => {
    setSelectedImage(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);
    setActiveProject(0);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/reimagine", { method: "POST", body: formData });
      const data = await res.json();
      if (data.projects) {
        setResult(data);
      } else {
        alert("Something went wrong. Check your API key.");
      }
    } catch {
      alert("Error connecting to AI studio.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
        const file = e.dataTransfer.files?.item(0);


    if (file && file.type.startsWith("image/")) processFile(file);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1B18] selection:bg-emerald-200">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block leading-none">Second Life</span>
            <span className="text-[11px] text-stone-500 font-medium">AI upcycling studio</span>
          </div>
        </div>
        {result && (
          <button
            onClick={() => {
              setSelectedImage(null);
              setResult(null);
            }}
            className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-4 py-2 rounded-full shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" /> Try another object
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        {!result && (
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Turn old objects into new creations
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-stone-900 mb-6 leading-[1.1]">
              Don't toss it. <br />
              <span className="text-emerald-700">Reimagine it.</span>
            </h1>

            <p className="text-lg text-stone-600 mb-10 leading-relaxed">
              Snap any old, broken or forgotten object. Our AI studies it, invents three projects made for that exact piece, and shows you what it could become.
            </p>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="group relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-3xl bg-white hover:bg-emerald-50/20 transition-all cursor-pointer shadow-sm overflow-hidden"
            >
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center bg-stone-100">
                  <img src={selectedImage} alt="Preview" className="max-h-full max-w-full object-contain p-4" />
                  {loading && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-9 h-9 text-emerald-700 animate-spin" />
                      <p className="font-semibold text-stone-800">Studying your piece & inventing 3 projects...</p>
                      <p className="text-xs text-stone-500">Generating visual previews (takes ~10 seconds)</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Recycle className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-semibold text-stone-800 mb-1">Drop a photo or click to upload</p>
                  <p className="text-sm text-stone-400">Chairs, jars, bikes, jeans, lamps… anything.</p>
                </div>
              )}
              <input
                
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  const file = e.target.files?.item(0);
                  if (file) processFile(file);
                }}
              />

            </label>
          </div>
        )}

        {result && (
          <div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm mb-8">
              <div className="flex items-center gap-4">
                {selectedImage && (
                  <img src={selectedImage} alt="Original" className="w-16 h-16 rounded-xl object-cover border border-stone-200" />
                )}
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">Detected Piece</span>
                  <h2 className="text-2xl font-bold text-stone-900 capitalize">{result.objectName}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                {result.projects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveProject(idx)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      activeProject === idx
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Idea #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {result.projects[activeProject] && (
              <div className="grid md:grid-cols-12 gap-8 bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm">
                <div className="md:col-span-6 flex flex-col justify-between">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                    {result.projects[activeProject].previewImage ? (
                      <img
                        src={result.projects[activeProject].previewImage!}
                        alt={result.projects[activeProject].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
                        Visual preview unavailable
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full">
                      AI Concept Visualization
                    </span>
                  </div>

                  <div className="mt-6 bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-3">
                      <Wrench className="w-4 h-4 text-emerald-700" /> Materials & Tools Needed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.projects[activeProject].materials.map((item, i) => (
                        <span key={i} className="text-xs font-medium bg-white border border-stone-200 text-stone-700 px-3 py-1.5 rounded-lg">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {result.projects[activeProject].difficulty}
                      </span>
                      <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {result.projects[activeProject].timeEstimate}
                      </span>
                    </div>

                    <h3 className="text-3xl font-extrabold text-stone-900 mb-3">
                      {result.projects[activeProject].title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed mb-6">
                      {result.projects[activeProject].description}
                    </p>

                    <h4 className="text-sm font-bold text-stone-900 mb-3">How to build it:</h4>
                    <ol className="space-y-3">
                      {result.projects[activeProject].steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
