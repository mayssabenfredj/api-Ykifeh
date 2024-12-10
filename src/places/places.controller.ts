import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { FilterByTypeDto } from './dto/filter-type.dto';
import { SearchPlaceDto } from './dto/search-place.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseGuards(AuthGuard)
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
    @Headers('authorization') authorization: string,
    @Body() createPlaceDto: CreatePlaceDto,
    @UploadedFiles() photos,
    @Req() request: Request,
  ) {
    const photoPaths = photos.map(
      (photo) => `/uploads/placesImage/${photo.filename}`,
    );

    if (typeof createPlaceDto.daysOfWork === 'string') {
      createPlaceDto.daysOfWork = JSON.parse(createPlaceDto.daysOfWork);
    }
    if (typeof createPlaceDto.hoursOfWork === 'string') {
      createPlaceDto.hoursOfWork = JSON.parse(createPlaceDto.hoursOfWork);
    }
    if (typeof createPlaceDto.tags === 'string') {
      createPlaceDto.tags = JSON.parse(createPlaceDto.tags);
    }
    if (typeof createPlaceDto.type === 'string') {
      createPlaceDto.type = JSON.parse(createPlaceDto.type);
    }
    if (typeof createPlaceDto.restDays === 'string') {
      createPlaceDto.restDays = JSON.parse(createPlaceDto.restDays);
    }

    const annonceCreated = await this.placesService.create(
      createPlaceDto,
      photoPaths,
      request,
    );

    return annonceCreated;
  }
  @Get('status')
  @UseGuards(AuthGuard)
  async findAllByStatus(
    @Headers('authorization') authorization: string,
    @Query('status') status: Boolean,
    @Req() request: Request,
  ) {
    console.log(status);
    return this.placesService.findAllByStatus(status);
  }
  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Headers('authorization') authorization: string,
    @Req() request: Request,
  ) {
    return this.placesService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
    @Req() request: Request,
  ) {
    return this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Req() request: Request,
  ) {
    return this.placesService.remove(request, id);
  }

  @Post('filter-by-types')
  @UseGuards(AuthGuard)
  async filterByTypes(
    @Headers('authorization') authorization: string,

    @Body() filterByTypeDto: FilterByTypeDto,
    @Req() request: Request,
  ) {
    const { types } = filterByTypeDto;
    return this.placesService.filterByTypes(types);
  }

  @Post('search-by-keyword')
  @UseGuards(AuthGuard)
  async searchByKeyword(
    @Headers('authorization') authorization: string,

    @Body() searchPlaceDto: SearchPlaceDto,
    @Req() request: Request,
  ) {
    const { keyword } = searchPlaceDto;
    return this.placesService.searchByKeyword(keyword);
  }
}
