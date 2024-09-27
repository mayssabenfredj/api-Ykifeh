import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';


@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: diskStorage({
        destination: './uploads/placesImage',
        filename: (req, file, cb) => {
          const filename =
            file.originalname.replace(/\s/g, '_') + '_' + uuidv4(); // Remplace les espaces par des underscores
          const extension = file.originalname.split('.').pop();
          cb(null, `${filename}.${extension}`);
        },
      }),
    }),
  )
  async create(
    @Body() createPlaceDto: CreatePlaceDto,
    @UploadedFiles() photos,
  ) {
    // Récupérer les chemins des fichiers uploadés
    const photoPaths = photos.map(
      (photo) => `/uploads/placesImage/${photo.filename}`,
    );

    // Vérifiez si daysOfWork et hoursOfWork sont des objets
    if (typeof createPlaceDto.daysOfWork === 'string') {
      createPlaceDto.daysOfWork = JSON.parse(createPlaceDto.daysOfWork);
    }
    if (typeof createPlaceDto.hoursOfWork === 'string') {
      createPlaceDto.hoursOfWork = JSON.parse(createPlaceDto.hoursOfWork);
    }

    // Appel à la méthode de création de la place dans le service
    const annonceCreated = await this.placesService.create({
      ...createPlaceDto,
      photos: photoPaths, // Utiliser 'photos' pour stocker les chemins d'image
    });

    return annonceCreated;
  }

  @Get()
  findAll() {
    return this.placesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
    return this.placesService.update(+id, updatePlaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placesService.remove(+id);
  }
}
