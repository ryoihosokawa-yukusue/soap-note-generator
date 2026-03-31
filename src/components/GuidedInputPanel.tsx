"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "soap-guided-checkpoints";

const DEFAULT_CHECKPOINTS = [
  {
    category: "S（主観的データ）",
    items: [
      "患者の主訴（いつから、どこが、どのように）",
      "痛みの性質・程度（NRSスケール等）",
      "随伴症状の有無（悪心、めまい、倦怠感など）",
      "日常生活への影響（食事、睡眠、活動）",
      "患者自身の言葉での表現",
    ],
  },
  {
    category: "O（客観的データ）",
    items: [
      "バイタルサイン（BP, P, T, SpO2, RR）",
      "意識レベル（JCS / GCS）",
      "全身状態の観察（顔色、表情、皮膚の状態）",
      "食事摂取量・水分摂取量",
      "排泄状況（尿量、性状、排便の有無）",
      "創部・ドレーン・ライン類の観察",
      "検査データ（直近の血液検査等）",
      "ADL・活動状況",
    ],
  },
  {
    category: "A（アセスメント）",
    items: [
      "S・Oデータの関連性と統合的解釈",
      "現在の問題点の明確化",
      "リスクの予測（合併症、転倒、感染等）",
      "前回からの変化（改善・悪化・維持）",
      "治療・ケアの効果判定",
    ],
  },
  {
    category: "P（計画）",
    items: [
      "観察計画（何を、いつ、どの頻度で観察するか）",
      "ケア計画（具体的な介入内容）",
      "教育計画（患者・家族への指導事項）",
      "他職種との連携事項",
      "次回評価のタイミング",
    ],
  },
];

type Checkpoint = {
  category: string;
  items: string[];
};

type Props = {
  onGenerate: (input: string) => void;
  isLoading: boolean;
};

export default function GuidedInputPanel({ onGenerate, isLoading }: Props) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(DEFAULT_CHECKPOINTS);
  const [text, setText] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCheckpoints(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("このブラウザは音声入力に対応していません");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onGenerate(text);
  };

  const handleEditStart = () => {
    setEditText(
      checkpoints
        .map((cp) => `## ${cp.category}\n${cp.items.join("\n")}`)
        .join("\n\n")
    );
    setIsEditing(true);
  };

  const handleEditSave = () => {
    const parsed: Checkpoint[] = [];
    const sections = editText.split(/^## /m).filter(Boolean);
    for (const section of sections) {
      const lines = section.split("\n").filter((l) => l.trim());
      if (lines.length === 0) continue;
      parsed.push({
        category: lines[0].trim(),
        items: lines.slice(1).map((l) => l.trim()),
      });
    }
    if (parsed.length > 0) {
      setCheckpoints(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    setIsEditing(false);
  };

  const handleEditReset = () => {
    setCheckpoints(DEFAULT_CHECKPOINTS);
    localStorage.removeItem(STORAGE_KEY);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">入力</h2>
        <div className="flex items-center gap-3">
          {showGuide && !isEditing && (
            <button
              onClick={handleEditStart}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              観点を編集
            </button>
          )}
          <button
            onClick={() => { setShowGuide(!showGuide); setIsEditing(false); }}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              showGuide
                ? "bg-blue-100 text-blue-700 font-medium"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {showGuide ? "観点を非表示" : "観点を表示"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs text-gray-500">
            「## カテゴリ名」の後に観点を1行ずつ記述してください
          </p>
          <textarea
            className="flex-1 min-h-[300px] p-3 border border-gray-300 rounded-lg resize-none text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEditSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              保存
            </button>
            <button
              onClick={handleEditReset}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              デフォルトに戻す
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          {showGuide && (
            <div className="flex-shrink-0 max-h-[40%] overflow-y-auto p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">
                以下の観点を参考に入力してください
              </p>
              {checkpoints.map((cp) => (
                <div key={cp.category} className="mb-2 last:mb-0">
                  <h3 className="text-xs font-semibold text-blue-700">
                    {cp.category}
                  </h3>
                  <ul className="ml-3 mt-0.5">
                    {cp.items.map((item) => (
                      <li key={item} className="text-xs text-gray-600 leading-5">
                        ・{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="flex-1 min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="上記の観点を参考に、患者の情報や観察内容を入力してください..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isListening
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {isListening ? "⏹ 録音停止" : "🎤 音声入力"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !text.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "生成中..." : "SOAP生成"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
