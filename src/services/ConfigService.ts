import ConfigI from '../interfaces/ConfigI';
import LanguageI from '../interfaces/LanguageI';
import path from 'path';
import ProvidedConfigI from '../interfaces/ProvidedConfigI';
import SearchModeE from '../enumerations/SearchModeE';
import {config as env} from 'dotenv';
import {defaultConfigPath, envName, variablePlaceholder} from '../variables.json';

/**
 *
 */
class ConfigService {

    /**
     * Object that implements the ConfigI interface and includes all config values.
     * @private
     */
    private readonly config: ConfigI

    /**
     * Constructor of the config service.
     * @param config Config values that should be set for this config service.
     */
    constructor(config: ProvidedConfigI = {}) {
        this.config = this.initialiseConfig(require('../defaultSnippetConfig.json'), this.getEnvConfig(), config);
    }

    /**
     *
     * @param configName
     */
    public getConfig(configName: (keyof ConfigI)): any {
        return this.config[configName];
    }

    /**
     *
     * @param defaultConfig
     * @param envConfig
     * @param passedConfig
     * @private
     */
    private initialiseConfig(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): ConfigI {
        const snippetRootPath: string = this.extractSnippetRootPath(defaultConfig, envConfig, passedConfig);
        const [variableIndicatorStart, variableIndicatorEnd]: string[] = this.extractVariableIndicators(defaultConfig, envConfig, passedConfig);
        const searchMode: SearchModeE = passedConfig.searchMode ?? envConfig.searchMode ?? defaultConfig.searchMode;
        const separationToken: string = passedConfig.separationToken ?? envConfig.separationToken ?? defaultConfig.separationToken;
        const strictSeparationToken: string = passedConfig.strictSeparationToken ?? envConfig.strictSeparationToken ?? defaultConfig.strictSeparationToken;
        const languages: LanguageI[] = this.extractLanguages(defaultConfig, envConfig, passedConfig);
        const defaultLanguage: string | undefined = this.extractDefaultLanguage(defaultConfig, envConfig, passedConfig, languages);
        return {
            snippetRootPath,
            variableIndicatorStart,
            variableIndicatorEnd,
            searchMode,
            separationToken,
            strictSeparationToken,
            defaultLanguage,
            languages
        };
    }


    /**
     *
     * @private
     */
    private getEnvConfig(): ProvidedConfigI {
        env().parsed;
        const envConfigPath: string | undefined = process.env[envName];
        try {
            if(envConfigPath !== undefined) {
                if(path.isAbsolute(envConfigPath)) {
                    return require(envConfigPath);
                }
                else {
                    return require(path.join(process.cwd(), envConfigPath));
                }
            } else {
                if(path.isAbsolute(defaultConfigPath)) {
                    return require(defaultConfigPath);
                }
                else {
                    return require(path.join(process.cwd(), defaultConfigPath));
                }
            }
        }
        catch {
            return {};
        }
    }

    /**
     *
     * @param defaultConfig
     * @param envConfig
     * @param passedConfig
     * @private
     */
    private extractSnippetRootPath(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): string {
        let snippetRootPath: string = passedConfig.snippetRootPath ?? envConfig.snippetRootPath ?? defaultConfig.snippetRootPath;
        if(path.isAbsolute(snippetRootPath)) {
            return snippetRootPath;
        }
        return path.join(process.cwd(), snippetRootPath);
    }

    /**
     *
     * @param defaultConfig
     * @param envConfig
     * @param passedConfig
     * @private
     */
    private extractVariableIndicators(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): string[] {
        const indicator: string | undefined = passedConfig.variableIndicator ?? envConfig.variableIndicator;
        if(indicator !== undefined) {
            const indicators: string[] = indicator.split(variablePlaceholder);
            if(indicators.length === 2) {
                return indicators;
            }
        }
        return [defaultConfig.variableIndicatorStart, defaultConfig.variableIndicatorEnd];
    }

    /**
     *
     * @param defaultConfig
     * @param envConfig
     * @param passedConfig
     * @param languages
     * @private
     */
    private extractDefaultLanguage(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI, languages: LanguageI[]): string | undefined {
        const providedDefaultLanguage: string | undefined = passedConfig.defaultLanguage ?? envConfig.defaultLanguage ?? defaultConfig.defaultLanguage;
        return languages.find(language =>
            language.identifier === providedDefaultLanguage
        )?.identifier;
    }

    /**
     *
     * @param defaultConfig
     * @param envConfig
     * @param passedConfig
     * @private
     */
    private extractLanguages(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): LanguageI[] {
        let languages = passedConfig.languages ?? envConfig.languages;
        if(languages !== undefined) {
            let preparedLanguages: LanguageI[] = [];
            Object.entries(languages).forEach(language => {
                {
                    preparedLanguages.push({
                        identifier: language[0],
                        ...language[1]
                    });
                }
            });
            preparedLanguages.forEach(preparedLanguage => {
                if(preparedLanguages.find(checkedLanguage => checkedLanguage.identifier === preparedLanguage.fallback) === undefined) {
                    preparedLanguage.fallback = undefined;
                }
            });

            return preparedLanguages;
        }
        return defaultConfig.languages;
    }
}

export default ConfigService;
