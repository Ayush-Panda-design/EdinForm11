"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1, "Title required").max(300),
  description: z.string().max(2000).optional(),
  allowMultipleResponses: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  submitButtonText: z.string().optional(),
  successMessage: z.string().optional(),
});

export default function NewFormPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { allowMultipleResponses: true, showProgressBar: true },
  });

  const createForm = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created!");
      router.push("/dashboard/forms/" + data.id + "/edit");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Form</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">Set up the basics, then add fields</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => createForm.mutate(d))} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Form Title *</label>
            <input {...register("title")} placeholder="My awesome form"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea {...register("description")} rows={3} placeholder="Tell respondents what this form is about..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500 resize-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Settings</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Allow multiple responses</p>
              <p className="text-gray-500 text-xs mt-0.5">Same person can submit multiple times</p>
            </div>
            <input type="checkbox" {...register("allowMultipleResponses")} className="w-5 h-5 accent-stone-900" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Show progress bar</p>
              <p className="text-gray-500 text-xs mt-0.5">Show form completion progress</p>
            </div>
            <input type="checkbox" {...register("showProgressBar")} className="w-5 h-5 accent-stone-900" />
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Submit button text</label>
            <input {...register("submitButtonText")} placeholder="Submit" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Success message</label>
            <input {...register("successMessage")} placeholder="Thank you for submitting!"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1 text-center px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={createForm.isPending}
            className="flex-1 bg-gradient-to-r from-stone-900 to-stone-900 text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {createForm.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create & add fields →
          </button>
        </div>
      </form>
    </div>
  );
}
