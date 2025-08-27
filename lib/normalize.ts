import he from 'he';

// 타이포그래피 치환 강도 옵션
export type TypographyLevel = 'off' | 'conservative' | 'aggressive' | 'safe';

export function normalizeLegalText(
  raw: string,
  opts: { typography?: TypographyLevel } = {}
) {
  const level = opts.typography ?? 'conservative';

  let s = String(raw ?? '');

  // 1) HTML 엔티티 → 실제 문자 (예: &copy; → ©, &gt; → >)
  //  - 태그를 파싱하지 않고, 엔티티만 문자로 바꿉니다.
  s = he.decode(s, { isAttributeValue: false });

  // 2) 유니코드 정규화 (풀와이드, 조합문자 일관화)
  s = s.normalize('NFKC');

  // 3) 개행/공백 정리
  s = s.replace(/\r\n?/g, '\n')          // CRLF → LF
       .replace(/\u00A0/g, ' ')          // NBSP → 일반 스페이스
       .replace(/[ \t]+\n/g, '\n');      // 행 끝 공백 제거

  // 4) (선택) 보기 좋은 특수문자 치환
  if (level !== 'off') {
    // 보수적: 의미를 거의 바꾸지 않는 치환
    s = s.replace(/\.{3}/g, '…');            // ... → …
    s = s.replace(/\(tm\)/gi, '™');          // (tm) → ™
    s = s.replace(/\(c\)/gi, '©');           // (c)  → ©
    s = s.replace(/\(r\)/gi, '®');           // (r)  → ®
    s = s.replace(/<=/g, '≤').replace(/>=/g, '≥');

    if (level === 'aggressive') {
      // 공격적: 맥락 따라 오탐 가능 (필요 시에만)
      s = s.replace(/--/g, '—');             // -- → —(em-dash)
      // 리스트 마커 정리
      s = s.replace(/^\s*[-*]\s+/gm, '• ');
    } else if (level === 'safe') {
      // 안전: 확실한 패턴만 변환
      s = s.replace(/\.{3}/g, '…');          // ... → … (확실한 패턴만)
      s = s.replace(/\(tm\)/gi, '™');        // (tm) → ™ (확실한 패턴만)
      s = s.replace(/\(c\)/gi, '©');         // (c) → © (확실한 패턴만)
      s = s.replace(/\(r\)/gi, '®');         // (r) → ® (확실한 패턴만)
    }
  }

  return s;
}

