import { Get, Controller, Query } from '@nestjs/common'
import { ApiQuery} from '@nestjs/swagger'

/**
 * Making two providers to mimic two separate APIs with product data. The two APIs have similar data, but as in the real world 
 * the fields for both the data are different. , ie, type in provider1, itemType in Provider2 , we will map it to a field 
 * named "product_type" which is maintained at our end
 */
@Controller('provider')
export class ProviderController {

    @Get('/custom-provider-1')
    @ApiQuery({ name: 'upc', required: false, description: 'Filter products by upc (optional)' })
    getProductsFromProvider1(@Query('upc') upc?: string) {
        const products = [
            { id: 1, upc: "UPC-eb-1", type: "e-book", title: "Silo", price: this.getRandomPrice(), currency: "AED", isAvailable: true },
            { id: 2, upc: "UPC-eb-2", type: "e-book", title: "Designing Data Intensive System PDF", price: this.getRandomPrice(), currency: "AED", isAvailable: true },
            { id: 3, upc: "UPC-sl-1", type: "software-license", title: "Microsoft Office Suite", price: this.getRandomPrice(), currency: "AED", isAvailable: true },
            { id: 4, upc: "UPC-sl-2", type: "software-license", title: "Matlab Pro", price: this.getRandomPrice(), currency: "AED", isAvailable: false },
            { id: 5, upc: "UPC-dc-1", type: "digital-course", availableSlots: 3, title: "Cooking Pro Course", price: this.getRandomPrice(), currency: "AED" }
          ];
        // if no type given return all products
        if(upc){
            return products.filter(p => p.upc === upc)
        }
        return products;
    }

    @Get('/custom-provider-2')
    @ApiQuery({ name: 'type', required: false, description: 'Filter products by type (optional)' })
    getProductsFromProvider2(@Query('upc') upc?: string) {
        const products = [
            { id: 1, upc: "UPC-eb-1", itemType: "E_BOOK", title: "Silo", price: this.getRandomPrice(), currency: "AED", availability: true },
            { id: 2, upc: "UPC-eb-2", itemType: "E_BOOK", title: "Designing Data Intensive System PDF", price: this.getRandomPrice(), currency: "AED", availability: true },
            { id: 3, upc: "UPC-sl-1", itemType: "SOFT_LICENSE", title: "Microsoft Office Suite", price: this.getRandomPrice(), currency: "AED", availability: true },
            { id: 4, upc: "UPC-sl-2", itemType: "SOFT_LICENSE", title: "Matlab Pro", price: this.getRandomPrice(), currency: "AED", availability: false },
            { id: 5, upc: "UPC-dc-2", itemType: "ONLINE_COURSE", remainingSlots: 0, title: "Python Pro Course", price: this.getRandomPrice(), currency: "AED", availability: false }
          ];
        // if no type given return all products
        if(upc){
            return products.filter(p => p.upc === upc)
        }
        return products;
    }

    // Helper function to generate a random price between 100 and 500
    private getRandomPrice(): number {
        return Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    }
}
