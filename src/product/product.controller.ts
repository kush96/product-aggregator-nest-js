import {Controller, Query, Get} from '@nestjs/common'
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService){}
    
    @Get()
    async getProductUsingUPC(@Query('upc') upc:string){
        const prds =  await this.productService.getProductFromAllDataSources(upc);
        return prds
    }

}