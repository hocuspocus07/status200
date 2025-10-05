"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type NetworkFiltersState = {
  query: string
  role: "all" | "engineer" | "designer" | "product" | "data"
  location: "all" | "Remote" | "NYC" | "SF" | "London"
  verifiedOnly: boolean
  sort: "recent" | "name" | "location"
}

export function Filters({
  value,
  onChange,
  className,
}: {
  value: NetworkFiltersState
  onChange: (nv: NetworkFiltersState) => void
  className?: string
}) {
  const queryId = useId()
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Label htmlFor={queryId}>Search</Label>
          <Input
            id={queryId}
            placeholder="Search name, title, or skills"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="sr-only">Role</Label>
          <Select
            value={value.role}
            onValueChange={(v) => onChange({ ...value, role: v as NetworkFiltersState["role"] })}
          >
            <SelectTrigger className="mt-6 md:mt-0">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="engineer">Engineer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="data">Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="sr-only">Location</Label>
          <Select
            value={value.location}
            onValueChange={(v) => onChange({ ...value, location: v as NetworkFiltersState["location"] })}
          >
            <SelectTrigger className="mt-6 md:mt-0">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="NYC">NYC</SelectItem>
              <SelectItem value="SF">SF</SelectItem>
              <SelectItem value="London">London</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="sr-only">Sort</Label>
          <Select
            value={value.sort}
            onValueChange={(v) => onChange({ ...value, sort: v as NetworkFiltersState["sort"] })}
          >
            <SelectTrigger className="mt-6 md:mt-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 md:justify-end">
          <Checkbox
            id="verifiedOnly"
            checked={value.verifiedOnly}
            onCheckedChange={(c) => onChange({ ...value, verifiedOnly: Boolean(c) })}
          />
          <Label htmlFor="verifiedOnly">Verified only</Label>
        </div>
      </div>
    </div>
  )
}
