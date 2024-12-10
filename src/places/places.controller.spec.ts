import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

describe('PlacesController', () => {
  let controller: PlacesController;
  let service: PlacesService;

  const mockPlacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllByStatus: jest.fn(),
    filterByTypes: jest.fn(),
    searchByKeyword: jest.fn(),
    confirmPlace: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: mockPlacesService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: MailerService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
    service = module.get<PlacesService>(PlacesService);
  });

  describe('findAll', () => {
    it('should return an array of places', async () => {
      const result = [{ id: 1, name: 'Place 1' }];
      mockPlacesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('token', {} as Request)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single place', async () => {
      const result = { id: 1, name: 'Place 1' };
      mockPlacesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('token', '1', {} as Request)).toBe(
        result,
      );
    });
  });

  describe('findAllByStatus', () => {
    it('should return places by status', async () => {
      const result = [{ id: 1, name: 'Place 1', isConfirmed: true }];
      mockPlacesService.findAllByStatus.mockResolvedValue(result);

      expect(
        await controller.findAllByStatus('token', true, {} as Request),
      ).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a place', async () => {
      const updateDto = { title: 'Updated Place' };
      const result = { id: 1, ...updateDto };
      mockPlacesService.update.mockResolvedValue(result);

      expect(
        await controller.update('token', '1', updateDto, {} as Request),
      ).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a place', async () => {
      const result = { message: 'Place removed' };
      mockPlacesService.remove.mockResolvedValue(result);

      expect(
        await controller.remove('token', '1', {} as Request, {} as Request),
      ).toBe(result);
    });
  });

  describe('filterByTypes', () => {
    it('should filter places by types', async () => {
      const types = ['restaurant', 'cafe'];
      const result = [
        { id: 1, type: 'restaurant' },
        { id: 2, type: 'cafe' },
      ];
      mockPlacesService.filterByTypes.mockResolvedValue(result);

      expect(
        await controller.filterByTypes('token', { types }, {} as Request),
      ).toBe(result);
    });
  });

  describe('searchByKeyword', () => {
    it('should search places by keyword', async () => {
      const keyword = 'restaurant';
      const result = [{ id: 1, title: 'Best Restaurant' }];
      mockPlacesService.searchByKeyword.mockResolvedValue(result);

      expect(
        await controller.searchByKeyword('token', { keyword }, {} as Request),
      ).toBe(result);
    });
  });
});
