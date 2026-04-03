-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('YES', 'NO', 'MAYBE');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffinityQuestions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subCode" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffinityQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResponses" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" "ResponseType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResults" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResults_assessmentId_key" ON "AssessmentResults"("assessmentId");

-- AddForeignKey
ALTER TABLE "Assessments" ADD CONSTRAINT "Assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponses" ADD CONSTRAINT "AssessmentResponses_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponses" ADD CONSTRAINT "AssessmentResponses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AffinityQuestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResults" ADD CONSTRAINT "AssessmentResults_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
