
# Map Colonies Updated Shared Components Library

A Refactored version of the [shard components library](https://github.com/MapColonies/shared-components-deprecated) for map colonies application.

  

**NOTE: Previous version is now deprecated.**

### Technical Updates:

  

- [X] Using [Vite bundler](https://vitejs.dev/) for smaller bundle size and faster development.

- [X] Latest version of [Lerna + NX](https://lerna.js.org/) for the mono-repo management and its caching capabilities.

- [X] React version 18.

- [X] Latest version of [RMWC](https://rmwc.io/).

- [x] Latest version of [Storybook](https://storybook.js.org/) (with vite).

- [X] Smaller package footprint.

- [X] Migrate from old "forked", self maintained RMWC components to component wrappers.

- [X] Upgrade CesiumJS in react-components to v1.103.0 in order to utilize some of the latest features and bug fixes.

  

## Installation and development

  

### Perquisites

1. From root directory, run `yarn`. lerna (using yarn workspaces) will install all the projects dependencies (root deps and deps for each individual package).

2. Run `yarn build` first to build both packages, there are some assets that are required in order to run storybook, on post build we copy those deps, and the components library depends on the ui components, lerna is managing all of it by building them in the correct order.

### Run storybook

You can just `yarn storybook:all` from root directory to run both storybooks in parallel, or you can choose specific library's storybook by run either:

*  `yarn storybook:core` for react-ui-components.

*  `yarn storybook:components` for react-components.

  

### Publish to NPM and versioning

We are using conventional commits in order to be able to get an automatic change-log and for lerna version to increment versions properly.

First, log in to NPM as usual for publishing. (`npm login`)

Next, run `yarn release` from root dir and let lerna do its thing 😎

### General Info

* Lerna allows us to maintain our packages dependencies on multiple levels, this gives us flexibility and also to share some common configurations among our packages.
As a baseline, we installed storybook, react, vite, lerna, etc, at the most updated versions, so that when you add more packages you will not have to re-declare and configure them all over again, and can use them as peer-dependencies on production.
Moreover, we created some base configs for storybook, vite and typescript at the root level, and each package can extend it as further as it needs, or just use it as-is if it doesn't have any special requirements, so its just plug and play.

	A simple example would be the storybook static directories, allows you to serve some static assets which will be available for you when running the storybook dev server (and when building storybook static).
So we are utilizing the storybook shared config from the root folder to serve the public dir from the root folder which including the favicon for our storybook, and extends it in each package to serve its own public dir as well, so that each package will include the same favicon (or not, as you wish).

* As a rule of thumb, when need some extra configuration, always think where it should be added. if its more of a general config, put it on root so the internal packages will extend it and use it, and if its some more specific config, there are internal `vite.config`, `tsconfig.json`, `tsconfig-build.json` and `.storybook` directory in each package for you to override and customize global config.

* Our react-components package uses a slightly older version of storybook than the one used as a baseline, this is because cesium didn't play well with the latest version for some reason. this is expected to be addressed at some point in the future updates.

* 🧟‍♀️🪡 Sometimes in development you might face some weird issues of some changes you made that are not working properly or simply not seem to be showing at all, especially after adding a new package via the package manager.
This could be due to caching either by Lerna NX we mentioned before, or Vite and Vite-Storybook.
Before you start investigating the issue further and spent too much time, simply try to delete `.cache` and `.vite-storybook` via the package's node_modules folder, and also `.cache` folder inside the root node_modules which is the NX cache. If it wouldn't work, it wont harm, and cost no time compared to an intense debugging session (But the slightly longer build time at the first run).
* #️⃣ In react-ui-core package we are now using a custom wrappers on top of RMWC core components so we could extend them as we need. We added a handy vs-code snippet to ease up some of the work, anywhere inside the project you can type  `rmwcWrapper` and hit `TAB` in order to create a simple wrapper for the main component you want to create a wrapper for.
 **NOTICE**: this is bases on the folder name, so if it includes any special characters, you might need to make some tweaks on top of the basic structure for it to work properly.
 In addition, make sure to wrap and export all of the side components that might have been exported from RMWC in addition to the main component, this shouldn't be that hard and most of the time is just a copy and paste from the wrapper you've created using the provided snippet, and sometimes you would need to write it manually as it wont fit all sorts of exports (Such as types you would want to include, utility functions, hooks, etc).
* 🎨 RMWC provides external styles for their components as a css loaders.
notice the import from the snippet mentioned before i.e `import  '@rmwc/avatar/styles';`,
this import should **NOT** be included inside the component wrapper. instead create a file `styles.js` inside the component folder and include it there.
This is because we are importing their styles manually in our application in a certain order so we could override it and customize as needed.
However, if you still need to override some styles or css behaviors beforehand, you need to add an additional file `stylesReset.css`, make any overrides as you wish and import it as well after the first styles import in the `styles.js` file mentioned before.
