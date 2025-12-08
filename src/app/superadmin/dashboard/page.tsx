"use client";

import { useEffect, useState } from "react";
import useSWR from "swr"; // You have swr in package.json, let's use it for easy fetching
import { Loader2, Building2, CheckCircle, Clock } from "lucide-react";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Institute {
  _id: string;
  instituteId: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { data, error, isLoading } = useSWR("/api/superadmin/dashboard", fetcher);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard.</div>;
  }

  const { pending, all } = data;

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage institutes and requests</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Institutes</p>
                <h3 className="text-2xl font-bold">{all.length}</h3>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3 text-yellow-600 dark:bg-yellow-900/20">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <h3 className="text-2xl font-bold">{pending.length}</h3>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <h3 className="text-2xl font-bold">
                  {all.filter((i: Institute) => i.status === "approved").length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Table */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
          </div>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Institute Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Requested</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No pending requests found.
                    </td>
                  </tr>
                ) : (
                  pending.map((institute: Institute) => (
                    <tr key={institute._id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{institute.name}</td>
                      <td className="p-4 align-middle">{institute.email}</td>
                      <td className="p-4 align-middle">{new Date(institute.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 align-middle text-right">
                        <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}