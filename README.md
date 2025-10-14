# 1. 프로젝트 개요

## 1-1. 프로젝트 소개

* **프로젝트 명**: LLM 기반 계약서 자동 검토 및 리스크 관리 서비스 (한이음 드림업 2025)
* **프로젝트 정의**: 사용자가 업로드한 계약서를 **OCR로 디지털화**하고, **LLM + RAG**로 **조항의 의미를 해석**해 **법적 리스크를 자동 탐지·시각화**하며 **표준계약서/판례 기반 개선안**을 제안하는 웹 서비스.

## 1-2. 개발 배경 및 필요성

* 계약서의 난해한 표현과 비표준 양식(스캔/이미지 포함)으로 인해 **비전문가가 리스크를 식별하기 어려움**.
* 전문가 검토는 **시간·비용 부담**이 커 **스타트업/SMB**가 접근하기 어려움.
* 최신 법령·판례를 반영한 **의미기반(semantic) 자동 검토**로, **누락 조항**과 **불리 조항**을 신속히 찾아 **안전하고 공정한 계약**을 돕는 서비스가 필요.

## 1-3. 프로젝트 특장점

* **자연어 이해 기반 의미 해석**: 키워드 매칭이 아닌 **조항 맥락**을 파악해 리스크 판단.
* **법률 데이터 연동 RAG**: **국가법령정보 공동활용 판례 OpenAPI** 및 **표준계약서 DB**를 벡터DB에 적재, 최신 근거와 함께 제시.
* **리스크 시각화**: 원문 **PDF 위 오버레이**로 색상/점수 기반 **위험도 맵** 제공(조항-원문 좌표 매핑).
* **자동 개선안 제시**: 표준 조항과 비교한 **문구 대체(패치) 제안** 및 클릭 반영 흐름.
* **대용량 대응/정확도 향상**: 문서 **섹션 단위 청킹·병렬 분석**, **임계값/메타필터**가 적용된 검색·판단 파이프라인.
* **사용자 친화적 UX**: 조항 유형/리스크 레벨 **필터·정렬**, 요약/세부 탭, 근거(판례/조항) **원클릭 열람**.

## 1-4. 주요 기능

* **OCR & 전처리**: PDF/이미지에서 텍스트·레이아웃 추출(페이지·문단 좌표 보존).
* **조항 분할·정규화**: 계약서 구조를 섹션·조항 단위로 분리/정규화.
* **의미 기반 분석(LLM)**: 조항 **의도/의미 해석** 및 **리스크 판정**(중요도/위험도 점수화).
* **RAG 근거 제시**: 유사 **판례/법령/표준조항** 근거와 함께 결과 설명.
* **개선안 추천**: 위험/누락 조항에 대한 **대체 문구·추가 조항** 제안.
* **리스크 요약 대시보드**: 문서 전반의 **핵심 리스크 요약**, 조항별 상세로 드릴다운.
* **자연어 Q&A**: “이 조항이 불리한 이유는?” 같은 **질문-답변형 해설**.
* **멀티플랫폼 웹 지원**: 데스크톱·모바일 환경에서 동일한 분석 경험.

## 1-5. 기대 효과 및 활용 분야

* **기대 효과**
  * 계약 검토 **정확도·속도 향상**, 법률 접근성 제고, **리스크의 가시화**로 의사결정 지원.
  * 법무 인력이 부족한 조직도 **일정 수준의 사전 검토** 가능.
* **활용 분야**
  * **프리랜서·스타트업·SMB**의 NDA/용역/투자계약 등 사전 검토.
  * **일반 소비자**의 부동산·인테리어·웨딩 등 생활계약 점검.
  * **공익/복지 단체**의 무료 계약서 검토 지원 서비스.

## 1-6. 기술 스택

* **프론트엔드**: React, Next.js, TypeScript, JavaScript, Tailwind CSS, PDF.js(오버레이 시각화)
* **백엔드**: Springboot, Next.js, Python(FastAPI), LangChain(파이프라인 오케스트레이션) 
  * 구현 링크 : https://github.com/ggwanrok/25_HC109
* **AI/ML**
  * **OCR**: (프로젝트 내) Mistral 기반 OCR 파이프라인
  * **LLM**: Gemini 2.5 Flash(의미 해석/요약/개선안 생성)
  * **임베딩 모델**: Hugging Face `kakao1513/KURE-legal-ft-v1`
  * **RAG**: Qdrant(Vector DB) + 표준계약서/법령·판례 코퍼스
