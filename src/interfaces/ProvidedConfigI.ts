import LanguageInfosI from './LanguageInfosI';
import SearchModeE from '../enumerations/SearchModeE';

interface ProvidedConfigI {
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

export default ProvidedConfigI;
