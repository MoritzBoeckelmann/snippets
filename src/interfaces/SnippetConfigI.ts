import SearchModeE from '../enumerations/SearchModeE';

interface SnippetConfigI {
    snippetRootPath: string
    variableIndicatorStart: string
    variableIndicatorEnd: string
    searchMode: SearchModeE
    separationToken: string
    strictSeparationToken: string
}

export default SnippetConfigI;
