import { z } from "zod";
export declare const GetDisputeSchema: z.ZodObject<{
    disputeId: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, string, string | number>;
    chainId: z.ZodEffects<z.ZodNumber, 1 | 100, number>;
}, "strip", z.ZodTypeAny, {
    disputeId: string;
    chainId: 1 | 100;
}, {
    disputeId: string | number;
    chainId: number;
}>;
//# sourceMappingURL=validation.d.ts.map