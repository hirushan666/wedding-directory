import { DataSource } from 'typeorm';
import { MyVendorsEntity } from '../entities/myVendors.entity';
import { ServiceEntity } from '../entities/service.entity';

export const MyVendorsRepository = (dataSource: DataSource) =>
  dataSource.getRepository(MyVendorsEntity).extend({

    async findAllMyVendorsByCategory(visitorId: string, category: string) {
      const results = await this.createQueryBuilder('myVendors')
        .innerJoinAndSelect('myVendors.service', 'service')
        .innerJoinAndSelect('service.vendor', 'vendor')
        .where('myVendors.visitor.id = :visitorId', { visitorId })
        .andWhere('service.category = :category', { category })
        .getMany();
      
      return results;
    },

    async findAllMyVendors(visitorId: string) {
      return this.createQueryBuilder('myVendors')
          .innerJoinAndSelect('myVendors.service', 'service')
          .innerJoinAndSelect('service.vendor', 'vendor')
          .where('myVendors.visitor.id = :visitorId', { visitorId })
          .orderBy('myVendors.createdAt', 'DESC')
          .getMany();
    },
  
    async findMyVendorById(visitorId: string, serviceId: string) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId);

      // Query to find a specific service in the visitor's My Vendors list
      const query = this.createQueryBuilder('myVendors')
        .innerJoinAndSelect('myVendors.service', 'service') // Join with the service table
        .where('myVendors.visitor.id = :visitorId', { visitorId }); // Filter by visitor ID

      if (isUuid) {
        query.andWhere('service.id = :serviceId', { serviceId });
      } else {
        query.andWhere('service.slug = :serviceId', { serviceId });
      }

      const myVendor = await query.getOne(); // Retrieve a single matching record
    
      // If no result is found, return null or throw an error
      if (!myVendor) {
        return null;
      }
    
      return myVendor;
    },

    async addToMyVendors(visitorId: string, serviceId: string) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId);
      const service = await this.manager.findOne(ServiceEntity, {
        where: isUuid ? { id: serviceId } : { slug: serviceId },
      });

      if (!service) {
        throw new Error("No service found");
      }

      // Create and save the new myVendors entity
      const myVendors = this.create({
        visitor: { id: visitorId }, // Pass only the visitor's ID
        service: service,
      });

      return this.save(myVendors);
    },

    async removeFromMyVendors(visitorId: string, serviceId: string) {
      const myVendor = await this.findMyVendorById(visitorId, serviceId);
      
      if (!myVendor) {
        throw new Error("MyVendor relationship not found");
      }
    
      await this.delete({ id: myVendor.id });
    
      return myVendor;
    }
  });
