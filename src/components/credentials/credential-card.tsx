"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle} from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export type Credential = {
  id: string
  name: string
  issuer: string
  issuedAt?: string
  verificationUrl: string
  verified?: boolean
}

export function CredentialCard({
  credential,
  className,
}: {
  credential: Credential
  className?: string
}) {
  return (
    <Card className={cn("group relative overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base leading-snug text-foreground">{credential.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {credential.issuer} {credential.issuedAt ? `• ${credential.issuedAt}` : ""}
          </p>
        </div>
        {credential.verified ? <Badge variant="secondary">Verified</Badge> : null}
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{"View verification details"}</div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="transition-transform group-hover:translate-x-0.5 bg-transparent"
        >
          <Link href={credential.verificationUrl} target="_blank" rel="noopener noreferrer">
            Open
          </Link>
        </Button>
      </CardContent>

      <Link
        href={credential.verificationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${credential.name}`}
        className="absolute inset-0"
      />
    </Card>
  )
}
