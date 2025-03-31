"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter()
  const [habit, setHabit] = useState<string>("");

  interface HabitData {
    name: string;
    streak: number;
    daysDone: number[];
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (habit === '') {
      return new Error('Habit name is empty')
    }

    const newHabit: HabitData = {
      name: habit || "",
      streak: 0,
      daysDone: [],
    };
    localStorage.setItem(
      "Habits",
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem("Habits") || "[]")),
        newHabit,
      ])
    );
    setHabit("");
    router.push('/')
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="text-2xl font-bold mb-5">Add Habit</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-5 border-2 p-10 rounded-xl"
      >
        {/* Habit Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="habit" className="font-medium text-[#a8a8a8]">
            Habit Name
          </label>
          <input
            type="text"
            id="habit"
            name="habit"
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            placeholder="Enter habit name"
            className="border border-gray-400 px-3 py-2 rounded-md w-64 focus:outline-none focus:ring-1 focus:bg-black bg-[#1c1c1c] focus:ring-white"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center mt-5">
          <button
            type="submit"
            className="bg-white text-black py-2 px-5 cursor-pointer rounded-full"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
