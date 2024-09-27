import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Req,
  UseInterceptors,
  Res,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from './users.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdatePasswordDto } from './dto/update-password-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  
@Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
   @Get('profileImage/:imageName')
  findProfilImage(@Res() res, @Param('imageName') imageName: string) {
    return this.usersService.findProfilImage(res, imageName);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profileImage',
        filename: (req, file, cb) => {
          const filename = file.originalname + uuidv4();
          const extension = file.originalname.split('.').pop();
          cb(null, `${filename}.${extension}`);
        },
      }),
    }),
  )
  update(
    @Headers('token') token: string,
    @Param('id') id: string,
    @Body() updateAuthDto: UpdateAuthDto,
    @UploadedFile() file,
    @Req() req,
  ) {
    return this.usersService.update(token, updateAuthDto, file?.filename);
  }

 
  @Delete('delete')
  remove(@Headers('token') token: string) {
    return this.usersService.remove(token);
  }

  @Patch('updatePassword')
  updatePassword(
    @Headers('token') token: string,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(token, updatePassword);
  }

  
}
