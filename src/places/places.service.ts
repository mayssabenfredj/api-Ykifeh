import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Places } from './schema/places.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlacesService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailerService,
    @InjectModel(Places.name)
    private placesModel: Model<Places>,
  ) {}
  async create(createPlaceDto: CreatePlaceDto & { photos: string[] }) {
    // Créer un nouvel enregistrement pour le lieu
    const annonceCreated = await this.placesModel.create({
      ...createPlaceDto,
    });

    if (annonceCreated) {
      return { message: 'Annonce created, wait for confirmation from Admin.' };
    } else {
      throw new Error('Error while creating the Announce');
    }
  }

  findAll() {
    return `This action returns all places`;
  }

  findOne(id: number) {
    return `This action returns a #${id} place`;
  }

  update(id: number, updatePlaceDto: UpdatePlaceDto) {
    return `This action updates a #${id} place`;
  }

  remove(id: number) {
    return `This action removes a #${id} place`;
  }
}
