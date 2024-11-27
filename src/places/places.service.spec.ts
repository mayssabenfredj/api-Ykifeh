import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Places } from './schema/places.schema';
import { CreatePlaceDto } from './dto/create-place.dto';

const mockPlacesModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
};

describe('PlacesService', () => {
  let service: PlacesService;
  let placesModel: Model<Places>;
  let createPlaceDto : CreatePlaceDto

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        JwtService,
        MailerService,
        {
          provide: getModelToken(Places.name),
          useValue: mockPlacesModel,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    placesModel = module.get<Model<Places>>(getModelToken(Places.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new place and return a success message', async () => {
const placeData: CreatePlaceDto = {
  title: 'Example Place',
  type: ['Restaurant'], // Exemple de tableau
  tags: ['food', 'family'],
  description: 'A cozy place for dining.',
  address: '123 Main Street',
  daysOfWork: {
    for: 'Monday',
    to: 'Friday',
  },
  restDays: ['Sunday'], // Facultatif
  hoursOfWork: {
    start: '09:00 AM',
    end: '10:00 PM',
  },
  phone: '123-456-7890',
  lienMap: 'https://maps.google.com/example',
};
      const photos = ['photo1.jpg'];
      const request = { user: { id: '12345' } } as any;

      mockPlacesModel.create.mockResolvedValue({
        ...createPlaceDto,
        photos,
        userId: '12345',
      });

      const result = await service.create(createPlaceDto, photos, request);

      expect(result).toEqual({
        message: 'Annonce created, wait for confirmation from Admin.',
      });
      expect(mockPlacesModel.create).toHaveBeenCalledWith({
        ...createPlaceDto,
        photos,
        userId: '12345',
      });
    });
  });

  describe('findAll', () => {
    it('should return all places', async () => {
      const places = [{ title: 'Place 1' }, { title: 'Place 2' }];
      mockPlacesModel.find.mockResolvedValue(places);

      const result = await service.findAll();

      expect(result).toEqual(places);
      expect(mockPlacesModel.find).toHaveBeenCalled();
    });

    it('should return a message if no places are found', async () => {
      mockPlacesModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ message: 'No Places added.' });
    });
  });

  describe('findOne', () => {
    it('should return a place if found', async () => {
      const place = { title: 'Place 1', _id: '12345' };
      mockPlacesModel.findOne.mockResolvedValue(place);

      const result = await service.findOne('12345');

      expect(result).toEqual(place);
      expect(mockPlacesModel.findOne).toHaveBeenCalledWith({ _id: '12345' });
    });

    it('should return a message if place is not found', async () => {
      mockPlacesModel.findOne.mockResolvedValue(null);

      const result = await service.findOne('12345');

      expect(result).toEqual({ message: 'Place not found.' });
    });
  });

  describe('remove', () => {
    it('should delete a place if the user has permission', async () => {
      const request = { user: { id: '12345', role: 'admin' } } as any;
      const place = { _id: '12345', userId: '12345' };
      mockPlacesModel.findById.mockResolvedValue(place);
      mockPlacesModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.remove(request, '12345');

      expect(result).toEqual({ message: 'Place removed.' });
      expect(mockPlacesModel.deleteOne).toHaveBeenCalledWith({ _id: '12345' });
    });

    it('should throw a ForbiddenException if the user does not have permission', async () => {
      const request = { user: { id: '54321', role: 'user' } } as any;
      const place = { _id: '12345', userId: '12345' };
      mockPlacesModel.findById.mockResolvedValue(place);

      await expect(service.remove(request, '12345')).rejects.toThrow(
        'You do not have permission to delete this place',
      );
    });
  });
});
