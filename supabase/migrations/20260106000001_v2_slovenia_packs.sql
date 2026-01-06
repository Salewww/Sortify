-- Sortify v2.0 - Slovenia Template Packs and Tasks
-- System templates for Slovenian market

-- ============================================
-- PACK SI-1: Normiran s.p. - Self-Service Starter
-- ============================================
INSERT INTO public.packs (id, owner_user_id, name, description, is_system, country_code, tags, business_types) VALUES
  (
    'aaa00001-0000-0000-0000-000000000000',
    null,
    'Normiran s.p. - Začetni paket',
    'Osnovni paket za samostojne podjetnike z normirano obdavčitvijo. Vodenje računov, evidence in letnih obveznosti.',
    true,
    'SI',
    ARRAY['normiran', 'sp', 'solo'],
    ARRAY['normiran_sp']
  )
ON CONFLICT (id) DO NOTHING;

-- Tasks for SI-1: Normiran s.p. Starter
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, proof_type, requires_verification, platform_tag) VALUES
  (
    'aaa10001-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Shrani izdane račune (evidence)',
    'Izdani računi so osnova za ugotavljanje prihodkov pri normirani obdavčitvi. Shranite jih za morebitni pregled.',
    E'# Kako shraniti izdane račune\n\n1. Naložite vse izdane račune v sistem (PDF ali slika)\n2. Označite jih kot "Izdan račun"\n3. Sistem bo avtomatsko prebral znesek in datum (če bo mogoče)\n4. Račune hranite v digitalnem arhivu',
    false,
    'upload',
    false,
    'documents'
  ),
  (
    'aaa10002-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Shrani prejete račune (stroški)',
    'Prejeti računi so dokaz o stroških. Pri normirani obdavčitvi ne zmanjšujejo davčne osnove, a jih lahko potrebujete za evidence.',
    E'# Kako shraniti prejete račune\n\n1. Naložite prejete račune (nakupi, stroški)\n2. Označite jih kot "Prejet račun"\n3. Razvrstite po vrstah (material, storitve, oprema)\n4. Hranite jih za 10 let',
    false,
    'upload',
    false,
    'documents'
  ),
  (
    'aaa10003-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Oddaja dohodnine (letna obveznost)',
    'Normiranci morajo letno oddati napoved za odmero dohodnine. Rok je običajno do 31. marca naslednjega leta.',
    E'# Oddaja dohodnine za normirane s.p.\n\n1. Pripravite evidenco prihodkov (izdani računi)\n2. Vpišite prihodke v obrazec eDavki\n3. Sistem sam izračuna normiran odhodek (80% prihodkov)\n4. Preverite znižanja (olajšave, vzdrževani družinski člani)\n5. Oddajte do 31. marca',
    true,
    'note',
    false,
    'edavki'
  )
ON CONFLICT (id) DO NOTHING;

