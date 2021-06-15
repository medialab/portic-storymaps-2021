Portic storymaps 2021 - La Rochelle
===

More to see here soon ...

# Installation

```bash
yarn install
yarn data:update
```

# Development

```bash
yarn start
```

# Contributing

Suggested guidelines for commiting the repo :

- the `main` branch is the principal branch for the website version under development. Suggested workflow for contributing to the code is to develop new features in a separated branch, then to merge it in `main` branch when it is ready.

- it is suggested to use imperative tense verbs and explicit features/bugs mentions in commit messages

- it is suggested to reference related issue in commit messages (example of commit message : `improve radar viz #8`) in order to keep track of commits related to an improvement or problem in particular.

Suggested guidelines concerning the code :

- reusable components should go into `src/components` folder. Each component should have its own folder with an `index.js` file, plus as many files as you want (js subcomponent files, scss files, component-specific assets, ...)


- components aimed at being directly used in contents should go in the `src/visualizations` folder. They should use reusable components from `src/components` as much as possible.

- style is managed through scss files. It is suggested to use existing variables in `src/App.scss` as much as possible.

# Deployment

Deployment is automated to happen every day and each time a commit is pushed to the `prod` branch. The published website is then pushed on the `gh-pages` branch, which serves the site at https://medialab.github.io/portic-storymaps-2021/.

Therefore :

- Contents and data are updated every day
- To deploy a new version of the website code, it has to be pushed to the `prod` branch.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).