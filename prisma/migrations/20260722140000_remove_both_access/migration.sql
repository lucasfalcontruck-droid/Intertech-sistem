-- Remove the BOTH value from SystemAccess: strict either/or access between
-- the e-commerce ERP and the WhatsApp Atendimento module. Table was already
-- cleared of demo data before this migration, so no cast-failure risk.

ALTER TYPE "SystemAccess" RENAME TO "SystemAccess_old";

CREATE TYPE "SystemAccess" AS ENUM ('ECOMMERCE', 'ATENDIMENTO');

ALTER TABLE "User" ALTER COLUMN "systemAccess" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "systemAccess" TYPE "SystemAccess" USING ("systemAccess"::text::"SystemAccess");
ALTER TABLE "User" ALTER COLUMN "systemAccess" SET DEFAULT 'ECOMMERCE';

DROP TYPE "SystemAccess_old";
