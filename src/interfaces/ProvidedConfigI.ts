import SearchModeE from '../enumerations/SearchModeE';
import LanguageInfosI from './LanguageInfosI';

export default interface ProvidedConfigI {
    defaultLanguage?: string | undefined
    languages?: {
        [identifier: string]: LanguageInfosI
    }
    searchMode?: SearchModeE
    separationToken?: string
    snippetRootPath?: string
    strictSeparationToken?: string
    variableIndicator?: string
}
