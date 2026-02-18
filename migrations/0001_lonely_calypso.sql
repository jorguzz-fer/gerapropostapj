ALTER TABLE "consultores" DROP CONSTRAINT "consultores_id_consultor_unique";--> statement-breakpoint
ALTER TABLE "consultores" ALTER COLUMN "id_consultor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "consultores" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "consultores" ADD COLUMN "telefone" text;--> statement-breakpoint
ALTER TABLE "consultores" DROP COLUMN "whatsapp";--> statement-breakpoint
ALTER TABLE "consultores" ADD CONSTRAINT "consultores_email_unique" UNIQUE("email");