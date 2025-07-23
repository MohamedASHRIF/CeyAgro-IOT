

// // // hari eka
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from './schema/user.schema';
// import { UpdateUserDto } from './dto/user.dto';
// import * as path from 'path';
// import * as fs from 'fs';
// import * as uuid from 'uuid';

// @Injectable()
// export class UserService {
//   private uploadsDir: string;

//   constructor(@InjectModel(User.name) private userModel: Model<User>) {
//     // Fix: Use process.cwd() to get the project root directory
//     this.uploadsDir = path.join(process.cwd(), 'uploads');

//     console.log(' Uploads directory path:', this.uploadsDir);

//     // Ensure uploads directory exists
//     if (!fs.existsSync(this.uploadsDir)) {
//       fs.mkdirSync(this.uploadsDir, { recursive: true });
//       console.log('✅ Created uploads directory:', this.uploadsDir);
//     } else {
//       console.log('✅ Uploads directory already exists:', this.uploadsDir);
//     }
//   }

//   // ==================== PROFILE MANAGEMENT METHODS ====================

//   async getProfile(email: string): Promise<Partial<User>> {
//     const user = await this.userModel
//       .findOne({ email })
//       .select('name email nic gender telephone address picture -_id')
//       .exec();
//     if (!user) throw new NotFoundException('User not found');
//     return user;
//   }

//   async updateProfile(
//     email: string,
//     updateUserDto: UpdateUserDto,
//     picture?: Express.Multer.File,
//     removePicture?: string,
//   ): Promise<User> {
//     const user = await this.userModel.findOne({ email });
//     if (!user) throw new NotFoundException('User not found');

//     console.log(' Update DTO received:', updateUserDto);
//     console.log(' Email:', email);
//     console.log(' Current user name:', user.name);
//     console.log(' Remove picture flag:', removePicture);

//     // Handle picture removal FIRST
//     if (removePicture === 'true') {
//       console.log(' Removing existing picture...');

//       // Delete the old picture file if it exists
//       if (user.picture && user.picture.startsWith('/uploads/')) {
//         const fileName = user.picture.replace('/uploads/', '');
//         const oldFilePath = path.join(this.uploadsDir, fileName);
//         if (fs.existsSync(oldFilePath)) {
//           try {
//             fs.unlinkSync(oldFilePath);
//             console.log(' Old picture file deleted:', oldFilePath);
//           } catch (error) {
//             console.error('❌ Error deleting old picture file:', error);
//           }
//         }
//       }

//       // Clear the picture field
//       user.picture = null;
//       console.log('✅ Picture removed from user profile');
//     }

//     // Handle new picture upload (only if not removing)
//     if (picture && removePicture !== 'true') {
//       console.log(' Uploading new picture...');
//       console.log(' Picture buffer size:', picture.buffer.length);
//       console.log(' Picture original name:', picture.originalname);

//       // Delete old picture file if it exists
//       if (user.picture && user.picture.startsWith('/uploads/')) {
//         const fileName = user.picture.replace('/uploads/', '');
//         const oldFilePath = path.join(this.uploadsDir, fileName);
//         if (fs.existsSync(oldFilePath)) {
//           try {
//             fs.unlinkSync(oldFilePath);
//             console.log(' Old picture file replaced:', oldFilePath);
//           } catch (error) {
//             console.error('❌ Error deleting old picture file:', error);
//           }
//         }
//       }

//       // Generate unique filename
//       const fileName = `${uuid.v4()}${path.extname(picture.originalname)}`;
//       const filePath = path.join(this.uploadsDir, fileName);

//       console.log('💾 Saving picture to:', filePath);

//       try {
//         // Ensure the uploads directory still exists
//         if (!fs.existsSync(this.uploadsDir)) {
//           fs.mkdirSync(this.uploadsDir, { recursive: true });
//           console.log('✅ Re-created uploads directory:', this.uploadsDir);
//         }

//         fs.writeFileSync(filePath, picture.buffer);
//         user.picture = `/uploads/${fileName}`;
//         console.log('✅ New picture uploaded successfully:', fileName);
//         console.log('✅ File saved at:', filePath);
//         console.log('✅ File exists check:', fs.existsSync(filePath));

