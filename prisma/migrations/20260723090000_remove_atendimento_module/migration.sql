-- Remove the WhatsApp Atendimento module entirely: back to a plain e-commerce
-- ERP. Message references Lead, so it's dropped first.

DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Lead";

ALTER TABLE "User" DROP COLUMN IF EXISTS "systemAccess";
ALTER TABLE "User" DROP COLUMN IF EXISTS "isAtendimentoAdmin";
ALTER TABLE "User" DROP COLUMN IF EXISTS "atendimentoActive";

DROP TYPE IF EXISTS "SystemAccess";
DROP TYPE IF EXISTS "LeadStatus";
DROP TYPE IF EXISTS "MessageDirection";
DROP TYPE IF EXISTS "MessageStatus";
