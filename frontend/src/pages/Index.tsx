import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Loader2, Play, Database, Zap, Settings, ListPlus } from "lucide-react";
import { toast } from "sonner";
import FieldsInput from "@/components/FieldsInput";
import ResultsTable from "@/components/ResultsTable";
import ExportButtons from "@/components/ExportButtons";

const Index = () => {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(5);
  const [presets, setPresets] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePreset = (preset: string) => {
    setPresets(prev =>
      prev.includes(preset) ? prev.filter(p => p !== preset) : [...prev, preset]
    );
  };

  const canRun = url.trim() && (fields.length > 0 || presets.length > 0);

  const handleScrape = async () => {
    if (!canRun) return;

    setLoading(true);
    setResults([]);

    try {
      console.log("🚀 Starting scrape request...");
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          source_type: "Web",
          fields: fields.filter(f => f.trim()),
          max_pages: maxPages,
          presets: presets
        }),
      });

      console.log("📡 Response status:", res.status, res.statusText);

      if (!res.ok) {
        const errData = await res.json();
        console.error("❌ Error response:", errData);
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Full API response:", data);
      console.log("📊 Data array:", data.data);
      console.log("📈 Data length:", data.data?.length);

      setResults(data.data);
      toast.success(`Successfully analyzed ${data.data.length} items`);
    } catch (error: any) {
      console.error("💥 Scrape error:", error);
      toast.error(error.message || "Failed to connect to scraping engine");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="flex-none border-b bg-white dark:bg-slate-900 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">ScrapingAgent Pro</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Intelligence Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-4 h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <Card className="flex-none border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-5">
                {/* URL Input */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="url" className="text-[10px] font-bold text-slate-400 uppercase">Target URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Depth</Label>
                      <span className="text-[10px] font-mono font-bold text-blue-600">{maxPages} pages</span>
                    </div>
                    <Slider
                      value={[maxPages]}
                      onValueChange={(v) => setMaxPages(v[0])}
                      max={50} min={1} step={1}
                      className="py-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b flex-none">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                  <ListPlus className="h-3.5 w-3.5" />
                  Data Schema
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                {/* Presets */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "phone", label: "Phone" },
                      { id: "email", label: "Email" },
                      { id: "address", label: "Address" },
                      { id: "socials", label: "Socials" },
                    ].map((preset) => (
                      <div key={preset.id} className="flex items-center space-x-2 bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                        <Checkbox
                          id={preset.id}
                          checked={presets.includes(preset.id)}
                          onCheckedChange={() => togglePreset(preset.id)}
                        />
                        <Label htmlFor={preset.id} className="text-[11px] font-medium cursor-pointer">{preset.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="flex-1">
                  <FieldsInput fields={fields} onChange={setFields} disabled={loading} />
                </div>
              </CardContent>
              <div className="p-4 border-t bg-white dark:bg-slate-950 flex-none">
                <Button
                  onClick={handleScrape}
                  disabled={!canRun || loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      EXTRACTING…
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-2" />
                      RUN ENGINE
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
            <Card className="flex-1 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="flex-none py-3 px-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider">Extraction Feed</CardTitle>
                      <CardDescription className="text-[10px] font-medium">
                        {results.length > 0 ? `${results.length} records captured` : "Ready for input"}
                      </CardDescription>
                    </div>
                  </div>
                  {results.length > 0 && <ExportButtons data={results} />}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                {results.length > 0 ? (
                  <div className="h-full overflow-auto custom-scrollbar">
                    <ResultsTable data={results} />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-dots-grid">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <Database className="h-6 w-6 text-slate-300" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Awaiting Data</h3>
                    <p className="text-[11px] text-slate-500 font-medium max-w-[200px]">Strategic intelligence will appear here once the engine starts.</p>
                    {/* Debug info */}
                    <div className="mt-4 text-[10px] text-slate-400 font-mono">
                      Debug: results.length = {results.length} | loading = {loading.toString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
