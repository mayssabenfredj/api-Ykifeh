import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFavoryDto } from './dto/create-favory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Favory } from './schema/favory.schema';
import { Model, Types } from 'mongoose';
import { Places } from 'src/places/schema/places.schema';
import { CustomRequest } from 'src/shared/custom-request';
import { User } from 'src/auth/schema/user.schema';

@Injectable()
export class FavoriesService {
  constructor(
    @InjectModel(Favory.name)
    private favoryModel: Model<Favory>,
    @InjectModel(Places.name)
    private placeModel: Model<Places>,
  ) {}
  async create(createFavoryDto: CreateFavoryDto, request: CustomRequest) {
    const user = request.user as User;
    const favoryCreated = await this.favoryModel.create({
      ...createFavoryDto,
      userId: user.id,
    });
    if (!favoryCreated) {
      throw new BadRequestException('Place Not Added to fravory  ');
    }
    return { message: 'Place Add To Favory ' };
  }

  async findAll(request: CustomRequest) {
    const user = request.user as User;
    const favories = await this.favoryModel.find({ userId: user.id });
    const places = await Promise.all(
      favories.map(async (favory) => {
        const place = await this.placeModel.findById(favory.placeId);
        return place;
      }),
    );
    return places;
  }

  async remove(id: string) {
    // Vérifiez si l'id est valide
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Trouver et supprimer le favori par son ID
    const favoryDeleted = await this.favoryModel.findByIdAndDelete(id);
    

    return favoryDeleted ;
  }
}
