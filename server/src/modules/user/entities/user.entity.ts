import { Exclude } from 'class-transformer';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums/user/user-role.enum';

@Entity('users')
@Index(['email', 'deletedAt'])
@Index(['hashedVerifyToken'])
export class UserEntity extends BaseEntity {
  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'hashed_password', select: false })
  @Exclude()
  hashedPassword: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'phone_number', length: 15, nullable: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    name: 'hashed_verify_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  @Exclude()
  hashedVerifyToken: string | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    name: 'hashed_refresh_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  @Exclude()
  hashedRefreshToken: string | null;
}
