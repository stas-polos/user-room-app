import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from '../users/user.entity';

@Entity('rooms')
export class Room {
  @ApiProperty({ example: '09d00bd8-2bf2-4938-a028-5ab265fc4013' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => User, (user) => user.room)
  @JoinColumn({ name: 'user_id' })
  users: User[];

  @ApiProperty({ example: 'Simple room', description: 'Name room.' })
  @Column({ length: 256, unique: false, nullable: false, update: false })
  name: string;

  @Exclude()
  @CreateDateColumn({
    name: 'created_at',
    precision: null,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Exclude()
  @Index('ix_rooms_updated_at')
  @UpdateDateColumn({
    name: 'updated_at',
    precision: null,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Exclude()
  @Index('ix_rooms_deleted_at')
  @DeleteDateColumn({
    name: 'deleted_at',
    precision: null,
    type: 'timestamp',
    default: null,
  })
  deletedAt?: Date;
}
