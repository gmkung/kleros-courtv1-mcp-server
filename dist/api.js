import axios from "axios";
import { CHAIN_CONFIG, KLEROS_CDN_BASE, KLEROS_API_BASE } from "./config.js";
export async function fetchMetaEvidence(chainId, disputeId) {
    const response = await axios.get(`${KLEROS_API_BASE}/get-dispute-metaevidence`, {
        params: { chainId, disputeId },
    });
    if (!response.data.metaEvidenceUri) {
        throw new Error("No meta evidence URI found");
    }
    const metaEvidenceUrl = `${KLEROS_CDN_BASE}${response.data.metaEvidenceUri}`;
    // Fetch the JSON meta evidence file from IPFS
    const metaEvidenceResponse = await axios.get(metaEvidenceUrl, {
        headers: { 'Accept': 'application/json' }
    });
    // Validate that we received valid JSON
    if (!metaEvidenceResponse.data || typeof metaEvidenceResponse.data !== 'object') {
        throw new Error("Invalid meta evidence JSON received");
    }
    const fileUrl = metaEvidenceResponse.data.fileURI
        ? `${KLEROS_CDN_BASE}${metaEvidenceResponse.data.fileURI}`
        : "";
    return {
        metaEvidence: metaEvidenceResponse.data,
        fileUrl,
    };
}
export async function fetchEvidences(chainId, disputeId) {
    const chainConfig = CHAIN_CONFIG[chainId];
    const query = {
        query: `
      query getDispute($id: String!) {
        dispute(id: $id) {
          evidenceGroup {
            evidence {
              URI
              sender
              creationTime
            }
          }
        }
      }
    `,
        variables: { id: disputeId },
    };
    const response = await axios.post(chainConfig.subgraphUrl, query, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data.data.dispute?.evidenceGroup?.evidence || [];
}
export async function fetchEvidenceContent(evidenceUri) {
    const url = `${KLEROS_CDN_BASE}${evidenceUri}`;
    // Fetch the JSON evidence content from IPFS
    const response = await axios.get(url, {
        headers: { 'Accept': 'application/json' }
    });
    // Validate that we received valid JSON
    if (!response.data || typeof response.data !== 'object') {
        throw new Error(`Invalid evidence content JSON received from ${evidenceUri}`);
    }
    return response.data;
}
export async function getDisputeData(disputeId, chainId) {
    // Fetch meta evidence and evidences in parallel
    const [metaEvidenceData, evidences] = await Promise.all([
        fetchMetaEvidence(chainId, disputeId),
        fetchEvidences(chainId, disputeId),
    ]);
    // Try to fetch all evidence contents, tracking successes and failures
    const evidenceResults = await Promise.allSettled(evidences.map((evidence) => fetchEvidenceContent(evidence.URI)));
    // Convert all relative URIs to full CDN URLs
    const { fileURI, ...metaEvidenceWithoutFileURI } = metaEvidenceData.metaEvidence;
    const processedMetaEvidence = {
        ...metaEvidenceWithoutFileURI,
        disputePolicyFileUrl: fileURI
            ? `${KLEROS_CDN_BASE}${fileURI}`
            : fileURI
    };
    // Convert other URI fields to full URLs if they exist
    if (processedMetaEvidence.evidenceDisplayInterfaceURI && typeof processedMetaEvidence.evidenceDisplayInterfaceURI === 'string') {
        processedMetaEvidence.evidenceDisplayInterfaceURI = `${KLEROS_CDN_BASE}${processedMetaEvidence.evidenceDisplayInterfaceURI}`;
    }
    if (processedMetaEvidence.metadata && typeof processedMetaEvidence.metadata === 'object' && processedMetaEvidence.metadata.logoURI && typeof processedMetaEvidence.metadata.logoURI === 'string') {
        processedMetaEvidence.metadata.logoURI = `${KLEROS_CDN_BASE}${processedMetaEvidence.metadata.logoURI}`;
    }
    // Process results
    const successfulEvidenceContents = [];
    const evidenceErrors = [];
    evidenceResults.forEach((result, index) => {
        const evidenceUri = evidences[index].URI;
        if (result.status === 'fulfilled') {
            // Convert fileURI to full URL
            const processedContent = {
                ...result.value,
                fileURI: result.value.fileURI ? `${KLEROS_CDN_BASE}${result.value.fileURI}` : result.value.fileURI
            };
            successfulEvidenceContents.push(processedContent);
        }
        else {
            evidenceErrors.push({
                evidenceUri,
                error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
            });
        }
    });
    // Return based on whether all evidences were successfully retrieved
    if (evidenceErrors.length === 0) {
        // All evidence contents retrieved successfully
        return {
            disputeId,
            chainId,
            metaEvidence: processedMetaEvidence,
            evidenceContents: successfulEvidenceContents,
        };
    }
    else {
        // Some evidences failed to retrieve
        return {
            disputeId,
            chainId,
            metaEvidence: processedMetaEvidence,
            evidenceErrors,
        };
    }
}
//# sourceMappingURL=api.js.map