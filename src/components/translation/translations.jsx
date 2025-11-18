"use client";

import { useEffect } from "react";
import { useAfterPaint } from "./hook"; // <--- NEW HOOK

export default function Translation() {
    // Run AFTER render + hydration
    useAfterPaint(() => {
        if (typeof window === "undefined") return;
        if (process.env.NEXT_PUBLIC_NODE_ENV === "development") return;

        // Prevent duplicate initialization
        if (window.__translationWidgetLoaded) return;

        window.__translationWidgetLoaded = true;

        import("translation-widget").then(({ default: TranslationWidget }) => {
            console.log("Translation widget loaded");

            TranslationWidget(
                "pk_49cbe6260c71bf0bacc2c02b5bfb1a420f78eb88d2aa9c14f7e726590b37dd621ddcfda5d788d68522137b20e33ae16f6ee568c97f7b211ff029353dcfc4c3e8024j6hTG3D7RAHyrFMX91",
                {
                    showUI: true,
                    pageLanguage: "en",
                    position: "bottom-right",
                    autoDetectLanguage: false,
                }
            );
        });
    });

    return null;
}
