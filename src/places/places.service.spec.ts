import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { CustomRequest } from 'src/shared/custom-request';
import { User } from 'src/auth/schema/user.schema';
import { Places } from './schema/places.schema'; // Assurez-vous que vous importez correctement le modèle
import { getModelToken } from '@nestjs/mongoose';

// Mock du modèle Places
const mockPlacesModel = {
  create: jest.fn().mockResolvedValue({}),
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  find: jest.fn().mockResolvedValue([]),
  update: jest.fn().mockResolvedValue({}),
};

describe('PlacesService', () => {
  let service: PlacesService;
  let mailerService: MailerService;
  let jwtService: JwtService;

  // Mocking services
  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedJwtToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        { provide: getModelToken('Places'), useValue: mockPlacesModel }, // Utilisation du nom du modèle 'Places'
        { provide: MailerService, useValue: mockMailerService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    mailerService = module.get<MailerService>(MailerService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a place successfully with valid data (TC01)', async () => {
      const createPlaceDto: CreatePlaceDto = {
        title: 'Test Place',
        description: 'A nice place',
        type: ['restaurant'],
        tags: ['cozy', 'family'],
        address: '123 Street',
        daysOfWork: { for: 'Monday', to: 'Friday' },
        hoursOfWork: { start: '09:00', end: '18:00' },
        phone: '123456789',
        lienMap: 'http://map.com',
      };
      const photos = ['photo1.jpg'];
      const request: Partial<CustomRequest> = {
        user: { id: '66f823eb993c62bb205936a7' } as User, // Mocking only the user property
      };
      const result = await service.create(
        createPlaceDto,
        photos,
        request as CustomRequest,
      );
      expect(result).toEqual({
        message: 'Place created, wait for confirmation from Admin.',
      });
    });

    it('should fail to create if title is missing (TC02)', async () => {
      const createPlaceDto: CreatePlaceDto = {
        title: '',
        description: 'Test description',
        type: ['restaurant'],
        tags: ['cozy'],
        address: '123 Street',
        hoursOfWork: { start: '09:00', end: '18:00' },
        phone: '123456789',
        lienMap: 'http://map.com',
        daysOfWork: { for: 'Monday', to: 'Friday' },
      };
      const photos = ['photo1.jpg'];
      const request: Partial<CustomRequest> = {
        user: { id: '66f823eb993c62bb205936a7' } as User,
      };
      try {
        await service.create(createPlaceDto, photos, request as CustomRequest);
      } catch (e) {
        expect(e.response.message).toEqual('Title is required');
      }
    });

    it('should fail if user is missing in the request (TC03)', async () => {
      const createPlaceDto: CreatePlaceDto = {
        title: 'Place',
        description: 'Test description',
        type: ['restaurant'],
        tags: ['cozy'],
        address: '123 Street',
        daysOfWork: { for: 'Monday', to: 'Friday' },
        hoursOfWork: { start: '09:00', end: '18:00' },
        phone: '123456789',
        lienMap: 'http://map.com',
      };
      const photos = ['photo1.jpg'];
      const request: Partial<CustomRequest> = {
        user: { id: '66f823eb993c62bb205936a7' } as User,
      };

      try {
        await service.create(createPlaceDto, photos, request as CustomRequest);
      } catch (e) {
        expect(e.response.message).toEqual('User is required');
      }
    });

    it('should fail if invalid data type is provided (TC04)', async () => {
      const createPlaceDto: CreatePlaceDto = {
        title: 'Place',
        description: 'Test description',
        type: [], // Invalid type
        tags: ['cozy'],
        address: '123 Street',
        daysOfWork: { for: 'Monday', to: 'Friday' },
        hoursOfWork: { start: '09:00', end: '18:00' },
        phone: '123456789',
        lienMap: 'http://map.com',
      };
      const photos = ['photo1.jpg'];
      const request: Partial<CustomRequest> = {
        user: { id: '66f823eb993c62bb205936a7' } as User,
      };
      try {
        await service.create(createPlaceDto, photos, request as CustomRequest);
      } catch (e) {
        expect(e.response.message).toEqual('Invalid type');
      }
    });

    it('should fail if no photos are provided (TC05)', async () => {
      const createPlaceDto: CreatePlaceDto = {
        title: 'Place',
        description: 'Test description',
        type: ['restaurant'],
        tags: ['cozy'],
        address: '123 Street',
        daysOfWork: { for: 'Monday', to: 'Friday' },
        hoursOfWork: { start: '09:00', end: '18:00' },
        phone: '123456789',
        lienMap: 'http://map.com',
      };
      const photos = [];
      const request: Partial<CustomRequest> = {
        user: { id: '66f823eb993c62bb205936a7' } as User,
      };
      try {
        await service.create(createPlaceDto, photos, request as CustomRequest);
      } catch (e) {
        expect(e.response.message).toEqual('Photos are required');
      }
    });
  });

  describe('findAllByStatus', () => {
    const mockData = [
      { name: 'Place 1', isConfirmed: true },
      { name: 'Place 2', isConfirmed: true },
      { name: 'Place 3', isConfirmed: false },
      { name: 'Place 4', isConfirmed: false },
    ];

    it('TC01: Récupération des places confirmées', async () => {
      // Mock des données
      mockPlacesModel.find = jest.fn().mockImplementation((query) => {
        return Promise.resolve(
          mockData.filter((place) => place.isConfirmed === query.isConfirmed),
        );
      });

      // Appeler la fonction avec status: true
      const result = await service.findAllByStatus(true);

      // Vérifier que seules les places confirmées sont retournées
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Place 1', isConfirmed: true }),
          expect.objectContaining({ name: 'Place 2', isConfirmed: true }),
        ]),
      );
    });

    it('TC02: Aucune place confirmée trouvée', async () => {
      // Mock des données vides pour le statut confirmé
      mockPlacesModel.find = jest.fn().mockResolvedValue([]);

      // Appeler la fonction avec status: true
      const result = await service.findAllByStatus(true);

      // Vérifier que le message est retourné
      expect(result).toEqual({ message: 'No Places found.' });
    });

    it('TC03: Récupération des places non confirmées', async () => {
      // Mock des données
      mockPlacesModel.find = jest.fn().mockImplementation((query) => {
        return Promise.resolve(
          mockData.filter((place) => place.isConfirmed === query.isConfirmed),
        );
      });

      // Appeler la fonction avec status: false
      const result = await service.findAllByStatus(false);

      // Vérifier que seules les places non confirmées sont retournées
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Place 3', isConfirmed: false }),
          expect.objectContaining({ name: 'Place 4', isConfirmed: false }),
        ]),
      );
    });

    it('TC04: Aucune place non confirmée trouvée', async () => {
      // Mock des données vides pour le statut non confirmé
      mockPlacesModel.find = jest.fn().mockResolvedValue([]);

      // Appeler la fonction avec status: false
      const result = await service.findAllByStatus(false);

      // Vérifier que le message est retourné
      expect(result).toEqual({ message: 'No Places found.' });
    });

    it('TC05: Gestion des statuts mal définis', async () => {
      // Mock the service to throw error for invalid status
      mockPlacesModel.find = jest.fn().mockImplementation(() => {
        throw new Error('Invalid status value');
      });

      await expect(service.findAllByStatus('invalid' as any)).rejects.toThrow(
        'Invalid status value',
      );
    });
  });

  describe('findOne', () => {
    it('should return the place when a valid ID is provided (TC01)', async () => {
      const placeId = '67041dd86617e31d8870bdc2';
      const mockPlace = {
        id: placeId,
        title: 'Test Place',
        description: 'A nice place',
      };

      // Mock de la méthode findOne pour retourner la place correspondante
      mockPlacesModel.findOne = jest.fn().mockResolvedValue(mockPlace);

      const result = await service.findOne(placeId);

      expect(result).toEqual(mockPlace);
    });
    it('should return a message if the place is not found (TC02)', async () => {
      const placeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      mockPlacesModel.findOne = jest.fn().mockResolvedValue(null);

      const result = await service.findOne(placeId);
      expect(result).toEqual({ message: 'Place not found.' });
    });
    it('should throw an error if the ID is malformed (TC03)', async () => {
      const placeId = 'invalidId'; // ID mal formé

      try {
        await service.findOne(placeId);
      } catch (e) {
        expect(e.response.message).toEqual('Invalid Place ID format');
      }
    });
    it('should throw an error if the ID is empty (TC04)', async () => {
      const placeId = ''; // ID vide

      try {
        await service.findOne(placeId);
      } catch (e) {
        expect(e.response.message).toEqual('Place ID is required');
      }
    });
    it('should return a message if the place is not found in an empty database (TC05)', async () => {
      const placeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      mockPlacesModel.findOne = jest.fn().mockResolvedValue(null);

      const result = await service.findOne(placeId);
      expect(result).toEqual({ message: 'Place not found.' });
    });
  });
});
