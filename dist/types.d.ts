export interface RawMetaEvidence {
    fileURI: string;
    [key: string]: any;
}
export interface MetaEvidence {
    disputePolicyFileUrl: string;
    [key: string]: any;
}
export interface Evidence {
    URI: string;
    sender: string;
    creationTime: string;
}
export interface EvidenceContent {
    title: string;
    description: string;
    fileURI: string;
    fileTypeExtension: string;
    type: string;
}
export interface DisputeData {
    disputeId: string;
    chainId: number;
    metaEvidence: MetaEvidence;
    evidenceContents?: EvidenceContent[];
    evidenceErrors?: Array<{
        evidenceUri: string;
        error: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map