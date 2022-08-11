import LanguageService from './LanguageService';
import TranslationService from './TranslationService';
import SnippetI from '../interfaces/SnippetI';
import ConfigService from './ConfigService';

class SnippetService {
    private languageService: LanguageService;
    private translationService: TranslationService;
    private configService: ConfigService;

    constructor(languageService: LanguageService, translationService: TranslationService, configService: ConfigService) {
        this.languageService = languageService;
        this.translationService = translationService;
        this.configService = configService;
    }

    getSnippet(snippetTag: string): SnippetI {
        let translations: {[key: string]: string} = {};
        const languageIdentifiers = this.languageService.getLanguageIdentifierList();
        languageIdentifiers.forEach(languageIdentifier => {
           const translation: string | undefined = this.translationService.getSpecificTranslation(snippetTag, languageIdentifier);
           if(translation !== undefined) {
               translations[languageIdentifier] = translation;
           }
        });
        const snippet: SnippetI = {
            snippetTag,
            translations
        }

        return snippet;
    }

    public replaceVariables(text: string, variables: {[key: string]: string}): string {


        Object.entries(variables).forEach(variable => {
            text = text.replace(this.configService.getConfig('variableIndicatorStart') + variable[0] + this.configService.getConfig('variableIndicatorEnd'), variable[1])
        })
        return text;
    }
}

export default SnippetService;
