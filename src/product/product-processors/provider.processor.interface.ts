import { Product } from "@prisma/client";

/**
 * All Processors Should Process data and spit out products in the format our db has to store
 * TODO : We can have a ProductDTO to enforce the return format
 */
export interface ProviderProcessor {
    process(data: any[]): Omit<Product, "id">[];
  }