"use client";

import React, { useState, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "العربية", flag: "🇦🇪" },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const cookieVal = getCookie("googtrans");
    if (cookieVal) {
      const lang = cookieVal.split("/").pop();
      if (lang) {
        setCurrentLang(lang);
      }
    }

    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
          "google_translate_element"
        );
      };

      const addScript = () => {
        const s = document.createElement("script");
        s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        s.async = true;
        document.body.appendChild(s);
      };
      addScript();
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
    setCurrentLang(langCode);
    setDropdownOpen(false);
    window.location.reload();
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left z-50">
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all shadow-sm active:scale-95"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500" />
        <span>{activeLang.flag} {activeLang.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white border border-slate-100 shadow-xl z-50 overflow-hidden py-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                  currentLang === lang.code ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Global CSS to strip Google Translate frames/styles */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        #goog-gt-tt {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-logo-link {
          display: none !important;
        }
        .goog-te-gadget {
          color: transparent !important;
        }
        .goog-te-gadget img {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
