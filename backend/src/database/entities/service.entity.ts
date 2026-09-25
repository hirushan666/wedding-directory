import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { VendorEntity } from './vendor.entity';
import { ReviewEntity } from './review.entity';
import { MyVendorsEntity } from './myVendors.entity';
import { PackageEntity } from './package.entity';
import { ServiceMediaEntity } from './service-media.entity';

@Entity({ name: 'service' })
export class ServiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 20 })
    category: string;

    @Column({ type: 'boolean', default: true })
    visible: boolean;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 300, nullable: true  })
    banner: string;

    // Virtual properties — populated at read-time from service_media child rows.
    // Not persisted as columns; source of truth is the service_media table.
    video_showcase?: string[];
    photo_showcase?: string[];

    @Column({ type: 'varchar', length: 100, nullable: true })
    website : string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    instagram: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    facebook: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    x: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    tiktok: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    location?: string;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    latitude?: number;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    longitude?: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => VendorEntity, v => v.service)
    @JoinColumn({ name: 'vendor_id' })
    vendor: VendorEntity;

    @OneToMany(() => ReviewEntity, (r) => r.service, { cascade: true })
    review: ReviewEntity[]; 

    @OneToMany(() => MyVendorsEntity, m => m.service, {cascade: true})
    @JoinColumn({ name: 'myvendors_id' })
    myVendors: MyVendorsEntity[];
    
    @OneToMany(() => PackageEntity, p => p.service, {cascade: true})
    @JoinColumn({ name: 'package_id' })
    packages: PackageEntity[];

    @OneToMany(() => ServiceMediaEntity, (m) => m.service, { cascade: true })
    media?: ServiceMediaEntity[];
}