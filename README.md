# Map Colonies Updated Shared Components Library
A Refactured version of the [shard components library](https://github.com/MapColonies/shared-components) for map colonies application. 

**NOTE: Previeous version will soon be deprecated.**
### Technical Updates:

 - [X] Using [vite bundler](https://vitejs.dev/).
 - [X] Latest version of [lerna + NX](https://lerna.js.org/).
 - [X] React version 18
 - [X] Latest version of [RMWC](https://rmwc.io/).
 - [X] Latest version of [storybook](https://storybook.js.org/) (with vite).
 - [X] Smaller package footprint.
 - [X] Migrate from old "forked" RMWC components to component wrappers.
 - [X] Updgrade cesiumJS in react-components to v1.103.0 in order to utilize some of the latest features and bug fixes. 

## Installation and development

### Prequisites 
 1. From root directory, run `yarn`. lerna (using yarn workspaces) will install all the projects dependencies (root deps and deps for each individual package).
 2. Run `yarn build` first to build both packages, there are some assets that are required in order to run storybook, post build we copy those deps, and the components library depends on the ui components, lerna is managing all of it.

### Run storybook
You can just `yarn storybook:all` from root directory to run both storybooks in parallel, or you can choose specific library's storybook by run either: 
* `yarn storybook:core` for react-ui-components.
* `yarn storybook:components` for react-components.

### Publish to NPM and versioning
We are using conventional commits in order to be able to get an automatic change-log and for lerna version to increment versions properly.
First, log in to NPM as usual for publishing.
Next, run `yarn release` from root dir and let lerna do its thing :)