// 법률 문서 특화 정규화 함수
export function normalizeContractText(
  raw: string,
  opts: { 
    typography?: TypographyLevel;
    legalSymbols?: boolean;
    listFormatting?: boolean;
  } = {}
) {
  const level = opts.typography ?? 'conservative';
  const legalSymbols = opts.legalSymbols ?? true;
  const listFormatting = opts.listFormatting ?? true;

  let s = normalizeLegalText(raw, { typography: level });

      // 5) 법률 문서 특화 치환
    if (legalSymbols) {
      // LaTeX 수식 → 유니코드 문자 (정확한 패턴 매칭만)
      s = s.replace(/\\\$\\cdot\\\$/g, '·')      // $\cdot$ → ·
           .replace(/\\\$\\cdots\\\$/g, '⋯')     // $\cdots$ → ⋯
           .replace(/\\\$\\ldots\\\$/g, '…')     // $\ldots$ → …
           .replace(/\\\$\\vdots\\\$/g, '⋮')     // $\vdots$ → ⋮
           .replace(/\\\$\\square\\\$/g, '□')    // $\square$ → □
      
      // LaTeX 명령어만 변환 (이스케이프된 문자는 보존)
      s = s.replace(/\\cdot(?![a-zA-Z])/g, '·')              // \cdot → · (다음에 문자가 오지 않는 경우만)
           .replace(/\\cdots(?![a-zA-Z])/g, '⋯')             // \cdots → ⋯
           .replace(/\\ldots(?![a-zA-Z])/g, '…')             // \ldots → …
           .replace(/\\vdots(?![a-zA-Z])/g, '⋮')             // \vdots → ⋮
           .replace(/\\square(?![a-zA-Z])/g, '□')            // \square → □
      
      // LaTeX 수식 표시만 제거 (내용은 보존)
      s = s.replace(/\$([^$]*)\$/g, '$1')                   // $내용$ → 내용 (LaTeX 수식 내용은 보존)
           .replace(/\$\s*([^$]*)\s*\$/g, '$1')             // $ 내용 $ → 내용 (공백 포함)
      
      // 법률 문서 특수 기호 (정확한 패턴만)
      s = s.replace(/\(R\\&D\)/gi, '(R&D)')      // R\&D → R&D (정확한 패턴만)
           .replace(/\(R&D\)/gi, '(R&D)')        // R&D → R&D
           .replace(/\(R\s*&\s*D\)/gi, '(R&D)') // R & D → R&D
    }

  // 6) 리스트 및 체크리스트 포맷팅
  if (listFormatting) {
    // 체크리스트 변환 (전용 함수 사용)
    s = convertChecklist(s)
    
    // 체크박스 기호 변환
    s = s.replace(/✓\s*/g, '· ')
         .replace(/☐\s*/g, '· ')
         .replace(/□\s*/g, '· ')
    
    // 세미콜론을 기준으로 개행 처리 후 세미콜론 제거
    s = s.replace(/;/g, '\n')
    
    // 리스트 마커 정리
    s = s.replace(/^\s*[가-힣]\.\s+/gm, '• ')  // 가. 나. 다. → •
         .replace(/^\s*[a-z]\.\s+/gim, '• ')   // a. b. c. → •
         .replace(/^\s*\d+\.\s+/gm, '• ')      // 1. 2. 3. → •
  }

  return s;
}

// 안전한 계약서 정규화 함수 (중요한 특수문자는 보존)
export function normalizeContractTextSafe(
  raw: string,
  opts: { 
    typography?: TypographyLevel;
    legalSymbols?: boolean;
    listFormatting?: boolean;
  } = {}
) {
  const level = opts.typography ?? 'safe';
  const legalSymbols = opts.legalSymbols ?? true;
  const listFormatting = opts.listFormatting ?? true;

  let s = normalizeLegalText(raw, { typography: level });

  // 5) 법률 문서 특화 치환 (안전한 방식)
  if (legalSymbols) {
    // LaTeX 수식 → 유니코드 문자 (정확한 패턴 매칭만)
    s = s.replace(/\\\$\\cdot\\\$/g, '·')      // $\cdot$ → ·
         .replace(/\\\$\\cdots\\\$/g, '⋯')     // $\cdots$ → ⋯
         .replace(/\\\$\\ldots\\\$/g, '…')     // $\ldots$ → …
         .replace(/\\\$\\vdots\\\$/g, '⋮')     // $\vdots$ → ⋮
         .replace(/\\\$\\square\\\$/g, '□')    // $\square$ → □
    
    // LaTeX 명령어만 변환 (이스케이프된 문자는 보존)
    s = s.replace(/\\cdot(?![a-zA-Z])/g, '·')              // \cdot → · (다음에 문자가 오지 않는 경우만)
         .replace(/\\cdots(?![a-zA-Z])/g, '⋯')             // \cdots → ⋯
         .replace(/\\ldots(?![a-zA-Z])/g, '…')             // \ldots → …
         .replace(/\\vdots(?![a-zA-Z])/g, '⋮')             // \vdots → ⋮
         .replace(/\\square(?![a-zA-Z])/g, '□')            // \square → □
    
    // LaTeX 수식 표시만 제거 (내용은 보존)
    s = s.replace(/\$([^$]*)\$/g, '$1')                   // $내용$ → 내용 (LaTeX 수식 내용은 보존)
         .replace(/\$\s*([^$]*)\s*\$/g, '$1')             // $ 내용 $ → 내용 (공백 포함)
    
    // 법률 문서 특수 기호 (정확한 패턴만)
    s = s.replace(/\(R\\&D\)/gi, '(R&D)')      // R\&D → R&D (정확한 패턴만)
         .replace(/\(R&D\)/gi, '(R&D)')        // R&D → R&D
         .replace(/\(R\s*&\s*D\)/gi, '(R&D)') // R & D → R&D
  }

  // 6) 리스트 및 체크리스트 포맷팅 (안전한 방식)
  if (listFormatting) {
    const beforeLength = s.length
    
    // 체크리스트 변환 (전용 함수 사용)
    s = convertChecklist(s)
    
    // 세미콜론을 기준으로 개행 처리 후 세미콜론 제거 (안전하게)
    s = s.replace(/;\s*(?=\S)/g, '\n')        // 세미콜론 뒤에 공백이 있고 다음 문자가 오는 경우만, 세미콜론 제거
    
    // 리스트 마커 정리 (정확한 패턴만)
    s = s.replace(/^\s*[가-힣]\.\s+/gm, '• ')  // 가. 나. 다. → •
         .replace(/^\s*[a-z]\.\s+/gim, '• ')   // a. b. c. → •
         .replace(/^\s*\d+\.\s+/gm, '• ')      // 1. 2. 3. → •
    
    const afterLength = s.length
    if (beforeLength !== afterLength) {
      console.log('🔍 안전한 정규화 함수 데이터 길이 변화:', {
        before: beforeLength,
        after: afterLength,
        change: afterLength - beforeLength,
        changePercentage: ((afterLength - beforeLength) / beforeLength * 100).toFixed(2) + '%'
      })
    }
  }

  return s;
}

