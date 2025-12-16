-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('EXAM', 'HOMEWORK', 'EVENT', 'TASK');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'TASK';
