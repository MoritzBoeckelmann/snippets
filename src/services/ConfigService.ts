import ConfigI from '../interfaces/ConfigI';
import LanguageI from '../interfaces/LanguageI';
import path from 'path';
import ProvidedConfigI from '../interfaces/ProvidedConfigI';
import SearchModeE from '../enumerations/SearchModeE';
import {config as env} from 'dotenv';
import {defaultConfigPath, envName, variablePlaceholder} from '../variables.json';

/**
 *  A Service containing all settings and therefor all needed functions.
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
        // Loading all available config objects and merging them together to one valid config object.
        this.config = this.mergeConfig(require('../defaultSnippetConfig.json'), this.getEnvConfig(), config);
    }

    /**
     * Returns the value of the requested configuration.
     *
     * @param configName Key of the requested configuration.
     * @public
     */
    public getConfig(configName: (keyof ConfigI)): any {
        // Returning the value of the requested configuration.
        return this.config[configName];
    }

    /**
     * Merges three config objects to one valid config object.
     *
     * @param defaultConfig Default configuration object, provided with the plugin.
     * @param envConfig Env configuration object that can be provided by the plugin user and applies to every instance of the ConfigService.
     * @param passedConfig Passed configuration object that can be provided by the plugin user with the initialization of an ConfigService instance applying only for that instance.
     *
     * @return ConfigI
     * @private
     */
    private mergeConfig(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): ConfigI {
        // Extracting and merging every config value.
        const snippetRootPath: string = this.extractSnippetRootPath(defaultConfig, envConfig, passedConfig);
        const [variableIndicatorStart, variableIndicatorEnd]: string[] = this.extractVariableIndicators(defaultConfig, envConfig, passedConfig);
        const searchMode: SearchModeE = passedConfig.searchMode ?? envConfig.searchMode ?? defaultConfig.searchMode;
        const separationToken: string = passedConfig.separationToken ?? envConfig.separationToken ?? defaultConfig.separationToken;
        const strictSeparationToken: string = passedConfig.strictSeparationToken ?? envConfig.strictSeparationToken ?? defaultConfig.strictSeparationToken;
        const languages: LanguageI[] = this.extractLanguages(defaultConfig, envConfig, passedConfig);
        const defaultLanguage: string | undefined = this.extractDefaultLanguage(defaultConfig, envConfig, passedConfig, languages);
        // Returning all values as one object.
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
     * Searching for a config file provided by the plugin user.
     *
     * @returns ProvidedConfigI Object
     * @private
     */
    private getEnvConfig(): ProvidedConfigI {
        // Loading the env variable SNIPPET_CONFIG_PATH
        env().parsed;
        let envConfigPath: string | undefined = process.env[envName];

        // Trying to read the config file.
        try {
            // Checking whether the env variable SNIPPET_CONFIG_PATH was set.
            if(envConfigPath !== undefined) {
                // In case the envConfigPath is not absolut an absolut path is getting created from the given relative path outgoing from the process directory.
                if(!path.isAbsolute(envConfigPath)) {
                    envConfigPath = path.join(process.cwd(), envConfigPath)
                }

                // Reading and returning the config file.
                return require(envConfigPath);
            } else {
                // Checking whether the defaultConfigPath is absolut.
                if(path.isAbsolute(defaultConfigPath)) {
                    // Reading and returning the config file from the default path.
                    return require(defaultConfigPath);
                }
                else {
                    // Creating an absolut path from the relative defaultConfigPath outgoing from the process directory. Reading and returning the config file from the default path.
                    return require(path.join(process.cwd(), defaultConfigPath));
                }
            }
        }
        catch {
            // Returning an empty object in case no file could be read.
            return {};
        }
    }

    /**
     * Extracting the snippet root path from the three possible config objects.
     *
     * @param defaultConfig Default configuration object, provided with the plugin.
     * @param envConfig Env configuration object that can be provided by the plugin user and applies to every instance of the ConfigService.
     * @param passedConfig Passed configuration object that can be provided by the plugin user with the initialization of an ConfigService instance applying only for that instance.
     *
     * @returns String
     * @private
     */
    private extractSnippetRootPath(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): string {
        // Extracting the config value.
        let snippetRootPath: string = passedConfig.snippetRootPath ?? envConfig.snippetRootPath ?? defaultConfig.snippetRootPath;

        // Creating an absolut path from the snippetRootPath outgoing from the process directory.
        if(!path.isAbsolute(snippetRootPath)) {
            snippetRootPath = path.join(process.cwd(), snippetRootPath);
        }

        // Returning the absolut snippet root path.
        return snippetRootPath;
    }

    /**
     * Returns an array with the length of 2. The first entry contains the starting indicator for a variable and the second entry the ending indicator for a variable.
     *
     * @param defaultConfig Default configuration object, provided with the plugin.
     * @param envConfig Env configuration object that can be provided by the plugin user and applies to every instance of the ConfigService.
     * @param passedConfig Passed configuration object that can be provided by the plugin user with the initialization of an ConfigService instance applying only for that instance.
     *
     * @returns String[]
     * @private
     */
    private extractVariableIndicators(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): string[] {
        // Loading the variable indicator string from the provided configurations.
        const indicator: string | undefined = passedConfig.variableIndicator ?? envConfig.variableIndicator;

        // Checks whether the indicator string is set.
        if(indicator !== undefined) {
            // In case it's set, the indicator is split by the variablePlaceholder, defined in the variables.json.
            const indicators: string[] = indicator.split(variablePlaceholder);

            // If indicators has a length of 2 the array will be returned.
            if(indicators.length === 2) {
                return indicators;
            }
        }

        // Returning the default start and end indicator in case the provided configurations don't contain a variableIndicator or the provided variableIndicator is not configured correctly.
        return [defaultConfig.variableIndicatorStart, defaultConfig.variableIndicatorEnd];
    }

    /**
     * Returns the default language in case a valid default language is configured.
     *
     * @param defaultConfig Default configuration object, provided with the plugin.
     * @param envConfig Env configuration object that can be provided by the plugin user and applies to every instance of the ConfigService.
     * @param passedConfig Passed configuration object that can be provided by the plugin user with the initialization of an ConfigService instance applying only for that instance.
     * @param languages List of all available languages.
     *
     * @returns string | undefined
     * @private
     */
    private extractDefaultLanguage(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI, languages: LanguageI[]): string | undefined {
        // Loads the configured value of the default Language.
        const providedDefaultLanguage: string | undefined = passedConfig.defaultLanguage ?? envConfig.defaultLanguage ?? defaultConfig.defaultLanguage;

        // Returns the configured value in case it fits with one language indicator of the provided language list. Else undefined will be returned.
        return languages.find(language =>
            language.identifier === providedDefaultLanguage
        )?.identifier;
    }

    /**
     * Extracts the available languages, checks for valid fallbacks and returns a list of all languages.
     *
     * @param defaultConfig Default configuration object, provided with the plugin.
     * @param envConfig Env configuration object that can be provided by the plugin user and applies to every instance of the ConfigService.
     * @param passedConfig Passed configuration object that can be provided by the plugin user with the initialization of an ConfigService instance applying only for that instance.
     *
     * @returns LanguageI[]
     * @private
     */
    private extractLanguages(defaultConfig: ConfigI, envConfig: ProvidedConfigI, passedConfig: ProvidedConfigI): LanguageI[] {
        // Creating an array with all provided languages.
        let languages = passedConfig.languages ?? envConfig.languages;
        // Checking whether the list is defined. Else the default languages will be returned.
        if(languages !== undefined) {
            // List of all prepared languages.
            let preparedLanguages: LanguageI[] = [];

            // Running throw the provided languages to prepare them.
            Object.entries(languages).forEach(language => {
                {
                    // Convert a provided language into a valid instance of ILanguage.
                    preparedLanguages.push({
                        identifier: language[0],
                        ...language[1]
                    });
                }
            });
            // Running threw the prepared languages.
            preparedLanguages.forEach(preparedLanguage => {
                // Checking whether the provided fallback refers to an existing language
                if(preparedLanguages.find(checkedLanguage => checkedLanguage.identifier === preparedLanguage.fallback) === undefined) {
                    // If the provided fallback doesn't refer to an existing language, the value of fallback will be set undefined.
                    preparedLanguage.fallback = undefined;
                }
            });

            // Returning the prepared languages.
            return preparedLanguages;
        }
        // Returning the default languages
        return defaultConfig.languages;
    }
}

export default ConfigService;
