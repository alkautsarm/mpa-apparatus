import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { z } from "zod";
import { makeZodI18nMap } from "zod-i18n-map";
import enZod from "zod-i18n-map/locales/en/zod.json";
import idZod from "zod-i18n-map/locales/id/zod.json";

import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import idAuth from "./locales/id/auth.json";
import idCommon from "./locales/id/common.json";
import idHome from "./locales/id/home.json";

export function initI18n(): void {
  if (i18next.isInitialized) return;

  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      defaultNS: "common",
      ns: ["common", "auth", "home", "zod"],
      resources: {
        en: { common: enCommon, auth: enAuth, home: enHome, zod: enZod },
        id: { common: idCommon, auth: idAuth, home: idHome, zod: idZod },
      },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
      interpolation: { escapeValue: false },
    });

  z.setErrorMap(makeZodI18nMap({ t: i18next.t.bind(i18next) }));
}

export { i18next };
