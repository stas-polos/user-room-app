import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ example: '09d00bd8-2bf2-4938-a028-5ab265fc4013' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ name: 'in_room', type: 'boolean', default: false })
  inRoom: boolean;

  @ApiProperty({ example: 'user@host.com', description: 'Account email.' })
  @Index('ux_users_email', { unique: true })
  @Column({ length: 256, unique: true, nullable: false, update: false })
  email: string;

  @Exclude()
  @Column({ name: 'hashed_password', nullable: true })
  hashedPassword?: string;

  @Exclude()
  @CreateDateColumn({
    name: 'created_at',
    precision: null,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Exclude()
  @Index('ix_users_updated_at')
  @UpdateDateColumn({
    name: 'updated_at',
    precision: null,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Exclude()
  @Index('ix_users_deleted_at')
  @DeleteDateColumn({
    name: 'deleted_at',
    precision: null,
    type: 'timestamp',
    default: null,
  })
  deletedAt?: Date;
}
