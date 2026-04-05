DO $$ BEGIN
 CREATE TYPE "public"."actor_type" AS ENUM('user', 'system', 'agent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."badge_type" AS ENUM('founding', 'early');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."confidence_level" AS ENUM('HIGH', 'MEDIUM', 'LOW');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."evidence_type" AS ENUM('HUMAN_DEFINED_RULE', 'OBSERVED_ONCE', 'OBSERVED_REPEATEDLY', 'MEASURED_RESULT', 'INFERENCE', 'SPECULATION');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'read', 'replied', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_status" AS ENUM('draft', 'published', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."org_size" AS ENUM('solo', 'small', 'medium', 'large', 'enterprise');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."quality_tier" AS ENUM('platinum', 'gold', 'silver', 'bronze');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."similarity_class" AS ENUM('SIMILAR', 'DUPLICATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."source_doc_status" AS ENUM('processing', 'processed', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."template_type" AS ENUM('agent_army', 'value_chain', 'org_chart');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_category" AS ENUM('bug', 'feature', 'question', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."visibility" AS ENUM('free', 'paid', 'premium');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'consultant', 'client');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) DEFAULT 'Default' NOT NULL,
	"key_prefix" varchar(8) NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"scopes" text[] NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"actor_type" "actor_type" NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "best_practices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_profile_id" uuid,
	"slug" varchar(255) NOT NULL,
	"term" varchar(500) NOT NULL,
	"definition" text NOT NULL,
	"category" varchar(255) DEFAULT 'General' NOT NULL,
	"industry" varchar(100),
	"is_original" boolean DEFAULT false,
	"related_terms" text[],
	"source_url" text NOT NULL,
	"canonical_url" text,
	"is_coordination" boolean,
	"last_updated_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "claim_similarities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_a_id" uuid NOT NULL,
	"claim_b_id" uuid NOT NULL,
	"oos_a_id" uuid NOT NULL,
	"oos_b_id" uuid NOT NULL,
	"similarity_score" real NOT NULL,
	"classification" "similarity_class" NOT NULL,
	"section_match" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oos_file_id" uuid NOT NULL,
	"claim_id" varchar(10) NOT NULL,
	"section" varchar(100) NOT NULL,
	"display_order" integer NOT NULL,
	"rule" text NOT NULL,
	"why" text NOT NULL,
	"failure_mode" text NOT NULL,
	"confidence" "confidence_level" NOT NULL,
	"evidence" "evidence_type" NOT NULL,
	"scope" text NOT NULL,
	"visibility_override" "visibility",
	"is_canonical" boolean DEFAULT false,
	"source" varchar(50) DEFAULT 'oos_publish',
	"source_url" text,
	"agent_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consultant_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"headline" varchar(255),
	"photo_url" text,
	"avatar_url" text,
	"bio" text,
	"expertise_tags" text[],
	"contact_email" varchar(255),
	"website" text,
	"website_url" text,
	"linkedin_url" text,
	"published" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"profile_type" varchar(20) DEFAULT 'consultant' NOT NULL,
	"content_source_url" text,
	"content_count" integer DEFAULT 0 NOT NULL,
	"publisher_description" text,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultant_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_profile_id" uuid NOT NULL,
	"org_id" uuid,
	"sender_name" varchar(255) NOT NULL,
	"sender_email" varchar(255) NOT NULL,
	"sender_org" varchar(255),
	"sender_company" varchar(255),
	"subject" varchar(500),
	"message" text NOT NULL,
	"notes" text,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"read_at" timestamp,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" varchar(50) DEFAULT 'homepage' NOT NULL,
	"double_opt_in_confirmed" boolean DEFAULT false NOT NULL,
	"confirm_token" varchar(64),
	"token_expires_at" timestamp,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oos_best_practice_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oos_file_id" uuid NOT NULL,
	"best_practice_id" uuid NOT NULL,
	"relevance_score" real DEFAULT 0 NOT NULL,
	"matched_claims" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oos_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255),
	"template" "template_type" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "oos_status" DEFAULT 'draft' NOT NULL,
	"visibility_default" "visibility" DEFAULT 'free' NOT NULL,
	"word_count" integer NOT NULL,
	"claim_count" integer DEFAULT 0 NOT NULL,
	"raw_content" text NOT NULL,
	"frontmatter" jsonb NOT NULL,
	"confidence_distribution" jsonb,
	"evidence_distribution" jsonb,
	"source_document_id" uuid,
	"workspace_id" uuid,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"pseudonym" varchar(255),
	"industry" varchar(255) NOT NULL,
	"size" "org_size" NOT NULL,
	"clerk_org_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"badge" "badge_type",
	"quality_tier" "quality_tier",
	"agentic_level" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "practice_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"best_practice_id" uuid NOT NULL,
	"voter_ip" varchar(45) NOT NULL,
	"vote" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"original_filename" varchar(500),
	"storage_key" varchar(1000),
	"raw_text" text,
	"raw_content" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"status" "source_doc_status" DEFAULT 'processing' NOT NULL,
	"section_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"category" "ticket_category" DEFAULT 'bug' NOT NULL,
	"reporter_email" varchar(255),
	"resolution" text,
	"agent_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"org_id" uuid,
	"email" varchar(255) NOT NULL,
	"role" "workspace_role" NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_org_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "best_practices" ADD CONSTRAINT "best_practices_publisher_profile_id_consultant_profiles_id_fk" FOREIGN KEY ("publisher_profile_id") REFERENCES "public"."consultant_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claim_similarities" ADD CONSTRAINT "claim_similarities_claim_a_id_claims_id_fk" FOREIGN KEY ("claim_a_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claim_similarities" ADD CONSTRAINT "claim_similarities_claim_b_id_claims_id_fk" FOREIGN KEY ("claim_b_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claim_similarities" ADD CONSTRAINT "claim_similarities_oos_a_id_oos_files_id_fk" FOREIGN KEY ("oos_a_id") REFERENCES "public"."oos_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claim_similarities" ADD CONSTRAINT "claim_similarities_oos_b_id_oos_files_id_fk" FOREIGN KEY ("oos_b_id") REFERENCES "public"."oos_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claims" ADD CONSTRAINT "claims_oos_file_id_oos_files_id_fk" FOREIGN KEY ("oos_file_id") REFERENCES "public"."oos_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consultant_profiles" ADD CONSTRAINT "consultant_profiles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_consultant_profile_id_consultant_profiles_id_fk" FOREIGN KEY ("consultant_profile_id") REFERENCES "public"."consultant_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_best_practice_matches" ADD CONSTRAINT "oos_best_practice_matches_oos_file_id_oos_files_id_fk" FOREIGN KEY ("oos_file_id") REFERENCES "public"."oos_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_best_practice_matches" ADD CONSTRAINT "oos_best_practice_matches_best_practice_id_best_practices_id_fk" FOREIGN KEY ("best_practice_id") REFERENCES "public"."best_practices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_files" ADD CONSTRAINT "oos_files_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "practice_votes" ADD CONSTRAINT "practice_votes_best_practice_id_best_practices_id_fk" FOREIGN KEY ("best_practice_id") REFERENCES "public"."best_practices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_consultant_org_id_organizations_id_fk" FOREIGN KEY ("consultant_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_organizations_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_api_keys_hash" ON "api_keys" ("key_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_api_keys_org" ON "api_keys" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_org_time_idx" ON "audit_logs" ("org_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bp_publisher_idx" ON "best_practices" ("publisher_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bp_category_idx" ON "best_practices" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bp_industry_idx" ON "best_practices" ("industry");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bp_term_idx" ON "best_practices" ("term");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bp_is_coordination_idx" ON "best_practices" ("is_coordination");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sim_oos_pair_idx" ON "claim_similarities" ("oos_a_id","oos_b_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sim_score_idx" ON "claim_similarities" ("similarity_score");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "claim_oos_claim_idx" ON "claims" ("oos_file_id","claim_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_oos_order_idx" ON "claims" ("oos_file_id","display_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_confidence_idx" ON "claims" ("confidence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_evidence_idx" ON "claims" ("evidence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cp_org_idx" ON "consultant_profiles" ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cp_slug_idx" ON "consultant_profiles" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cp_published_idx" ON "consultant_profiles" ("published");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inq_profile_idx" ON "inquiries" ("consultant_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inq_org_idx" ON "inquiries" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inq_status_idx" ON "inquiries" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ns_email_idx" ON "newsletter_subscribers" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ns_confirmed_idx" ON "newsletter_subscribers" ("double_opt_in_confirmed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "obpm_oos_idx" ON "oos_best_practice_matches" ("oos_file_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "obpm_bp_idx" ON "oos_best_practice_matches" ("best_practice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "obpm_score_idx" ON "oos_best_practice_matches" ("relevance_score");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "oos_org_version_idx" ON "oos_files" ("org_id","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oos_status_idx" ON "oos_files" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "org_clerk_idx" ON "organizations" ("clerk_org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pv_practice_idx" ON "practice_votes" ("best_practice_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pv_unique_vote_idx" ON "practice_votes" ("best_practice_id","voter_ip");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sd_org_idx" ON "source_documents" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sd_status_idx" ON "source_documents" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_status_idx" ON "tickets" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_org_idx" ON "tickets" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wm_workspace_idx" ON "workspace_members" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wm_org_idx" ON "workspace_members" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wm_email_idx" ON "workspace_members" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ws_consultant_org_idx" ON "workspaces" ("consultant_org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ws_owner_idx" ON "workspaces" ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ws_slug_idx" ON "workspaces" ("slug");