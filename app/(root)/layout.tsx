"use client";
import Navbar from "@/components/Navbar";
// app/providers.jsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <Providers>{children}</Providers>
    </>
  );
}
