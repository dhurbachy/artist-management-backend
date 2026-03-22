import { Module,Global } from '@nestjs/common';
import {Pool} from "pg";
import { DatabaseService } from './database.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule], 
    providers:[DatabaseService],
    exports:[DatabaseService],
})
export class DatabaseModule {}
