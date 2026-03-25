import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    async create(dto: CreateUserDto) {
        // ✅ Check email already exists
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already registered');
        return this.userRepo.createUser(dto);
    }

    async findAll(page: number, limit: number) {
        const { data, total } = await this.userRepo.findAll(page, limit);
        return {
            data,
            total,
            page:     Number(page),
            lastPage: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const user = await this.userRepo.findByIdSafe(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.userRepo.findByIdSafe(id);
        if (!user) throw new NotFoundException('User not found');

        // ✅ Check email conflict if email is being changed
        if (dto.email && dto.email !== user.email) {
            const existing = await this.userRepo.findByEmail(dto.email);
            if (existing) throw new ConflictException('Email already in use');
        }

        return this.userRepo.update(id, dto);
    }

    async remove(id: string) {
        const user = await this.userRepo.findByIdSafe(id);
        if (!user) throw new NotFoundException('User not found');
        await this.userRepo.delete(id);
    }
}