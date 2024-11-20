import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    @InjectModel(Places.name)
    private readonly placesModel: Model<Places>,
  ) {}

  async create(
    createPlaceDto: CreatePlaceDto & { photos: string[] },
  ): Promise<{ message: string }> {
    const place = await this.placesModel.create({
      ...createPlaceDto,
      isConfirmed: false,
    });

    if (!place) {
      throw new Error('Failed to create place');
    }

    await this.notifyAdminAboutNewPlace(place);

    return {
      message: 'Place created successfully. Awaiting admin confirmation.',
    };
  }

  private async notifyAdminAboutNewPlace(place: Places): Promise<void> {
    await this.mailService.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Place Submission',
      html: `
        <h1>New Place Submission</h1>
        <p>A new place "${place.title}" has been submitted and needs review.</p>
        <p>Type: ${place.type}</p>
        <p>Address: ${place.address}</p>
      `,
    });
  }

  async findAll(): Promise<Places[]> {
    return this.placesModel
      .find({ isConfirmed: true })
      .populate('userId', 'fullName email')
      .exec();
  }

  async findOne(id: string): Promise<Places> {
    const place = await this.placesModel
      .findById(id)
      .populate('userId', 'fullName email')
      .exec();

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    return place;
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto): Promise<Places> {
    const updatedPlace = await this.placesModel.findByIdAndUpdate(
      id,
      { $set: updatePlaceDto },
      { new: true },
    );

    if (!updatedPlace) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    return updatedPlace;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedPlace = await this.placesModel.findByIdAndDelete(id);

    if (!deletedPlace) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    // TODO: Implement photo deletion logic
    // if (deletedPlace.photos?.length) {
    //   await this.deletePhotos(deletedPlace.photos);
    // }

    return { message: 'Place deleted successfully' };
  }
}
