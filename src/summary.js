/* eslint import/no-webpack-loader-syntax : 0 */
import ScrollyPage from './pages/ScrollyPage';

// import TestScrollyFr from '!babel-loader!mdx-loader!./contents/fr/test-scrolly.mdx';
// import testScrollyEn from '!babel-loader!mdx-loader!./contents/en/test-scrolly.mdx';

import Part1Fr from '!babel-loader!mdx-loader!./contents/fr/partie-1.mdx';
import Part1En from '!babel-loader!mdx-loader!./contents/en/part-1.mdx';

// import Part2IntroFr from '!babel-loader!mdx-loader!./contents/fr/partie-2-intro.mdx';
// import Part2IntroEn from '!babel-loader!mdx-loader!./contents/en/part-2-intro.mdx';

import Part2IntroFr from '!babel-loader!mdx-loader!./contents/fr/partie-2.mdx';
import Part2IntroEn from '!babel-loader!mdx-loader!./contents/en/part-2-intro.mdx';

// import Part21Fr from '!babel-loader!mdx-loader!./contents/fr/partie-2-1.mdx';
// import Part21En from '!babel-loader!mdx-loader!./contents/en/part-2-1.mdx';

// import Part22Fr from '!babel-loader!mdx-loader!./contents/fr/partie-2-2.mdx';
// import Part22En from '!babel-loader!mdx-loader!./contents/en/part-2-2.mdx';

// import Part23Fr from '!babel-loader!mdx-loader!./contents/fr/partie-2-3.mdx';
// import Part23En from '!babel-loader!mdx-loader!./contents/en/part-2-3.mdx';

import Part3Fr from '!babel-loader!mdx-loader!./contents/fr/partie-3.mdx';
import Part3En from '!babel-loader!mdx-loader!./contents/en/part-3.mdx';

import AboutFr from '!babel-loader!mdx-loader!./contents/fr/a-propos.mdx';
import AboutEn from '!babel-loader!mdx-loader!./contents/en/about.mdx';

import TestsFr from '!babel-loader!mdx-loader!./contents/fr/tests.mdx';
import TestsEn from '!babel-loader!mdx-loader!./contents/en/tests.mdx';

const summary = [
  {
    routes: {
      fr: 'partie-1',
      en: 'part-1'
    },
    titles: {
      fr: 'Partie 1 - Le déclin de la région de La Rochelle suite à la perte du Canada',
      en: 'Partie 1 - The decline of La Rochelle region after Canada\'s loss'
    },
    shortTitles: {
      fr: 'le déclin de la région de La Rochelle',
      en: 'the decline of La Rochelle region'
    },
    contents: {
      fr: 'fr/partie-1.mdx',
      en: 'en/part-1.mdx'
    },
    contentsProcessed: {
      fr: Part1Fr,
      en: Part1En,
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
  {
    routes: {
      fr: 'partie-2',
      en: 'part-2'
    },
    titles: {
      fr: 'Partie 2 - Une forte spécialisation portuaire: le cas de la traite négrière, du commerce du sel et de l\'eau-de-vie',
      en: 'Partie 2 - A strong portual specialization'
    },
    shortTitles: {
      fr: 'une forte spécialisation portuaire',
      en: 'a strong portual specialization'
    },
    contents: {
      fr: 'fr/partie-2.mdx',
      en: 'en/part-2.mdx'
    },
    contentsProcessed: {
      fr: Part2IntroFr,
      en: Part2IntroEn,
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
  // {
  //   routes: {
  //     fr: 'partie-2',
  //     en: 'part-2'
  //   },
  //   titles: {
  //     fr: 'Partie 2 - Une forte spécialisation portuaire: le cas de la traite négrière, du commerce du sel et de l\'eau-de-vie',
  //     en: 'Partie 2 - A strong portual specialization'
  //   },
  //   contents: {
  //     fr: 'fr/partie-2-intro.mdx',
  //     en: 'en/part-2-intro.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: Part2IntroFr,
  //     en: Part2IntroEn,
  //   },
  // },
  // {
  //   routes: {
  //     fr: 'partie-2-1',
  //     en: 'part-2-1'
  //   },
  //   titles: {
  //     fr: 'Partie 2.1 - La Rochelle et le commerce triangulaire',
  //     en: 'Partie 2.1 - La Rochelle and triangular trade'
  //   },
  //   contents: {
  //     fr: 'fr/partie-2-1.mdx',
  //     en: 'en/part-2-1.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: Part21Fr,
  //     en: Part21En,
  //   },
  // },
  // {
  //   routes: {
  //     fr: 'partie-2-2',
  //     en: 'part-2-2'
  //   },
  //   titles: {
  //     fr: 'Partie 2.2 - Le commerce de l’eau-de-vie',
  //     en: 'Partie 2.2 - Eau-de-vie trade'
  //   },
  //   contents: {
  //     fr: 'fr/partie-2-2.mdx',
  //     en: 'en/part-2-2.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: Part22Fr,
  //     en: Part22En,
  //   },
  // },
  // {
  //   routes: {
  //     fr: 'partie-2-3',
  //     en: 'part-2-3'
  //   },
  //   titles: {
  //     fr: 'Partie 2.3 - Marennes et le commerce du sel',
  //     en: 'Partie 2.3 - Marennes and salt trade'
  //   },
  //   contents: {
  //     fr: 'fr/partie-2-3.mdx',
  //     en: 'en/part-2-3.mdx'
  //   },
  //   contentsProcessed: {
  //     fr: Part23Fr,
  //     en: Part23En,
  //   },
  // },
  {
    routes: {
      fr: 'partie-3',
      en: 'part-3'
    },
    titles: {
      fr: 'Partie 3 - La Rochelle, port dominant mais pas structurant',
      en: 'Part 3 - La Rochelle port, dominating but not structuring'
    },
    shortTitles: {
      fr: 'un port dominant mais pas structurant',
      en: 'a dominating but not structuring port'
    },
    contents: {
      fr: 'fr/partie-3.mdx',
      en: 'en/part-3.mdx'
    },
    contentsProcessed: {
      fr: Part3Fr,
      en: Part3En,
    },
    Component: ScrollyPage,
    routeGroup: 'primary'
  },
  {
    routes: {
      fr: 'a-propos',
      en: 'about'
    },
    titles: {
      fr: 'À propos',
      en: 'About'
    },
    shortTitles: {
      fr: 'à propos',
      en: 'about'
    },
    contents: {
      fr: 'fr/a-propos.mdx',
      en: 'en/about.mdx'
    },
    contentsProcessed: {
      fr: AboutFr,
      en: AboutEn,
    },
    routeGroup: 'secondary',
  },
  {
    routes: {
      fr: 'tests',
      en: 'tests'
    },
    titles: {
      fr: 'Tests',
      en: 'Tests'
    },
    shortTitles: {
      fr: 'tests',
      en: 'tests'
    },
    contents: {
      fr: 'fr/tests.mdx',
      en: 'en/Tests.mdx'
    },
    contentsProcessed: {
      fr: TestsFr,
      en: TestsEn,
    },
    routeGroup: 'secondary',
  }
]


export default summary;