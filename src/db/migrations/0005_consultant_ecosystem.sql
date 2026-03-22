-- Consultant Ecosystem Migration
-- Adds consultant profiles, workspaces, source documents, and inquiries

-- Enums
CREATE TYPE workspace_role AS ENUM ('owner', 'consultant', 'client');
CREATE TYPE source_doc_status AS ENUM ('processing', 'processed', 'completed', 'failed');
CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'replied', 'closed');

-- Consultant Profiles
CREATE TABLE consultant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  slug VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  headline VARCHAR(255),
  photo_url TEXT,
  avatar_url TEXT,
  bio TEXT,
  expertise_tags TEXT[],
  contact_email VARCHAR(255),
  website TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cp_org_idx ON consultant_profiles(org_id);
CREATE UNIQUE INDEX cp_slug_idx ON consultant_profiles(slug);
CREATE INDEX cp_published_idx ON consultant_profiles(published);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_org_id UUID NOT NULL REFERENCES organizations(id),
  owner_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ws_consultant_org_idx ON workspaces(consultant_org_id);
CREATE INDEX ws_owner_idx ON workspaces(owner_id);
CREATE UNIQUE INDEX ws_slug_idx ON workspaces(slug);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  role workspace_role NOT NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX wm_workspace_idx ON workspace_members(workspace_id);
CREATE INDEX wm_org_idx ON workspace_members(org_id);
CREATE INDEX wm_email_idx ON workspace_members(email);

-- Source Documents
CREATE TABLE source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500),
  storage_key VARCHAR(1000),
  raw_text TEXT,
  raw_content TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  status source_doc_status NOT NULL DEFAULT 'processing',
  section_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sd_org_idx ON source_documents(org_id);
CREATE INDEX sd_status_idx ON source_documents(status);

-- Inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_profile_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_org VARCHAR(255),
  sender_company VARCHAR(255),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  notes TEXT,
  status inquiry_status NOT NULL DEFAULT 'new',
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX inq_profile_idx ON inquiries(consultant_profile_id);
CREATE INDEX inq_org_idx ON inquiries(org_id);
CREATE INDEX inq_status_idx ON inquiries(status);

-- Add columns to existing oos_files table
ALTER TABLE oos_files ADD COLUMN source_document_id UUID REFERENCES source_documents(id);
ALTER TABLE oos_files ADD COLUMN workspace_id UUID REFERENCES workspaces(id);
