"use client";

import { useState, useCallback } from "react";
import GuidedInputPanel from "@/components/GuidedInputPanel";
import OutputPanel from "@/components/OutputPanel";
import PromptEditor from "@/components/PromptEditor";

export default function Home() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleGenerate = async (input: string) => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, systemPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "エラーが発生しました");
      } else {
        setResult(data.result);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = useCallback((prompt: string) => {
    setSystemPrompt(prompt);
  }, []);

  return (
    <main className="flex flex-col h-screen">
      <header className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            SOAP Note Generator
          </h1>
          <PromptEditor onPromptChange={handlePromptChange} />
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 md:w-1/2">
            <GuidedInputPanel
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
          <div className="flex-1 md:w-1/2">
            <OutputPanel result={result} error={error} />
          </div>
        </div>
      </div>
    </main>
  );
}
