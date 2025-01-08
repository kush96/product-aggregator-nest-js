import { Product } from "@prisma/client";
import {ProviderProcessor} from "./provider.processor.interface"

export class CustomProvider2Processor implements ProviderProcessor{
    process(data: any[]): Omit<Product, "id">[] {
        return data.map((d) => ({
            upc_id: d.upc,
            title: d.title,
            is_available: d.availability,
            custom_provider: "Custom Provider 2",
            last_updated: new Date(),
            product_type: d.itemType,
            external_id: String(d.id),
            price: parseInt(d.price),
            currency: d.currency
        }));
    }
}