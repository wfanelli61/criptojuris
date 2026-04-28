-- Nuevos campos en User (cédula, RIF, estado, dirección)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cedula"    TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rif"       TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "estado"    TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "direccion" TEXT;

-- Índice en cédula
CREATE INDEX IF NOT EXISTS "User_cedula_idx" ON "User"("cedula");

-- Tabla CaseEvent (historial de cambios del caso)
CREATE TABLE IF NOT EXISTS "CaseEvent" (
    "id"          TEXT        NOT NULL,
    "caseId"      TEXT        NOT NULL,
    "userId"      TEXT        NOT NULL,
    "type"        TEXT        NOT NULL,
    "description" TEXT        NOT NULL,
    "fromStatus"  TEXT,
    "toStatus"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CaseEvent_caseId_idx"   ON "CaseEvent"("caseId");
CREATE INDEX IF NOT EXISTS "CaseEvent_userId_idx"   ON "CaseEvent"("userId");
CREATE INDEX IF NOT EXISTS "CaseEvent_createdAt_idx" ON "CaseEvent"("createdAt");

DO $$ BEGIN
  ALTER TABLE "CaseEvent"
      ADD CONSTRAINT "CaseEvent_caseId_fkey"
          FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CaseEvent"
      ADD CONSTRAINT "CaseEvent_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tabla CasePayment (pagos del caso)
CREATE TABLE IF NOT EXISTS "CasePayment" (
    "id"             TEXT         NOT NULL,
    "caseId"         TEXT         NOT NULL,
    "clientId"       TEXT         NOT NULL,
    "amount"         DOUBLE PRECISION NOT NULL,
    "currency"       TEXT         NOT NULL DEFAULT 'USD',
    "method"         TEXT         NOT NULL,
    "reference"      TEXT,
    "bank"           TEXT,
    "phone"          TEXT,
    "concept"        TEXT,
    "status"         TEXT         NOT NULL DEFAULT 'PENDIENTE',
    "confirmedById"  TEXT,
    "confirmedAt"    TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CasePayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CasePayment_caseId_idx"   ON "CasePayment"("caseId");
CREATE INDEX IF NOT EXISTS "CasePayment_clientId_idx" ON "CasePayment"("clientId");
CREATE INDEX IF NOT EXISTS "CasePayment_status_idx"   ON "CasePayment"("status");

DO $$ BEGIN
  ALTER TABLE "CasePayment" ADD CONSTRAINT "CasePayment_caseId_fkey"
      FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CasePayment" ADD CONSTRAINT "CasePayment_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "User"("id");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CasePayment" ADD CONSTRAINT "CasePayment_confirmedById_fkey"
      FOREIGN KEY ("confirmedById") REFERENCES "User"("id");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
