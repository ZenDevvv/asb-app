import { z } from "zod";
import { ObjectIdSchema } from "./object-id.zod";

export const EntitySchema = z.object({
	type: z.string().min(1),
	id: ObjectIdSchema,
});

export const ChangesSchema = z.object({
	before: z.any().optional(),
	after: z.any().optional(),
});

export const metadataSchema = z.object({
	userAgent: z.string().min(1),
	ip: z.string().min(1),
	path: z.string().min(1),
	method: z.string().min(1),
});

export const AuditLogSchema = z.object({
	id: ObjectIdSchema,
	userId: ObjectIdSchema,
	type: z.string().min(1),
	severity: z.string().min(1),
	entity: EntitySchema,
	changes: ChangesSchema.optional(),
	metadata: metadataSchema.optional(),
	description: z.string().optional(),
	archiveStatus: z.boolean(),
	archiveDate: z.coerce.date().optional(),
	isDeleted: z.boolean(),
	timestamp: z.coerce.date(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const CreateAuditLogSchema = AuditLogSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial({
	changes: true,
	metadata: true,
	description: true,
	archiveDate: true,
	isDeleted: true,
	timestamp: true,
	archiveStatus: true,
});

export const UpdateAuditLogSchema = z.object({
	userId: ObjectIdSchema
		.optional(),
	type: z.string().min(1).optional(),
	severity: z.string().min(1).optional(),
	entity: EntitySchema.optional(),
	changes: ChangesSchema.optional(),
	metadata: metadataSchema.optional(),
	description: z.string().min(1).optional(),
	archiveStatus: z.boolean().optional(),
	archiveDate: z.coerce.date().optional(),
	timestamp: z.coerce.date().optional(),
});
