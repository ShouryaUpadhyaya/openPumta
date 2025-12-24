"use client";
import Clock from "./components/Home/Clock";
import Habits from "./components/Home/Habits";
import Stats from "./components/Home/Stats";
import Subjects from "./components/Home/Subjects";
export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <Clock time={{ hr: "01" }} />
        <Subjects />
      </div>
      <div className="flex flex-row gap-4">
        <Habits />
        <Stats />
      </div>
    </div>
  );
}
