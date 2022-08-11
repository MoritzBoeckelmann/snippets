# Snippets

## Introduction

## Key Facts

## Getting Started
### Configuration
To configure the snippet package, a JSON File is needed.
The default path to your config file ongoing from your project root folder is `./snippet/config.json`. 
####
If you want to use another location or an error occurs you can specify a path (absolute) in your `.env` by adding the variable `SNIPPET_CONFIG_PATH`.
As of now those config files contain the default config for your snippet service.
####
In case you want to use a separate instance with different configurations to your default,
you can parse an object in, which contains all the configurations you want to override. 
####
If you provide no configuration at all the package will fall back on the standard configuration.
Below you will find an explanation and the possible values likewise the fall back value of every available configuration.
