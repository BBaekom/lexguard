interface Clause {
  clause_number: string;
  clause_title: string;
  clause_content: string;
  risk_analysis: string;
  risk_level: string;
  risk_score: number;
  improvement?: {
    original: string;
    suggested: string;
    explanation: string;
  };
}

interface AnalysisData {
  contractType: string;
  completedAt: string;
  riskScore: number;
  mainRisks: string[];
  clauses: Clause[];
  summary: {
    riskScore: number;
    mainRiskClauses: { title: string; score: number }[];
    comment: string;
  };
  contractText: string;
}

export function generateImprovedNDA(analysisData: AnalysisData): string {
  const { clauses, contractText } = analysisData;
  
  // 개선된 조항들을 수집
  const improvedClauses = clauses
    .filter(clause => clause.improvement && clause.risk_level !== '낮음')
    .map(clause => ({
      ...clause,
      improvedContent: clause.improvement?.suggested || clause.clause_content
    }));

  // 원본 텍스트에서 조항들을 개선된 내용으로 교체
  let improvedText = contractText;

  improvedClauses.forEach(clause => {
    if (clause.improvement?.original && clause.improvement?.suggested) {
      const originalContent = clause.improvement.original;
      const improvedContent = clause.improvement.suggested;
      
      // 정규식을 사용하여 원본 내용을 개선된 내용으로 교체
      const regex = new RegExp(originalContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      improvedText = improvedText.replace(regex, improvedContent);
    }
  });

  // 개선 사항을 주석으로 추가
  const improvements = clauses
    .filter(clause => clause.improvement)
    .map(clause => `// ${clause.clause_number} ${clause.clause_title}: ${clause.improvement?.explanation}`)
    .join('\n');

  return `${improvedText}

=== 개선 사항 요약 ===
${improvements}

=== 분석 정보 ===
- 분석 완료 시간: ${analysisData.completedAt}
- 전체 리스크 점수: ${analysisData.riskScore}/100
- 개선된 조항 수: ${improvedClauses.length}개
`;
}

export function generateNDAReport(analysisData: AnalysisData): string {
  const { contractType, completedAt, riskScore, clauses, summary } = analysisData;
  
  const report = `
표준비밀유지계약서 분석 보고서

분석 정보:
- 계약서 유형: ${contractType}
- 분석 완료 시간: ${completedAt}
- 전체 리스크 점수: ${riskScore}/100

주요 리스크 조항 분석:
${clauses
  .filter(clause => clause.risk_level === '높음' || clause.risk_level === '중간')
  .map(clause => `
${clause.clause_number} ${clause.clause_title}
- 리스크 레벨: ${clause.risk_level}
- 리스크 점수: ${clause.risk_score}/100
- 리스크 분석: ${clause.risk_analysis}
${clause.improvement ? `
- 개선 제안:
  기존: ${clause.improvement.original}
  개선: ${clause.improvement.suggested}
  설명: ${clause.improvement.explanation}
` : ''}
`).join('\n')}

전체 요약:
${summary.comment}

개선 권장사항:
${clauses
  .filter(clause => clause.improvement)
  .map(clause => `
${clause.clause_number} ${clause.clause_title}:
${clause.improvement?.explanation}
`).join('\n')}
`;

  return report;
}

export function generateNDATemplate(analysisData: AnalysisData): string {
  const { clauses } = analysisData;
  
  // 개선된 조항들을 기반으로 NDA 템플릿 생성
  const template = `
표준비밀유지계약서

(2024. 12. 제정)

공정거래위원회

제1조 (계약의 목적)
본 계약은 원사업자와 수급사업자 간의 기술자료 제공 및 비밀유지에 관한 사항을 정함을 목적으로 한다.

제2조 (기술자료의 정의)
본 계약에서 "기술자료"라 함은 다음 각 호의 것을 말한다.
1. 제조, 수리, 건설 또는 서비스 수행 방법에 관한 정보 또는 자료
2. 수급사업자의 연구개발, 생산 및 판매 활동에 있어 기술적으로 유용하고 독립적인 경제적 가치를 가지는 지적재산권(특허권, 실용신안권, 디자인권, 저작권 등)에 관한 기술적 정보 또는 자료
3. 그 밖에 건설공정 매뉴얼, 설비 사양서, 설계도면, 연구자료, 연구개발 보고서 등으로서 기술적으로 유용하고 독립적인 경제적 가치를 가지는 정보 또는 자료

제3조 (기술자료의 목적외 사용금지)
원사업자는 수급사업자로부터 제공받은 기술자료를 첨부서류(별첨 1-2)에 명시된 목적 외에는 사용할 수 없다.

제4조 (기술자료의 비밀유지 의무)
원사업자는 수급사업자의 사전 서면 동의 없이는 제공받은 기술자료를 타인에게 공개하거나 공표할 수 없다.

제5조 (기술자료의 반환 또는 폐기방법)
원사업자는 첨부서류(별첨 1-4)에 정한 반환일까지 제공받은 기술자료의 원본을 수급사업자에게 즉시 반환하거나 폐기하여야 한다.

제6조 (권리의 부존재 등)
1. 본 계약은 원사업자에게 수급사업자의 기술자료에 대한 권리를 부여하는 것이 아니다.
2. 본 계약은 향후 계약 체결이나 매매를 보장하는 것이 아니다.
3. 수급사업자는 본 계약에 따른 기술자료 제공에 대한 법적 권한을 보장한다.

제7조 (비밀유지의무 위반시 배상)
원사업자가 본 계약을 위반하여 수급사업자에게 손해를 입힌 경우, 고의 또는 과실이 없음을 증명하지 못하는 한 그 손해를 배상하여야 한다.

제8조 (권리의무의 양도 및 계약의 변경)
1. 원사업자는 수급사업자의 서면 동의 없이는 본 계약에 따른 권리 또는 의무를 타인에게 양도할 수 없다.
2. 본 계약의 변경은 당사자 대표자의 서면 합의에 의해서만 가능하다.
3. 임직원 명단의 변경(퇴직 등)은 별도 서면으로 통지하여야 한다.

제9조 (일부무효의 특칙)
본 계약의 일부가 무효인 경우에도 나머지 부분은 유효하며, 유효한 부분만으로는 계약의 목적을 달성할 수 없는 경우에는 전체 계약이 무효가 된다.

본 계약의 체결과 내용을 증명하기 위하여 본 계약서 2부를 작성하여 각 1부씩 보관한다.

년    월    일

원사업자                                    수급사업자
상호 또는 명칭 :                            상호 또는 명칭 :
전화번호 :                                  전화번호 :
주 소 :                                     주 소 :
대표자 성명 :                    (인)       대표자 성명 :                    (인)
사업자(법인)번호 :                          사업자(법인)번호 :

첨부:
1. 표준비밀유지계약서 (별첨)

【첨부 1】

1-1. 수급사업자로부터 제공받는 기술자료의 명칭 및 범위
* 요구하는 기술자료의 명칭과 범위 등 구체적 내역을 명시하여 기재

[기술자료 상세 내용]

1-2. <1-1. 기술자료>를 제공받는 목적
* 원사업자가 기술자료를 요구하는 정당한 사유 기재

[목적 상세 내용]

1-3. <1-1. 기술자료>의 사용기간:

[사용기간]

1-4. <1-1. 기술자료>의 반환일 또는 폐기일:

[반환일 또는 폐기일]

2. 기술자료를 보유할 임직원의 명단

No.    보유자    이메일
1      [이름]    [이메일]
2      [이름]    [이메일]
:      :         :

* 위 임직원의 명단은 본 계약의 체결 및 이행을 위해서만 사용될 수 있는 것으로서 이를 무단으로 전송.배포할 수 없으며, 일부의 내용이라도 공개. 복사해서는 안됨
** 본 건 기술자료를 1-3.의 사용기간 중 보유할 임직원 명단을 기재
`;

  return template;
} 