-- Link tasks to pack SI-1
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('aaa00001-0000-0000-0000-000000000000', 'aaa10001-0000-0000-0000-000000000000', 1),
  ('aaa00001-0000-0000-0000-000000000000', 'aaa10002-0000-0000-0000-000000000000', 2),
  ('aaa00001-0000-0000-0000-000000000000', 'aaa10003-0000-0000-0000-000000000000', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- PACK SI-2: Accounting Firm - Basic s.p. Onboarding
-- ============================================
INSERT INTO public.packs (id, owner_user_id, name, description, is_system, country_code, tags, business_types) VALUES
  (
    'aaa00002-0000-0000-0000-000000000000',
    null,
    'Računovodstvo - Osnovno s.p.',
    'Paket za prejem novega s.p. klienta. eDavki dostop, bančni izpiski, računi, potrditev DDV statusa.',
    true,
    'SI',
    ARRAY['sp', 'firm', 'onboarding'],
    ARRAY['sp', 'normiran_sp']
  )
ON CONFLICT (id) DO NOTHING;

-- Tasks for SI-2
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, proof_type, requires_verification, platform_tag) VALUES
  (
    'aaa20001-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Uredi pooblastilo v eDavki za računovodstvo',
    'Brez pooblastila ne moremo oddajati obrazcev in pregledovati davčnih obveznosti v vašem imenu.',
    E'# Kako urediti pooblastilo v eDavki\n\n1. Prijavite se v portal [eDavki](https://edavki.durs.si)\n2. Pojdite na **Pooblastila**\n3. Kliknite **Dodaj novo pooblastilo**\n4. Vnesite našo davčno številko: _________\n5. Izberite pravice:\n   - DDV obrazci\n   - Dohodnina\n   - REK obrazci\n   - Pregled podatkov\n6. Shranite in potrdite s kvalificiranim potrdilom ali SMS\n7. Pošljite nam posnetek zaslona',
    true,
    'screenshot',
    true,
    'edavki'
  ),
  (
    'aaa20002-0000-0000-0000-000000000000',
    'ban00000-0000-0000-0000-000000000000',
    'Naloži bančne izpiske za zadnje 3 mesece',
    'Bančni izpiski so osnova za knjiženje in usklajevanje transakcij. Potrebujemo jih za prevzem stanja.',
    E'# Kako pridobiti bančne izpiske\n\n1. Prijavite se v spletno banko\n2. Pojdite na **Izpiski** ali **Dokumenti**\n3. Izberite poslovni TRR\n4. Prenesite zadnje 3 mesece (PDF format)\n5. Naložite datoteke v sistem',
    true,
    'upload',
    false,
    'bank'
  ),
  (
    'aaa20003-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Naloži izdane račune (zadnje 3 mesece)',
    'Za prevzem računovodstva potrebujemo vse izdane račune od začetka tekočega leta ali zadnjih 3 mesecev.',
    E'# Naložite izdane račune\n\n1. Pripravite vse izdane račune (PDF ali Excel izvoz)\n2. Če imate program za fakturiranje, izvozite seznam\n3. Naložite datoteke v sistem\n4. Označite kot "Izdani računi"',
    true,
    'upload',
    false,
    'documents'
  ),
  (
    'aaa20004-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Potrdi status plačnika DDV',
    'Moramo vedeti, ali ste zavezanec za DDV, da pravilno vodimo knjige in pripravljamo obrazce.',
    E'# Preverjanje DDV statusa\n\n**Ali ste zavezani za DDV?**\n- DA, če je promet nad 50.000 EUR letno\n- DA, če ste se prostovoljno vključili\n- NE, če je promet pod 50.000 EUR in se niste prostovoljno vključili\n\n**Če ste zavezanec:**\n- Kakšna je obračunska obdobja? (mesečno / četrtletno)\n- Kdaj ste postali zavezanec?\n\n**Vnesite informacije v opombe.**',
    true,
    'note',
    false,
    'edavki'
  ),
  (
    'aaa20005-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Vprašalnik o poslovni dejavnosti',
    'Za pravilno vodenje računovodstva potrebujemo osnovne informacije o vaši dejavnosti.',
    E'# Vprašalnik - Kratek opis\n\nProsimo odgovorite na naslednja vprašanja:\n\n1. **Kakšna je vaša glavna dejavnost?** (čim bolj konkretno)\n2. **Ali imate zaposlene?** (DA/NE)\n3. **Ali imate poslovni prostor?** (najemniško/lastniški/ni)\n4. **Ali uporabljate gotovino?** (DA/NE)\n5. **Ali izvažate/uvažate?** (DA/NE)\n6. **Ali imate osnovna sredstva?** (oprema, vozila) → seznam\n7. **Ali imate dolgove/kredite?** → seznam\n8. **Imate odprte obveznosti do dobaviteljev/kupcev?** (DA/NE)\n\nVnesite odgovore v opombe.',
    true,
    'note',
    false,
    'general'
  )
ON CONFLICT (id) DO NOTHING;

