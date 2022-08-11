import LanguageService from './services/LanguageService';
import SnippetService from './services/SnippetService';
import ConfigService from './services/ConfigService';
import TranslationService from './services/TranslationService';

class Snippet {
    private static languageService: LanguageService;
    private static snippetService: SnippetService;
    private static translationService: TranslationService;
    private static configService: ConfigService;
    private static initializationDone: boolean = false;

    static init = (config = {}) => {
        this.configService = new ConfigService(config);
        this.languageService = new LanguageService(this.configService);
        this.translationService = new TranslationService(this.configService, this.languageService);
        this.snippetService = new SnippetService(this.languageService, this.translationService, this.configService);
        this.initializationDone = true;
    };

    static translate = (snippetTag: string, language: string | undefined = undefined, variables: {[key: string]: string} = {}) => {
        if(!this.initializationDone) {
            this.init();
        }

        let translation: string | undefined = this.translationService.getTranslation(snippetTag, language);
        if(translation !== undefined) {
            this.snippetService.replaceVariables(translation, variables);
        }
        return translation;
    };
}

export default Snippet;
export {Snippet, LanguageService, SnippetService, ConfigService, TranslationService};
