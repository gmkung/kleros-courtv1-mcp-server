import { z } from "zod";

// Validation schemas
export const GetDisputeSchema = z.object({
  disputeId: z.union([z.string(), z.number()]).transform(String),
  chainId: z.number().refine((id) => id === 1 || id === 100, {
    message: "Chain ID must be 1 (Ethereum) or 100 (Gnosis)",
  }),
}); 