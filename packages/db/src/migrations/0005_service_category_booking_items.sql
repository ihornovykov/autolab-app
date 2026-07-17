ALTER TABLE "services" ADD COLUMN "category" text;--> statement-breakpoint
CREATE INDEX "idx_services_category" ON "services" USING btree ("category");--> statement-breakpoint
ALTER TABLE "booking_services" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_services" ADD COLUMN "unit_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "booking_services" ADD COLUMN "duration" integer;--> statement-breakpoint
UPDATE "booking_services" AS bs
SET
  "unit_price" = s."price",
  "duration" = s."duration"
FROM "services" AS s
WHERE s."id" = bs."service_id";--> statement-breakpoint
ALTER TABLE "booking_services" ALTER COLUMN "unit_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_services" ALTER COLUMN "duration" SET NOT NULL;
