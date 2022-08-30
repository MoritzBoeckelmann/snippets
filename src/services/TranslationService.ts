import ConfigService from './ConfigService';
import SearchModeE from '../enumerations/SearchModeE';
import {readdirSync} from 'fs';
import LanguageService from './LanguageService';
import {snippetFileExtension} from '../variables.json'
import DirectoryReaderResponseE from '../enumerations/DirectoryReaderResponseE';

class TranslationService {
    private readonly configService: ConfigService;
    private readonly languageService: LanguageService;

    constructor(configService: ConfigService, languageService: LanguageService) {
        this.configService = configService;
        this.languageService = languageService;
    }

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

    private validateJson(obj: any, nextStep: string): boolean {
        return nextStep in obj;
    }
}

export default TranslationService;
