import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PlacesSchema } from './schema/places.schema';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'signup',
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      {
        name: 'Places',
        schema: PlacesSchema,
      },
    ]),
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
