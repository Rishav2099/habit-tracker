"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { notFound, useParams } from "next/navigation";

interface Habit {
  name: string;
  streak: number;
  daysDone: string[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const habitName = params.habitName as string;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    const storedHabits = JSON.parse(localStorage.getItem("Habits") || "[]");
    const foundHabit = storedHabits.find((h: Habit) => h.name === habitName);
    
    if (!foundHabit) {
      notFound();
    } else {
      const normalizedHabit = {
        ...foundHabit,
        daysDone: foundHabit.daysDone.map((dateStr: string | number | Date) => {
          const date = new Date(dateStr);
          return toLocalDateString(date);
        })
      };
      setHabit(normalizedHabit);
    }
    setIsLoading(false);
  }, [habitName]);

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!habit) return <p className="text-center text-red-500">Habit not found</p>;

  return (
    <div className="p-5 text-foreground bg-background min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Analytics for {habit.name}</h1>
      <div className="flex flex-col items-center">
        <div className="mb-4 p-4 bg-gray-800 rounded-lg shadow">
          <p className="text-lg text-white">
            <span className="font-bold">Current Streak:</span> {habit.streak} days
          </p>
          <p className="text-lg text-white">
            <span className="font-bold">Total Completed:</span> {habit.daysDone.length} days
          </p>
        </div>
        
        <div className="dark-calendar-container">
          <Calendar
            className="custom-calendar w-full max-w-md"
            tileClassName={({ date, view }) => {
              if (view !== "month") return "";
              
              const dateStr = toLocalDateString(date);
              const classes = [];
              
              if (habit.daysDone.includes(dateStr)) {
                classes.push("highlight-day");
              }
              
              if (isToday(date)) {
                classes.push("current-day");
              }
              
              return classes.join(" ");
            }}
          />
        </div>
      </div>
    </div>
  );
}