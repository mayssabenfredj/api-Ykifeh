import { Module } from '@nestjs/common';
import { FavoriesService } from './favories.service';
import { FavoriesController } from './favories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FavorySchema } from './schema/favory.schema';
import { PlacesSchema } from 'src/places/schema/places.schema';
import { UserSchema } from 'src/auth/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Favory',
        schema: FavorySchema,
      },
      {
        name: 'Places',
        schema: PlacesSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [FavoriesController],
  providers: [FavoriesService],
})
export class FavoriesModule {}
