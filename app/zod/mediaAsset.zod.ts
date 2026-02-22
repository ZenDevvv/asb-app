import { z } from "zod";
import { ObjectIdSchema } from "./object-id.zod";
import { UserSchema } from "./user.zod";
import { ProjectSchema } from "./project.zod";
import { PaginationSchema } from "./common.zod";

export const MediaAssetSchema = z.object({
	id: ObjectIdSchema,
	userId: ObjectIdSchema,
	projectId: ObjectIdSchema
		.optional(),
	url: z.string().min(1),
	publicId: z.string().min(1),
	filename: z.string().optional(),
	size: z.number().int().optional(),
	width: z.number().int().optional(),
	height: z.number().int().optional(),
	format: z.string().optional(),
	isDeleted: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),

	user: UserSchema.optional(),
	project: ProjectSchema.optional(),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;

export const GetAllMediaAssetsSchema = z.object({
	mediaAssets: z.array(MediaAssetSchema),
	pagination: PaginationSchema.optional(),
	count: z.number().optional(),
});

export type GetAllMediaAssets = z.infer<typeof GetAllMediaAssetsSchema>;

export const CreateMediaAssetSchema = MediaAssetSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	user: true,
	project: true,
}).partial({
	projectId: true,
	filename: true,
	size: true,
	width: true,
	height: true,
	format: true,
	isDeleted: true,
});

export type CreateMediaAsset = z.infer<typeof CreateMediaAssetSchema>;

export const UpdateMediaAssetSchema = MediaAssetSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	isDeleted: true,
	user: true,
	project: true,
}).partial();

export type UpdateMediaAsset = z.infer<typeof UpdateMediaAssetSchema>;
