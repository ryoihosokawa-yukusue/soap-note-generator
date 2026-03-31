"use client";

import { useState } from "react";

type Props = {
  result: string;
  error: string;
};

export default function OutputPanel({ result, error }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">SOAP出力</h2>
        {result && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {copied ? "コピー済み ✓" : "コピー"}
          </button>
        )}
      </div>
      <div className="flex-1 min-h-[200px] p-4 bg-white border border-gray-300 rounded-lg overflow-y-auto">
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : result ? (
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
            {result}
          </pre>
        ) : (
          <p className="text-gray-400 text-sm">
            入力内容をもとにSOAP形式の看護記録が表示されます
          </p>
        )}
      </div>
    </div>
  );
}
