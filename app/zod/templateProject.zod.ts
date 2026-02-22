import { z } from "zod";
import { ObjectIdSchema } from "./object-id.zod";
import { UserSchema } from "./user.zod";
import { PaginationSchema } from "./common.zod";

export const TemplateProjectSchema = z.object({
	id: ObjectIdSchema,
	name: z.string().min(1),
	description: z.string().optional(),
	category: z.string().optional(),
	thumbnail: z.string().optional(),
	createdById: ObjectIdSchema,
	pages: z.any(),
	globalStyle: z.any(),
	seo: z.any().optional(),
	isActive: z.boolean(),
	usageCount: z.number().int(),
	isDeleted: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),

	createdBy: UserSchema.optional(),
});

export type TemplateProject = z.infer<typeof TemplateProjectSchema>;

export const GetAllTemplateProjectsSchema = z.object({
	templateProjects: z.array(TemplateProjectSchema),
	pagination: PaginationSchema.optional(),
	count: z.number().optional(),
});

export type GetAllTemplateProjects = z.infer<typeof GetAllTemplateProjectsSchema>;

export const CreateTemplateProjectSchema = TemplateProjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	createdBy: true,
}).partial({
	description: true,
	category: true,
	thumbnail: true,
	seo: true,
	isActive: true,
	usageCount: true,
	isDeleted: true,
});

export type CreateTemplateProject = z.infer<typeof CreateTemplateProjectSchema>;

export const UpdateTemplateProjectSchema = TemplateProjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	isDeleted: true,
	createdBy: true,
}).partial();

export type UpdateTemplateProject = z.infer<typeof UpdateTemplateProjectSchema>;
