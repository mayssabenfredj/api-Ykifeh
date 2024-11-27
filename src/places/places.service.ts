import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Places } from './schema/places.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { verifyAdmin } from 'src/shared/shared.service';
import { Request } from 'express';
import { User } from 'src/auth/schema/user.schema';
import { CustomRequest } from 'src/shared/custom-request';

@Injectable()
export class PlacesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
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
    const annonceCreated = await this.placesModel.create({
      ...createPlaceDto,
      photos: photos,
      userId: user.id,
    });

    if (annonceCreated) {
      return { message: 'Annonce created, wait for confirmation from Admin.' };
    } else {
      throw new Error('Error while creating the Announce');
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
    const places = await this.placesModel.find({ isConfirmed: status });
    if (places.length != 0) {
      return places;
    } else {
      return { message: 'No Places found.' };
    }
  }

  async findOne(id: string) {
    const place = await this.placesModel.findOne({ _id: id });
    if (place) {
      return place;
    } else {
      return { message: 'Place not found.' };
    }
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto) {
    const updatedPlace = await this.placesModel
      .findByIdAndUpdate(id, { $set: updatePlaceDto }, { new: true })
      .exec();

    if (!updatedPlace) {
      throw new NotFoundException(`Place  not found`);
    }

    return updatedPlace;
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
    const query: any = {};

    if (types && types.length > 0) {
      query.type = {
        $in: types.map((type) => new RegExp(type, 'i')),
      };

      const places = await this.placesModel.find(query).exec();

      if (places.length === 0) {
        return 'No places Found';
      }

      return places;
    }
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
    const places = this.placesModel.find(query).exec();
    if ((await places).length === 0) {
      return 'No places Found ';
    }
    return places;
  }
}
