import {Injectable} from '@nestjs/common'
import {config} from './../../config'
import axios from 'axios'
import { ProductRepository } from './product.repository'
import { CustomProvider1Processor } from './product-processors/custom.provider.1.processor';
import { CustomProvider2Processor } from './product-processors/custom.provider.2.processor';

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

async getProductFromAllDataSources(upc:string){
        
        // get product using upc from db (product.repository, write it if it doesn't exist)
        const productsDb = await this.productRepo.getProductsByUPC(upc)
        
        
        if (productsDb && productsDb.length > 0)
        {
            // check if any product is outdated in the db by more than 60 seconds
            const hasOutdated = productsDb.some(product => 
                new Date(product.last_updated)
                < new Date(Date.now() - this.MAX_TIME_TILL_PRODUCT_REFRESH_IN_SECONDS * 1000));
            
            // if no return fetched or db products
            if(!hasOutdated){
                console.log("Data served from DB")
                return productsDb;
            }
        }

        // else
        // fetch all products with given upc from all providers simultaeneously using allSettled
        // collect the results, and process them and print if any error fetching
        const results = await Promise.allSettled(
            this.providers.map((provider) =>
            axios.get(provider.url + upc).then((response) =>
                provider.processor.process(response.data),
            ),
            ),
        );

        const productsWithLatestData = [];

        // collect transformed products from providers and log errors if present
        results.forEach((result, index) => {
            const provider = this.providers[index];
            if (result.status === 'fulfilled') {
                productsWithLatestData.push(...result.value);
            } else {
                console.error('Errors while fetching from provider:'+ provider.name + ' with reason' + result.reason.message);
            }
        });

        // add new products to db, update existing products with fresh data
        const existingProductsInDb = await this.productRepo.getExistingProducts(productsWithLatestData)
    
        const newProductsToAddInDb = productsWithLatestData.filter(
            (product) => !existingProductsInDb.some(
            (existingProduct) => 
                existingProduct.upc_id === product.upc_id && 
                existingProduct.custom_provider === product.custom_provider
            )
        );

        await this.productRepo.updateProductsByUPCAndProvider(existingProductsInDb);
        
        await this.productRepo.createManyProducts(newProductsToAddInDb);

        console.log("Latest Data served from Provider APIs")
        // return list of products
        return productsWithLatestData
    }
} 