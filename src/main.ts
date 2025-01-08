import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Swagger configuration
    const config = new DocumentBuilder()
    .setTitle('Product Aggregator API')
    .setDescription('API documentation for Product Aggregator')
    .setVersion('1.0')
    .addTag('products-aggregator') // Adds a tag for organization in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI available at /api

  const port = process.env.PORT || 3000; // Default to 3000 if no PORT is provided
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger is available at: http://localhost:${port}/api`);
}
bootstrap();
