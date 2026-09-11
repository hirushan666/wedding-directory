import { Test, TestingModule } from '@nestjs/testing';
import { VendorService } from 'src/modules/vendor/vendor.service';
import { VendorEntity } from 'src/database/entities/vendor.entity';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { CreateVendorInput } from 'src/graphql/inputs/createVendor.input';
import * as bcrypt from 'bcryptjs';

// Mock the vendor repository
const mockVendorRepository = {
  findAllVendors: jest.fn(),
  findVendorById: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  extend: jest.fn().mockReturnThis(),
};

// Utility function to create a VendorEntity for testing
const createVendor = (): VendorEntity => ({
  id: '',
  fname: '',
  email: '',
  password: '',
  lname: '',
  about: '',
  location: '',
  city: '',
  busname: '',
  phone: '',
  profile_pic_url: '',
  createdAt: undefined,
  updatedAt: undefined,
  offering: [],
  payments: [],
});

describe('VendorService', () => {
  let service: VendorService;
  let dataSourceMock: Partial<DataSource>;
  let httpServiceMock: Partial<HttpService>;

  // Modular setup function for creating the test module
  const createTestingModule = async (): Promise<TestingModule> => {
    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(mockVendorRepository),
    };

    httpServiceMock = {
      request: jest.fn(),
    };

    return await Test.createTestingModule({
      providers: [
        VendorService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();
  };

  beforeEach(async () => {
    const module = await createTestingModule();
    service = module.get<VendorService>(VendorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllVendors', () => {
    it('should return all vendors', async () => {
      const vendors: VendorEntity[] = [createVendor(), createVendor()];

      mockVendorRepository.findAllVendors.mockResolvedValue(vendors);

      const result = await service.findAllVendors();
      expect(result).toEqual(vendors);
      expect(mockVendorRepository.findAllVendors).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository throws an error', async () => {
      mockVendorRepository.findAllVendors.mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.findAllVendors()).rejects.toThrow(
        'Repository error',
      );
      expect(mockVendorRepository.findAllVendors).toHaveBeenCalledTimes(1);
    });
  });

  describe('findVendorById', () => {
    it('should return a vendor entity when the id is valid', async () => {
      const id = '123';
      const vendor = createVendor();

      mockVendorRepository.findVendorById.mockResolvedValue(vendor);

      const result = await service.findVendorById(id);
      expect(result).toBe(vendor);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(id);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledTimes(1);
    });

    it('should return null when the id is not found', async () => {
      const id = '123';

      mockVendorRepository.findVendorById.mockResolvedValue(null);

      const result = await service.findVendorById(id);
      expect(result).toBeNull();
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(id);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledTimes(1);
    });

    it('should throw an error for invalid id input', async () => {
      const invalidIds = [undefined, null, ''];

      expect.assertions(invalidIds.length);
      for (const id of invalidIds) {
        await expect(service.findVendorById(id)).rejects.toThrow('Invalid ID');
      }
    });

    it('should handle repository errors gracefully', async () => {
      const id = '123';
      mockVendorRepository.findVendorById.mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.findVendorById(id)).rejects.toThrow(
        'Repository error',
      );
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(id);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteVendorById', () => {
    it('should delete vendor successfully', async () => {
      const id = '123';
      const vendor = createVendor();
      mockVendorRepository.findVendorById.mockResolvedValue(vendor);
      mockVendorRepository.remove.mockResolvedValue(undefined);
      await service.deleteVendor(id);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(id);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledTimes(1);
      expect(mockVendorRepository.remove).toHaveBeenCalledTimes(1);
      expect(mockVendorRepository.remove).toHaveBeenCalledWith(vendor);
    });

    it('should throw error if vendor does not exist', async () => {
      const id = '123';
      mockVendorRepository.findVendorById.mockResolvedValue(null);
      await expect(service.deleteVendor(id)).rejects.toThrow(
        'Vendor not found',
      );

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(id);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledTimes(1);
    });

    it('should throw error if invalid ID input', async () => {
      const invalidIds = [undefined, null, ''];

      expect.assertions(invalidIds.length);
      for (const id of invalidIds) {
        await expect(service.deleteVendor(id)).rejects.toThrow('Invalid ID');
      }
    });
  });

  describe('createVendor', () => {
    it('should create a new vendor', async () => {
      const createVendorInput: CreateVendorInput = {
        fname: 'John',
        lname: 'Doe',
        email: 'new.email@example.com',
        password: 'password123',
        busname: 'ABC Corp.',
        phone: '555-1234',
        city: 'New York',
        location: '123 Main St',
      };

      const hashedPassword = 'hashed_password123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const savedVendor = {
        ...createVendorInput,
        password: hashedPassword,
        id: '123',
      };
      mockVendorRepository.findOne.mockResolvedValue(null); // Simulate no existing vendor
      mockVendorRepository.create.mockReturnValue(savedVendor);
      mockVendorRepository.save.mockResolvedValue(savedVendor);

      const result = await service.createVendor(createVendorInput);

      expect(bcrypt.hash).toHaveBeenCalledWith(createVendorInput.password, 12);
      expect(mockVendorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createVendorInput.email },
      });
      expect(mockVendorRepository.create).toHaveBeenCalledWith({
        ...createVendorInput,
        password: hashedPassword,
      });
      expect(mockVendorRepository.save).toHaveBeenCalledWith(savedVendor);
      expect(result).toEqual(savedVendor);
    });

    it('should throw an error if the email already exists', async () => {
      const createVendorInput: CreateVendorInput = {
        fname: 'John',
        lname: 'Doe',
        email: 'existing.email@example.com',
        password: 'password123',
        busname: 'ABC Corp.',
        phone: '555-1234',
        city: 'New York',
        location: '123 Main St',
      };

      mockVendorRepository.findOne.mockResolvedValue(createVendorInput); // Simulate existing vendor with the same email

      await expect(service.createVendor(createVendorInput)).rejects.toThrow(
        'Email already exists',
      );
      expect(mockVendorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createVendorInput.email },
      });
    });

    it('should handle repository errors gracefully', async () => {
      const createVendorInput: CreateVendorInput = {
        fname: 'John',
        lname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        busname: 'ABC Corp.',
        phone: '555-1234',
        city: 'New York',
        location: '123 Main St',
      };

      mockVendorRepository.findOne.mockResolvedValue(null);
      mockVendorRepository.save.mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(service.createVendor(createVendorInput)).rejects.toThrow(
        'Repository error',
      );
      expect(mockVendorRepository.save).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });

  describe('updateVendor', () => {
    it('should update vendor profile fields without touching password', async () => {
      const vendorId = 'vendor-123';
      const updateInput = { fname: 'Updated', busname: 'Updated Co' };
      const updatedVendor = { ...createVendor(), id: vendorId, ...updateInput };

      mockVendorRepository.update.mockResolvedValue({ affected: 1 });
      mockVendorRepository.findOne.mockResolvedValue(updatedVendor);

      const result = await service.updateVendor(vendorId, updateInput);

      expect(mockVendorRepository.update).toHaveBeenCalledWith(vendorId, updateInput);
      expect(result).toEqual(updatedVendor);
    });

    it('should throw BadRequestException if password is provided without currentPassword', async () => {
      const vendorId = 'vendor-123';
      const updateInput = { password: 'newPassword123' };

      await expect(service.updateVendor(vendorId, updateInput)).rejects.toThrow(
        'Current password is required to change password',
      );
    });

    it('should throw NotFoundException if vendor is not found when updating password', async () => {
      const vendorId = 'vendor-123';
      const updateInput = {
        password: 'newPassword123',
        currentPassword: 'oldPassword123',
      };

      mockVendorRepository.findOne.mockResolvedValue(null);

      await expect(service.updateVendor(vendorId, updateInput)).rejects.toThrow(
        'Vendor not found',
      );
    });

    it('should throw BadRequestException if currentPassword does not match', async () => {
      const vendorId = 'vendor-123';
      const updateInput = {
        password: 'newPassword123',
        currentPassword: 'wrongPassword',
      };
      const existingVendor = {
        ...createVendor(),
        id: vendorId,
        password: 'hashedOldPassword',
      };

      mockVendorRepository.findOne.mockResolvedValue(existingVendor);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.updateVendor(vendorId, updateInput)).rejects.toThrow(
        'Current password is incorrect',
      );
    });

    it('should update password and delete currentPassword before saving when currentPassword is correct', async () => {
      const vendorId = 'vendor-123';
      const updateInput = {
        password: 'newPassword123',
        currentPassword: 'correctPassword',
      };
      const existingVendor = {
        ...createVendor(),
        id: vendorId,
        password: 'hashedOldPassword',
      };

      mockVendorRepository.findOne
        .mockResolvedValueOnce(existingVendor)
        .mockResolvedValueOnce({
          ...existingVendor,
          password: 'hashedNewPassword',
        });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedNewPassword');
      mockVendorRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateVendor(vendorId, updateInput);

      expect(updateInput.currentPassword).toBeUndefined();
      expect(mockVendorRepository.update).toHaveBeenCalledWith(
        vendorId,
        expect.objectContaining({ password: 'hashedNewPassword' }),
      );
      expect(result.password).toEqual('hashedNewPassword');
    });
  });
});
