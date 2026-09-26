import { DataSource } from 'typeorm';
import { VendorEntity } from '../entities/vendor.entity';
import { ServiceRepositoryType } from 'src/database/types/serviceTypes';
import { ServiceEntity } from '../entities/service.entity';

// Use the DataSource to get the base repository and extend it
export const ServiceRepository = (dataSource: DataSource): ServiceRepositoryType =>
  dataSource.getRepository(ServiceEntity).extend({

    async createService(
      createServiceInput: Partial<ServiceEntity>,
      vendor: VendorEntity,
    ): Promise<ServiceEntity> {
      const service = this.create({
        ...createServiceInput,
        vendor,
      });
      return this.save(service);
    },

    async updateService(
      id: string,
      updateServiceInput: Partial<ServiceEntity>,
    ): Promise<ServiceEntity> {
      const service = await this.findOne({ where: { id } });
      if (!service) {
        throw new Error('Service not found');
      }
      return this.save({
        ...service,
        ...updateServiceInput
      });
    },

    async deleteService(id: string): Promise<boolean> {
      const result = await this.delete({ id });
      return result.affected > 0;
    },

    async findServiceById(id: string): Promise<ServiceEntity> {
      const service = await this.findOne({ 
        relations: ['vendor', 'media'], 
        where: { id } 
      });
      if (service && service.media && service.media.length > 0) {
        const photos = service.media
          .filter(m => m.mediaType === 'photo')
          .sort((a, b) => a.slotIndex - b.slotIndex)
          .map(m => m.url);
        const videos = service.media
          .filter(m => m.mediaType === 'video')
          .sort((a, b) => a.slotIndex - b.slotIndex)
          .map(m => m.url);
        if (photos.length > 0) service.photo_showcase = photos;
        if (videos.length > 0) service.video_showcase = videos;
      }
      return service;
    },

    async findServicesByFilters(category?: string, city?: string): Promise<ServiceEntity[]> {
      const query = this.createQueryBuilder('service')
        .leftJoinAndSelect('service.vendor', 'vendor') // Join with vendor
        .andWhere('service.visible = :visible', { visible: true }); // Only public offerings

      if (category && category.trim()) {
        query.andWhere(
          '(LOWER(TRIM(service.category)) = LOWER(TRIM(:category)) OR service.category ILIKE :catPattern)',
          {
            category: category.trim(),
            catPattern: `%${category.trim()}%`,
          }
        );
      }

      if (city && city.trim()) {
        query.andWhere(
          '(LOWER(TRIM(COALESCE(NULLIF(service.city, \'\'), vendor.city))) = LOWER(TRIM(:city)) OR COALESCE(NULLIF(service.city, \'\'), vendor.city) ILIKE :cityPattern)',
          {
            city: city.trim(),
            cityPattern: `%${city.trim()}%`,
          }
        );
      }

      return query.getMany();
    },

    async findServicesByVendor(id: string): Promise<ServiceEntity[]> {
      return this.createQueryBuilder('service')
        .leftJoinAndSelect('service.vendor', 'vendor') // Include vendor details
        .where('vendor.id = :id', { id })
        .getMany();
    }
  });
