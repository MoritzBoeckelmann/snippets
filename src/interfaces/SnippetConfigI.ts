import SearchModeE from '../enumerations/SearchModeE';

export default interface SnippetConfigI {
    snippetRootPath: string
    variableIndicatorStart: string
    variableIndicatorEnd: string
    searchMode: SearchModeE
    separationToken: string
    strictSeparationToken: string
}