* **데이터/문서 처리**: PyMuPDF(레이아웃 보존 추출), 좌표 매핑/청킹 유틸
* **인프라/배포**: Docker, (옵션) Kubernetes, GitHub Actions(CI/CD)
* **클라우드**: AWS, Oracle Cloud (환경별 선택)
* **데이터베이스(메타)**: MySQL/PostgreSQL(문서/사용자/리포트 메타)

# 2. 사진
| <img width="80" height="100" src="https://github.com/user-attachments/assets/36906c54-5128-4138-8a05-c0c2597d5127" > | <img width="80" height="100" alt="image" src="https://github.com/user-attachments/assets/a6d6f0d8-38ee-4e3d-8a89-92e9a104ebd3" > | <img width="80" height="100" alt="image" src="https://i.pinimg.com/280x280_RS/ce/6c/fc/ce6cfc73ef62f44510a64bc62937328f.jpg" > |
|:---:|:---:|:---:|
| **이종민** | **문관록** | **조영현** |
| • 프로젝트 총괄 <br> • 프론트엔드 | • LLM 프롬프팅 <br> • 법률 RAG 구축 | • 백엔드 <br> • DB 구축 |

# 3. 시스템 구성도
- 서비스 구성도
<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/77f0cb27-68fa-4072-9d3d-75a1a9789b6f" />


