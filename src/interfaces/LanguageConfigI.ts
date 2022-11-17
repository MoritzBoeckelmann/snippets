import LanguageI from './LanguageI';

interface LanguageConfigI extends Object {
    defaultLanguage: string | undefined
    languages: LanguageI[]
}

export default LanguageConfigI;
