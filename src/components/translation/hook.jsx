"use client";

import { useEffect } from "react";

export function useAfterPaint(callback) {
  useEffect(() => {
    // Ensures it runs AFTER hydration + render + paint
    requestAnimationFrame(() => {
      callback();
    });
  });
}
