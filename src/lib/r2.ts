// Cloudflare R2 스토리지 클라이언트 및 Presigned URL 발급 유틸리티
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(r2Client, command, { expiresIn })
}

export function getPublicUrl(key: string): string {
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
}

// 이미지 키 생성: 오피스ID/매물ID/타임스탬프_파일명
export function createImageKey(officeId: string, propertyId: string, filename: string): string {
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  return `${officeId}/${propertyId}/${timestamp}.${ext}`
}
