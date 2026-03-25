import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { DatabaseModule } from 'src/core/database/database.module';
import { AuthRepository } from 'src/auth/auth.repository';

@Module({
  imports:[DatabaseModule],
  controllers: [UserController],
  providers: [UserService,UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
