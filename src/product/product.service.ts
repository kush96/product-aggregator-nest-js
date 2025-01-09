import {Injectable} from '@nestjs/common'
import {config} from './../../config'
import axios from 'axios'
import { ProductRepository } from './product.repository'
import { CustomProvider1Processor } from './product-processors/custom.provider.1.processor';
import { CustomProvider2Processor } from './product-processors/custom.provider.2.processor';
import {Product, product_pricing_time as ProductPricingTime} from "@prisma/client"

@Injectable()
export class ProductService{
    private readonly MAX_TIME_TILL_PRODUCT_REFRESH_IN_SECONDS = 60; 

    private readonly providers = [
        {
          name: 'CustomProvider1',
          url: config.CUSTOM_PROVIDER_1_PRODUCT_API_URL,
          processor: new CustomProvider1Processor(),
        },
        {
          name: 'CustomProvider2',
          url: config.CUSTOM_PROVIDER_2_PRODUCT_API_URL,
          processor: new CustomProvider2Processor(),
        }
      ];

    constructor(private readonly productRepo: ProductRepository){}

async getAllProductsWithBestPrice(){

    // get all products from all providers
    const allSuccessfullyFetchedProducts = await this.getProductsFromProviderAPIs();
    
    // map of upc_id --> product
    const minimumPricedProductsMap = await this.getMinPricedProductsFromAllProducts(allSuccessfullyFetchedProducts);

    // store prd pricing at current time
    const productPricingWithTime= Object.entries(minimumPricedProductsMap).map(([upc_id, prd]) => ({
        upc_id: upc_id,
        price: prd.price,
        time: new Date()
      }));
    // create latest pricing data for pricing history table
    this.productRepo.addProductPricingTime(productPricingWithTime);

    return minimumPricedProductsMap;
    
}

async getProductWithPricingHistory(upc_id:string){
    const allSuccessfullyFetchedProductsForUpcId = await this.getProductsFromProviderAPIs(upc_id);
    if(!allSuccessfullyFetchedProductsForUpcId || allSuccessfullyFetchedProductsForUpcId.length<1){
        console.error("Prd with given upc_id not present")
        return {};
    }
    const minimumPricedProductForUpcId = (await this.getMinPricedProductsFromAllProducts(allSuccessfullyFetchedProductsForUpcId))[upc_id];
    const prdPricingHistory = await this.productRepo.getProductPricingHistoryForUpcId(upc_id);
    return {
        ...minimumPricedProductForUpcId,
        pricingHistory: prdPricingHistory
    }
}

async getPricingChanges(timeFrame: string) {
    // 1) Determine the date threshold
    const dateThreshold = new Date();
    if (timeFrame === 'LAST_TEN_SECOND') {
      dateThreshold.setSeconds(dateThreshold.getSeconds() - 10);
    } else if (timeFrame === 'LAST_MIN') {
      dateThreshold.setMinutes(dateThreshold.getMinutes() - 1);
    } else if (timeFrame === 'LAST_HOUR') {
      dateThreshold.setHours(dateThreshold.getHours() - 1);
    }
  
    // 2) Fetch recent pricing data
    const recentPricing = await this.productRepo.getRecentPricingSince(dateThreshold);
  
    // 3) Group by upc_id
    const groupedMap: Record<string, { price: number; time: Date }[]> = {};
    for (const p of recentPricing) {
      if (!groupedMap[p.upc_id]) {
        groupedMap[p.upc_id] = [];
      }
      groupedMap[p.upc_id].push({ price: p.price, time: p.time });
    }
  
    // 4) Build the results without fetching the full product
    const results = [];
    for (const [upc_id, pricingHistory] of Object.entries(groupedMap)) {
      results.push({ upcId: upc_id, pricingHistory });
    }
  
    // 5) Return the final structured result
    return results;
  }
  
  


/**
 * Given allSuccessfully fethed products from providers, this function returns a map of upc_id(unique prd id) --> prd
 * @param allSuccessfullyFetchedProducts : all Products from all Providers. There can be repeated products, i.e, two same
 *                                         prd from diff providers. They will have the same upc_id
 * @returns map of upc_id(unique prd id) --> prd
 */
async getMinPricedProductsFromAllProducts(allSuccessfullyFetchedProducts: Product[]): Promise<Record<string, Product>>{
        // map of upc_id --> product
        const minimumPricedProductsMap:Record<string, Product> = {}

        // make map of prd upc_id --> product at best available price
        allSuccessfullyFetchedProducts.forEach(
            (prd, ind) => {
                if(minimumPricedProductsMap[prd.upc_id]){
                    const cur_min_priced_prd = minimumPricedProductsMap[prd.upc_id];
                    if(prd.price < cur_min_priced_prd.price)
                        minimumPricedProductsMap[prd.upc_id] = prd;   
                }
                else
                    minimumPricedProductsMap[prd.upc_id] = prd;
            }
        )
        return minimumPricedProductsMap;
}
/**
 * Fetches all Products from all Providers. There can be repeated products, i.e, two same rd from diff providers.
 * Two similar prds will have same upc_id.
 * @param upc_id (optional) : If upc_id not given , all products from all providers fetched, else if given, only prds
 *                            with given upc_id fetched from all providers
 * @returns a list of all fetched products
 */
async getProductsFromProviderAPIs(upc_id?:string): Promise<Product[]>{
    const results = await Promise.allSettled(
        this.providers.map((provider) =>
            axios
                .get(upc_id ? `${provider.url}${upc_id}` : provider.url)
                .then((response) =>
                    // Based on provider, data is processed to transform into Product data type 
                    // we store in our db
                    provider.processor.process(response.data),
                ),
        ),
    );

    const allSuccessfullyFetchedProducts = [];
    
    // collect transformed products from providers and log errors if present
    results.forEach((result, index) => {
        const provider = this.providers[index];

        if (result.status === 'fulfilled') {
            allSuccessfullyFetchedProducts.push(...result.value);
        } else {
            console.error('Errors while fetching from provider:'+ provider.name + ' with reason' + result.reason.message);
        }
    });
    return allSuccessfullyFetchedProducts;
}
} 