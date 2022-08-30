import ConfigService from './ConfigService';
import LanguageService from './LanguageService';
import SnippetI from '../interfaces/SnippetI';
import TranslationService from './TranslationService';

/**
 * Service to provide any function that is needed to get full snippets or to replace variables.
 */
class SnippetService {
    /**
     * Instance of the config service which handles all available configurations.
     *
     * @private
     */
    private configService: ConfigService;

    /**
     * Instance of the language service which provides everything to handle the (available) languages.
     *
     * @private
     */
    private languageService: LanguageService;

    /**
     * Instance of the translation service which provides everything to find the correct translation of a snippet.
     *
     * @private
     */
    private translationService: TranslationService;

    /**
     * Initializing all needed services.
     *
     * @param configService Instance of the config service
     * @param languageService Instance of the language service
     * @param translationService Instance of the translation service
     */
    constructor(configService: ConfigService, languageService: LanguageService, translationService: TranslationService) {
        /**
         * Initializing the services
         */
        this.configService = configService;
        this.languageService = languageService;
        this.translationService = translationService;
    }

    /**
     * Searches for a translation for every available language.
     *
     * If there is no translation for a language this language will not be added to the returned object.
     *
     * @param snippetTag Name of the snippet that should get translated
     * @return snippet
     */
    public getSnippet(snippetTag: string): SnippetI {
        /**
         * Initializing an empty array the found translations will be added to.
         */
        let translations: {[key: string]: string} = {};

        /**
         * Requesting a list of the identifier of each available language.
         */
        const languageIdentifiers = this.languageService.getLanguageIdentifierList();

        /**
         * Running through the language identifiers and searching for their translation.
         * If a translation is found it will be added to the translations array.
         * The key of the new entry is the identifier of the language and the value the belonging translation.
         */
        languageIdentifiers.forEach(languageIdentifier => {
           const translation: string | undefined = this.translationService.getSpecificTranslation(snippetTag, languageIdentifier);
           if(translation !== undefined) {
               translations[languageIdentifier] = translation;
           }
        });

        /**
         * Building a SnippetI Object out of the provided snippetTag as well as the translations array and returning it.
         */
        return {
            snippetTag,
            translations
        }
    }

    /**
     * Runs through the array variables and replaces all occurrences of the variable with the belonging value.
     *
     * @param text
     * @param variables A array which includes all variable
     *
     * @return text
     */
    public replaceVariables(text: string, variables: {[key: string]: string}): string {
        Object.entries(variables).forEach(variable => {
            text = text.replace(
                this.configService.getConfig('variableIndicatorStart') + variable[0] + this.configService.getConfig('variableIndicatorEnd'), variable[1])
        });
        return text;
    }
}

export default SnippetService;
