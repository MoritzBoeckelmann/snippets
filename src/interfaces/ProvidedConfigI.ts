import SearchModeE from '../enumerations/SearchModeE';
import LanguageI from './LanguageI';
import LanguageInfosI from './LanguageInfosI';

interface ProvidedConfigI {
    snippetRootPath?: string
    variableIndicator?: string
    searchMode?: SearchModeE
    separationToken?: string
    strictSeparationToken?: string
    defaultLanguage?: string | undefined
    languages?: {
        [identifier: string]: LanguageInfosI
    }
}

export default ProvidedConfigI;
