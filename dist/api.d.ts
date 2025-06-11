import type { RawMetaEvidence, Evidence, EvidenceContent, DisputeData } from "./types.js";
export declare function fetchMetaEvidence(chainId: number, disputeId: string): Promise<{
    metaEvidence: RawMetaEvidence;
    fileUrl: string;
}>;
export declare function fetchEvidences(chainId: number, disputeId: string): Promise<Evidence[]>;
export declare function fetchEvidenceContent(evidenceUri: string): Promise<EvidenceContent>;
export declare function getDisputeData(disputeId: string, chainId: number): Promise<DisputeData>;
//# sourceMappingURL=api.d.ts.map