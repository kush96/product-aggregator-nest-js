import { Module } from '@nestjs/common';
import {ProductModule} from './product/product.module'
import { ProviderModule } from './provider/provider.module';
@Module({
    imports: [ProductModule, ProviderModule]
})

export class AppModule {}