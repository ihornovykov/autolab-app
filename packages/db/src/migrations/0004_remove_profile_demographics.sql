ALTER TABLE "profiles" DROP CONSTRAINT "uq_profiles_username";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "birth_date";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "gender";--> statement-breakpoint
DROP TYPE "public"."gender";