-- Link tasks to pack SI-2
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('aaa00002-0000-0000-0000-000000000000', 'aaa20001-0000-0000-0000-000000000000', 1),
  ('aaa00002-0000-0000-0000-000000000000', 'aaa20002-0000-0000-0000-000000000000', 2),
  ('aaa00002-0000-0000-0000-000000000000', 'aaa20003-0000-0000-0000-000000000000', 3),
  ('aaa00002-0000-0000-0000-000000000000', 'aaa20004-0000-0000-0000-000000000000', 4),
  ('aaa00002-0000-0000-0000-000000000000', 'aaa20005-0000-0000-0000-000000000000', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- PACK SI-3: Accounting Firm - Basic d.o.o. Onboarding
-- ============================================
INSERT INTO public.packs (id, owner_user_id, name, description, is_system, country_code, tags, business_types) VALUES
  (
    'aaa00003-0000-0000-0000-000000000000',
    null,
    'Računovodstvo - Osnovno d.o.o.',
    'Paket za prevzem d.o.o. družbe. AJPES potrditev, eDavki, bančni izpiski, DDV konfiguracija, seznam osnovnih sredstev.',
    true,
    'SI',
    ARRAY['doo', 'firm', 'onboarding'],
    ARRAY['doo']
  )
ON CONFLICT (id) DO NOTHING;

-- Tasks for SI-3
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, proof_type, requires_verification, platform_tag) VALUES
  (
    'aaa30001-0000-0000-0000-000000000000',
    'ajp00000-0000-0000-0000-000000000000',
    'Potrditev podatkov iz AJPES registra',
    'Preverimo osnovne družbene podatke (ime, naslov, matična, davčna št., zastopniki).',
    E'# Potrditev AJPES podatkov\n\n1. Pojdite na [AJPES biznis.si](https://www.ajpes.si/)\n2. Poiščite vašo družbo\n3. Preverite:\n   - Polno ime družbe\n   - Sedež\n   - Matična številka\n   - Davčna številka\n   - Zastopnik(i)\n   - Osnovni kapital\n4. Če so podatki pravilni, potrdite v opombi\n5. Če je kaj narobe, naložite AJPES izpisek',
    true,
    'note',
    false,
    'ajpes'
  ),
  (
    'aaa30002-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Uredi pooblastilo v eDavki',
    'Potrebujemo pooblastilo za oddajo DDV, dohodnine, obračuna prispevkov, REK obrazcev.',
    E'# Pooblastilo za d.o.o.\n\n1. Prijavite se v [eDavki](https://edavki.durs.si)\n2. Pojdite na **Pooblastila**\n3. Dodajte novo pooblastilo za računovodstvo\n4. Vnesite našo davčno številko: _________\n5. Izberite pravice:\n   - DDV obrazci\n   - Obračun dohodnine\n   - REK obrazci\n   - Prispevki\n   - Pregled podatkov\n6. Potrdite in pošljite posnetek zaslona',
    true,
    'screenshot',
    true,
    'edavki'
  ),
  (
    'aaa30003-0000-0000-0000-000000000000',
    'ban00000-0000-0000-0000-000000000000',
    'Naloži bančne izpiske (zadnjih 3 mesecev)',
    'Bančni izpiski so osnova za knjiženje transakcij in usklajevanje stanja.',
    E'# Bančni izpiski za d.o.o.\n\n1. Prijavite se v spletno banko\n2. Prenesite izpiske za poslovni TRR (zadnji 3 meseci, PDF)\n3. Če imate več TRR računov, prenesite vse\n4. Naložite datoteke',
    true,
    'upload',
    false,
    'bank'
  ),
  (
    'aaa30004-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Potrditev DDV obveznosti',
    'Vse d.o.o. družbe so zavezane za DDV. Preverimo obračunsko obdobje.',
    E'# DDV konfiguracija\n\n**Potrebujemo:**\n- Obračunsko obdobje DDV: mesečno ali četrtletno?\n- Datum registracije za DDV\n- Ali imate kakšne posebnosti? (izvoz, uvoz, EU posli)\n\nVnesite informacije v opombe.',
    true,
    'note',
    false,
    'edavki'
  ),
  (
    'aaa30005-0000-0000-0000-000000000000',
    'ajp00000-0000-0000-0000-000000000000',
    'Seznam osnovnih sredstev',
    'Za prevzem stanja potrebujemo seznam vseh osnovnih sredstev (oprema, vozila, nepremičnine).',
    E'# Seznam osnovnih sredstev\n\nPripravite seznam:\n- Naziv sredstva\n- Leto nabave\n- Nabavna vrednost\n- Sedanja odpisana vrednost (če veste)\n- Način uporabe (poslovno/mešano)\n\nNaložite Excel ali Word dokument.',
    true,
    'upload',
    false,
    'documents'
  )
ON CONFLICT (id) DO NOTHING;

-- Link tasks to pack SI-3
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('aaa00003-0000-0000-0000-000000000000', 'aaa30001-0000-0000-0000-000000000000', 1),
  ('aaa00003-0000-0000-0000-000000000000', 'aaa30002-0000-0000-0000-000000000000', 2),
  ('aaa00003-0000-0000-0000-000000000000', 'aaa30003-0000-0000-0000-000000000000', 3),
  ('aaa00003-0000-0000-0000-000000000000', 'aaa30004-0000-0000-0000-000000000000', 4),
  ('aaa00003-0000-0000-0000-000000000000', 'aaa30005-0000-0000-0000-000000000000', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- PACK SI-4: Switching Accountant (Migration)
-- ============================================
INSERT INTO public.packs (id, owner_user_id, name, description, is_system, country_code, tags, business_types) VALUES
  (
    'aaa00004-0000-0000-0000-000000000000',
    null,
    'Menjava računovodstva',
    'Paket za prevzem računovodstva od drugega računovodskega servisa. Finančni podatki, saldakonti, odprti postavke.',
    true,
    'SI',
    ARRAY['migration', 'firm'],
    ARRAY['sp', 'normiran_sp', 'doo']
  )
ON CONFLICT (id) DO NOTHING;

-- Tasks for SI-4
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, proof_type, requires_verification, platform_tag) VALUES
  (
    'aaa40001-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Zahtevaj finančno poročilo za predhodno leto',
    'Potrebujemo zaključni račun za predhodno leto, da začnemo z nadaljnjim knjiženjem.',
    E'# Finančno poročilo\n\n1. Kontaktirajte prejšnjega računovodjo\n2. Zahtevajte:\n   - Bilanca stanja (31.12. preteklega leta)\n   - Izkaz poslovnega izida\n   - Če ste d.o.o.: letno poročilo, oddano na AJPES\n3. Naložite dokumente (PDF)',
    true,
    'upload',
    false,
    'documents'
  ),
  (
    'aaa40002-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Saldakonti (stanja kupcev in dobaviteljev)',
    'Potrebujemo pregled odprtih terjatev in obveznosti.',
    E'# Saldakonti\n\n1. Od prejšnjega računovodje zahtevajte:\n   - Seznam odprtih terjatev (kupci, ki še niso plačali)\n   - Seznam odprtih obveznosti (dobavitelji, ki jim še dolgujete)\n2. Format: Excel ali PDF\n3. Naložite dokument',
    true,
    'upload',
    false,
    'documents'
  ),
  (
    'aaa40003-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Evidenca zaposlenih (če obstaja)',
    'Če imate zaposlene, potrebujemo podatke za nadaljevanje obračuna plač.',
    E'# Evidenca zaposlenih\n\nČe imate zaposlene:\n1. Od prejšnjega računovodstva zahtevajte:\n   - Seznam zaposlenih\n   - Plačilne liste za zadnje 3 mesece\n   - Podatke o akontaciji dohodnine\n   - Podatke o prispevkih\n2. Naložite dokumentacijo',
    false,
    'upload',
    false,
    'documents'
  )
