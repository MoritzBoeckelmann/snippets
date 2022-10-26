import ConfigService from './ConfigService';
import SearchModeE from '../enumerations/SearchModeE';
import {readdirSync} from 'fs';
import LanguageService from './LanguageService';
import {snippetFileExtension} from '../variables.json'
import DirectoryReaderResponseE from '../enumerations/DirectoryReaderResponseE';

/**
 * Service to provide any function needed to translate a service
 */
class TranslationService {
    private readonly configService: ConfigService;
    private readonly languageService: LanguageService;

    /**
     * Initializing all needed services
     * @param configService
     * @param languageService
     */
    constructor(configService: ConfigService, languageService: LanguageService) {
        // Initializing services.
        this.configService = configService;
        this.languageService = languageService;
    }

    /**
     * Returns a translation for the provided snippetTag. If there is no explicit translation the fallback languages will be checked.
     * When there is no fallback Language, the default Language will be checked for a translation. If there is no translation even in the fallback language, undefined will be returned.
     *
     * @param snippetTag Tag of the snippet that should be translated.
     * @param languageIdentifier Preferred Language.
     */
    public getTranslation(snippetTag: string, languageIdentifier: string | undefined): string | undefined {
        let languageCodesDone: string[] = [];
        while (languageIdentifier !== undefined && languageCodesDone.includes(languageIdentifier) === false) {
            const translation = this.getSpecificTranslation(snippetTag, languageIdentifier);
            if (translation !== undefined) {
                return translation;
            }
            languageCodesDone.push(languageIdentifier);
            languageIdentifier = this.languageService.getAlternativeLanguage(languageIdentifier)?.identifier;
        }
        languageIdentifier = this.languageService.getDefaultLanguage();
        return languageIdentifier !== undefined ? this.getSpecificTranslation(snippetTag, languageIdentifier) : undefined;
    }

    /**
     * Returns the translation for the provided snippetTag in the requested language.
     * If there is no translation in that concrete language, undefined will be returned.
     *
     * @param snippetTag Tag of the snippet that should be translated
     * @param languageIdentifier Requested language
     */
    public getSpecificTranslation(snippetTag: string, languageIdentifier: string): string | undefined {
        switch (this.configService.getConfig('searchMode')) {
            case SearchModeE.STRICT:
                return this.searchTranslationStrict(snippetTag, languageIdentifier);
            case SearchModeE.DYNAMIC:
                return this.searchTranslationDynamic(snippetTag, languageIdentifier);
            default:
                return undefined;
        }
    }

    /**
     * Search for a translation with the strict way.
     *
     * @param snippetTag
     * @param languageIdentifier
     * @private
     */
    private searchTranslationStrict(snippetTag: string, languageIdentifier: string): string | undefined {
        let languageSelected: boolean = false;
        let separator: string = this.configService.getConfig('strictSeparationToken');
        const [directoryPath, jsonPath] = snippetTag.split(separator, 2);
        if (directoryPath === undefined || jsonPath === undefined) {
            return undefined;
        }
        const rootPath: string = this.configService.getConfig('snippetRootPath');
        separator = this.configService.getConfig('separationToken');
        let steps: string[] = directoryPath.split(separator);
        let lastStep: string | undefined = steps.pop();
        if (lastStep === undefined) {
            return undefined;
        }
        let currentPath = steps.join('/');
        switch (this.validateDirectory(rootPath + '/' + currentPath, lastStep)) {
            case DirectoryReaderResponseE.DIRECTORY:
                currentPath += '/' + lastStep;
                lastStep = languageIdentifier;
                languageSelected = true;
                break;
            case DirectoryReaderResponseE.FILE:
                break;
            case DirectoryReaderResponseE.ERROR:
            default:
                if (this.validateDirectory(rootPath + '/' + languageIdentifier + '/' + currentPath, lastStep) !== 'file') {
                    return undefined;
                }
                currentPath = languageIdentifier + '/' + currentPath;
                languageSelected = true;
                break;
        }
        try {
            let snippetObject = require(rootPath + '/' + currentPath + '/' + lastStep + snippetFileExtension);
            steps = jsonPath.split(separator);
            if (this.validateJson(snippetObject, languageIdentifier) && !languageSelected) {
                snippetObject = snippetObject[languageIdentifier];
                languageSelected = true;
            }
            steps.forEach(step => {
                if (this.validateJson(snippetObject, step)) {
                    snippetObject = snippetObject[step];
                }
            });
            if (this.validateJson(snippetObject, languageIdentifier) && !languageSelected) {
                snippetObject = snippetObject[languageIdentifier];
            }
            if (typeof snippetObject === 'string') {
                return snippetObject;
            }
        } catch {}
        return undefined;
    }

