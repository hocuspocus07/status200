"use client";

import * as React from "react";
import { Search, Loader2, Award, MessageSquare, ExternalLink } from "lucide-react"; // Changed UserPlus to MessageSquare
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Imports from Source 1 (Logic) ---
import { ProfileSheet } from "@/components/network/profile-sheet";
import { MessageDialog } from "@/components/network/message";
import { ConnectionsTabs } from "@/components/network/connections";
import { ProfileData } from "@/components/network/types"; 

interface SearchResponse {
  results: ProfileData[];
  error?: string;
}

export default function NetworkSearchPage() {
  const [query, setQuery] = React.useState<string>("");
  const [users, setUsers] = React.useState<ProfileData[]>([]);
  const [isSearching, setIsSearching] = React.useState<boolean>(true);
  const [token, setToken] = React.useState<string | null>(null);

  // --- Logic for Profile & Messaging ---
  const [selectedUser, setSelectedUser] = React.useState<ProfileData | null>(null);
  const [chatUser, setChatUser] = React.useState<ProfileData | null>(null);

  React.useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // --- 1. Reusable Fetch Function ---
  const fetchUsers = React.useCallback(async (searchQuery: string = "") => {
    setIsSearching(true);
    setUsers([]);

    try {
      const url = `/api/search/certificates${
        searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""
      }`;

      const response = await fetch(url);
      const data: SearchResponse = await response.json();

      if (response.ok) {
        // Map results to ensure compatibility with ProfileData type
        const mappedUsers = (data.results || []).map((u) => ({
          ...u,
          matchedCertificates: u.matchedCertificates || [],
        }));
        setUsers(mappedUsers);
      } else {
        toast.error(data.error || "Failed to fetch results.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // --- 2. Initial Load Effect ---
  React.useEffect(() => {
    fetchUsers("");
  }, [fetchUsers]);

  // --- 3. Handle Form Submit ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(query);
  };

  // --- Handlers ---
  
  // Updated: Opens Message Dialog instead of just a Toast
  const handleMessage = (e: React.MouseEvent, user: ProfileData) => {
    e.stopPropagation(); 
    setChatUser(user);
  };

  const handleViewProfile = (user: ProfileData) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* --- Main Content Area --- */}
      <main className={cn("px-4 py-6 md:px-8 w-full flex-1")}>
        
        {/* Page Header */}
        <section aria-labelledby="search-title" className="mb-6">
          <h1 id="search-title" className="text-2xl font-semibold text-foreground text-balance">
            Talent Search
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Find people with specific verified skills and certificates.
          </p>
        </section>

        {/* Search Input Section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by skill (e.g. 'Python', 'NSQF Level 5')..."
                className="pl-9 h-11 bg-muted/30 border-muted-foreground/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching} size="lg" className="h-11 px-6">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>

        {/* Results Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-semibold">
              {query ? "Search Results" : "Suggested People"}
            </h2>
            {!isSearching && (
              <span className="text-xs text-muted-foreground">
                {users.length} results
              </span>
            )}
          </div>

          {!isSearching && users.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search terms.</p>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
              <p>Searching talent pool...</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {users.map((user) => (
              <Card
                key={user._id}
                className="p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-start transition-all hover:shadow-sm border-muted-foreground/15"
              >
                {/* Avatar */}
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm shrink-0">
                  <AvatarImage src={user.profile?.avatar} alt={user.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Main Content */}
                <div className="flex-1 w-full min-w-0 space-y-3">
                  <div>
                    <h3
                      className="text-lg font-semibold leading-tight hover:text-primary transition-colors cursor-pointer truncate"
                      onClick={() => handleViewProfile(user)}
                    >
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate leading-snug">
                      {user.headline || user.email}
                    </p>
                  </div>

                  {/* Certificates */}
                  <div className="bg-muted/40 rounded-lg p-3 border border-muted-foreground/10 text-sm">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-primary uppercase tracking-wider">
                      <Award className="h-3.5 w-3.5" />
                      {query ? "Matched Credentials" : "Top Credentials"}
                    </div>

                    <div className="space-y-2">
                      {user.matchedCertificates?.slice(0, 3).map((cert, index) => (
                        <div
                          key={`${cert._id}-${index}`}
                          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-4 gap-y-1 bg-background p-2 rounded-md border shadow-sm"
                        >
                          <div className="font-medium truncate flex-1 min-w-[120px]">
                            {cert.course}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                            <span className="truncate max-w-[100px]">
                              {cert.issued_by}
                            </span>
                            {cert.nsqf_level && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 px-1.5 font-normal bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
                              >
                                NSQF {cert.nsqf_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {(user.matchedCertificates?.length || 0) > 3 && (
                        <p className="text-xs text-muted-foreground pl-1">
                          +{ (user.matchedCertificates?.length || 0) - 3 } more relevant certificates
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex shrink-0 flex-col sm:flex-row gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto gap-2"
                    onClick={() => handleViewProfile(user)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Profile
                  </Button>
                  
                  {/* Replaced Connect with Message */}
                  <Button
                    className="w-full sm:w-auto gap-2"
                    onClick={(e) => handleMessage(e, user)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* --- Profile Sheet & Message Dialog --- */}
        <ProfileSheet
          user={selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
          onMessage={() => {
            if (selectedUser) {
              setChatUser(selectedUser);
              setSelectedUser(null);
            }
          }}
        />

        <MessageDialog
          user={chatUser}
          onOpenChange={(open) => !open && setChatUser(null)}
        />
      </main>

      <aside className="hidden lg:block w-80 shrink-0 sticky top-0 h-screen overflow-y-auto border-l bg-muted/10 pl-4 pr-6 py-6">
        <ConnectionsTabs token={token} />
      </aside>
    </div>
  );
}