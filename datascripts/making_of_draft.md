


# Carte des provinces étudiées : Poitou, Aunis, Saintonge, Angoumois (PASA)

Le fond de carte de cette visualisation a été constitué en agrégeant de multiples sources et en les mettant en cohérence avec des méthodes de géomatique.

# Carte des ports de la région PASA

Le fond de carte de cette visualisation a été constitué en agrégeant de multiples sources et en les mettant en cohérence avec des méthodes de géomatique.

Les données sont constituées à partir de la base de données navigo, et plus précisément des *pointcalls*, soit les indications de mouvement de ports. Encore plus précisément, sont pris en compte les *pointcalls* entrants et sortants qui ont été directement observés directement à la sortie de port (et non rapportés).

Les disques représentés sont dimensionnés de manière à ce que leur aire soit proportionnelle au nombre de mouvements enregistrés.

# Carte des bureaux des fermes de la région PASA

Le fond de carte de cette visualisation a été constitué en agrégeant de multiples sources et en les mettant en cohérence avec des méthodes de géomatique.

Les bureaux de ferme ont été localisés en fonction de la position de l'un de leur port, puis déplacés arbitrairement pour des besoins de lisibilité (ce choix est justifié par le fait que leur périmètre d'action géographique est relativement incertain).

# Le déclin de la région de La Rochelle suite à la perte du Canada

Les données proviennent de la base de données Toflit18, et plus particulièrement des flux tirés de son groupe de sources "Best Guess customs region prod x partner" qui permettent de raisonner au niveau des directions des fermes (et non de l'ensemble de la France). Pour chacune des parties de la visualisation, seuls les exports sont pris en compte.

La diversité du commerce de la région est calculée au moyen de l'indice de Herfindahl-Hirschmann, soit la somme du carré des parts du marché français par classe de produits exportés (sur la base de la classification "Révolution & Empire" de Toflit18, visile dans le détail de la troisième partie).

Dans les visualisations en ligne et en histogrammes, les trous indiquent des années pour lesquelles les sources sont manquantes.

# Une forte spécialisation portuaire : le cas de la traite négrière, du commerce du sel et de l’eau-de-vie

Les données du diagramme alluvial sont tirées de la base Toflit18 et concernent tous les échanges avec l'étranger (ports francs non pris en compte). Les flux sont tirés du de sources "Best Guess customs region prod x partner" qui permettent de raisonner au niveau des directions des fermes (et non de l'ensemble de la France). Les produits et les partenaires affichés sur la visualisation correspondent à des agrégations élaborées spécifiquement pour mettre en lumière des circuits spécifialisés (faisant correspondre de manière relativement identifiable : un ou plusieurs bureaux de ferme, un type de produit et un groupe).

Les données du second diagramme (diagramme dit "radar") sont tirées de la base de données Navigo. Sont pris en compte les flux en provenance des ports attachés à la direction des fermes de La Rochelle. Les destinations sont regroupées selon la même classification que Toflit18 afin de permettre la comparaison (agrégation itérative à partir des ports de destination).

# La Rochelle, port dominant mais pas structurant

Le fond de carte des visualisations a été constitué en agrégeant de multiples sources et en les mettant en cohérence avec des méthodes de géomatique.

Les données de la base Navigo sont utilisées pour toutes les parties liées à la navigation.

La première partie est constituée à partir des états de sortie de port (*pointcalls*) observés dans la région en 1789, puis transcrite à travers des objets graphiques dont la hauteur et la largeur représente respectivement le tonnage (taille) des navires parti du port, et le nombre de sorties, permettant de distinguer différents types de ports dans la région.

La seconde partie (graphes) est fondée sur les flux Navigo enregistrés pour 1787 (la complétude des les données de 1789 n'étant pas suffisante pour effectuer des comparaisons valides). À partir des flux enregistrés, nous avons isolé trois corpus en se fondant sur l'amirauté des ports de départ ou d'arrivée de chaque flux (le corpus de la région PASA concerne trois amirautés, et les autres une seule, mais après expérimentation cette différence n'occasionne pas de changement important dans les visualisations et les métriques). Nous avons ensuite regroupé pour chaque corpus les voyages par ports. 

