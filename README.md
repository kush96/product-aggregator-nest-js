
# Digital Product Aggregator

The App consists of two Modules:
1. Provider
2. Product

### Provider 
There are 2 provider APIs in this module, which spit info like upc_id(unique identifier for any product), id(their own custom external id for the product), availability, price, title. To simulate real world providers, the fields against similar data fields are different, i.e, one can have 'upc' field while the other can have it as 'upc_id' as both follow different conventions. Also, we can pass upc as a query param to filter by upc_id. I keep generating a random price when 

1. /provider/custom-provider-1?upc={upc_id}
2. /provider/custom-provider-2?upc={upc_id}

### Product
The following APIs have been implemented in this module



#### GET /products:
Returns a list of aggregated products with current best price from all providers based on availability


#### GET /products/:id:
Returns detailed information for a specific product, including current best price and pricing history

## Setup 

    1. git clone https://github.com/kush96/product-aggregator-nest-js.git .
    2. Make sure you have docker CLI installed on System
    3. docker build -t product-aggregator .
    4. docker run -p 3000:3000 -p 4000:4000 -p 5432:5432 product-aggregator // This is for running two instances, one for hitting all Provider APIs, the other instance is for Product related APIs
    4. Open Swagger doc through http://localhost:3000/api#/
    5. Sample upc for testing is UPC-eb-1
