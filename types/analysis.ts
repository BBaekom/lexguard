export type RiskAssessment = {
    risk_level: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL";
    risk_score: number;
    risk_factors: string[];
    recommendations: string[];
    explanation?: string;
    why?: string[];
    triggers?: { start: number; end: number; text: string }[];
    citations?: { source: string; identifier?: string; note?: string }[];
  };
  
  export type ClauseItem = {
    clause_id: string;
    original_identifier?: string;
    original_text: string;
    risk_assessment: RiskAssessment;
    revised_text?: string;
  };
  
  export type AnalysisResponse = {
    contract_id: string;
    contract_name?: string | null;
    analysis_timestamp: string;
    overall_risk_assessment: RiskAssessment;
    clause_analysis: ClauseItem[];
    summary: string;
    normalized: {
      contract_id: string;
      contract_name?: string | null;
      contract_type?: string | null;
      jurisdiction?: string | null;
      language?: string | null;
      is_reference?: boolean;
      clauses: { original_identifier?: string; start_index:number; end_index:number; clause_type:string }[];
    };
  };
  