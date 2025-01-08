import { Product } from "@prisma/client"
import {ProviderProcessor} from "./provider.processor.interface"

export class CustomProvider1Processor implements ProviderProcessor {
    process(data: any[]): Omit<Product, "id">[] {
      return data.map((d) => ({
        upc_id: d.upc,
        title: d.title,
        is_available: d.isAvailable,
        custom_provider: "Custom Provider 1",
        last_updated: new Date(),
        product_type: d.type,
        external_id: String(d.id),
        price: parseInt(d.price),
        currency: d.currency,
      }));
    }
  }