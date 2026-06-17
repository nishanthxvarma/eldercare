import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

export const uploadPhoto = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Upload to Cloudinary using a buffer stream
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'eldercare_profiles',
    resource_type: 'auto',
  });

  res.status(200).json({
    success: true,
    data: { url: result.secure_url },
    message: 'File uploaded successfully',
  });
});
