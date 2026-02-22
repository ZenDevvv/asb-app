import { z } from "zod";
import { ObjectIdSchema } from "./object-id.zod";
import { UserSchema } from "./user.zod";
import { TemplateProjectSchema } from "./templateProject.zod";
import { PaginationSchema } from "./common.zod";

export const ProjectStatus = z.enum(["draft", "published"]);

export const ProjectSchema = z.object({
	id: ObjectIdSchema,
	userId: ObjectIdSchema,
	sourceTemplateId: ObjectIdSchema
		.optional(),
	name: z.string().min(1),
	slug: z.string().min(1),
	status: ProjectStatus.default("draft"),
	pages: z.any(),
	globalStyle: z.any(),
	seo: z.any().optional(),
	aiContext: z.any().optional(),
	publishedUrl: z.string().optional(),
	publishedHtml: z.string().optional(),
	publishedAt: z.coerce.date().optional(),
	isDeleted: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),

	user: UserSchema.optional(),
	sourceTemplate: TemplateProjectSchema.optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const GetAllProjectsSchema = z.object({
	projects: z.array(ProjectSchema),
	pagination: PaginationSchema.optional(),
	count: z.number().optional(),
});

export type GetAllProjects = z.infer<typeof GetAllProjectsSchema>;

export const CreateProjectSchema = ProjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	user: true,
	sourceTemplate: true,
}).partial({
	sourceTemplateId: true,
	status: true,
	seo: true,
	aiContext: true,
	publishedUrl: true,
	publishedHtml: true,
	publishedAt: true,
	isDeleted: true,
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = ProjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	isDeleted: true,
	user: true,
	sourceTemplate: true,
}).partial();

export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
