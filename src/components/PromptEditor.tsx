"use client";

import { useState, useEffect } from "react";

const DEFAULT_PROMPT = `あなたは経験豊富な看護師です。
以下の患者情報・観察内容をもとに、SOAP形式の看護記録を作成してください。

## 出力形式
S（主観的データ）: 患者の訴え、言葉をそのまま記載
O（客観的データ）: バイタルサイン、観察所見、検査データなど客観的事実
A（アセスメント）: S・Oを統合した看護判断・分析
P（計画）: 具体的な看護計画・介入内容

## 注意事項
- 医療用語を適切に使用すること
- 簡潔かつ正確に記載すること
- 推測と事実を明確に区別すること`;

const STORAGE_KEY = "soap-system-prompt";

type Props = {
  onPromptChange: (prompt: string) => void;
};

export default function PromptEditor({ onPromptChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPrompt(saved);
      onPromptChange(saved);
    }
  }, [onPromptChange]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, prompt);
    onPromptChange(prompt);
    setIsOpen(false);
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
    localStorage.removeItem(STORAGE_KEY);
    onPromptChange(DEFAULT_PROMPT);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
      >
        {isOpen ? "プロンプト設定を閉じる" : "プロンプト設定"}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-white border border-gray-300 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            システムプロンプト
          </label>
          <textarea
            className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              デフォルトに戻す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
