import { z } from 'zod';

export const VariantSchema = z.object({
  hex: z.string().min(1, "Color hex is required"),
  images: z.array(z.string().url("Invalid image URL")).default([]),
  sizes_stock: z.record(z.string(), z.number().int().nonnegative("Stock must be a non-negative integer")).default({}),
});

export const ProductVariantsSchema = z.array(VariantSchema);

export type ProductVariant = z.infer<typeof VariantSchema>;
export type ProductVariants = z.infer<typeof ProductVariantsSchema>;

/**
 * Calculates the total stock across all variants and sizes.
 */
export function calculateTotalStock(variants: ProductVariants | null | undefined): number {
  if (!variants || !Array.isArray(variants)) return 0;
  
  return variants.reduce((total, variant) => {
    const variantStock = Object.values(variant.sizes_stock || {}).reduce((sum, count) => sum + count, 0);
    return total + variantStock;
  }, 0);
}
