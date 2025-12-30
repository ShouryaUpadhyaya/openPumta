"use client";
import React, { useState, useEffect } from "react";
import { Subject, columns } from "./Subjects/columbs";
import { DataTable } from "./Subjects/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCounterStore } from "@/store/useStore";

function Subjects() {
  const { addSubject, updateSubjectWorkSecs, Subjects } = useCounterStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [runningSubjectId, setRunningSubjectId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastRecordedWorkTime: number;
    if (runningSubjectId) {
      interval = setInterval(() => {
        setSubjects((prevSubjects) =>
          prevSubjects.map((subject) => {
            lastRecordedWorkTime = subject.workSecs;
            return subject.id === runningSubjectId
              ? { ...subject, workSecs: subject.workSecs + 1 }
              : subject;
          })
        );
      }, 1000);
    }
    return () => {
      runningSubjectId
        ? updateSubjectWorkSecs(runningSubjectId, lastRecordedWorkTime)
        : console.log("no runningSubjectId");
      clearInterval(interval);
    };
  }, [runningSubjectId]);

  const addsubject = (name: string, goalWorkSecs: number) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      workSecs: 0,
      goalWorkSecs,
      status: "not Started",
      date: new Date().toLocaleDateString(),
    };
    addSubject(newSubject);
    setSubjects((prev) => [...prev, newSubject]);
    setIsDialogOpen(false);
  };

  const toggleTimer = (subjectId: string) => {
    if (runningSubjectId === subjectId) {
      setRunningSubjectId(null);
    } else {
      setRunningSubjectId(subjectId);
    }
  };

  return (
    <section className="container mx-10 pt-20 min-h-[50vh] flex flex-col ">
      <div className="flex justify-between mb-4">
        <h1 className="text-4xl font-bold">Subjects</h1>
      </div>
      <DataTable
        columns={columns({ toggleTimer, runningSubjectId })}
        data={Subjects}
      />
      <div className="flex justify-end mt-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size={"lg"} className=" font-bold">
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements[0] as HTMLInputElement).value;
                const hours =
                  Number((form.elements[1] as HTMLInputElement).value) || 0;
                const minutes =
                  Number((form.elements[2] as HTMLInputElement).value) || 0;
                const seconds =
                  Number((form.elements[3] as HTMLInputElement).value) || 0;
                const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;
                addsubject(name, goalWorkSecs);
                form.reset();
              }}
              className="flex flex-col gap-4"
            >
              <Input placeholder="Subject Name" required />
              <div className="flex items-center gap-2">
                <Input placeholder="hh" type="number" />
                <span>:</span>
                <Input placeholder="mm" type="number" />
                <span>:</span>
                <Input placeholder="ss" type="number" />
              </div>
              <Button type="submit">Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

export default Subjects;
