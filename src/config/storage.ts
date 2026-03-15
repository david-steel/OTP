import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'otp-oos-files';

const isConfigured = !!(accountId && accessKeyId && secretAccessKey);

const s3 = isConfigured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })
  : null;

export function storageAvailable(): boolean {
  return isConfigured;
}

export async function uploadFile(key: string, body: Buffer | string, contentType = 'application/json'): Promise<void> {
  if (!s3) throw new Error('R2 storage not configured');
  await s3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

export async function getFile(key: string): Promise<string> {
  if (!s3) throw new Error('R2 storage not configured');
  const res = await s3.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));
  return await res.Body!.transformToString();
}

export async function deleteFile(key: string): Promise<void> {
  if (!s3) throw new Error('R2 storage not configured');
  await s3.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));
}

export { bucketName };