//         // Log file stats for debugging
//         const stats = fs.statSync(filePath);
//         console.log('File size:', stats.size, 'bytes');
//       } catch (error) {
//         console.error('❌ Error saving new picture:', error);
//         console.error('❌ Upload directory:', this.uploadsDir);
//         console.error('❌ File path:', filePath);
//         throw new Error(`Failed to save picture: ${error.message}`);
//       }
//     }

//     // Update other fields only if provided and not empty
//     if (updateUserDto.name !== undefined) {
//       console.log(' Name update requested:', `"${updateUserDto.name}"`);
//       console.log(' Name after trim:', `"${updateUserDto.name.trim()}"`);
//       console.log(
//         ' Is name empty after trim?',
//         updateUserDto.name.trim() === '',
//       );

//       if (updateUserDto.name.trim() !== '') {
//         console.log('✅ Setting new name:', updateUserDto.name);
//         user.name = updateUserDto.name;
//       } else if (!user.name) {
//         console.log(' Setting default name from email');
//         user.name = user.email.split('@')[0];
//       } else {
//         console.log(' Keeping existing name:', user.name);
//       }
//     }

//     console.log(' Final name before save:', user.name);
//     console.log(' Final picture before save:', user.picture);

//     if (updateUserDto.nic !== undefined) user.nic = updateUserDto.nic;
//     if (updateUserDto.gender !== undefined) user.gender = updateUserDto.gender;
//     if (updateUserDto.telephone !== undefined)
//       user.telephone = updateUserDto.telephone;
//     if (updateUserDto.address !== undefined)
//       user.address = updateUserDto.address;

//     // Update the updated_at timestamp
//     user.updated_at = new Date();

//     const savedUser = await user.save();
//     console.log('✅ User saved with name:', savedUser.name);
//     console.log('✅ User saved with picture:', savedUser.picture);
//     return savedUser;
//   }

//   async getProfileShort(email: string) {
//     const user = await this.userModel.findOne({ email });
//     if (!user) throw new NotFoundException('User not found');
//     return {
//       name: user.name,
//       picture: user.picture,
//     };
//   }

// // hari eka
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/user.dto';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

