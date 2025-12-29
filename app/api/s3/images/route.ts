import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

// Get environment variables
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION;
const AWS_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_KEY;
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;

// Validate required environment variables
if (!AWS_REGION || !AWS_ACCESS_KEY || !AWS_SECRET_KEY || !BUCKET_NAME) {
	console.error("Missing AWS S3 environment variables:");
	console.error("NEXT_PUBLIC_AWS_S3_REGION:", AWS_REGION ? "✓ Set" : "✗ Missing");
	console.error("NEXT_PUBLIC_AWS_ACCESS_KEY:", AWS_ACCESS_KEY ? "✓ Set" : "✗ Missing");
	console.error("NEXT_PUBLIC_AWS_SECRET_KEY:", AWS_SECRET_KEY ? "✓ Set" : "✗ Missing");
	console.error("NEXT_PUBLIC_AWS_BUCKET_NAME:", BUCKET_NAME ? "✓ Set" : "✗ Missing");
}

const s3Client = new S3Client({
	region: AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: AWS_ACCESS_KEY || "",
		secretAccessKey: AWS_SECRET_KEY || "",
	},
});

// GET - List all images from S3 bucket
export async function GET(request: NextRequest) {
	try {
		if (!BUCKET_NAME) {
			return NextResponse.json({ error: "AWS S3 bucket name is not configured" }, { status: 500 });
		}

		const prefixParam = request.nextUrl.searchParams.get("prefix");
		// If prefix is explicitly provided (even if empty string), use it
		// If prefix is null (not provided), list all images from bucket
		// Otherwise use the provided prefix

		const command = new ListObjectsV2Command({
			Bucket: BUCKET_NAME,
			...(prefixParam !== null ? { Prefix: prefixParam } : {}),
		});

		const response = await s3Client.send(command);

		const region = AWS_REGION || "us-east-1";
		const baseUrl =
			process.env.AWS_S3_BASE_URL || `https://${BUCKET_NAME}.s3.${region}.amazonaws.com`;

		const mediaType = request.nextUrl.searchParams.get("type") || "image"; // 'image' or 'video' or 'all'

		const allMedia = (response.Contents || [])
			.filter((item) => {
				const key = item.Key || "";
				if (mediaType === "image") {
					return /\.(jpg|jpeg|png|gif|webp)$/i.test(key);
				} else if (mediaType === "video") {
					return /\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i.test(key);
				} else {
					// 'all' - return both images and videos
					return /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi|mkv|flv|wmv)$/i.test(key);
				}
			})
			.map((item) => {
				const key = item.Key || "";
				const isVideo = /\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i.test(key);
				return {
					key,
					url: `${baseUrl}/${key}`,
					name: key.split("/").pop() || key,
					size: item.Size || 0,
					lastModified: item.LastModified?.toISOString() || "",
					type: isVideo ? "video" : "image",
				};
			});

		const images = allMedia;

		return NextResponse.json({ images });
	} catch (error) {
		console.error("Error listing S3 images:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: `Failed to list images: ${errorMessage}` }, { status: 500 });
	}
}

// POST - Upload image to S3
export async function POST(request: NextRequest) {
	try {
		if (!BUCKET_NAME || !AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
			return NextResponse.json(
				{
					error: "AWS S3 configuration is incomplete. Please check your environment variables.",
				},
				{ status: 500 }
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const prefix = (formData.get("prefix") as string) || "venues/";

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file type
		const isImage = file.type.startsWith("image/");
		const isVideo = file.type.startsWith("video/");

		if (!isImage && !isVideo) {
			return NextResponse.json({ error: "File must be an image or video" }, { status: 400 });
		}

		// Generate unique filename
		const ext = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
		const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: fileName,
			Body: buffer,
			ContentType: file.type,
			// Note: ACL might not be allowed if bucket has ACLs disabled
			// Remove ACL if you get errors, and ensure bucket policy allows public reads
		});

		await s3Client.send(command);

		const region = AWS_REGION || "us-east-1";
		const baseUrl =
			process.env.AWS_S3_BASE_URL || `https://${BUCKET_NAME}.s3.${region}.amazonaws.com`;
		const imageUrl = `${baseUrl}/${fileName}`;

		return NextResponse.json({
			success: true,
			url: imageUrl,
			key: fileName,
		});
	} catch (error) {
		console.error("Error uploading to S3:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("Error details:", {
			message: errorMessage,
			bucket: BUCKET_NAME,
			region: AWS_REGION,
			hasAccessKey: !!AWS_ACCESS_KEY,
			hasSecretKey: !!AWS_SECRET_KEY,
		});
		return NextResponse.json({ error: `Failed to upload image: ${errorMessage}` }, { status: 500 });
	}
}