    /**
     * Searches for a translation with the dynamic way.
     *
     * @param snippetTag
     * @param languageIdentifier
     * @private
     */
    private searchTranslationDynamic(snippetTag: string, languageIdentifier: string): string | undefined {
        const separator: string = this.configService.getConfig('separationToken');
        const snippetRootPath: string = this.configService.getConfig('snippetRootPath');


        const seek = (followingSteps: string[], stepsDone: string[] = [], languageSelected: boolean = false): string | undefined => {

            try {
                let jsonObject = require(snippetRootPath + '/' + stepsDone.join('/') + snippetFileExtension);
                if (followingSteps.every(step => {
                    if(!languageSelected && this.validateJson(jsonObject,languageIdentifier)) {
                        jsonObject = jsonObject[languageIdentifier];
                        languageSelected = true;
                    }
                    if (this.validateJson(jsonObject, step)) {
                        jsonObject = jsonObject[step];
                        return true;
                    }
                    return false;
                })) {
                    if(!languageSelected && this.validateJson(jsonObject, languageIdentifier)) {
                        jsonObject = jsonObject[languageIdentifier];
                    }
                    if (typeof jsonObject === 'string') {
                        return jsonObject;
                    }


                }
            } catch {}

            if(!languageSelected) {
                const newStepsDone = stepsDone.slice();
                newStepsDone.push(languageIdentifier);
                const newSeek = seek(followingSteps.slice(), newStepsDone, true);
                if(newSeek !== undefined) {
                    return newSeek;
                }
            }
            const newStepsDone = stepsDone.slice();
            const newFollowingSteps = followingSteps.slice();
            const nextStep = newFollowingSteps.shift();
            if(nextStep !== undefined) {
                newStepsDone.push(nextStep);
                const newSeek = seek(newFollowingSteps, newStepsDone, languageSelected);
                if(newSeek !== undefined) {
                    return newSeek;
                }
            }
            return undefined;
        }

        return seek(snippetTag.split(separator));
    }

    /**
     * Checks whether the next Step is a directory.
     * @param currentPath
     * @param nextStep
     * @private
     */
    private validateDirectory(currentPath: string, nextStep: string): DirectoryReaderResponseE {
        try {
            const directoryEntries = readdirSync(currentPath, {withFileTypes: true});
            if (directoryEntries.find(directoryEntry => (directoryEntry.name === nextStep) && (directoryEntry.isDirectory())) !== undefined) {
                return DirectoryReaderResponseE.DIRECTORY;
            }
            if (directoryEntries.find(directoryEntry => (directoryEntry.name === (nextStep + snippetFileExtension)) && (!directoryEntry.isDirectory())) !== undefined) {
                return DirectoryReaderResponseE.FILE;
            }
        } catch {}
        return DirectoryReaderResponseE.ERROR;
    }

    /**
     * Checks whether an object provides an specific property.
     * @param obj
     * @param nextStep
     * @private
     */
    private validateJson(obj: any, nextStep: string): boolean {
        return nextStep in obj;
    }
}

export default TranslationService;