Les nœuds affichés sur la visualisation représentent donc un port, et les liens un ou plusieurs voyages réalisés entre deux ports en 1787. La taille des nœuds correspond à leur degré dans le réseau, c'est-à-dire dans ce cas au nombre de ports avec lesquels ils ont été mis en relation par des voyages en 1787.

La troisième partie de la visualisation mélange des données de Navigo et de Toflit18.

Pour ce qui est des objets visuels de la carte, les portions de cercle sont tirés des états d'export enregistrés dans Toflit18, divisés suivant l'origine des produits commercés (dans la région ou hors de la région) et agrégés par leur valeur commerciale en livres tournois. Les triangles correspondent aux états de sortie de port enregistrés dans Navigo, divisés suivant la destination des navires (dans la région ou hors de la région) et agrégés  par tonnage cumulé des navires partis des ports rattachés à chaque bureau de ferme.

Les objets visuels permettant de faire la comparaison sont similaires à deux nuances près : ils sont construits avec les données de 1787 pour permettre une comparaison valide (avec suffisament de données), et les données de navigation concernent les ports dominants de chaque direction des fermes et non l'ensemble des ports.

# Produits dont les valeurs d'exports sont les plus importantes en 1789 : comparaison de La Rochelle à la moyenne française

Les données de cette visualisation sont tirées de la base Toflit18. Après avoir isolé les flux appropriés au niveau national et local, les produits ont été agrégés au moyen de la classification "Revolution & Empire" de Toflit18, puis rapportés à leur part vis-à-vis des exports totaux sur chacune des deux échelles. 

Les ports francs ne sont pas inclus dans les comptages de cette visualisation.

# Évolution globale de la part des échanges de La Rochelle par rapport à l'ensemble de la France

Les données de cette visualisation sont tirées de la base Toflit18. Les flux nationaux ont été calculés en se fondant sur les enregistrements au niveau national (sources "Best Guess National partner") et les flux de La Rochelle avec ceux enregistrés au niveau local (sources "Best Guess region prod x part"). Les ports francs sont exclus des comptages.

# Pays d'attache des navires partant de la région en 1789

Les données sont tirées de la base Navigo et délimitées autour des navires partis de la région PASA en 1789. Les voyages sont ensuite agrégés par pays du port d'attache des navires et par tonnage cumulé.

# Ports d'attache des navires partant de la région PASA en 1789

Les données sont tirées de la base Navigo et délimitées autour des navires partis de la région PASA en 1789. Les voyages sont ensuite agrégés par port d'attache des navires et par tonnage cumulé.

# Destinations des navires partant de la région PASA en 1789

Les données sont tirées de la base Navigo et délimitées autour des navires partis de la région PASA en 1789. Les voyages sont ensuite agrégés par destination des navires et par tonnage cumulé.

# Ports d’attache des navires en direction de l’étranger

Les données sont tirées de la base Navigo et délimitées autour des navires partis de la région PASA en direction de l'étranger en 1789. Les voyages sont ensuite agrégés par port d'attache des navires et par tonnage cumulé.

# Part de la navigation française dans la région

Les données proviennent de la base Navigo, est concernent les états de sortie de port (*pointcalls*) observés en 1789 par des ports de la région.

L'aire des disques correspond au tonnage cumulé des bateaux sortis de chaque port en 1789. Leur couleur correspond à la part de la navigation française pour les départs qui les concerne, déterminée à partir du port d'attache des navires.

# Comparaison des exports de produits coloniaux, locaux et autres par bureaux des fermes

Les données de cette visualisation sont tirées de la base Toflit18, et plus spécifiquement des états d'exports vers l'étranger (ports francs non pris en compte). Les flux ont été classés en trois catégories en fonction du type de produits commercés. Un produit marqué comme originaire de l'une des provinces de la région PASA a été classé "produit local", un produit tombant dans les catégories 'Café', 'Sucre', 'Indigo', ou 'Coton non transformé' de la classification "Révolution & Empire" de Toflit18 a été classé comme "produit colonial". Les produits restants ont été regroupés dans une classe "autres produits".

# Voyages des navires rattachés au port de La Rochelle en 1787

Le fond de carte de la visualisation a été constitué en agrégeant de multiples sources et en les mettant en cohérence avec des méthodes de géomatique.

Les données visualisées sont tirées des flux enregistrés dans Navigo pour 1787 et concernant uniquement les navires dont le port d'attache est La Rochelle.
