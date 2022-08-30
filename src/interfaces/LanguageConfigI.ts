import LanguageI from './LanguageI';

export default interface LanguageConfigI extends Object {
    defaultLanguage: string | undefined
    languages: LanguageI[]
}
