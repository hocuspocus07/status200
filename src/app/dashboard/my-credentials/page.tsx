"use client"

import * as React from "react"
import { type Credential, CredentialCard } from "@/components/credentials/credential-card"

export default function CredentialsPage() {
  // Example data. Replace with data from your API/database.
  const [credentials] = React.useState<Credential[]>([
    {
      id: "1",
      name: "example1",
      issuer: "example2e",
      issuedAt: "Aug 2025",
      verificationUrl: "https://example.com/verify/1",
      verified: true,
    },
    {
      id: "2",
      name: "example1",
      issuer: "example2e",
      issuedAt: "May 2025",
      verificationUrl: "https://example.com/verify/2",
      verified: true,
    },
    {
      id: "3",
      name: "example1",
      issuer: "example2e",
      issuedAt: "Jan 2025",
      verificationUrl: "https://example.com/verify/3",
      verified: true,
    },
  ])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          My Credentials
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          All your verified certificates in one place. Click to open their verification details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {credentials.map((c) => (
          <CredentialCard key={c.id} credential={c} />
        ))}
      </div>
    </main>
  )
}
