import {Controller, Param, Get, Query, BadRequestException} from '@nestjs/common'
import { ProductService } from './product.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService){}
    
    /**
     * Gets all products with best available pricing from all providers
     */
    @Get()
    async getAllProducts(){
        return await this.productService.getAllProductsWithBestPrice();
    }

    @Get('/changes')
    @ApiQuery({
      name: 'time_frame',
      required: true,
      enum: ['LAST_TEN_SECOND', 'LAST_MIN', 'LAST_HOUR'],
    })
    async getProductWithPricingChanges(@Query('time_frame') timeFrame: string) {
      const validTimeFrames = ['LAST_TEN_SECOND', 'LAST_MIN', 'LAST_HOUR'];
      if (!validTimeFrames.includes(timeFrame)) {
        throw new BadRequestException(
          `Invalid time_frame. Must be one of: ${validTimeFrames.join(', ')}`,
        );
      }
      return await this.productService.getPricingChanges(timeFrame);
    }
    
    @Get(':upc_id')
    async getProductWithPricingHistory(@Param('upc_id') upcId: string) {
        return await this.productService.getProductWithPricingHistory(upcId);
    }
    
}