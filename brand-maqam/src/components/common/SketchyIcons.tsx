"use client";

import React from "react";

// Sketchy/Hand-drawn Icon Collection matching image_7 aesthetics
export const SketchyCart = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10,20 L25,20 L35,70 L85,70 L90,30 L30,30" />
    <circle cx="40" cy="85" r="5" />
    <circle cx="80" cy="85" r="5" />
    <path d="M45,45 L75,45 M45,55 L75,55" opacity="0.5" />
  </svg>
);

export const SketchyUser = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="35" r="20" />
    <path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85" />
    <path d="M45,45 L55,45" opacity="0.3" />
  </svg>
);

export const SketchyTruck = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10,65 L80,65 L80,30 L45,30 L45,20 L10,20 Z" />
    <path d="M80,65 L90,65 L90,45 L80,45" />
    <circle cx="30" cy="75" r="8" />
    <circle cx="70" cy="75" r="8" />
    <path d="M5,35 L15,35 M5,45 L15,45 M5,55 L15,55" opacity="0.6" />
  </svg>
);

export const SketchyGroup = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="30" r="12" />
    <path d="M35,60 C35,50 42,45 50,45 C58,45 65,50 65,60" />
    <circle cx="25" cy="40" r="10" />
    <path d="M15,65 C15,58 20,55 25,55 C30,55 35,58 35,65" />
    <circle cx="75" cy="40" r="10" />
    <path d="M65,65 C65,58 70,55 75,55 C80,55 85,58 85,65" />
  </svg>
);
