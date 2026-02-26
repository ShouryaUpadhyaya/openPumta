-- CreateTable
CREATE TABLE "ToDo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "discription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "ToDo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToDoLog" (
    "id" SERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "toDoId" INTEGER,

    CONSTRAINT "ToDoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToDo_userId_idx" ON "ToDo"("userId");

-- CreateIndex
CREATE INDEX "ToDoLog_toDoId_idx" ON "ToDoLog"("toDoId");

-- AddForeignKey
ALTER TABLE "ToDo" ADD CONSTRAINT "ToDo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToDoLog" ADD CONSTRAINT "ToDoLog_toDoId_fkey" FOREIGN KEY ("toDoId") REFERENCES "ToDo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
