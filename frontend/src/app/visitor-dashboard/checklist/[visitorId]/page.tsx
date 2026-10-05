"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VISITOR_CHECKLISTS } from "@/graphql/queries";
import {
  CREATE_CHECKLIST,
  UPDATE_CHECKLIST,
  DELETE_CHECKLIST,
  CLEAR_ALL_CHECKLISTS,
  RESET_DEFAULT_CHECKLIST,
} from "@/graphql/mutations";
import CategoryDropdown from "@/components/visitor-dashboard/checklist/CategoryDropDown";
import AddEditTaskModal from "@/components/visitor-dashboard/checklist/AddEditModal";
import { TaskType } from "@/types/taskTypes";
import ProgressBar from "@/components/visitor-dashboard/checklist/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  FiCheckSquare,
  FiArrowLeft,
  FiPlus,
  FiSearch,
  FiClock,
  FiList,
  FiCheckCircle,
  FiFolder,
  FiTrash2,
  FiRotateCcw,
} from "react-icons/fi";

const ChecklistPage = () => {
  const params = useParams();
  const { visitorId } = params;
  const { data, loading, error, refetch } = useQuery(GET_VISITOR_CHECKLISTS, {
    variables: { visitorId },
    skip: !visitorId,
  });

  const [createTask] = useMutation(CREATE_CHECKLIST);
  const [updateTask] = useMutation(UPDATE_CHECKLIST);
  const [deleteTask] = useMutation(DELETE_CHECKLIST);

  const [clearAllChecklists, { loading: clearingLoading }] = useMutation(CLEAR_ALL_CHECKLISTS, {
    onCompleted: () => {
      toast.success("All tasks cleared!");
      refetch();
    },
    onError: (err) => {
      toast.error("Failed to clear tasks: " + err.message);
    },
  });

  const [resetDefaultChecklist, { loading: resettingLoading }] = useMutation(RESET_DEFAULT_CHECKLIST, {
    onCompleted: () => {
      toast.success("Wedding master checklist loaded!");
      refetch();
    },
    onError: (err) => {
      toast.error("Failed to load checklist: " + err.message);
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState(false);

  const tasks = useMemo(
    () => (data?.getVisitorChecklists as TaskType[]) || [],
    [data]
  );

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(tasks.map((task: TaskType) => task.category).filter(Boolean))
    );
    return unique.length > 0
      ? unique
      : [
          "Venue",
          "Photos & Videos",
          "Food & Drink",
          "Attire",
          "Music",
          "Flower & Decor",
          "Registry",
          "Invitation & Paper",
          "Beauty",
          "Ceremony",
          "Guests",
          "Travel",
        ];
  }, [tasks]);

  const finalFilteredTasks = useMemo(() => {
    let filtered = tasks;
    if (searchQuery) {
      filtered = filtered.filter((task: TaskType) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedMonth) {
      filtered = filtered.filter((task: TaskType) => {
        const dueDate = new Date(Number(task.due_date));
        const taskMonth = dueDate.toLocaleString("default", { month: "long" });
        return taskMonth === selectedMonth;
      });
    }
    if (showCompleted) {
      filtered = filtered.filter((task: TaskType) => task.completed);
    }
    return filtered;
  }, [tasks, searchQuery, selectedMonth, showCompleted]);

  const handleAddTask = (category?: string) => {
    setActiveCategory(category || null);
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask({ variables: { id } });
      toast.success("Task deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Error deleting task");
      console.error("Error deleting task:", error);
    }
  };

  const handleClearAll = () => {
    toast((t) => (
      <div className="space-y-2 p-1 font-body">
        <p className="text-sm font-semibold text-gray-800">
          Clear all {tasks.length} tasks from your checklist?
        </p>
        <p className="text-xs text-gray-500">
          This will wipe your current list so you can start completely blank.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearAllChecklists({ variables: { visitorId } });
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Yes, Clear All
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleResetDefault = () => {
    toast((t) => (
      <div className="space-y-2 p-1 font-body">
        <p className="text-sm font-semibold text-gray-800">
          Load wedding master template (79 tasks)?
        </p>
        <p className="text-xs text-gray-500">
          This will reset your checklist with standard milestones scheduled relative to your wedding date.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              resetDefaultChecklist({ variables: { visitorId } });
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-orange text-white hover:bg-orange/90"
          >
            Yes, Load Template
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleSaveTask = async (taskInput: Partial<TaskType>) => {
    try {
      if (selectedTask) {
        if (!selectedTask.id) {
          throw new Error("Task ID is missing for update!");
        }

        await updateTask({
          variables: {
            input: {
              id: selectedTask.id,
              ...taskInput,
            },
          },
        });
        toast.success('Task updated successfully');
      } else {
        await createTask({
          variables: { input: { ...taskInput, visitorId } },
        });
        toast.success('Task added successfully');
      }
      setModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Error saving task');
      console.error("Error saving task:", error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateTask({
        variables: { input: { id, completed } },
      });
      toast.success(
        `Task marked as ${completed ? "completed" : "incomplete"}!`
      );
      refetch();
    } catch (error) {
      toast.error("Error toggling task completion");
      console.error("Error toggling task completion:", error);
    }
  };

  if (!visitorId) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-2 border-orange/20 max-w-lg mx-auto mt-12">
        <p className="text-gray-700 font-title text-lg font-bold">Please log in to view your checklist.</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="w-full space-y-6 animate-fade-in">
        {/* Hero Card Skeleton */}
        <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          </div>
          <Skeleton className="h-20 w-56 rounded-2xl" />
        </div>

        {/* 4 Metric Pills Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-darkSurface rounded-2xl border-2 border-orange/20 dark:border-zinc-800 p-4 sm:p-5 shadow-2xs space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Action Bar Skeleton */}
        <div className="bg-white dark:bg-darkSurface rounded-2xl border-2 border-orange/20 dark:border-zinc-800 p-4 flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Task Items Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-darkSurface rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-2 border-orange/20 max-w-lg mx-auto mt-12">
        <p className="text-red-500 font-semibold mb-2 font-title text-lg">Error loading checklist</p>
        <p className="text-xs text-gray-500 font-body">{error.message}</p>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: TaskType) => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* 1. Hero Card */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <Link
              href="/visitor-dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange bg-orange/5 dark:bg-darkElevated hover:bg-orange/15 dark:hover:bg-orange/15 border border-orange/20 dark:border-zinc-800 transition-all duration-200 active:scale-95 group w-fit"
            >
              <FiArrowLeft className="text-base sm:text-sm transition-transform group-hover:-translate-x-1 text-orange" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
              <FiCheckSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                My Wedding Checklist
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
                Stay organized and stress-free throughout your wedding journey.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Card on the right */}
        <div className="bg-orange/[0.05] dark:bg-orange/[0.08] border-2 border-orange/15 rounded-2xl p-5 flex items-center gap-6 shrink-0 justify-between lg:justify-end">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-body">
              Completed
            </p>
            <p className="text-3xl sm:text-4xl font-black font-title text-orange">
              {progress}%
            </p>
          </div>
          <div className="h-10 w-px bg-orange/20" />
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-body">
              Tasks Done
            </p>
            <p className="text-2xl sm:text-3xl font-black font-title text-gray-900 dark:text-zinc-100">
              {completedTasks} / {totalTasks}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Metrics Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-darkSurface rounded-2xl border-2 border-orange/20 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-body">
            <FiList className="text-orange" size={14} />
            <span>Total Tasks</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-title text-gray-900 dark:text-zinc-100 mt-2">
            {totalTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-darkSurface rounded-2xl border-2 border-orange/20 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-body">
            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={14} />
            <span>Completed</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-title text-emerald-600 dark:text-emerald-400 mt-2">
            {completedTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-darkSurface rounded-2xl border-2 border-orange/20 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-orange uppercase tracking-wider font-body">
            <FiClock className="text-orange" size={14} />
            <span>Remaining</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-title text-orange mt-2">
            {remainingTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-darkSurface rounded-2xl border-2 border-orange/20 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-body">
            <FiFolder className="text-orange" size={14} />
            <span>Categories</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-title text-gray-900 dark:text-zinc-100 mt-2">
            {categories.length}
          </p>
        </div>
      </div>

      {/* 3. Tasks Toolbar & Progress Card */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-orange/15 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-title text-gray-900 dark:text-zinc-100">
              Tasks & Milestones
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
              Filter by category, search by keyword, or manage wedding milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {totalTasks > 0 && (
              <>
                <button
                  onClick={handleClearAll}
                  disabled={clearingLoading}
                  className="border-2 border-red-200 dark:border-red-900/60 hover:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title="Wipe all tasks to start blank"
                >
                  <FiTrash2 size={15} />
                  <span>Clear All</span>
                </button>

                <button
                  onClick={handleResetDefault}
                  disabled={resettingLoading}
                  className="border-2 border-orange/20 hover:border-orange bg-orange/[0.04] dark:bg-orange/[0.08] text-gray-800 dark:text-zinc-200 hover:text-orange dark:hover:text-orange px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title="Reload standard 79-task timeline"
                >
                  <FiRotateCcw size={15} />
                  <span>Reset Template</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleAddTask()}
              className="bg-orange hover:bg-orange/90 text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-xs hover:shadow-md"
            >
              <FiPlus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Component (Only if tasks exist) */}
        {totalTasks > 0 && (
          <div className="bg-orange/[0.03] dark:bg-darkElevated/40 border-2 border-orange/15 dark:border-zinc-800 rounded-2xl p-4 sm:p-5">
            <ProgressBar completed={completedTasks} total={totalTasks} />
          </div>
        )}

        {/* Filters Toolbar (Only if tasks exist) */}
        {totalTasks > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-orange/[0.02] dark:bg-darkElevated border-2 border-orange/20 dark:border-zinc-700 focus:border-orange rounded-xl focus:outline-none focus:ring-1 focus:ring-orange text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 transition-all font-body"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={16} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Month Selection */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-2 border-orange/20 dark:border-zinc-700 focus:border-orange rounded-xl px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }).map((_, index) => {
                  const month = new Date(0, index).toLocaleString("default", {
                    month: "long",
                  });
                  return (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  );
                })}
              </select>

              {/* Show Completed Toggle */}
              <label className="inline-flex items-center gap-2.5 cursor-pointer bg-orange/[0.04] dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={() => setShowCompleted(!showCompleted)}
                  className="hidden"
                />
                <span
                  className={`relative inline-block w-9 h-5 transition-colors duration-200 ease-linear rounded-full ${
                    showCompleted ? "bg-orange" : "bg-gray-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 inline-block w-4 h-4 transform transition-transform duration-200 ease-linear bg-white rounded-full shadow-xs ${
                      showCompleted ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </span>
                <span>{showCompleted ? "Completed Only" : "All Tasks"}</span>
              </label>
            </div>
          </div>
        )}

        {/* Empty State when 0 total tasks */}
        {totalTasks === 0 ? (
          <div className="border-2 border-dashed border-orange/20 dark:border-zinc-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 bg-orange/[0.02] dark:bg-darkElevated/30">
            <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center text-orange mx-auto">
              <FiCheckSquare size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold font-title text-gray-800 dark:text-zinc-100">
                Your Checklist is Currently Empty
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body max-w-md mx-auto">
                You can load our curated 79-task master wedding timeline scheduled relative to your wedding date, or start with your own custom tasks.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => resetDefaultChecklist({ variables: { visitorId } })}
                disabled={resettingLoading}
                className="bg-orange hover:bg-orange/90 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <FiRotateCcw size={15} />
                <span>Load Wedding Master Timeline (79 Tasks)</span>
              </button>
              <button
                onClick={() => handleAddTask()}
                className="border-2 border-orange/20 hover:border-orange bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-200 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
              >
                <FiPlus size={15} />
                <span>Add Custom Task</span>
              </button>
            </div>
          </div>
        ) : (
          /* Categories and Tasks Accordions */
          <div className="space-y-4 pt-2">
            {categories.map((category) => {
              const categoryTasks = finalFilteredTasks.filter(
                (task: TaskType) => task.category === category
              );

              if ((searchQuery || selectedMonth || showCompleted) && categoryTasks.length === 0) {
                return null;
              }

              return (
                <CategoryDropdown
                  key={category}
                  category={category}
                  tasks={categoryTasks}
                  onAddTask={() => handleAddTask(category)}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <AddEditTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        initialData={
          selectedTask
            ? {
                id: selectedTask.id,
                title: selectedTask.title,
                due_date: selectedTask.due_date,
                category: selectedTask.category,
                notes: selectedTask.notes || "",
              }
            : activeCategory
            ? {
                title: "",
                due_date: "",
                category: activeCategory,
                notes: "",
              }
            : undefined
        }
      />
    </div>
  );
};

export default ChecklistPage;