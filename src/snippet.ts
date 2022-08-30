import ConfigService from './services/ConfigService';
import LanguageService from './services/LanguageService';
import SnippetService from './services/SnippetService';
import TranslationService from './services/TranslationService';

/**
 * A wrapper class to provide quick access to the translation feature of this plugin.
 */
class Snippet {
    /**
     * Instance of the config service which handles all available configurations.
     *
     * @private
     */
    private static configService: ConfigService;

    /**
     * Instance of the language service which provides everything to handle the (available) languages.
     *
     * @private
     */
    private static languageService: LanguageService;

    /**
     * Instance of the snippet service which provides everything to build a full snippet or to replace variables.
     *
     * @private
     */
    private static snippetService: SnippetService;

    /**
     * Instance of the translation service which provides everything to find the correct translation of a snippet.
     *
     * @private
     */
    private static translationService: TranslationService;

    /**
     * A check to make sure the services are initialized.
     *
     * @private
     */
    private static initializationDone: boolean = false;

    /**
     * Initializes all services needed.
     *
     * @param config Configuration that's getting considered for further translate calls.
     */
    static init = (config: Object = {}) => {
        // Initializing the services
        this.configService = new ConfigService(config);
        this.languageService = new LanguageService(this.configService);
        this.translationService = new TranslationService(this.configService, this.languageService);
        this.snippetService = new SnippetService(this.configService, this.languageService, this.translationService);

        // Switching initializationDone to true to save that the initialization is completed.
        this.initializationDone = true;
    };

    /**
     * Searches for a translation of a snippet.
     *
     * If there is no translation for the requested language the translation of its fallback language will be taken.
     * If there is no fallback language or no translation for the fallback language
     * the translation of the default language will be returned.
     *
     * @param snippetTag Name of the snippet that should be translated
     * @param language Language the snippet should be translated to.
     * @param variables Variables that should be replaced in the translation.
     *
     * @return translation | undefined
     */
    static translate = (snippetTag: string, language: string | undefined = undefined, variables: {[key: string]: string} = {}): string | undefined => {
        // Initializing the needed services if it is not done yet
        if(!this.initializationDone) {
            this.init();
        }

        // Searching for the translation of the provided snippet.
        let translation: string | undefined = this.translationService.getTranslation(snippetTag, language);

        // If a translation was found, every occurrence of the provided variables will be replaced by their value.
        if(translation !== undefined) {
            translation = this.snippetService.replaceVariables(translation, variables);
        }

        // Returning the translation
        return translation;
    };
}

export {Snippet, LanguageService, SnippetService, ConfigService, TranslationService};
