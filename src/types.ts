// Types for the data structures
export interface RawMetaEvidence {
  fileURI: string;
  [key: string]: any; // Allow any other properties since structure varies
}

export interface MetaEvidence {
  disputePolicyFileUrl: string;
  [key: string]: any; // Allow any other properties since structure varies by dispute type
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