function getCloudinaryPublicId(url: string): string | null {
  // Example: https://res.cloudinary.com/dj5086rhp/image/upload/v1234567890/user-imgs/filename.png
  // We want: user-imgs/filename (without extension)
  const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async getProfile(email: string): Promise<Partial<User>> {
    const user = await this.userModel
      .findOne({ email })
      .select('name email nic gender telephone address picture -_id')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
async updateProfile(
  email: string,
  updateUserDto: UpdateUserDto,
  picture?: Express.Multer.File,
  removePicture?: string,
): Promise<User> {
  try {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    // Helper to delete old image from Cloudinary
    const deleteOldImage = async () => {
      if (user.picture && user.picture.startsWith('http')) {
        const publicId = getCloudinaryPublicId(user.picture);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log('Deleted old image from Cloudinary:', publicId);
          } catch (err) {
            console.error('Error deleting old image from Cloudinary:', err);
          }
        }
      }
    };

    // Remove picture from Cloudinary if requested
    if (removePicture === 'true') {
      await deleteOldImage();
      user.picture = null;
    }

    // Upload new picture to Cloudinary (and delete old one)
    if (picture && removePicture !== 'true') {
      await deleteOldImage();
      const url = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'user-imgs' },
          (error, result) => {
            if (error || !result) {
              console.error('Cloudinary upload error:', error);
              return reject(error || new Error('No result from Cloudinary'));
            }
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(picture.buffer).pipe(uploadStream);
      });
      user.picture = url;
    }

    if (updateUserDto.name !== undefined && updateUserDto.name.trim() !== '') {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.nic !== undefined) user.nic = updateUserDto.nic;
    if (updateUserDto.gender !== undefined) user.gender = updateUserDto.gender;
    if (updateUserDto.telephone !== undefined) user.telephone = updateUserDto.telephone;
    if (updateUserDto.address !== undefined) user.address = updateUserDto.address;

    user.updated_at = new Date();

    return await user.save();
  } catch (err) {
    console.error('updateProfile error:', err);
    throw err;
  }
}

  async getProfileShort(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    return {
      name: user.name,
      picture: user.picture,
    };
  }


  // ==================== AUTH0 & USER MANAGEMENT METHODS ====================

  async getUserByEmail(email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      const user = await this.userModel
        .findOne({ email: normalizedEmail })
        .exec();
      if (!user) {
        throw new Error(`User with email ${normalizedEmail} not found`);
      }
      return user;
    } catch (error) {
      console.error(
        `Error getting user by email ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Error getting user: ${error.message}`);
    }
  }

  async updateUserByEmail(
    email: string,
    updateDto: Partial<User>,
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { email: normalizedEmail },
          { $set: { ...updateDto, updated_at: new Date() } },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new Error(`Failed to update user for ${normalizedEmail}`);
      }

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${normalizedEmail}: ${error.message}`);
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async findOrCreateUser(email: string, name: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      console.log(`Finding user for email: ${normalizedEmail}`);
      const existingUser = await this.userModel
        .findOne({ email: normalizedEmail })
        .exec();
      if (existingUser) {
        console.log(
          `Found user: email=${normalizedEmail}, sns_subscription_status=${existingUser.sns_subscription_status}, login_count=${existingUser.login_count}, user_id=${existingUser.user_id}`,
        );
        const updateData: any = {
          //name,
          updated_at: new Date(),
          last_login: new Date(),
        };
        if (!existingUser.sns_subscription_status) {
          updateData.sns_subscription_status = 'unsubscribed';
          updateData.last_sns_subscription_attempt = null;
        }
        if (existingUser.sns_subscription_status === 'subscribed') {
          console.log(
            `Preserving sns_subscription_status: subscribed for ${normalizedEmail}`,
          );
        }
        if (!existingUser.login_count) {
          updateData.login_count = 0;
        }
        const updatedUser = await this.userModel
          .findOneAndUpdate(
            { email: normalizedEmail },
            { $set: updateData },
            { new: true },
          )
          .exec();
        if (!updatedUser) {
          throw new Error(`Failed to update user for ${normalizedEmail}`);
        }
        console.log(
          `Updated user: email=${normalizedEmail}, sns_subscription_status=${updatedUser.sns_subscription_status}, login_count=${updatedUser.login_count}, user_id=${updatedUser.user_id}`,
        );
        return updatedUser;
      }

      console.log(`Creating new user for ${normalizedEmail}`);
      const newUser = new this.userModel({
        email: normalizedEmail,
        name,
        user_id: `manual|${normalizedEmail}`,
        login_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        identities: [],
        user_metadata: {},
        sns_subscription_status: 'unsubscribed',
        last_sns_subscription_attempt: null,
      });
      const savedUser = await newUser.save();
      console.log(
        `Created user: email=${normalizedEmail}, sns_subscription_status=${savedUser.sns_subscription_status}, user_id=${savedUser.user_id}`,
      );
      return savedUser;
    } catch (error) {
      console.error(
        `Failed to find or create user for ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Failed to find or create user: ${error.message}`);
    }
  }

  async incrementLoginCount(email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      console.log(`Incrementing login_count for ${normalizedEmail}`);
      const user = await this.userModel
        .findOneAndUpdate(
          { email: normalizedEmail },
          {
            $inc: { login_count: 1 },
            $set: { last_login: new Date(), updated_at: new Date() },
          },
          { new: true },
        )
        .exec();
      if (!user) {
        throw new Error(`User with email ${normalizedEmail} not found`);
      }
      console.log(
        `User after increment: email=${normalizedEmail}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`,
      );
      return user;
    } catch (error) {
      console.error(
        `Failed to increment login count for ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Failed to increment login count: ${error.message}`);
    }
  }

  async updateSubscriptionStatus(
    email: string,
    status: string,
    attempt?: Date,
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      console.log(
        `Updating subscription status for ${normalizedEmail} to ${status}`,
      );
      const update: any = { sns_subscription_status: status };
      if (attempt) {
        update.last_sns_subscription_attempt = attempt;
      }
      const user = await this.userModel
        .findOneAndUpdate(
          { email: normalizedEmail },
          { $set: update },
          { new: true },
        )
        .exec();
      if (!user) {
        console.error(
          `User with email ${normalizedEmail} not found in database`,
        );
        throw new Error(`User with email ${normalizedEmail} not found`);
      }
      console.log(
        `Successfully updated subscription status: email=${normalizedEmail}, sns_subscription_status=${user.sns_subscription_status}, user_id=${user.user_id}`,
      );
      return user;
    } catch (error) {
      console.error(
        `Failed to update subscription status for ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Failed to update subscription status: ${error.message}`);
    }
  }
}
