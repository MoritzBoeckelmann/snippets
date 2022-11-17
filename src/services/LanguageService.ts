import ConfigService from './ConfigService';
import LanguageI from '../interfaces/LanguageI';

/**
 * Service including every methode regarding the available languages.
 */
class LanguageService {
    /**
     * Instance of the config service holding every configuration value and important methods.
     * @private
     */
    private readonly configService: ConfigService;

    /**
     * Initializing all needed services.
     * @param configService Instance of the config service
     */
    constructor(configService: ConfigService) {
        // Initializing all needed services.
        this.configService = configService;
    }

    /**
     * Returns a list of all language identifiers.
     * @returns string[]
     */
    public getLanguageIdentifierList(): string[] {
        // Requesting an array with all languages and mapping this list to a string array including the identifier from every language.
        return this.configService.getConfig('languages').map((language: LanguageI) => {
            return language.identifier;
        });
    }

    /**
     * Provides an array with all available languages.
     * @returns LanguageI[]
     */
    public getLanguages(): LanguageI[] {
        // Returning the available languages from the config service.
        return this.configService.getConfig('languages');
    }

    /**
     * Returns the full information of the language with the provided identifier.
     * If there is no language with that identifier, undefined will be returned.
     *
     * @param identifier The identifier that should be searched for.
     *
     * @returns LanguageI|undefined
     */
    public getLanguage(identifier: string): LanguageI | undefined {
        // Runs throw all available languages comparing their identifier with the provided one.
        return this.configService.getConfig('languages').find((language: LanguageI) => {
            return language.identifier === identifier;
        });
    }

    /**
     * Returns the identifier of the default language. If there is no default language, undefined will be returned.
     *
     * @returns string|undefined
     */
    public getDefaultLanguage(): string | undefined {
        // Returning the default language from the config service.
        return this.configService.getConfig('defaultLanguage');
    }

    /**
     * Returns the alternative language of the language with the provided identifier.
     * If no language with that identifier exists or the language has no fallback, undefined will be returned.
     *
     * @param identifier
     *
     * @returns LanguageI|undefined
     */
    public getAlternativeLanguage(identifier: string): LanguageI | undefined {
        // Requesting the alternative language of the language with the provided identifier.
        const alternativeIdentifier: string|undefined = this.getLanguage(identifier)?.fallback;
        // Returning the full information of the alternative language.
        return alternativeIdentifier !== undefined ? this.getLanguage(alternativeIdentifier) : undefined;
    }
}

export default LanguageService;
