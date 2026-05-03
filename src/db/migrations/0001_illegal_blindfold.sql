DO $$ BEGIN
 CREATE TYPE "public"."ids_status" AS ENUM('open', 'identified', 'discussed', 'solved');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."kpi_aggregation" AS ENUM('sum', 'avg', 'last', 'first', 'min', 'max');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."kpi_goal_operator" AS ENUM('gte', 'lte', 'eq', 'gt', 'lt');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."kpi_owner_entity_type" AS ENUM('agent', 'human');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."kpi_time_grain" AS ENUM('weekly', 'monthly', 'quarterly', 'annual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."kpi_value_source" AS ENUM('manual', 'api', 'computed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."meeting_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_item_priority" AS ENUM('critical', 'high', 'medium', 'low');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_item_status" AS ENUM('proposed', 'accepted', 'in_progress', 'at_risk', 'completed', 'deferred');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_owner_type" AS ENUM('employee', 'agent', 'hybrid', 'unassigned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_plan_section_key" AS ENUM('foundation', 'market_command', 'destination', 'annual_game_plan', 'ninety_day_engine', 'performance_scorecard', 'constraints_leverage', 'alignment_accountability');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_plan_status" AS ENUM('draft', 'active', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oos_sync_type" AS ENUM('preview', 'push_to_oos', 'rollback');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."org_invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."org_member_role" AS ENUM('owner', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."org_member_status" AS ENUM('active', 'revoked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."owner_entity_type" AS ENUM('agent', 'human');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kpi_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kpi_id" uuid NOT NULL,
	"depends_on_kpi_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kpi_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kpi_id" uuid NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"value" real,
	"source" "kpi_value_source" NOT NULL,
	"entered_by" varchar(255),
	"entered_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kpis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"owner_entity_type" "kpi_owner_entity_type" NOT NULL,
	"owner_external_id" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"group_name" varchar(120),
	"goal_operator" "kpi_goal_operator",
	"goal_value" real,
	"unit" varchar(40),
	"time_grain" "kpi_time_grain" DEFAULT 'weekly' NOT NULL,
	"formula" text,
	"aggregation_method" "kpi_aggregation" DEFAULT 'sum' NOT NULL,
	"plan_section_id" uuid,
	"execution_item_id" uuid,
	"claim_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"meeting_type" varchar(60) DEFAULT 'leadership' NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" "meeting_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"attendees" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"segue_notes" text,
	"headlines" text,
	"cascading_message" text,
	"ratings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scorecard_snapshot" jsonb,
	"rocks_snapshot" jsonb,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_sequence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"signup_at" timestamp DEFAULT now() NOT NULL,
	"email_1_sent_at" timestamp,
	"email_2_sent_at" timestamp,
	"email_3_sent_at" timestamp,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_sequence_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oos_execution_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"outcome" text,
	"priority" "oos_item_priority" DEFAULT 'medium' NOT NULL,
	"status" "oos_item_status" DEFAULT 'proposed' NOT NULL,
	"due_date" timestamp,
	"quarter" varchar(12) NOT NULL,
	"assigned_owner_type" "oos_owner_type" DEFAULT 'unassigned' NOT NULL,
	"assigned_owner_id" varchar(255),
	"assigned_owner_name" varchar(255),
	"secondary_owner_type" "oos_owner_type",
	"secondary_owner_id" varchar(255),
	"secondary_owner_name" varchar(255),
	"confidence_score" real,
	"assignment_reason" text,
	"source_references_json" jsonb DEFAULT '[]'::jsonb,
	"pushed_claim_ids_json" jsonb DEFAULT '[]'::jsonb,
	"created_by_ai" boolean DEFAULT false NOT NULL,
	"user_modified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oos_operating_plan_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"section_key" "oos_plan_section_key" NOT NULL,
	"title" varchar(255) NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oos_operating_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"department_id" uuid,
	"title" varchar(255) NOT NULL,
	"status" "oos_plan_status" DEFAULT 'draft' NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_synced_to_oos_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oos_plan_sync_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"sync_type" "oos_sync_type" NOT NULL,
	"pushed_by" varchar(255) NOT NULL,
	"before_snapshot_json" jsonb DEFAULT '{}'::jsonb,
	"after_snapshot_json" jsonb DEFAULT '{}'::jsonb,
	"claim_ids_json" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"email" varchar(200) NOT NULL,
	"role" "org_member_role" DEFAULT 'member' NOT NULL,
	"claimed_entity_id" varchar(120),
	"token_hash" varchar(100) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_by_user_id" varchar(255) NOT NULL,
	"status" "org_invitation_status" DEFAULT 'pending' NOT NULL,
	"accepted_at" timestamp,
	"accepted_by_user_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"role" "org_member_role" DEFAULT 'member' NOT NULL,
	"claimed_entity_id" varchar(120),
	"status" "org_member_status" DEFAULT 'active' NOT NULL,
	"invited_by_user_id" varchar(255),
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"owner_entity_type" "owner_entity_type" NOT NULL,
	"owner_external_id" varchar(120) NOT NULL,
	"owner_name" varchar(255),
	"title" varchar(500) NOT NULL,
	"description" text,
	"quarter" varchar(10) NOT NULL,
	"due_date" timestamp NOT NULL,
	"on_track" boolean DEFAULT true NOT NULL,
	"status_note" text,
	"status_updated_at" timestamp,
	"completed_at" timestamp,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"meeting_id" uuid,
	"owner_entity_type" "owner_entity_type" NOT NULL,
	"owner_external_id" varchar(120) NOT NULL,
	"owner_name" varchar(255),
	"title" varchar(500) NOT NULL,
	"description" text,
	"due_at" timestamp,
	"done_at" timestamp,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_engagement_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"clerk_user_id" varchar(255),
	"last_sign_in_at_at_send" timestamp,
	"segment" varchar(50) NOT NULL,
	"template_key" varchar(100) NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"send_status" varchar(20) DEFAULT 'sent' NOT NULL,
	"send_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "use_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "name" varchar(200);--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "converted_at" timestamp;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "converted_clerk_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "resend_contact_id" varchar(64);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "ids_status" "ids_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "priority_rank" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "solved_in_meeting_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpi_dependencies" ADD CONSTRAINT "kpi_dependencies_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpi_dependencies" ADD CONSTRAINT "kpi_dependencies_depends_on_kpi_id_kpis_id_fk" FOREIGN KEY ("depends_on_kpi_id") REFERENCES "public"."kpis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpi_values" ADD CONSTRAINT "kpi_values_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpis" ADD CONSTRAINT "kpis_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpis" ADD CONSTRAINT "kpis_plan_section_id_oos_operating_plan_sections_id_fk" FOREIGN KEY ("plan_section_id") REFERENCES "public"."oos_operating_plan_sections"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpis" ADD CONSTRAINT "kpis_execution_item_id_oos_execution_items_id_fk" FOREIGN KEY ("execution_item_id") REFERENCES "public"."oos_execution_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_execution_items" ADD CONSTRAINT "oos_execution_items_plan_id_oos_operating_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."oos_operating_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_operating_plan_sections" ADD CONSTRAINT "oos_operating_plan_sections_plan_id_oos_operating_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."oos_operating_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_operating_plans" ADD CONSTRAINT "oos_operating_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_plan_sync_events" ADD CONSTRAINT "oos_plan_sync_events_plan_id_oos_operating_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."oos_operating_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oos_plan_sync_events" ADD CONSTRAINT "oos_plan_sync_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_invitations" ADD CONSTRAINT "org_invitations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rocks" ADD CONSTRAINT "rocks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todos" ADD CONSTRAINT "todos_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todos" ADD CONSTRAINT "todos_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "kpi_deps_uk" ON "kpi_dependencies" ("kpi_id","depends_on_kpi_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpi_deps_depends_on_idx" ON "kpi_dependencies" ("depends_on_kpi_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "kpi_values_kpi_period_uk" ON "kpi_values" ("kpi_id","period_start");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpi_values_period_idx" ON "kpi_values" ("kpi_id","period_start","period_end");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpi_values_source_idx" ON "kpi_values" ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpis_org_idx" ON "kpis" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpis_owner_idx" ON "kpis" ("organization_id","owner_entity_type","owner_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpis_group_idx" ON "kpis" ("organization_id","group_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpis_grain_idx" ON "kpis" ("organization_id","time_grain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpis_section_idx" ON "kpis" ("plan_section_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kpis_exec_item_idx" ON "kpis" ("execution_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meetings_org_idx" ON "meetings" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meetings_scheduled_idx" ON "meetings" ("organization_id","scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meetings_type_idx" ON "meetings" ("organization_id","meeting_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "onb_clerk_user_idx" ON "onboarding_sequence" ("clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "onb_email_idx" ON "onboarding_sequence" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "onb_signup_idx" ON "onboarding_sequence" ("signup_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ooei_plan_idx" ON "oos_execution_items" ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ooei_quarter_idx" ON "oos_execution_items" ("plan_id","quarter");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ooei_status_idx" ON "oos_execution_items" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ooei_owner_idx" ON "oos_execution_items" ("assigned_owner_type","assigned_owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ooei_priority_idx" ON "oos_execution_items" ("priority");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "oops_plan_section_idx" ON "oos_operating_plan_sections" ("plan_id","section_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oops_sort_idx" ON "oos_operating_plan_sections" ("plan_id","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oop_org_idx" ON "oos_operating_plans" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oop_dept_idx" ON "oos_operating_plans" ("department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oop_status_idx" ON "oos_operating_plans" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oopse_plan_idx" ON "oos_plan_sync_events" ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oopse_org_idx" ON "oos_plan_sync_events" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oopse_type_idx" ON "oos_plan_sync_events" ("sync_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oopse_created_idx" ON "oos_plan_sync_events" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "org_invitations_token_idx" ON "org_invitations" ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_invitations_org_idx" ON "org_invitations" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_invitations_status_idx" ON "org_invitations" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_invitations_email_idx" ON "org_invitations" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "org_members_org_user_idx" ON "org_members" ("org_id","clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_members_org_idx" ON "org_members" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_members_user_idx" ON "org_members" ("clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rocks_org_idx" ON "rocks" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rocks_owner_idx" ON "rocks" ("organization_id","owner_entity_type","owner_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rocks_quarter_idx" ON "rocks" ("organization_id","quarter");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "todos_org_idx" ON "todos" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "todos_meeting_idx" ON "todos" ("meeting_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "todos_owner_idx" ON "todos" ("organization_id","owner_entity_type","owner_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "todos_open_idx" ON "todos" ("organization_id","done_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uel_email_idx" ON "user_engagement_log" ("user_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uel_email_sent_idx" ON "user_engagement_log" ("user_email","sent_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uel_clerk_user_idx" ON "user_engagement_log" ("clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uel_segment_idx" ON "user_engagement_log" ("segment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uel_sent_at_idx" ON "user_engagement_log" ("sent_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ns_converted_idx" ON "newsletter_subscribers" ("converted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ns_source_idx" ON "newsletter_subscribers" ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_ids_status_idx" ON "tickets" ("org_id","ids_status");