// import { Injectable, InternalServerErrorException ,NotFoundException} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as AWS from 'aws-sdk';

// @Injectable()
// export class S3Service {
//   private s3: AWS.S3;

//   // Constructor injects ConfigService to access environment variables
//   constructor(private configService: ConfigService) {
//     this.s3 = new AWS.S3({
//       region: this.configService.get<string>('AWS_REGION'),
//     });
//   }


//   //Uploads a file to an AWS S3 bucket and returns the file's location URL
//   async uploadFile(
//     buffer: Buffer,
//     filename: string,
//     contentType: string,
//   ): Promise<string> {
//     const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
//     if (!bucketName) {
//       throw new InternalServerErrorException(
//         'AWS S3 bucket name is not defined',
//       );
//     }

//     // Define S3 upload parameters
//     const params = {
//       Bucket: bucketName,
//       Key: `${filename}`,
//       Body: buffer,
//       ContentType: contentType,
//       ACL: 'private',
//     };
//     // Upload the file to S3 and await the result
//     const { Location } = await this.s3.upload(params).promise();
//     return Location;
//   }

//   //Generates a pre-signed URL for accessing a file in the S3 bucket
//   getSignedUrl(key: string, expiresIn = 1800): string {
//     const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
//     if (!bucketName) {
//       throw new InternalServerErrorException(
//         'AWS S3 bucket name is not defined',
//       );
//     }
//     // Generate and return a pre-signed URL for the specified file
//     return this.s3.getSignedUrl('getObject', {
//       Bucket: bucketName,
//       Key: key,
//       Expires: expiresIn,
//     });
//   }

//   //Deletes a file from the AWS S3 bucket
//   async deleteFile(key: string): Promise<boolean> {
//     const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
//     if (!bucketName) {
//       throw new InternalServerErrorException(
//         'AWS S3 bucket name is not defined',
//       );
//     }
//     // Trim any whitespace from the key
//     key = key.trim();
//     console.log(
//       `Attempting to delete file with key: "${key}" from bucket: "${bucketName}"`,
//     );
//     try {
//       // List objects in the bucket with the prefix to check if file exists and get exact key
//       const listParams = {
//         Bucket: bucketName,
//         Prefix: key,
//       };
//       const listedObjects = await this.s3.listObjectsV2(listParams).promise();
//       console.log(
//         `Found ${listedObjects.Contents?.length || 0} objects with prefix "${key}"`,
//       );

//       if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
//         throw new NotFoundException(
//           `File with key "${key}" not found in bucket "${bucketName}"`,
//         );
//       }
//       // Find exact match (if any)
//       const exactMatch = listedObjects.Contents.find((obj) => obj.Key === key);
//       if (!exactMatch) {
//         console.log(
//           'Available objects:',
//           listedObjects.Contents.map((obj) => obj.Key),
//         );
//         throw new NotFoundException(
//           `Exact file with key "${key}" not found in bucket "${bucketName}"`,
//         );
//       }
//       // Delete the file from S3
//       await this.s3
//         .deleteObject({
//           Bucket: bucketName,
//           Key: key,
//         })
//         .promise();
//       console.log(`Successfully deleted file with key: "${key}"`);
//       return true;
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       console.error(`Failed to delete file from S3: ${error.message}`, error);
//       throw new InternalServerErrorException(
//         `Failed to delete file from storage: ${error.message}`,
//       );
//     }
//   }
// }












import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }

    const params = {
      Bucket: bucketName,
      Key: `${filename}`,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    };
    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  getSignedUrl(key: string, expiresIn = 1800): string {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }
    return this.s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
    });
  }

  async deleteFile(key: string): Promise<boolean> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }
    key = key.trim();
    try {
      const listParams = {
        Bucket: bucketName,
        Prefix: key,
      };
      const listedObjects = await this.s3.listObjectsV2(listParams).promise();
      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        throw new NotFoundException(`File with key "${key}" not found in bucket "${bucketName}"`);
      }
      const exactMatch = listedObjects.Contents.find((obj) => obj.Key === key);
      if (!exactMatch) {
        throw new NotFoundException(`Exact file with key "${key}" not found in bucket "${bucketName}"`);
      }
      await this.s3
        .deleteObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete file from storage: ${error.message}`);
    }
  }

  async readJsonFile(key: string): Promise<any> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }

    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };
      const data = await this.s3.getObject(params).promise();
      return JSON.parse(data.Body.toString('utf-8'));
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return [];
      }
      throw new InternalServerErrorException(`Failed to read file from S3: ${error.message}`);
    }
  }

  async writeJsonFile(key: string, data: any): Promise<void> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
      ACL: 'private',
    };

    await this.s3.upload(params).promise();
  }
}