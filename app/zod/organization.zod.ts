import { z } from "zod";
import { UserSchema } from "./user.zod";
import { ObjectIdSchema } from "./object-id.zod";
import { PaginationSchema } from "./common.zod";

export const OrganizationSchema = z.object({
	id: ObjectIdSchema,
	name: z.string().min(1),
	description: z.string().optional(),
	code: z.string().min(1),
	logo: z.string().optional(),
	background: z.string().optional(),
	isDeleted: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});
export const OrganizationWithRelationSchema = OrganizationSchema.extend({
	users: z.array(z.lazy(() => UserSchema)).optional(),
});

export const GetAllOrganizationsSchema = z.object({
	organizations: z.array(OrganizationWithRelationSchema),
	pagination: PaginationSchema.optional(),
	count: z.number().optional(),
});

export const CreateOrganizationSchema = OrganizationSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial({
	description: true,
	logo: true,
	background: true,
	isDeleted: true,
});

export const UpdateOrganizationSchema = OrganizationSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	isDeleted: true,
}).partial();

export const GroupBySchema = z.object({
	groupBy: z.string().optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationWithRelation = z.infer<typeof OrganizationWithRelationSchema>;
export type GetAllOrganizations = z.infer<typeof GetAllOrganizationsSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
