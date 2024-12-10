import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Places } from './schema/places.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schema/user.schema';
import { CustomRequest } from 'src/shared/custom-request';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Places.name)
    private readonly placesModel: Model<Places>,
  ) {}
  async create(
    createPlaceDto: CreatePlaceDto,
    photos: string[],
    request: CustomRequest,
  ) {
    const user = request.user as User;
    console.log(user);
    const placeCreated = await this.placesModel.create({
      ...createPlaceDto,
      photos: photos,
      userId: user.id,
    });

    console.log(photos);

    if (placeCreated) {
      console.log(placeCreated);
      return { message: 'Place created, wait for confirmation from Admin.' };
    } else {
      throw new Error('Error while creating the Place');
    }
  }

  async findAll() {
    const places = await this.placesModel.find();
    if (places.length != 0) {
      return places;
    } else {
      return { message: 'No Places added.' };
    }
  }
  async findAllByStatus(status: Boolean) {
    if (status !== true && status !== false) {
      throw new Error('Invalid status value');
    }
    const places = await this.placesModel.find({ isConfirmed: status });
    if (places.length != 0) {
      return places;
    } else {
      return { message: 'No Places found.' };
    }
  }

  async findOne(id: string) {
    try {
      // Check if the id is a valid MongoDB ObjectId
      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid place ID format.' };
      }

      const place = await this.placesModel.findOne({ _id: id });
      if (place) {
        return place;
      } else {
        return { message: 'Place not found.' };
      }
    } catch (error) {
      return { message: 'Error finding place.' };
    }
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto) {
    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Validate update data
    if (updatePlaceDto.title === '') {
      throw new BadRequestException('Invalid update data');
    }

    // Check if place exists
    const place = await this.placesModel.findById(id);
    if (!place) {
      throw new NotFoundException('Place not found');
    }

    // Perform update
    const updatedPlace = await this.placesModel.findByIdAndUpdate(
      id,
      { $set: updatePlaceDto },
      { new: true },
    );

    return { message: 'Place updated successfully.' };
  }

  async remove(request: CustomRequest, id: string) {
    const user = request.user as User;

    const placeToRemove = await this.placesModel.findById(id);

    if (!placeToRemove) {
      return { message: 'Place not found' };
    }

    if (user.id !== placeToRemove.userId.toString() && user.role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to delete this place',
      );
    }

    const placeRemoved = await this.placesModel.deleteOne({ _id: id });

    if (placeRemoved.deletedCount > 0) {
      return { message: 'Place removed.' };
    } else {
      return { message: 'Place not found' };
    }
  }

  async filterByTypes(types: string[]) {
    if (!types || types.length === 0) {
      return 'No places Found';
    }

    const query: any = {};
    query.type = {
      $in: types.map((type) => new RegExp(type, 'i')),
    };

    const places = await this.placesModel.find(query).exec();

    if (places.length === 0) {
      return 'No places Found';
    }

    return places;
  }

  async searchByKeyword(keyword?: string) {
    const query: any = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { type: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
      ];
    }
    const places = await this.placesModel.find(query).exec();
    if (places.length === 0) {
      return 'No places Found';
    }
    return places;
  }

  async confirmPlace(request: CustomRequest, placeId: string) {
    if (request.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can confirm places');
    }

    const place = await this.placesModel.findById(placeId);
    if (!place) {
      throw new NotFoundException('Place not found');
    }

    await this.placesModel.findByIdAndUpdate(
      placeId,
      { isConfirmed: true },
      { new: true },
    );

    return { message: 'Place confirmed successfully.' };
  }
}