# 4. 작품 소개영상
[![[2025 한이음] LLM 기반 계약서 자동 검토 및 리스크 관리 서비스](https://img.youtube.com/vi/Kng082ZPWgQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=Kng082ZPWgQ)

# 5. 핵심 소스코드

* https://github.com/ggwanrok/25_HC109 에 구현된 소스코드입니다.
* 정규화된 조항들을 대상으로 RAG 근거 검색 → 상황형(카테고리별) 프롬프트 평가 → 점수/등급 보정 → 개정문 생성까지 한 번에 오케스트레이션하는 상위 함수입니다.
```
    async def analyze(
        self, cn: ContractNormalized, contract_type: str, jurisdiction: str, role: str
    ) -> Tuple[RiskAssessment, List[ClauseAnalysisItem]]:
        pack = load_pack(contract_type)
        tpl_text = pack.prompts["clause_audit"]
        categories = pack.categories()

        async def _process_one_clause(idx: int, cl) -> Tuple[int, Optional[ClauseAnalysisItem], Optional[RiskAssessment]]:
            async with self.clause_sem:
                try:
                    # 1) RAG
                    refs = await self.retriever.retrieve_similar_chunks(
                        cl.original_text,
                        top_k=settings.retrieval_top_k,
                        reference_only=True,
                        contract_type=contract_type,
                        jurisdiction=jurisdiction,
                        clause_type=cl.clause_type,
                    )
                    refs_md = PromptBuilder.format_references([r.dict() if hasattr(r, "dict") else r for r in refs])

                    # 2) 카테고리 병렬
                    tasks = [
                        self._category_audit(
                            tpl_text, contract_type, jurisdiction, role,
                            cat, cl.original_text, refs_md
                        )
                        for cat in categories
                    ]
                    results = await asyncio.gather(*tasks, return_exceptions=False)
                    cat_results = [r for r in results if r]

                    # 3) 병합
                    is_purpose = _is_purpose_clause_text(cl.original_text, cl.original_identifier)
                    ra = self._merge_clause(cat_results, is_purpose=is_purpose)

                    # UNKNOWN 정리(조항 레벨)
                    ra = _sanitize_unknown_ra(ra)

                    # 4) 개정문/스팬
                    revised_text = ""
                    rev_spans = None
                    if ra.risk_level != "UNKNOWN" and float(getattr(ra, "risk_score", 0.0)) > 0.0:
                        revised_text = await self._rewrite_clause(
                            contract_type, jurisdiction, role,
                            cl.original_text, cl.original_identifier, ra, refs_md
                        )
                        if revised_text:
                            raw_spans = compute_revised_spans(cl.original_text, revised_text)
                            filtered = _filter_spans_after_header(revised_text, raw_spans)
                            major = _select_major_spans(revised_text, filtered)
                            rev_spans = [DiffSpan(**s) for s in major] if major else None
                    else:
                        # 개정안 카드 누락 방지(UNKNOWN)
                        revised_text = _SUFF

                    item = ClauseAnalysisItem(
                        clause_id=cl.clause_id,
                        original_identifier=cl.original_identifier,
                        original_text=cl.original_text,
                        risk_assessment=ra,
                        revised_text=revised_text,
                        revised_spans=rev_spans,
                    )
                    logger.info(f"[audit] clause={cl.original_identifier or cl.clause_id} cats={len(categories)} -> risks={len(cat_results)}")
                    return idx, item, ra

                except Exception as e:
                    logger.warning(f"[audit] clause failed: {getattr(cl, 'original_identifier', '?')} | {e}")
                    return idx, None, None

        t0 = time.perf_counter()

        # ---- 조항 병렬 스케줄 ----
        clause_tasks = [_process_one_clause(i, cl) for i, cl in enumerate(cn.clauses)]
        done = await asyncio.gather(*clause_tasks, return_exceptions=False)

        # ---- 결과 정리 ----
        done.sort(key=lambda x: x[0])
        clause_items: List[ClauseAnalysisItem] = []
        all_ra: List[RiskAssessment] = []
        for _, item, ra in done:
            if item: clause_items.append(item)
            if ra:   all_ra.append(ra)

        # ---- overall ----
        if not all_ra:
            overall = RiskAssessment(
                risk_level="LOW",
                risk_score=10.0,
                risk_factors=[],
                recommendations=[],
                explanation="No clauses.",
                citations=[],
            )
        else:
            scores_raw=[(0.0 if ra.risk_level=="UNKNOWN" else float(ra.risk_score)) for ra in all_ra]
            scores=sorted(scores_raw, reverse=True)
            topn_k=int(getattr(settings,"overall_topn",4))
            w_max=float(getattr(settings,"overall_weight_max",0.65))
            w_top=float(getattr(settings,"overall_weight_topn",0.35))
            topn=scores[:max(1,topn_k)]
            mean_topn=sum(topn)/max(1,len(topn))
            overall_score=w_max*scores[0]+w_top*mean_topn
            overall_score=max(0.0, min(100.0, overall_score * float(getattr(settings,"score_damping_overall",0.94))))
            level=_level_from_score(overall_score)

            factors: List[str]=[]
            recs: List[str]=[]
            for ra in sorted(all_ra, key=lambda x:(0.0 if x.risk_level=="UNKNOWN" else x.risk_score), reverse=True):
                if ra.risk_level == "UNKNOWN":
                    continue
                for f in ra.risk_factors:
                    if f and f not in factors: factors.append(f)
                for rc in ra.recommendations:
                    if rc and rc not in recs: recs.append(rc)
                if len(factors)>=5 and len(recs)>=5: break

            overall = RiskAssessment(
                risk_level=level,
                risk_score=round(overall_score, 1),
                risk_factors=factors[:5],
                recommendations=recs[:5] if recs else [_SUFF],
                explanation="Aggregated from clause-level assessments." if recs else "Sufficient as-is.",
                citations=[],
            )

        logger.info(f"[audit] done clauses={len(cn.clauses)} in {time.perf_counter()-t0:.1f}s")
        return overall, clause_items
```

* 평가 결과와 RAG 근거를 바탕으로 조문 헤더를 고정하고 범위 정책을 준수하며 안전한 개정문(레드라인)을 생성·반환하는 함수입니다.
```
    async def _rewrite_clause(
        self, contract_type: str, jurisdiction: str, role: str,
        clause_text: str, original_identifier: str,
        risk_assessment: RiskAssessment, references_md: str
    ) -> str:
        if not getattr(settings,"rewrite_enabled",True): return ""
        clean_recos=[r for r in (risk_assessment.recommendations or []) if not _is_sufficient(r)]
        if not clean_recos: return ""

        pack=load_pack(contract_type)
        tpl_text=pack.prompts.get("clause_rewriter")
        if not tpl_text: return ""

        original_header,_=_extract_header(clause_text)
        prompt=self._render_prompt(
            tpl_text, contract_type=contract_type, jurisdiction=jurisdiction, role=role,
            clause_text=clause_text, original_header=original_header or original_identifier or "",
            risk_factors=getattr(risk_assessment,"risk_factors",[]),
            recommendations=clean_recos, references_md=references_md,
        )

        async with self.sem:
            try:
                raw=await asyncio.wait_for(self._generate(prompt), timeout=self.request_timeout)
            except Exception as e:
                logger.warning(f"[rewrite] failed: {e}")
                return ""

        s=(raw or "").strip()
        if s.startswith("```"):
            s=re.sub(r"^```[\w-]*\n","",s); s=re.sub(r"\n```$","",s)
        data=None
        try:
            data=json.loads(s)
        except Exception:
            m=re.search(r"\{[\s\S]*\}$",s)
            if m:
                try: data=json.loads(m.group(0))
                except Exception: data=None
        if not isinstance(data,dict): return ""

        revised=(data.get("revised") or "").strip()
        if len(revised) < max(20, int(len(clause_text)*float(getattr(settings,"rewrite_min_ratio",0.3)))):
            return ""
        return _enforce_header(clause_text, revised)
```

* 원문을 조항/항/소항 단위로 표준화하고 위치 오프셋을 보존해, 이후 RAG·하이라이트의 기준 좌표가 될 수 있도록 하는 함수입니다.
```
    def normalize(self, raw_text: str, contract_id: Optional[str], meta: dict) -> ContractNormalized:
        text = raw_text or ""
        clauses: List[ClauseNormalized] = []

        # 1) 기사(조) 단위로 1차 분리
        article_spans = []
        for m in ARTICLE_RE.finditer(text):
            article_spans.append((m.start(), m.end(), m.group(1), m.group(2)))  # start, end_of_header, header, title

        if not article_spans:
            # 조 항목을 못 찾으면 전체를 하나의 조항으로
            cid = "article_1"
            clauses.append(
                ClauseNormalized(
                    clause_id=cid,
                    original_identifier="본문",
                    original_text=text,
                    analysis_text=self._clean(text),
                    start_index=0,
                    end_index=len(text),
                    clause_type="article",
                    article_number=1,
                    title=None,
                )
            )
        else:
            # 각 기사 블럭 추출
            for i, (s, e, header, title) in enumerate(article_spans):
                block_start = s
                block_end = article_spans[i + 1][0] if i + 1 < len(article_spans) else len(text)
                block = text[block_start:block_end]

                # 기사 번호 추출
                num_m = re.search(r"제\\s*(\\d+)\\s*조", header)
                art_no = int(num_m.group(1)) if num_m else (i + 1)
                art_title = title

                # 2) 항 단위 분리
                para_spans = list(PARA_RE.finditer(block))
                if not para_spans:
                    # 항이 없으면 기사 자체를 하나로
                    cid = f"article_{art_no}"
                    clauses.append(
                        ClauseNormalized(
                            clause_id=cid,
                            original_identifier=header.strip(),
                            original_text=block.strip(),
                            analysis_text=self._clean(block),
                            start_index=block_start,
                            end_index=block_end,
                            clause_type="article",
                            article_number=art_no,
                            title=art_title,
                        )
                    )
                else:
                    # 항 블럭들
                    for j, pm in enumerate(para_spans):
                        p_start = pm.start()
                        p_end = para_spans[j + 1].start() if j + 1 < len(para_spans) else len(block)
                        p_block = block[p_start:p_end]

                        # 항 번호
                        pnum_m = re.search(r"제\\s*(\\d+)\\s*항", pm.group(1))
                        pno = int(pnum_m.group(1)) if pnum_m else (j + 1)

                        cid = f"article_{art_no}_paragraph_{pno}"
                        clauses.append(
                            ClauseNormalized(
                                clause_id=cid,
                                original_identifier=f"제{art_no}조 제{pno}항",
                                original_text=p_block.strip(),
                                analysis_text=self._clean(p_block),
                                start_index=block_start + p_start,
                                end_index=block_start + p_end,
                                clause_type="paragraph",
                                article_number=art_no,
                                paragraph_number=pno,
                                title=art_title if j == 0 else None,
                            )
                        )

        cn = ContractNormalized(
            contract_id=contract_id or str(uuid.uuid4()),
            contract_name=meta.get("contract_name"),
            contract_type=meta.get("contract_type"),
            issuer=meta.get("issuer"),
            jurisdiction=meta.get("jurisdiction"),
            language=meta.get("language"),
            subject=meta.get("subject"),
            version=meta.get("version"),
            source_uri=meta.get("source_uri"),
            is_reference=meta.get("is_reference", False),
            clauses=clauses,
        )
        logger.info(f"Normalized contract: {cn.contract_id}, clauses={len(cn.clauses)}")
        return cn
```
