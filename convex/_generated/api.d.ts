/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as enterpriseAnalytics from "../enterpriseAnalytics.js";
import type * as organizationMembers from "../organizationMembers.js";
import type * as organizations from "../organizations.js";
import type * as payments from "../payments.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";
import type * as whitelabel from "../whitelabel.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  enterpriseAnalytics: typeof enterpriseAnalytics;
  organizationMembers: typeof organizationMembers;
  organizations: typeof organizations;
  payments: typeof payments;
  tasks: typeof tasks;
  users: typeof users;
  whitelabel: typeof whitelabel;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
