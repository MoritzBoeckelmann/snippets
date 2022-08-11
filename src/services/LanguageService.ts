import LanguageI from "../interfaces/LanguageI";
import ConfigService from './ConfigService';

class LanguageService {
    private readonly configService: ConfigService;

    constructor(configService: ConfigService) {
        this.configService = configService;
    }

    public getLanguageIdentifierList(): string[] {
        return this.configService.getConfig('languages').map((language: LanguageI) => {
            return language.identifier;
        });
    }

    public getLanguages(): LanguageI[] {
        return this.configService.getConfig('languages');
    }

    public getLanguage(identifier: string): LanguageI | undefined {
        return this.configService.getConfig('languages').find((language: LanguageI) => {
            return language.identifier === identifier;
        });
    }

    public getDefaultLanguage(): string | undefined {
        return this.configService.getConfig('defaultLanguage');
    }

    public getAlternativeLanguage(identifier: string): LanguageI | undefined {
        const alternativeIdentifier = this.getLanguage(identifier)?.fallback;
        return alternativeIdentifier !== undefined ? this.getLanguage(alternativeIdentifier) : undefined;
    }

}

export default LanguageService;
