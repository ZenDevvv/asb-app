# API Call Standard

This document outlines the standard pattern for creating API calls in the frontend application (`{projectName}-app`). Follow these steps when creating a new API endpoint integration.

---

## Table of Contents

1. [Step 1: Define Endpoints](#step-1-define-endpoints)
2. [Step 2: Create Service File](#step-2-create-service-file)
3. [Step 3: Create React Query Hooks](#step-3-create-react-query-hooks)
4. [Step 4: Create Zod Schema File](#step-4-create-zod-schema-file)
5. [Step 5: Using Hooks in Pages](#step-5-using-hooks-in-pages)
6. [Step 6: Page Integration Rules](#step-6-page-integration-rules)

---

## Step 1: Define Endpoints

**File Location:** `app/configs/endpoints.ts`

Add a new endpoint object for your resource in the `API_ENDPOINTS` object.

### Example: ORDER Endpoint

```typescript
ORDER: {
    GET_ALL: "/order",
    GET_BY_ID: "/order/:id",
    CREATE: "/order",
    UPDATE: "/order/:id",
    DELETE: "/order/:id", // Soft delete
},
```

### Naming Convention

- Use **UPPERCASE** for the resource name (e.g., `ORDER`, `PRODUCT`, `USER`)
- Use **UPPERCASE** with underscores for action names (e.g., `GET_ALL`, `GET_BY_ID`, `CREATE`, `UPDATE`, `DELETE`)
- Use `:id` as a placeholder for dynamic route parameters

---

## Step 2: Create Service File

**File Location:** `app/services/{resource}-service.ts`

Create a service class that extends `APIService` and implements methods for each endpoint.

### Example: order-service.ts

```typescript
import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { GetAll{Resource}s, {Resource}, Create{Resource}, Update{Resource} } from "~/zod/{resource}.zod";

const { RESOURCE } = API_ENDPOINTS;

class {Resource}Service extends APIService {
    getAll{Resource}s = async () => {
        try {
            const response: ApiResponse<GetAll{Resource}s> = await apiClient.get(
                `${RESOURCE.GET_ALL}${this.getQueryString()}`,
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.data?.errors?.[0]?.message || error.message || "An error has occurred",
            );
        }
    };

    get{Resource}ById = async ({resource}Id: string) => {
        try {
            const response: ApiResponse<{Resource}> = await apiClient.get(
                `${RESOURCE.GET_BY_ID.replace(":id", {resource}Id)}${this.getQueryString()}`,
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.data?.errors?.[0]?.message || error.message || "An error has occurred",
            );
        }
    };

    create{Resource} = async (data: Create{Resource} | FormData) => {
        try {
            let response: ApiResponse<{ {resource}: {Resource} }>;
            if (data instanceof FormData) {
                response = await apiClient.postFormData(RESOURCE.CREATE, data);
            } else {
                response = await apiClient.post(RESOURCE.CREATE, data);
            }
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.data?.errors?.[0]?.message || error.message || "An error has occurred",
            );
        }
    };

    update{Resource} = async ({
        {resource}Id,
        data,
    }: {
        {resource}Id: string;
        data: Update{Resource} | FormData;
    }) => {
        try {
            let response: ApiResponse<{ {resource}: {Resource} }>;
            if (data instanceof FormData) {
                response = await apiClient.patchFormData(
                    RESOURCE.UPDATE.replace(":id", {resource}Id),
                    data,
                );
            } else {
                response = await apiClient.patch(
                    RESOURCE.UPDATE.replace(":id", {resource}Id),
                    data,
                );
            }
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.data?.errors?.[0]?.message || error.message || "An error has occurred",
            );
        }
    };

    delete{Resource} = async ({resource}Id: string) => {
        try {
            const response = await apiClient.delete(RESOURCE.DELETE.replace(":id", {resource}Id));
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.data?.errors?.[0]?.message || error.message || "An error has occurred",
            );
        }
    };
}

export default new {Resource}Service();
```

### Key Points

- **Extend `APIService`** to inherit query string builder methods (`select`, `search`, `paginate`, `sort`, `filter`, `count`, `document`, `pagination`)
- **Use `apiClient`** for all HTTP requests
- **Type the response** using `ApiResponse<T>` generic
- **Handle errors consistently** with the standard error message extraction
- **Export as singleton** using `export default new {Resource}Service()`
- **Always support both JSON and FormData** in `create` and `update` methods — accept `Create{Resource} | FormData` and `Update{Resource} | FormData`, then use `apiClient.postFormData` / `apiClient.patchFormData` for `FormData` and `apiClient.post` / `apiClient.patch` for JSON

---

## Step 3: Create React Query Hooks

**File Location:** `app/hooks/use-{resource}.ts`

Create React Query hooks for each service method.

### Example: use-order.ts

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import {resource}Service from "~/services/{resource}-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { Create{Resource}, Update{Resource} } from "~/zod/{resource}.zod";
import { queryClient } from "~/lib/query-client";

// GET ALL
export const useGet{Resource}s = (apiParams?: ApiQueryParams) => {
    return useQuery({
        queryKey: ["{resource}s", apiParams],
        queryFn: () => {
            return {resource}Service
                .select(apiParams?.fields || "")
                .search(apiParams?.query || "")
                .paginate(apiParams?.page || 1, apiParams?.limit || 10)
                .sort(apiParams?.sort, apiParams?.order)
                .filter(apiParams?.filter || "")
                .count(apiParams?.count ?? false)
                .document(apiParams?.document ?? true)
                .pagination(apiParams?.pagination ?? true)
                .getAll{Resource}s();
        },
    });
};

// GET BY ID
export const useGet{Resource}ById = ({resource}Id: string, apiParams?: ApiQueryParams) => {
    return useQuery({
        queryKey: ["{resource}-by-id", {resource}Id, apiParams],
        queryFn: () => {
            return {resource}Service.select(apiParams?.fields || "").get{Resource}ById({resource}Id);
        },
        enabled: !!{resource}Id,
    });
};

// CREATE
export const useCreate{Resource} = () => {
    return useMutation({
        mutationFn: (data: Create{Resource} | FormData) => {
            return {resource}Service.create{Resource}(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["{resource}s"] });
        },
    });
};

// UPDATE
export const useUpdate{Resource} = () => {
    return useMutation({
        mutationFn: ({ {resource}Id, data }: { {resource}Id: string; data: Update{Resource} | FormData }) => {
            return {resource}Service.update{Resource}({ {resource}Id, data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["{resource}s"] });
        },
    });
};

// DELETE
export const useDelete{Resource} = () => {
    return useMutation({
        mutationFn: ({resource}Id: string) => {
            return {resource}Service.delete{Resource}({resource}Id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["{resource}s"] });
        },
    });
};
```

### Key Points

- **Use `useQuery`** for GET operations
- **Use `useMutation`** for CREATE, UPDATE, DELETE operations
- **Define unique `queryKey`** for cache management
- **Use `apiParams`** to pass query parameters (fields, pagination, sorting, filtering)
- **Invalidate queries on success** using `queryClient.invalidateQueries()`
- **Use `enabled` option** for conditional queries (e.g., `enabled: !!{resource}Id`)

---

## Step 4: Copy Zod Schema File from API

**Source:** `{projectName}-api/zod/{resource}.zod.ts`
**Destination:** `app/zod/{resource}.zod.ts`

Copy the Zod schema file directly from the backend API project (`{projectName}-api/zod/`) to the frontend app (`app/zod/`). The API project's `MODULE_TEMPLATE_GUIDE.md` defines the authoritative Zod schemas — the frontend must use the same file to stay aligned.

### Steps

1. Locate the Zod file in `{projectName}-api/zod/{resource}.zod.ts`
2. Copy it to `app/zod/{resource}.zod.ts`
3. **Replace `mongoose` ObjectId validation with `ObjectIdSchema`:**
   - Remove the `import { isValidObjectId } from "mongoose"` import
   - Add `import { ObjectIdSchema } from "./object-id.zod"` instead
   - Replace all `z.string().refine((val) => isValidObjectId(val))` with `ObjectIdSchema`
   - The `ObjectIdSchema` (defined in `app/zod/object-id.zod.ts`) uses a regex check: `z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")`
4. **Ensure `PaginationSchema` imports from the shared `common.zod.ts`:**
   - The API Zod file imports `PaginationSchema` from `./common.zod` — verify this import resolves in `app/zod/`
   - If `app/zod/common.zod.ts` does not exist yet, copy it from `{projectName}-api/zod/common.zod.ts` (no modifications needed — it has no mongoose dependency)
   - **Never define `PaginationSchema` inline in entity Zod files** — always import from `./common.zod`

### Key Points

- **Do NOT create a new Zod schema from scratch** — always copy from the API project
- The API Zod file is the **single source of truth** for all schemas (`{Resource}Schema`, `Create{Resource}Schema`, `Update{Resource}Schema`, `GetAll{Entities}Schema`)
- If the API Zod file does not exist yet, create it in the API project first following `{projectName}-api/md/MODULE_TEMPLATE_GUIDE.md` Step 2, then copy it over
- **If the copied Zod file imports other schemas (e.g., `import { PersonSchema } from "./person.zod"`) that do not yet exist in `app/zod/`, copy those dependency Zod files from `{projectName}-api/zod/` as well.** Recursively apply this rule until all imports resolve.
- **`PaginationSchema` is defined once in `app/zod/common.zod.ts`** — never redefine it in entity Zod files. If the shared file doesn't exist in the frontend yet, copy `{projectName}-api/zod/common.zod.ts` to `app/zod/common.zod.ts`.
- After copying, verify that all imports resolve correctly in the frontend context

---

## Step 5: Using Hooks in Pages

When integrating hooks into your pages, **always refer to the Zod schema and service files** for the module you are working with. These files are the source of truth for response data types and request payload types.

### Reference Files

Before using any hook, check these files for the resource:

| Purpose              | File                                 | What to look for                                                  |
| -------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Response & Payload Types | `app/zod/{resource}.zod.ts`          | All type definitions (`GetAll{Resource}s`, `{Resource}`, `Create{Resource}`, `Update{Resource}`) |
| Service Methods      | `app/services/{resource}-service.ts` | How each method calls the API and what response type it returns    |

### Using GET hooks (List & Detail)

When using `useGet{Resource}s` or `useGet{Resource}ById`, the **response data type** comes from the Zod schema file.

#### Passing the `fields` Parameter

**Always pass the `fields` parameter** as a comma-separated string containing all the fields you need from the resource. Since relation fields are now part of the base `{Resource}Schema`, simply list all keys from that schema.

To determine the correct fields string:
1. Open `app/zod/{resource}.zod.ts`
2. List every key in `{Resource}Schema` — this includes both scalar fields and relation fields (relation fields are defined as optional in the base schema)
3. Join them all into a single comma-separated string

##### Example: Organization fields from `app/zod/organization.zod.ts`

```typescript
// OrganizationSchema has: id, name, description, code, logo, background, isDeleted, createdAt, updatedAt, users
//
// → fields string: "id,name,code,description,logo,background,createdAt,updatedAt,isDeleted,users"
```

#### Example: Fetching all organizations

```typescript
// 1. Check app/zod/organization.zod.ts for the response type:
//    - GetAllOrganizations → { organizations: Organization[], pagination?: {...}, count?: number }
//
// 2. Check app/services/organization-service.ts to confirm:
//    - getAllOrganizations() returns ApiResponse<GetAllOrganizations>

import { useGetOrganizations } from "~/hooks/use-organization";

const MyPage = () => {
    const { data, isLoading } = useGetOrganizations({
        page: 1,
        limit: 10,
        fields: "id,name,code,description,logo,background,createdAt,updatedAt,isDeleted,users",
    });

    // data is typed as GetAllOrganizations (from app/zod/organization.zod.ts)
    // Access the list:  data?.organizations
    // Access pagination: data?.pagination
    // Access count:      data?.count
};
```

#### Example: Fetching a single organization

```typescript
// 1. Check app/zod/organization.zod.ts for the response type:
//    - Organization → { id, name, description, code, isDeleted, createdAt, updatedAt, users?, ... }
//
// 2. Check app/services/organization-service.ts to confirm:
//    - getOrganizationById() returns ApiResponse<Organization>

import { useGetOrganizationById } from "~/hooks/use-organization";

const DetailPage = ({ organizationId }: { organizationId: string }) => {
    const { data, isLoading } = useGetOrganizationById(organizationId);

    // data is typed as Organization (from app/zod/organization.zod.ts)
    // Access fields: data?.id, data?.name, data?.code, etc.
};
```

### Using CREATE hook

When using `useCreate{Resource}`, the **payload type** comes from the Zod schema file.

#### Example: Creating an organization

```typescript
// 1. Check app/zod/organization.zod.ts for the payload type:
//    - CreateOrganization → { name: string, code: string, description?: string, isDeleted?: boolean }
//    - It is OrganizationSchema with id, createdAt, updatedAt omitted
//
// 2. Check app/services/organization-service.ts to confirm:
//    - createOrganization(data: CreateOrganization) accepts CreateOrganization as payload

import { useCreateOrganization } from "~/hooks/use-organization";
import type { CreateOrganization } from "~/zod/organization.zod";

const CreatePage = () => {
    const { mutate, isPending } = useCreateOrganization();

    const handleSubmit = (formData: CreateOrganization) => {
        // formData must match CreateOrganization type from app/zod/organization.zod.ts
        mutate(formData, {
            onSuccess: () => {
                // Handle success (e.g., navigate, show toast)
            },
            onError: (error) => {
                // Handle error
            },
        });
    };
};
```

### Using UPDATE hook

When using `useUpdate{Resource}`, the **payload type** comes from the Zod schema file.

#### Example: Updating an organization

```typescript
// 1. Check app/zod/organization.zod.ts for the payload type:
//    - UpdateOrganization → Partial<CreateOrganization>
//    - All fields are optional since it uses .partial()
//
// 2. Check app/services/organization-service.ts to confirm:
//    - updateOrganization({ organizationId, data }) accepts UpdateOrganization as payload

import { useUpdateOrganization } from "~/hooks/use-organization";
import type { UpdateOrganization } from "~/zod/organization.zod";

const EditPage = ({ organizationId }: { organizationId: string }) => {
    const { mutate, isPending } = useUpdateOrganization();

    const handleSubmit = (formData: UpdateOrganization) => {
        // formData must match UpdateOrganization type from app/zod/organization.zod.ts
        mutate(
            { organizationId, data: formData },
            {
                onSuccess: () => {
                    // Handle success
                },
                onError: (error) => {
                    // Handle error
                },
            },
        );
    };
};
```

### Using DELETE hook

#### Example: Deleting an organization

```typescript
import { useDeleteOrganization } from "~/hooks/use-organization";

const ListPage = () => {
    const { mutate: deleteOrganization, isPending } = useDeleteOrganization();

    const handleDelete = (organizationId: string) => {
        deleteOrganization(
            { organizationId },
            {
                onSuccess: () => {
                    // Handle success
                },
                onError: (error) => {
                    // Handle error
                },
            },
        );
    };
};
```

### Key Points

- **Always check `app/zod/{resource}.zod.ts` first** to understand the exact shape of response data and request payloads
- **Always check `app/services/{resource}-service.ts`** to see the return types used in `ApiResponse<T>` — this tells you the structure of `data`
- **Always pass `fields`** with a comma-separated string of all keys from `{Resource}Schema` (which includes both scalar and relation fields) — refer to `app/zod/{resource}.zod.ts` to build this string
- **GET hooks return data typed by the Zod schema**: `GetAll{Resource}s` for lists, `{Resource}` for single items
- **CREATE hooks expect payloads typed as `Create{Resource}`**: auto-generated fields (id, createdAt, updatedAt) are omitted
- **UPDATE hooks expect payloads typed as `Update{Resource}`**: same as Create but all fields are optional (`.partial()`)
- **The Zod schema is the single source of truth** for all types used across services, hooks, and pages

---

## Step 6: Page Integration Rules

When integrating hooks into pages, follow these strict rules to keep pages clean and consistent.

### Rule 1: Use Zod Types Directly — No Intermediate Types

**Never** create page-local types (e.g., `CourseRow`, `UserRow`) to reshape or re-map the resource data. Use the Zod-inferred types (`{Resource}`, `GetAll{Resource}s`, `Create{Resource}`, `Update{Resource}`) directly in the page.

```typescript
// WRONG — creating an intermediate type and manually mapping data
type CourseRow = {
    id: string;
    title: string;
    status: string;
    // ... hand-picked fields
};

const rows: CourseRow[] = data?.courses.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    // ... manual field mapping
})) ?? [];

// CORRECT — use the Zod type directly, no mapping needed
import type { Course } from "~/zod/course.zod";

const courses: Course[] = data?.courses ?? [];
```

### Rule 2: Move Display Helpers to Reusable Files

Utility functions that convert raw data values into display labels or badge elements (e.g., `statusBadge`, `statusLabel`, `levelLabel`, `roleBadge`) **must not** live inside page components. Place them in a shared utility file so they can be reused across pages.

**Recommended location:** `app/lib/{resource}-utils.ts` or `app/lib/display-utils.ts`

```typescript
// app/lib/display-utils.ts
import { Badge } from "~/components/ui/badge";

export const getStatusBadge = (status: string) => {
    switch (status) {
        case "active":
            return (
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px]
                  dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                    Active
                </Badge>
            );
        // ... other statuses
    }
};

export const getLevelLabel = (level: string) => {
    // ... level display logic
};
```

```typescript
// In the page component — import helpers, don't define them inline
import { getStatusBadge, getLevelLabel } from "~/lib/display-utils";
```

### Rule 3: Always Follow the Styling Guide

When integrating hooks into pages, **always refer to `md/STYLING_GUIDE.md`** for component patterns, color tokens, icon usage, and layout conventions. Every UI element rendered with hook data must comply with the styling guide.

### Summary

| Rule | Do | Don't |
|---|---|---|
| Types | Use Zod types directly (`{Resource}`, `GetAll{Resource}s`, etc.) | Create page-local row/item types and manually map data |
| Display helpers | Put in `app/lib/display-utils.ts` or `app/lib/{resource}-utils.ts` | Define `statusBadge`, `levelLabel`, etc. inside page files |
| Styling | Follow `md/STYLING_GUIDE.md` for all UI patterns | Improvise styles without checking the guide |

---

## Quick Reference Checklist

When adding a new resource API, create/modify the following files:

| Step | File           | Location                             |
| ---- | -------------- | ------------------------------------ |
| 1    | Endpoints      | `app/configs/endpoints.ts`           |
| 2    | Service        | `app/services/{resource}-service.ts` |
| 3    | Hooks          | `app/hooks/use-{resource}.ts`        |
| 4    | Zod Schema (copy from API) | `{projectName}-api/zod/{resource}.zod.ts` → `app/zod/{resource}.zod.ts` |
| 5    | Page Integration | Check Zod + Service before using hooks in pages |
| 6    | Page Integration Rules | No intermediate types, display helpers in reusable files, follow Styling Guide |

---

## Notes

- Replace `{projectName}` with your project name (e.g., `alma`, `epp`, `myapp`) — the backend is `{projectName}-api` and the frontend is `{projectName}-app`
- Replace `{Resource}` with your resource name in **PascalCase** (e.g., `Order`, `Product`, `User`)
- Replace `{resource}` with your resource name in **camelCase** (e.g., `order`, `product`, `user`)
- Replace `RESOURCE` with your resource name in **UPPERCASE** (e.g., `ORDER`, `PRODUCT`, `USER`)
