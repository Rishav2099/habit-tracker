"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface HabitData {
  name: string;
  streak: number;
  daysDone: string[];
}

// Dropdown Menu Component
const HabitMenu = ({
  isOpen,
  onClose,
  onAnalytics,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAnalytics: () => void;
  onDelete: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-10"
    >
      <button
        onClick={() => {
          onAnalytics();
          onClose();
        }}
        className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200"
      >
        📊 Analytics
      </button>
      <button
        onClick={onDelete}
        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
      >
        ❌ Delete
      </button>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmDeleteModal = ({
  habitName,
  onConfirm,
  onCancel,
}: {
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-20">
    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
      <p className="mb-6">
        Are you sure you want to delete <strong>{habitName}</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const HabitsList = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; name: string } | null>(null);
  const router = useRouter();

  const toggleMenu = (index: number) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

  useEffect(() => {
    const storedHabits = localStorage.getItem("Habits");
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
  }, []);

  const getLast7Days = () => {
    const today = new Date();
    return Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        return date.toISOString().split("T")[0];
      })
      .reverse();
  };

  const last7Days = getLast7Days();

  const toggleStreak = (date: string, name: string) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.name === name) {
        const updatedDays = habit.daysDone.includes(date)
          ? habit.daysDone.filter((d) => d !== date)
          : [...habit.daysDone, date];

        updatedDays.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        let streak = 0;
        if (updatedDays.length > 0) {
          streak = 1;
          for (let i = updatedDays.length - 1; i > 0; i--) {
            const currDate = new Date(updatedDays[i]);
            const prevDate = new Date(updatedDays[i - 1]);
            const diffInDays =
              (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffInDays > 1) break;
            streak++;
          }
        }

        return { ...habit, daysDone: updatedDays, streak };
      }
      return habit;
    });

    setHabits(updatedHabits);
    localStorage.setItem("Habits", JSON.stringify(updatedHabits));
  };

  const handleDelete = (index: number) => {
    const habitToDelete = habits[index];
    setDeleteConfirm({ index, name: habitToDelete.name });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      const updatedHabits = habits.filter((_, i) => i !== deleteConfirm.index);
      setHabits(updatedHabits);
      localStorage.setItem("Habits", JSON.stringify(updatedHabits));
      setDeleteConfirm(null);
      setMenuOpen(null); // Close menu after delete
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleAnalytics = (habitName: string) => {
    router.push(`/analytics/${habitName}`);
  };

  return (
    <>
      {habits.length > 0 ? (
        habits.map((habit, index) => (
          <div
            key={index}
            className="border border-yellow-500 mx-7 my-5 px-5 rounded-lg bg-amber-400/20"
          >
            <div className="flex mt-3 items-center justify-between">
              <div className="flex items-center max-w-[50%] mb-10">
                <p className="font-bold text-2xl">{habit.name}</p>
                <div className="flex items-center gap-2 ml-4">
                  <Image src="/streak.png" alt="streak" width={35} height={50} />
                  <span className="font-bold text-2xl">{habit.streak}</span>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => toggleMenu(index)}
                  className="text-2xl cursor-pointer focus:outline-none"
                  aria-label={`Options for ${habit.name}`}
                >
                  ⋮
                </button>
                <HabitMenu
                  isOpen={menuOpen === index}
                  onClose={() => setMenuOpen(null)}
                  onAnalytics={() => handleAnalytics(habit.name)}
                  onDelete={() => handleDelete(index)}
                />
              </div>
            </div>
            <div className="flex justify-between my-5">
              {last7Days.map((day, idx) => (
                <span
                  key={idx}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border cursor-pointer ${
                    habit.daysDone.includes(day)
                      ? "bg-green-400 text-white"
                      : "border-gray-400"
                  }`}
                  onClick={() => toggleStreak(day, habit.name)}
                >
                  {day.split("-")[2]}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No habits added yet</p>
      )}

      {deleteConfirm && (
        <ConfirmDeleteModal
          habitName={deleteConfirm.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <button
        onClick={() => router.push("/add")}
        className="fixed bottom-5 right-5 bg-cyan-400 text-black rounded-full h-12 w-12 text-2xl font-bold cursor-pointer"
      >
        +
      </button>
    </>
  );
};

export default HabitsList;