"use client";
import React from "react";
import type { AnalysisResponse, ClauseItem } from "@/types/analysis";

function Badge({ level }: { level: string }) {
  const cls: Record<string,string> = {
    LOW:"bg-green-100 text-green-700",
    MEDIUM:"bg-yellow-100 text-yellow-700",
    HIGH:"bg-orange-100 text-orange-700",
    CRITICAL:"bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls[level]||"bg-slate-200 text-slate-700"}`}>{level}</span>;
}

export default function AnalysisView({ data, raw }: { data: AnalysisResponse; raw: string }) {
  const highlight = (text:string, spans:{start_index:number; end_index:number;}[])=>{
    if (!text || !spans?.length) return <pre className="whitespace-pre-wrap">{text}</pre>;
    const s=[...spans].sort((a,b)=>a.start_index-b.start_index);
    const out:React.ReactNode[]=[]; let pos=0;
    s.forEach((sp,i)=>{ if(sp.start_index>pos) out.push(<span key={`t${i}`}>{text.slice(pos,sp.start_index)}</span>);
      out.push(<mark key={`m${i}`} className="bg-yellow-100">{text.slice(sp.start_index,sp.end_index)}</mark>);
      pos=sp.end_index; }); if(pos<text.length) out.push(<span key="tail">{text.slice(pos)}</span>);
    return <pre className="whitespace-pre-wrap">{out}</pre>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded border p-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">전체 평가</h3>
          <Badge level={data.overall_risk_assessment.risk_level}/>
          <span className="text-sm text-slate-600">score: {data.overall_risk_assessment.risk_score}</span>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500">핵심 위험요소</div>
            <ul className="list-disc ml-5">{data.overall_risk_assessment.risk_factors?.map((x,i)=><li key={i}>{x}</li>)}</ul>
            <div className="text-xs text-slate-500 mt-2">개선 권고</div>
            <ul className="list-disc ml-5">{data.overall_risk_assessment.recommendations?.map((x,i)=><li key={i}>{x}</li>)}</ul>
          </div>
          <div>
            <div className="text-xs text-slate-500">요약</div>
            <pre className="whitespace-pre-wrap">{data.summary}</pre>
          </div>
        </div>
      </div>

      <div className="rounded border p-4 bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">조항별 평가 ({data.clause_analysis.length})</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2 w-24">조항</th>
                <th className="text-left p-2 w-28">위험</th>
                <th className="text-left p-2 w-16">점수</th>
                <th className="text-left p-2">왜 / 권고</th>
                <th className="text-left p-2 w-[36%]">원문</th>
              </tr>
            </thead>
            <tbody>
            {data.clause_analysis.map((c:ClauseItem)=>(
              <tr key={c.clause_id} className="border-t">
                <td className="p-2 font-semibold">{c.original_identifier || c.clause_id}</td>
                <td className="p-2"><Badge level={c.risk_assessment.risk_level}/></td>
                <td className="p-2">{c.risk_assessment.risk_score}</td>
                <td className="p-2">
                  {c.risk_assessment.why?.length ? (
                    <>
                      <div className="text-xs text-slate-500">왜</div>
                      <ul className="list-disc ml-5">{c.risk_assessment.why.slice(0,3).map((w,i)=><li key={i}>{w}</li>)}</ul>
                    </>
                  ) : null}
                  <div className="text-xs text-slate-500 mt-1">권고</div>
                  <ul className="list-disc ml-5">
                    {(() => {
                      const ra = c?.risk_assessment;
                      const level = String(ra?.risk_level ?? '').toUpperCase().trim();
                      
                      // UNKNOWN이면 "지금으로도 충분합니다." 강제
                      if (level === 'UNKNOWN') {
                        return <li key="unknown">지금으로도 충분합니다.</li>;
                      }
                      
                      // 병합 결과만 사용, fallback 금지
                      const recommendations = Array.isArray(ra?.recommendations) ? ra.recommendations : [];
                      return recommendations.slice(0,3).map((r,i)=><li key={i}>{r}</li>);
                    })()}
                  </ul>
                </td>
                <td className="p-2 align-top">
                  <details>
                    <summary className="cursor-pointer text-blue-600">보기</summary>
                    <pre className="whitespace-pre-wrap text-slate-800 mt-1">{c.original_text}</pre>
                    {c.risk_assessment.triggers?.length ? (
                      <div className="text-xs text-slate-500 mt-1">
                        근거: {c.risk_assessment.triggers.slice(0,2).map(t=>`「${t.text}」`).join(", ")}
                      </div>
                    ) : null}
                  </details>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded border p-4 bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">원문 하이라이트</h3>
        {highlight(raw, data.normalized.clauses.map(c => ({ start_index: c.start_index, end_index: c.end_index })))}
      </div>
    </div>
  );
}
