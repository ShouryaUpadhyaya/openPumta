import React from "react";

type Prop = {
  time: {
    hr: string;
    min?: string;
    sec?: string;
  };
};
function Clock({ time }: Prop) {
  return (
    <section>
      <div className="rounded-[50%] h-60 w-60 flex justify-center items-center bg-amber-300 p-3 text-4xl ">
        <h1 className=" font-bold">
          {time.hr ? time.hr + " : " : ""}{" "}
          {time.min ? `${time.min} : ` : "00 : "}
          {time.sec ? time.sec : "00"}
        </h1>
      </div>
    </section>
  );
}

export default Clock;
