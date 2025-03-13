import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-locize-backend';

const locizeOptions = {
    projectId: '13a4e68e-3014-438f-abe9-ebb6fbf43641',
    apiKey: '00a9e48a-6850-40c1-9ed8-31d264fc907c', // YOU should not expose your apps API key to production!!!
    referenceLng: 'en',
};

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        backend: locizeOptions,
        saveMissing: true
    });

export default i18n;