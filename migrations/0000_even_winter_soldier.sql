CREATE TYPE "public"."envio_status" AS ENUM('ENVIADO', 'FALHOU', 'PENDENTE');--> statement-breakpoint
CREATE TYPE "public"."metodo_envio" AS ENUM('EMAIL', 'WHATSAPP', 'AMBOS');--> statement-breakpoint
CREATE TYPE "public"."proposta_status" AS ENUM('RASCUNHO', 'ENVIADA', 'VISUALIZADA', 'ACEITA', 'RECUSADA', 'EXPIRADA');--> statement-breakpoint
CREATE TABLE "consultores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"id_consultor" text NOT NULL,
	"email" text,
	"whatsapp" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultores_id_consultor_unique" UNIQUE("id_consultor")
);
--> statement-breakpoint
CREATE TABLE "metas_propostas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodo" text NOT NULL,
	"tipo" text DEFAULT 'mensal' NOT NULL,
	"meta_valor" numeric(12, 2),
	"meta_quantidade" integer,
	"consultor_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposta_envios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposta_id" varchar NOT NULL,
	"metodo" "metodo_envio" NOT NULL,
	"destinatario" text NOT NULL,
	"status" "envio_status" DEFAULT 'PENDENTE' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propostas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_proposta" text NOT NULL,
	"consultor_id" varchar,
	"cliente_nome" text NOT NULL,
	"cliente_email" text,
	"cliente_whatsapp" text,
	"cliente_empresa" text,
	"cliente_cnpj" text,
	"cliente_estado" text,
	"cliente_cidade" text,
	"titulo" text NOT NULL,
	"descricao" text,
	"itens" json DEFAULT '[]'::json NOT NULL,
	"valor_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"validade_dias" integer DEFAULT 30 NOT NULL,
	"observacoes" text,
	"status" "proposta_status" DEFAULT 'RASCUNHO' NOT NULL,
	"metodo_envio" "metodo_envio",
	"pdf_url" text,
	"data_envio" timestamp,
	"data_visualizacao" timestamp,
	"data_resposta" timestamp,
	"data_expiracao" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "propostas_numero_proposta_unique" UNIQUE("numero_proposta")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "metas_propostas" ADD CONSTRAINT "metas_propostas_consultor_id_consultores_id_fk" FOREIGN KEY ("consultor_id") REFERENCES "public"."consultores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposta_envios" ADD CONSTRAINT "proposta_envios_proposta_id_propostas_id_fk" FOREIGN KEY ("proposta_id") REFERENCES "public"."propostas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_consultor_id_consultores_id_fk" FOREIGN KEY ("consultor_id") REFERENCES "public"."consultores"("id") ON DELETE no action ON UPDATE no action;