// 체크리스트 변환 전용 함수 (더 강력한 패턴 매칭)
export function convertChecklist(text: string): string {
  let s = text
  
  // 체크리스트 변환 패턴 (모든 경우를 커버)
  const patterns = [
    /체크리스트\s*:/g,           // 체크리스트: (공백 포함)
    /체크리스트:/g,               // 체크리스트:
    /^체크리스트\s*:/gm,          // 줄 시작 체크리스트: (공백 포함)
    /^체크리스트:/gm,             // 줄 시작 체크리스트:
    /\n체크리스트\s*:/g,          // 개행 후 체크리스트: (공백 포함)
    /\n체크리스트:/g,             // 개행 후 체크리스트:
    /\r\n체크리스트\s*:/g,        // CRLF 후 체크리스트: (공백 포함)
    /\r\n체크리스트:/g,           // CRLF 후 체크리스트:
    /\s+체크리스트\s*:/g,         // 공백 후 체크리스트: (공백 포함)
    /\s+체크리스트:/g,            // 공백 후 체크리스트:
  ]
  
  // 모든 패턴을 순차적으로 적용
  patterns.forEach(pattern => {
    s = s.replace(pattern, '·')
  })
  
  return s
}

// 특수문자 탐지 함수
export function detectSpecialCharacters(text: string) {
  const patterns = {
    latex: /\\\$[^$]*\\\$/g,
    htmlEntities: /&[a-zA-Z0-9#]+;/g,
    unicodeEscapes: /\\u[0-9a-fA-F]{4}/g,
    controlChars: /[\x00-\x1F\x7F-\x9F]/g,
    nonBreakingSpaces: /\u00A0/g,
    fullWidthChars: /[\uFF01-\uFF5E]/g,
    combiningMarks: /[\u0300-\u036F\u1AB0-\u1AFF\u20D0-\u20FF]/g
  };

  const results: Record<string, string[]> = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern);
    results[key] = matches ? [...new Set(matches)] : [];
  }

  return results;
}

// 정규화 요약 정보 생성
export function getNormalizationSummary(original: string, normalized: string) {
  const originalLength = original.length;
  const normalizedLength = normalized.length;
  const changes = originalLength !== normalizedLength;
  
  const detected = detectSpecialCharacters(original);
  const totalSpecialChars = Object.values(detected).reduce((sum, arr) => sum + arr.length, 0);

  return {
    originalLength,
    normalizedLength,
    changes,
    specialCharacters: detected,
    totalSpecialChars,
    efficiency: changes ? ((normalizedLength / originalLength) * 100).toFixed(1) : '100.0'
  };
}