ON CONFLICT (id) DO NOTHING;

-- Link tasks to pack SI-4
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('aaa00004-0000-0000-0000-000000000000', 'aaa40001-0000-0000-0000-000000000000', 1),
  ('aaa00004-0000-0000-0000-000000000000', 'aaa40002-0000-0000-0000-000000000000', 2),
  ('aaa00004-0000-0000-0000-000000000000', 'aaa40003-0000-0000-0000-000000000000', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- PACK SI-5: VAT Onboarding
-- ============================================
INSERT INTO public.packs (id, owner_user_id, name, description, is_system, country_code, tags, business_types) VALUES
  (
    'aaa00005-0000-0000-0000-000000000000',
    null,
    'Uvajanje v DDV sistem',
    'Paket za nove zavezance za DDV. Registracija, obrazci, evidenca.',
    true,
    'SI',
    ARRAY['vat', 'ddv', 'firm'],
    ARRAY['sp', 'doo']
  )
ON CONFLICT (id) DO NOTHING;

-- Tasks for SI-5
INSERT INTO public.tasks (id, platform_id, title, why_text, instructions_md, is_blocking, proof_type, requires_verification, platform_tag) VALUES
  (
    'aaa50001-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Potrditev DDV obveznosti',
    'Preverimo ali ste že registrirani za DDV ali morate postati zavezanec.',
    E'# DDV status\n\n**Ali ste že zavezanec za DDV?**\n- Če DA: od kdaj?\n- Če NE: ali je promet že presegel 50.000 EUR?\n\n**Obračunsko obdobje:**\n- Mesečno (promet > 210.000 EUR)\n- Četrtletno (promet < 210.000 EUR)\n\nVnesite podatke v opombe.',
    true,
    'note',
    false,
    'edavki'
  ),
  (
    'aaa50002-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Naložite evidenco izdanih računov (za DDV)',
    'Za DDV moramo voditi evidenco izdanih računov z DDV.',
    E'# Evidenca izdanih računov\n\n1. Pripravite vse izdane račune od registracije za DDV\n2. Računi morajo vsebovati:\n   - DDV številko\n   - Osnovo\n   - DDV znesek (22% ali druga stopnja)\n3. Naložite PDF ali Excel',
    true,
    'upload',
    false,
    'documents'
  ),
  (
    'aaa50003-0000-0000-0000-000000000000',
    'eda00000-0000-0000-0000-000000000000',
    'Naložite evidenco prejetih računov (vstopni DDV)',
    'Za obračun DDV potrebujemo prejete račune z DDV.',
    E'# Evidenca prejetih računov\n\n1. Pripravite vse prejete račune z DDV\n2. Pomembno: računi morajo biti od davčnih zavezancev\n3. Naložite dokumente',
    true,
    'upload',
    false,
    'documents'
  )
ON CONFLICT (id) DO NOTHING;

-- Link tasks to pack SI-5
INSERT INTO public.pack_tasks (pack_id, task_id, sort_order) VALUES
  ('aaa00005-0000-0000-0000-000000000000', 'aaa50001-0000-0000-0000-000000000000', 1),
  ('aaa00005-0000-0000-0000-000000000000', 'aaa50002-0000-0000-0000-000000000000', 2),
  ('aaa00005-0000-0000-0000-000000000000', 'aaa50003-0000-0000-0000-000000000000', 3)
ON CONFLICT DO NOTHING;
