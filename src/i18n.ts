import i18n from "i18next";
import Backend from "i18next-xhr-backend";
import { initReactI18next } from "react-i18next";

export type Language = 
  | "en"
  | "de"
  | "fr"
  | "it"
  | "zhs";

i18n
  .use(Backend) // Error here
  .use(initReactI18next) // If you remove above, error will be here...
  .init({
    lng: localStorage.getItem('I18N_LANGUAGE') || "en",
    fallbackLng: "en",
    debug: false,
    ns: ["translations"],
    defaultNS: "translations",
    keySeparator: ".", // we use content as keys
    interpolation: {
      escapeValue: false,
    },
    react: {
      bindI18n: "languageChanged",
      transEmptyNodeValue: "",
      useSuspense: false,
    },
    backend: {
      loadPath: "/src/i18n/{{lng}}/{{ns}}.json",
    },
  });

const langs: any = {
    'en': "English",
    "zhs": "中文",
    "es": "Español",
    "ru": "русский",
    'de': "Deutsch",
    "jp": "日本語",
    "fr": "Français",
    "it": "Italiano",
    "po": "Polski"
}

export { i18n, langs };