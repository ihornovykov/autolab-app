CREATE TABLE "profile_working_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"weekday" integer NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_profile_working_hours_profile_weekday" UNIQUE("profile_id","weekday")
);
--> statement-breakpoint
ALTER TABLE "profile_working_hours" ADD CONSTRAINT "profile_working_hours_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_profile_working_hours_profile_id" ON "profile_working_hours" USING btree ("profile_id");