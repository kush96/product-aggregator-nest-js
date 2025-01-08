import {Injectable} from "@nestjs/common"
import {PrismaClient, Product} from "@prisma/client"

@Injectable()
export class ProductRepository{
    private readonly prisma = new PrismaClient();
    
    async getProductsByUPC(upc:string){
        return await this.prisma.product.findMany(
            {
                where: {upc_id:upc}
            }
        )
    }

    async getExistingProducts(products: Product[]){
        const conditions = products.map((p) => ({
          upc_id: p.upc_id,
          custom_provider: p.custom_provider,
        }));
      
        return await this.prisma.product.findMany({
          where: {
            OR: conditions,
          },
        });
      }

    async createManyProducts(products : Product[]){
        await this.prisma.product.createMany({
            data: products
        })
    }

    async updateProductsByUPCAndProvider(products: Product[]) {
        return await Promise.all(
          products.map((product) =>
            this.prisma.product.updateMany({
              where: {
                upc_id: product.upc_id,
                custom_provider: product.custom_provider,
              },
              data: {
                title: product.title,          
                is_available: product.is_available,
                last_updated: new Date(),     // Automatically update timestamp
                product_type: product.product_type,
              },
            })
          )
        );
      }
}