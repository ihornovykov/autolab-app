ALTER TABLE "sessions" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
CREATE INDEX "idx_sessions_impersonated_by" ON "sessions" USING btree ("impersonated_by");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");