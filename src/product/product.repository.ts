import {Injectable} from "@nestjs/common"
import {PrismaClient, product_pricing_time as ProductPricingTime} from "@prisma/client"

@Injectable()
export class ProductRepository{
    private readonly prisma = new PrismaClient();
    

    async addProductPricingTime(productsPricingData :  Omit<ProductPricingTime, 'id'> [] ){
        await this.prisma.product_pricing_time.createMany({
            data: productsPricingData
        })
    }

    async getProductPricingHistoryForUpcId(upc_id: string ){
        return await this.prisma.product_pricing_time.findMany({
            where: {
                upc_id: upc_id, // Filter records with the given upc_id
            },
            orderBy: {
                time: 'desc', // Order by time in descending order (most recent first)
            },
        });
    }

    async getRecentPricingSince(dateThreshold: Date) {
        return await this.prisma.product_pricing_time.findMany({
          where: { time: { gt: dateThreshold } },
          orderBy: { time: 'desc' },
        });
      }
}