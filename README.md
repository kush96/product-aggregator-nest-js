
# Digital Products Aggregator

## Overview

The Digital Products Aggregator is an application designed to aggregate and normalize product data from multiple external providers, simulating real-world scenarios with dynamic pricing and inconsistent data structures. The application consists of two key modules:

1. **Provider Module**
2. **Product Module**

A core concept in this application is the **UPC ID**, a unique identifier assigned to a product. Different providers may list the same product under different external IDs but will share the same UPC ID if it’s the same product.

The primary goal of the product aggregation API is to:

- Collect data from multiple providers.
- Process and transform this data into a uniform structure (Product DTO).
- Serve the normalized product information through a set of APIs.

---

## Modules and Endpoints

### 1. Provider Module

The Provider Module simulates external APIs, each returning product data in different structures. Key points include:

- Each provider has unique field names and conventions (e.g., `upc` vs. `upc_id`).
- Dynamic pricing is simulated with random values generated between 100 and 500 for each product.
- APIs accept a query parameter `upc` to filter by UPC ID.

#### Provider Endpoints

1. **GET /provider/custom-provider-1?upc={upc_id}**
2. **GET /provider/custom-provider-2?upc={upc_id}**

#### Returned Data Structure

Each provider returns fields such as:

- **UPC ID**: Unique identifier for the product.
- **ID**: Provider-specific external ID.
- **Availability**: Stock status.
- **Price**: Dynamic pricing.
- **Title**: Product name.

---

### 2. Product Module

The Product Module aggregates and normalizes data from providers. It provides APIs for retrieving current product details, pricing history, and detecting price changes over time.

#### Product Endpoints

1. **GET /products**
   - Returns a list of aggregated products with the current best price based on availability.
   - Simulates dynamic pricing by recalculating prices for each call.

2. **GET /products/:id**
   - Returns detailed information about a specific product.
   - Includes:
     - Current best price.
     - Pricing history.
     - Other normalized product details.

3. **GET /products/changes**
   - Returns products with pricing changes within a specific time period.
   - Supported time ranges:
     - Last 10 seconds.
     - Last minute.
     - Last hour.
   - Pricing details within the selected time range are also included.

---

## Setup Instructions

To set up and run the application:

1. Clone the repository:
   ```bash
   git clone https://github.com/kush96/product-aggregator-nest-js.git .
   ```
2. Ensure Docker CLI is installed on your system.
3. Build the Docker image:
   ```bash
   docker build -t product-aggregator .
   ```
4. Run the application:
   ```bash
   docker run -p 3000:3000 -p 4000:4000 -p 5432:5432 product-aggregator
   ```
   - Two instances will run: one for provider-related APIs and another for product-related APIs.
   - Make sure ports 3000, 4000 and 5432 dont have anything running on your system. 
5. Access the Swagger documentation at:
   [http://localhost:3000/api](http://localhost:3000/api)

---

## Sample Run Instructions

### 1. Test `/products` API

- Call the `/products` API multiple times.
- Observe that the product list remains consistent, but the pricing updates dynamically for each call.

### 2. Test `/products/changes` API

- Call the `/products/changes` API immediately after running the `/products` API.
- Select the desired time range (e.g., last 10 seconds or last minute).
- Verify that the response includes UPC IDs and their respective prices within the selected range.

### 3. Test `/products/:id` API

- Use a UPC ID from the `/products` API response.
- Call the `/products/:id` API with the selected UPC ID.
- Verify that the response includes:
  - Pricing history.
  - Product details.

---

## Key Features

1. **Dynamic Pricing Simulation**: Randomized pricing to mimic real-world fluctuations.
2. **Data Normalization**: Uniform Product DTO structure despite variations in provider data.
3. **Comprehensive Insights**:
   - Best prices across providers.
   - Detailed product information.
   - Historical and recent price changes.

This application is a robust simulation tool for aggregating and normalizing data from multiple inconsistent sources.
