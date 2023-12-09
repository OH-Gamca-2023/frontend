<svelte:head>
	<title>Štatistiky a vývoj stránky &centerdot; OH Gamča 2023</title>
</svelte:head>

<h1 class="text-2xl font-bold pb-2">Štatistiky a vývoj stránky</h1>

<h4 class="text-xl font-bold pb-2">Backstory</h4>

<div class="mr-auto">
	Prvá verzia stránky sa objavila na mojom osobnom serveri v júni 2023. V tom čase bola prístupná
	iba po prihlásení a iba organizátorom. Niekedy v auguste 2023 bola presunutá na školský server a
	začiatkom septembra 2023 bola prístupná aj pre ostatných žiakov a učiteľov.
</div>
<div class="pt-1 mr-auto">
	Odvtedy bežala stránka skoro nepretržite. Jediné výpadky boli spôsobené tým, že som so serverom
	robil blbosti (napr. keď som opravoval to, že sa text zobrazoval kúsok nižšie ako mal z mobilu,
	cestou v električke ráno do školy (neodporúčam :D)).
</div>
<div class="pt-1 mr-auto">
	Išlo o prvú stránku OHčky, ktorá bežala priamo na školskom serveri. To prinieslo nové problémy,
	napr. to, že stránka do októbra nefungovala na školskej wifi (admini to nezvládali nastaviť
	¯\_(ツ)_/¯).
</div>
<div class="pt-1 mr-auto">
	Po Galaprograme bolo 9. 12. 2023 na stránke vypnuté prihlasovanie čím sa efektívne skončil život
	tejto stránky. V najbližšej dobe budú všetky dáta z API scrapnuté a prekonvertované do statických
	súborov. Týmto sa stránka dostane do jej konečnej fázy - archivujúc všetky disciplíny, výsledky a
	príspevky z OH Gamča 2023 - OH POHROMAde.
</div>

<h4 class="text-xl font-bold py-2">Štatistiky</h4>

<div class="pt-1 mr-auto">
	Počas behu stránky sa zaregistrovalo dokopy 122 používateľov, z toho 121 žiakov a jeden učiteľ. Na
	stránke sa nachádza 136 príspevkov a 62 disciplín. Z týchto disciplín existuje dokopy 201
	výsledkových listín obsahujúcich 2621 umiestnení (aj pre nezúčastnené triedy existoval v databáze
	objekt). Kalendár bol dokopy vygenerovaný 747 krát.
</div>
<div class="pt-1 mr-auto">Všetky tieto dáta zaberajú v databáze dokopy 14.3MB.</div>

<h4 class="text-xl font-bold py-2">Vývoj</h4>

<div class="pt-1 mr-auto">
	Celá táto stránka sa skladá z 2 hlavných častí: frontendu a backendu. Frontend je napísaný v
	Svelte ako PWA. Nechýba ani SW a caching dát z API aby sa stránka dala používať aj offline.
	Backend používa Django spolu s Django REST Frameworkom a štandardnou Postgres databázou. Django je
	doplnené o Huey, vďaka ktorému fungovali niektoré interné upozornenia pre orgov.
</div>
<div class="pt-1 mr-auto">
	Všetky tieto veci spája dokopy Docker, ktorý sa stará o všetky spojenia jednotlivých častí a ich
	vzájomnú spoluprácu. Bol doplnený aj o jednoduchý lokálny systém zálohovania, ktorý zálohoval
	databázu a súbory na serveri každé 2 hodiny. Poslednou súčasťou je jednoduchý auto update systém,
	ktorý sa staral o to, aby sa zmeny z GitHubu dostali na server. Nejde o práve najlepší systém, ale
	keď som ho nastavoval, nemal som náladu riešiť niečo komplikovanejšie a potom to proste fungovalo,
	tak som to nechal tak. Neposlednou súčasťou je aj Nginx, ktorý presmerovával všetky požiadavky na
	správne miesto a zabezpečoval za pomoci Certbotu aj HTTPS.
</div>
<div class="pt-1 mr-auto">
	Celú stránku som vytváral sám, preto je pravdepodobne na veľa miestach neprehľadný, neefektívny
	alebo akokoľvek inak zlý kód.
</div>

<div class="pt-3 mr-auto">
	Backend aj frontend sú verejne dostupné na GitHube:
	<ul class="list-disc pl-4 pb-1">
		<li>
			<a href="https://github.com/OH-Gamca-2023/frontend" class="underline"> Frontend </a>
		</li>
		<li>
			<a href="https://github.com/OH-Gamca-2023/backend" class="underline"> Backend </a>
		</li>
	</ul>
	<i
		>Na tom istom mieste viete nájsť aj zdrojový kód bota ktorý bol použitý na Ešportovom Discord
		serveri.</i
	>
</div>
<div class="pt-1 mr-auto">
	Ak chcete vidieť nginx config, docker-compose.yml, alebo niečo iné, tak mi napíšte na hociaké
	rozumné miesto a ja vám to môžem ukázať.
</div>

<div class="pt-5 mr-auto">
	Programovanie tejto stránky bola zaujímavá cesta, kým sa stránka dostala do stavu, v akom je
	teraz. V mnohých momentoch som mal chuť to všetko zahodiť, vykašľať sa na to a použiť iba nejaký
	Wordpress, ale nakoniec som to dokončil a som za to rád. Dúfam, že sa vám stránka páčila a že
	úspešne splnila svoj účel.
</div>
<span class="pt-2 text-sm mr-auto"> ~ Jakub Šiagi</span>
