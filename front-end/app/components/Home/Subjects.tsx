import React from "react";
import { IoIosPlayCircle } from "react-icons/io";

function formatSeconds(total = 0) {
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function Subjects() {
  const subjects = [
    {
      name: "Maths",
      id: "1",
      DayWork: [
        {
          WorkSecsTotoal: "12345",
          logs: { startTime: "123455", endTime: "1234556" },
          remarks: "a;dlkfjasdf",
          date: "24/12/2025",
        },
        {
          WorkSecsTotoal: "72345",
          logs: { startTime: "123455", endTime: "1234556" },
          remarks: "a;dlkfjasdf",
          date: "25/12/2025",
        },
        ,
        {
          WorkSecsTotoal: "72345",
          logs: { startTime: "123455", endTime: "1234556" },
          remarks: "a;dlkfjasdf",
          date: "26/12/2025",
        },
      ],
      currentDayWork: "1234",
      currentDate: "24/12/2025",
      targetGoalSecs: "120000",
      logs: { startTime: "123455", endTime: "1234556" },
    },
  ];
  console.log(subjects);

  return (
    <section>
      <div>
        <h1 className="font-bold text-3xl ">Subjects: </h1>
        {subjects.map((subject) => {
          const today = subject.DayWork.find(
            (day) => day?.date == subject.currentDate
          );
          return (
            <div
              key={subject.id}
              className="flex items-center gap-x-3 bg-gray-900 rounded-2xl p-3"
            >
              <h1 className="text-3xl">{subject.name}</h1>
              <IoIosPlayCircle size={25} />
              <h1 className="">
                {formatSeconds(parseInt(today?.WorkSecsTotoal) ?? 0)}
              </h1>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Subjects;
