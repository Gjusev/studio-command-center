"use client";

import { useEffect } from "react";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsentApi from "vanilla-cookieconsent";

declare global {
  interface Window {
    dataLayer: any[];
    [key: string]: any;
  }
}

export const CookieConsent = () => {
  useEffect(() => {
    CookieConsentApi.run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom left",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          readOnly: true,
          enabled: true,
        },
      },
      language: {
        default: "de",
        autoDetect: "browser",
        translations: {
          de: {
            consentModal: {
              title: "Datenschutz & Transparenz",
              description:
                "Wir nutzen anonyme Analysetools (Rybbit), die ohne Cookies auskommen und keine personenbezogenen Daten speichern – daher ist keine Einwilligung erforderlich. Für erweiterte Analysen (z.B. Google Analytics) benötigen wir Ihre Zustimmung.",
              acceptAllBtn: "Alles akzeptieren",
              acceptNecessaryBtn: "Nur Notwendiges",
              showPreferencesBtn: "Einstellungen",
              footer: `
                <a href="/impressum">Impressum</a>
                <a href="/datenschutz">Datenschutz</a>
              `,
            },
            preferencesModal: {
              title: "Datenschutz-Einstellungen",
              acceptAllBtn: "Alles akzeptieren",
              acceptNecessaryBtn: "Nur Notwendiges",
              savePreferencesBtn: "Speichern",
              closeIconLabel: "Schließen",
              sections: [
                {
                  title: "Verwendung von Cookies",
                  description:
                    "Wir legen großen Wert auf Datenschutz. Hier sehen Sie transparent, welche Tools wir nutzen.",
                },
                {
                  title: "Anonyme Statistik (immer aktiv)",
                  description:
                    "Rybbit Analytics läuft ohne Cookies und speichert keine personenbezogenen Daten. Da die Daten vollständig anonymisiert sind, ist keine Einwilligung erforderlich (Art. 6 Abs. 1 lit. f DSGVO).",
                  linkedCategory: "necessary",
                  cookieTable: {
                    headers: {
                      name: "Name",
                      domain: "Dienst",
                      desc: "Zweck",
                    },
                    body: [
                      {
                        name: "—",
                        domain: "Rybbit Analytics (immer aktiv, keine Cookies)",
                        desc: "Anonyme Besucherstatistik. Keine Cookies, keine personenbezogenen Daten, kein Cross-Site-Tracking. IP-Adressen werden anonymisiert. DSGVO-konform ohne Einwilligung.",
                      },
                      {
                        name: "cc_cookie",
                        domain: "Cookie Consent",
                        desc: "Speichert Ihre Datenschutz-Einstellungen.",
                      },
                    ],
                  },
                },
                {
                  title: "Analytics & Marketing (optional)",
                  description:
                    "Aktuell sind keine optionalen Analyse-Tools aktiviert. Bei zukünftiger Integration wird hier die Einwilligung eingeholt.",
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return null;
};
