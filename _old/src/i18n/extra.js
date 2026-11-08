const page = (play, dailyLink, achLink, language, nextBoardBefore, nextBoardAfter, playToday, streakNote) =>
  ({ play, dailyLink, achLink, language, nextBoardBefore, nextBoardAfter, playToday, streakNote });

const day = (one, many, few) => few ? { rule: 'slavic', one, few, many } : { one, many };

const ach = (rows) => Object.fromEntries(rows);

const ui = (p, a) => ({
  pages: p.pages,
  play: p.play, back: p.back, how: p.how, achievements: p.achievements, records: p.records, best: p.best,
  lede: p.lede, resume: p.resume, level: p.level,
  classic: p.classic, endless: p.endless, time: p.time, daily: p.daily,
  classicHint: p.classicHint, endlessHint: p.endlessHint, timeHint: p.timeHint, dailyHint: p.dailyHint,
  nextIn: p.nextIn, nextSoon: p.nextSoon, yourRecords: p.yourRecords, everyMode: p.everyMode, howRound: p.howRound,
  gotIt: p.gotIt, paused: p.paused, resumeBtn: p.resumeBtn, restart: p.restart, quit: p.quit,
  score: p.score, boardFull: p.boardFull, matchPairs: p.matchPairs, hungry: p.hungry, hint: p.hint,
  mute: p.mute, sound: p.sound, muted: p.muted, pause: p.pause, menu: p.menu,
  beat: p.beat, inARow: p.inARow, matchAgain: p.matchAgain, chain: p.chain,
  modeEndless: p.modeEndless, modeTime: p.modeTime, modeDaily: p.modeDaily, modeLevel: p.modeLevel,
  speed: p.speed, critterStats: p.critterStats, playNamed: p.playNamed,
  shared: p.shared,
  rules: p.rules,
  recordsNote: p.recordsNote,
  recordLabels: p.recordLabels,
  day: p.day,
  ach: a,
  themes: p.themes,
  introNew: p.introNew, introNewItem: p.introNewItem, introHungry: p.introHungry,
  callouts: p.callouts,
  tied: p.tied, youBeat: p.youBeat, shortOf: p.shortOf, streakLine: p.streakLine, unlocked: p.unlocked,
  newBest: p.newBest, personalBest: p.personalBest, nextLevel: p.nextLevel, rematch: p.rematch, again: p.again,
  share: p.share, challenge: p.challenge, linkCopied: p.linkCopied, copied: p.copied,
  results: p.results, stats: p.stats,
  shareTitle: p.shareTitle, shareDaily: p.shareDaily, shareScore: p.shareScore, shareStreak: p.shareStreak, shareBeat: p.shareBeat,
  nom: p.nom, ate: p.ate, shoo: p.shoo
});

const en = ui({
  pages: page('Play', 'Daily challenge', 'Achievements', 'Language', 'Next board in', 'UTC. Everyone gets the same fruit layout for the calendar day.', "Play today's challenge", 'Your streak is saved on this device. A shared score is a target to beat, not a public rank.'),
  play: 'PLAY', back: 'Back', how: 'How to play', achievements: 'Achievements', records: 'Records', best: 'Best',
  lede: "Tap two that match. Chain combos. Don't let the board fill up.",
  resume: 'Resume {mode}', level: 'Level {n}',
  classic: 'Classic', endless: 'Endless', time: 'Time Attack', daily: 'Daily',
  classicHint: 'Level {n} · clear the pairs', endlessHint: 'Survive · best {best}', timeHint: '60 seconds · best {best}',
  dailyHint: 'Same board worldwide · {when}', nextIn: 'next in {time}', nextSoon: 'next soon',
  yourRecords: 'Your records', everyMode: 'Every mode', howRound: 'How a round works',
  gotIt: 'GOT IT', paused: 'Paused', resumeBtn: 'RESUME', restart: 'Restart', quit: 'Quit',
  score: 'Score', boardFull: 'Board full', matchPairs: 'Match pairs', hungry: 'Hungry critters',
  hint: 'Esc to pause · match pairs into the basket · tap critters to shoo',
  mute: 'Mute sound', sound: 'Sound', muted: 'Muted', pause: 'Pause', menu: 'Menu',
  beat: 'Beat {score}', inARow: '{n} in a row', matchAgain: 'Match again fast!', chain: 'Chain matches',
  modeEndless: 'ENDLESS', modeTime: 'TIME', modeDaily: 'DAILY', modeLevel: 'LV {n}',
  speed: 'Speed {n} · new pair every {s}s', critterStats: 'ate {ate} · shooed {shooed}', playNamed: 'PLAY {mode}',
  shared: [
    'Tap two of the same fruit. They fly into the basket.',
    'Match again within 3 seconds for a combo: ×1.2, ×1.5, ×2, then ×3. A miss resets it.',
    'A critter walks toward its fruit. Tap it to shoo it for +50. If it eats, you lose 50.'
  ],
  rules: {
    classic: { aim: 'Clear {pairs} pairs before the 60-second clock runs out.', points: ['Each level asks for more pairs and adds fruit types.', 'Under 30 seconds is 3 stars. Under 45 seconds is 2 stars.', 'Critters start showing up at level 3. Later levels send more at once.'] },
    endless: { aim: 'Last as long as you can. The round ends when the board is full.', points: ['New pairs drop in, faster the longer you survive. Matching clears space.', 'More fruit types and more critters join as the run goes on.', 'Your survival time is saved on this device.'] },
    time: { aim: 'Score as much as you can in 60 seconds.', points: ['When the clock ends, that score is your result.', 'A full board ends the round early. Clear pairs faster than they arrive.', 'Critters are in from the start.'] },
    daily: { aim: 'Clear 18 pairs in 90 seconds. Every player gets this same board today.', points: ['The board changes at midnight UTC.', 'Winning today extends the streak saved on this device.', 'A score in a shared link is a target to beat, not a public rank.'] }
  },
  recordsNote: 'Saved on this device for {name}. There is no global ranking yet — a score in a link is a target, not a verified place.',
  recordLabels: { best: 'Best score', endless: 'Endless survival', time: 'Time attack', daily: 'Daily best', week: 'This week', streak: 'Daily streak', recent: 'Recently played' },
  day: day('{n} day', '{n} days'),
  themes: { jungle: 'JUNGLE', forest: 'FOREST', desert: 'DESERT', starfield: 'DEEP SPACE', sunset: 'SUNSET GRID' },
  introNew: 'NEW: {list} — tap critters to shoo them!',
  introNewItem: '{emoji} {name} eats {fruit}',
  introHungry: 'Hungry critters: {list} — tap to shoo!',
  callouts: { 2: 'GREAT!', 3: 'AMAZING!', 5: 'INCREDIBLE!', 8: 'UNSTOPPABLE!' },
  tied: 'Tied at {score}. A higher score wins.', youBeat: 'You beat {score}.', shortOf: 'Short of {score}.',
  streakLine: '{n} day streak', unlocked: 'Unlocked: {list}', newBest: 'NEW PERSONAL BEST!', personalBest: 'Personal best {score}',
  nextLevel: 'NEXT LEVEL', rematch: 'REMATCH', again: 'PLAY AGAIN', share: 'Share score', challenge: 'Challenge a friend',
  linkCopied: 'Link copied!', copied: 'Copied!',
  results: {
    endlessKicker: 'GAME OVER · BOARD 100% FULL', endlessTitle: 'Fruit avalanche!', endlessRecord: 'New survival record!',
    endlessNote: '{gap} off your best survival of {best}.', timeKicker: 'TIME ATTACK · 60 SECONDS', timeTitle: "Time's up!",
    boardFullTitle: 'Board full!', timeRecord: 'New time-attack record!', timeNote: 'Time-attack best: {best}.',
    dailyKicker: 'DAILY · CHERRY CHAOS', levelKicker: 'LEVEL {n}', cleared: 'Cleared!',
    starNote: 'Finish under {time} for {star}.', thirdStar: 'the third star', anotherStar: 'another star',
    perfect: 'Perfect peel. Three stars.', pairsShort: '{n} pairs short. Chain combos to move faster.'
  },
  stats: { survived: 'survived', accuracy: 'accuracy', bestCombo: 'best combo', score: 'score', pairs: 'pairs', time: 'time' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy Daily', shareScore: 'Score: {score}', shareStreak: 'Streak: {n}', shareBeat: 'Can you beat me?',
  nom: 'NOM!', ate: '{emoji} ate {fruit} −50', shoo: 'Shoo! +50'
}, ach([
  ['first-match', { name: 'First Match', detail: 'Finish a game.' }],
  ['combo-master', { name: 'Combo Master', detail: 'Reach a ×5 combo.' }],
  ['rising-star', { name: 'Rising Star', detail: 'Score 5,000 points in one game.' }],
  ['fruit-legend', { name: 'Fruit Legend', detail: 'Score 50,000 points in one game.' }],
  ['daily-player', { name: 'Daily Player', detail: 'Complete 3 daily challenges.' }],
  ['champion', { name: 'Champion', detail: "Beat a friend's score." }],
  ['perfectionist', { name: 'Perfectionist', detail: 'Clear a round with no misses.' }]
]));

const uk = ui({
  pages: page('Грати', 'Щоденний виклик', 'Досягнення', 'Мова', 'Наступне поле через', 'UTC. Усі отримують однакове поле на календарний день.', 'Грати сьогоднішній виклик', 'Серія зберігається на цьому пристрої. Рахунок у посиланні — це ціль, а не публічне місце.'),
  play: 'ГРАТИ', back: 'Назад', how: 'Як грати', achievements: 'Досягнення', records: 'Рекорди', best: 'Рекорд',
  lede: 'Тапни два однакові. Роби комбо. Не дай полю заповнитися.',
  resume: 'Далі: {mode}', level: 'Рівень {n}',
  classic: 'Класика', endless: 'Нескінченний', time: 'На час', daily: 'Щоденний',
  classicHint: 'Рівень {n} · збери пари', endlessHint: 'Виживи · рекорд {best}', timeHint: '60 секунд · рекорд {best}',
  dailyHint: 'Однакове поле для всіх · {when}', nextIn: 'ще {time}', nextSoon: 'скоро',
  yourRecords: 'Твої рекорди', everyMode: 'Усі режими', howRound: 'Як влаштований раунд',
  gotIt: 'ЗРОЗУМІЛО', paused: 'Пауза', resumeBtn: 'ДАЛІ', restart: 'Заново', quit: 'Вийти',
  score: 'Рахунок', boardFull: 'Поле повне', matchPairs: 'Збери пари', hungry: 'Голодні звірята',
  hint: 'Esc — пауза · пари летять у кошик · тапни звіря, щоб прогнати',
  mute: 'Вимкнути звук', sound: 'Звук', muted: 'Тиша', pause: 'Пауза', menu: 'Меню',
  beat: 'Обіграй {score}', inARow: '{n} поспіль', matchAgain: 'Ще пару, швидко!', chain: 'Роби комбо',
  modeEndless: 'НЕСКІН.', modeTime: 'ЧАС', modeDaily: 'ДЕНЬ', modeLevel: 'РІВ {n}',
  speed: 'Швидкість {n} · нова пара кожні {s} с', critterStats: 'з’їли {ate} · прогнано {shooed}', playNamed: 'ГРАТИ: {mode}',
  shared: [
    'Тапни два однакові фрукти. Вони летять у кошик.',
    'Знайди ще пару за 3 секунди — комбо: ×1.2, ×1.5, ×2, потім ×3. Промах скидає його.',
    'Звіря йде до свого фрукта. Тапни його — +50. Якщо з’їсть, втратиш 50.'
  ],
  rules: {
    classic: { aim: 'Збери {pairs} пар, поки не скінчаться 60 секунд.', points: ['Кожен рівень просить більше пар і додає види фруктів.', 'Менше ніж за 30 секунд — 3 зірки. Менше ніж за 45 — 2 зірки.', 'Звірята з’являються з 3-го рівня. Далі їх приходить більше одразу.'] },
    endless: { aim: 'Протримайсь якомога довше. Раунд закінчується, коли поле повне.', points: ['Нові пари падають дедалі швидше. Зібрані пари звільняють місце.', 'З часом додаються нові фрукти й більше звірят.', 'Час виживання зберігається на цьому пристрої.'] },
    time: { aim: 'Набери якомога більше очок за 60 секунд.', points: ['Коли час спливає, цей рахунок і є результатом.', 'Повне поле закінчує раунд раніше. Збирай пари швидше, ніж вони приходять.', 'Звірята є від самого початку.'] },
    daily: { aim: 'Збери 18 пар за 90 секунд. Сьогодні в усіх однакове поле.', points: ['Поле змінюється опівночі за UTC.', 'Перемога сьогодні продовжує серію на цьому пристрої.', 'Рахунок у посиланні — це ціль, а не публічне місце.'] }
  },
  recordsNote: 'Збережено на цьому пристрої для {name}. Світового рейтингу ще немає — рахунок у посиланні це ціль, а не перевірене місце.',
  recordLabels: { best: 'Найкращий рахунок', endless: 'Виживання', time: 'На час', daily: 'Щоденний рекорд', week: 'Цей тиждень', streak: 'Щоденна серія', recent: 'Нещодавно грав' },
  day: day('{n} день', '{n} днів', '{n} дні'),
  themes: { jungle: 'ДЖУНГЛІ', forest: 'ЛІС', desert: 'ПУСТЕЛЯ', starfield: 'КОСМОС', sunset: 'ЗАХІД' },
  introNew: 'НОВЕ: {list} — тапни звіря, щоб прогнати!',
  introNewItem: '{emoji} {name} їсть {fruit}',
  introHungry: 'Голодні звірята: {list} — тапни, щоб прогнати!',
  callouts: { 2: 'КЛАС!', 3: 'СУПЕР!', 5: 'НЕЙМОВІРНО!', 8: 'НЕ ЗУПИНИТИ!' },
  tied: 'Нічия на {score}. Перемагає вищий рахунок.', youBeat: 'Ти обіграв {score}.', shortOf: 'Не вистачило до {score}.',
  streakLine: 'Серія: {n}', unlocked: 'Відкрито: {list}', newBest: 'НОВИЙ РЕКОРД!', personalBest: 'Особистий рекорд {score}',
  nextLevel: 'ДАЛІ', rematch: 'РЕВАНШ', again: 'ЩЕ РАЗ', share: 'Поділитися', challenge: 'Виклик другу',
  linkCopied: 'Посилання скопійовано!', copied: 'Скопійовано!',
  results: {
    endlessKicker: 'КІНЕЦЬ · ПОЛЕ ПОВНЕ', endlessTitle: 'Фруктова лавина!', endlessRecord: 'Новий рекорд виживання!',
    endlessNote: 'На {gap} менше за твоє найкраще виживання {best}.', timeKicker: 'НА ЧАС · 60 СЕКУНД', timeTitle: 'Час вийшов!',
    boardFullTitle: 'Поле повне!', timeRecord: 'Новий рекорд на час!', timeNote: 'Рекорд на час: {best}.',
    dailyKicker: 'ЩОДЕННИЙ · ВИШНЕВИЙ ХАОС', levelKicker: 'РІВЕНЬ {n}', cleared: 'Зібрано!',
    starNote: 'Закінчи швидше ніж за {time}, щоб отримати {star}.', thirdStar: 'третю зірку', anotherStar: 'ще зірку',
    perfect: 'Ідеально. Три зірки.', pairsShort: 'Не вистачило {n} пар. Роби комбо, щоб встигати.'
  },
  stats: { survived: 'протримався', accuracy: 'точність', bestCombo: 'найкраще комбо', score: 'рахунок', pairs: 'пари', time: 'час' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · щоденний', shareScore: 'Рахунок: {score}', shareStreak: 'Серія: {n}', shareBeat: 'Зможеш обіграти?',
  nom: 'НЯМ!', ate: '{emoji} з’їв {fruit} −50', shoo: 'Геть! +50'
}, ach([
  ['first-match', { name: 'Перша пара', detail: 'Закінчи гру.' }],
  ['combo-master', { name: 'Майстер комбо', detail: 'Зроби комбо ×5.' }],
  ['rising-star', { name: 'Зірка, що сходить', detail: 'Набери 5 000 очок за одну гру.' }],
  ['fruit-legend', { name: 'Фруктова легенда', detail: 'Набери 50 000 очок за одну гру.' }],
  ['daily-player', { name: 'Щоденний гравець', detail: 'Пройди 3 щоденні виклики.' }],
  ['champion', { name: 'Чемпіон', detail: 'Обіграй рахунок друга.' }],
  ['perfectionist', { name: 'Перфекціоніст', detail: 'Пройди раунд без промахів.' }]
]));

const pl = ui({
  pages: page('Graj', 'Wyzwanie dnia', 'Osiągnięcia', 'Język', 'Następna plansza za', 'UTC. Wszyscy dostają ten sam układ owoców na dany dzień.', 'Zagraj w dzisiejsze wyzwanie', 'Seria zostaje na tym urządzeniu. Wynik w linku to cel, nie publiczne miejsce.'),
  play: 'GRAJ', back: 'Wstecz', how: 'Jak grać', achievements: 'Osiągnięcia', records: 'Rekordy', best: 'Rekord',
  lede: 'Kliknij dwa takie same. Rób combo. Nie pozwól, by plansza się zapełniła.',
  resume: 'Wznów: {mode}', level: 'Poziom {n}',
  classic: 'Klasyczny', endless: 'Bez końca', time: 'Na czas', daily: 'Dzienny',
  classicHint: 'Poziom {n} · zbierz pary', endlessHint: 'Przetrwaj · rekord {best}', timeHint: '60 sekund · rekord {best}',
  dailyHint: 'Ta sama plansza dla wszystkich · {when}', nextIn: 'za {time}', nextSoon: 'wkrótce',
  yourRecords: 'Twoje rekordy', everyMode: 'Każdy tryb', howRound: 'Jak działa runda',
  gotIt: 'JASNE', paused: 'Pauza', resumeBtn: 'WZNÓW', restart: 'Od nowa', quit: 'Wyjdź',
  score: 'Wynik', boardFull: 'Plansza pełna', matchPairs: 'Zbieraj pary', hungry: 'Głodne zwierzaki',
  hint: 'Esc pauza · pary lecą do koszyka · kliknij zwierzaka, by go przegonić',
  mute: 'Wycisz', sound: 'Dźwięk', muted: 'Cisza', pause: 'Pauza', menu: 'Menu',
  beat: 'Pobij {score}', inARow: '{n} z rzędu', matchAgain: 'Jeszcze jedna para, szybko!', chain: 'Rób combo',
  modeEndless: 'BEZ KOŃCA', modeTime: 'CZAS', modeDaily: 'DZIEŃ', modeLevel: 'POZ {n}',
  speed: 'Szybkość {n} · nowa para co {s} s', critterStats: 'zjadły {ate} · przegonione {shooed}', playNamed: 'GRAJ: {mode}',
  shared: [
    'Kliknij dwa takie same owoce. Lecą do koszyka.',
    'Znajdź kolejną parę w 3 sekundy: ×1.2, ×1.5, ×2, potem ×3. Pudło zeruje combo.',
    'Zwierzak idzie po swój owoc. Kliknij go za +50. Jeśli zje, tracisz 50.'
  ],
  rules: {
    classic: { aim: 'Zbierz {pairs} par, zanim minie 60 sekund.', points: ['Każdy poziom chce więcej par i dodaje rodzaje owoców.', 'Poniżej 30 sekund to 3 gwiazdki. Poniżej 45 sekund to 2.', 'Zwierzaki pojawiają się od 3. poziomu. Później przychodzi ich więcej naraz.'] },
    endless: { aim: 'Wytrzymaj jak najdłużej. Runda kończy się, gdy plansza jest pełna.', points: ['Nowe pary spadają coraz szybciej. Zebrane pary robią miejsce.', 'Z czasem dochodzą nowe owoce i więcej zwierzaków.', 'Czas przetrwania zapisuje się na tym urządzeniu.'] },
    time: { aim: 'Zdobądź jak najwięcej punktów w 60 sekund.', points: ['Gdy czas minie, ten wynik jest rezultatem.', 'Pełna plansza kończy rundę wcześniej. Zbieraj pary szybciej, niż spadają.', 'Zwierzaki są od początku.'] },
    daily: { aim: 'Zbierz 18 par w 90 sekund. Dziś wszyscy mają tę samą planszę.', points: ['Plansza zmienia się o północy UTC.', 'Wygrana dziś przedłuża serię na tym urządzeniu.', 'Wynik w linku to cel do pobicia, nie publiczne miejsce.'] }
  },
  recordsNote: 'Zapisane na tym urządzeniu dla {name}. Nie ma jeszcze rankingu światowego — wynik w linku to cel, nie sprawdzone miejsce.',
  recordLabels: { best: 'Najlepszy wynik', endless: 'Przetrwanie', time: 'Na czas', daily: 'Rekord dzienny', week: 'Ten tydzień', streak: 'Seria dzienna', recent: 'Ostatnio grane' },
  day: day('{n} dzień', '{n} dni'),
  themes: { jungle: 'DŻUNGLA', forest: 'LAS', desert: 'PUSTYNIA', starfield: 'KOSMOS', sunset: 'ZACHÓD' },
  introNew: 'NOWE: {list} — kliknij zwierzaka, by go przegonić!',
  introNewItem: '{emoji} {name} je {fruit}',
  introHungry: 'Głodne zwierzaki: {list} — kliknij, by przegonić!',
  callouts: { 2: 'SUPER!', 3: 'BOMBA!', 5: 'NIESAMOWITE!', 8: 'NIE DO ZATRZYMANIA!' },
  tied: 'Remis przy {score}. Wygrywa wyższy wynik.', youBeat: 'Pobiłeś {score}.', shortOf: 'Zabrakło do {score}.',
  streakLine: 'Seria: {n}', unlocked: 'Odblokowano: {list}', newBest: 'NOWY REKORD!', personalBest: 'Rekord osobisty {score}',
  nextLevel: 'DALEJ', rematch: 'REWANŻ', again: 'JESZCZE RAZ', share: 'Udostępnij', challenge: 'Wyzwij znajomego',
  linkCopied: 'Link skopiowany!', copied: 'Skopiowano!',
  results: {
    endlessKicker: 'KONIEC · PLANSZA PEŁNA', endlessTitle: 'Owocowa lawina!', endlessRecord: 'Nowy rekord przetrwania!',
    endlessNote: '{gap} od twojego najlepszego czasu {best}.', timeKicker: 'NA CZAS · 60 SEKUND', timeTitle: 'Czas minął!',
    boardFullTitle: 'Plansza pełna!', timeRecord: 'Nowy rekord na czas!', timeNote: 'Rekord na czas: {best}.',
    dailyKicker: 'DZIENNY · WIŚNIOWY CHAOS', levelKicker: 'POZIOM {n}', cleared: 'Zebrane!',
    starNote: 'Skończ poniżej {time}, aby zdobyć {star}.', thirdStar: 'trzecią gwiazdkę', anotherStar: 'kolejną gwiazdkę',
    perfect: 'Idealnie. Trzy gwiazdki.', pairsShort: 'Zabrakło {n} par. Rób combo, żeby być szybszym.'
  },
  stats: { survived: 'przetrwano', accuracy: 'celność', bestCombo: 'najlepsze combo', score: 'wynik', pairs: 'pary', time: 'czas' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · dzienny', shareScore: 'Wynik: {score}', shareStreak: 'Seria: {n}', shareBeat: 'Pobijesz mnie?',
  nom: 'AM!', ate: '{emoji} zjadł {fruit} −50', shoo: 'Sio! +50'
}, ach([
  ['first-match', { name: 'Pierwsza para', detail: 'Dokończ grę.' }],
  ['combo-master', { name: 'Mistrz combo', detail: 'Zrób combo ×5.' }],
  ['rising-star', { name: 'Wschodząca gwiazda', detail: 'Zdobądź 5 000 punktów w jednej grze.' }],
  ['fruit-legend', { name: 'Owocowa legenda', detail: 'Zdobądź 50 000 punktów w jednej grze.' }],
  ['daily-player', { name: 'Gracz dnia', detail: 'Ukończ 3 wyzwania dnia.' }],
  ['champion', { name: 'Czempion', detail: 'Pobij wynik znajomego.' }],
  ['perfectionist', { name: 'Perfekcjonista', detail: 'Ukończ rundę bez pudeł.' }]
]));

const de = ui({
  pages: page('Spielen', 'Tagesherausforderung', 'Erfolge', 'Sprache', 'Nächstes Feld in', 'UTC. Alle bekommen am Kalendertag dasselbe Obstfeld.', 'Heutige Herausforderung spielen', 'Deine Serie bleibt auf diesem Gerät. Eine Punktzahl im Link ist ein Ziel, kein öffentlicher Rang.'),
  play: 'SPIELEN', back: 'Zurück', how: 'So geht’s', achievements: 'Erfolge', records: 'Rekorde', best: 'Bestwert',
  lede: 'Tippe zwei gleiche. Baue Combos. Lass das Feld nicht volllaufen.',
  resume: 'Weiter: {mode}', level: 'Level {n}',
  classic: 'Klassisch', endless: 'Endlos', time: 'Zeitangriff', daily: 'Täglich',
  classicHint: 'Level {n} · Paare schaffen', endlessHint: 'Überlebe · Bestwert {best}', timeHint: '60 Sekunden · Bestwert {best}',
  dailyHint: 'Dasselbe Feld für alle · {when}', nextIn: 'in {time}', nextSoon: 'bald',
  yourRecords: 'Deine Rekorde', everyMode: 'Jeder Modus', howRound: 'So läuft eine Runde',
  gotIt: 'VERSTANDEN', paused: 'Pause', resumeBtn: 'WEITER', restart: 'Neustart', quit: 'Beenden',
  score: 'Punkte', boardFull: 'Feld voll', matchPairs: 'Paare finden', hungry: 'Hungrige Tiere',
  hint: 'Esc für Pause · Paare fliegen in den Korb · Tiere antippen und verscheuchen',
  mute: 'Ton aus', sound: 'Ton', muted: 'Stumm', pause: 'Pause', menu: 'Menü',
  beat: 'Schlag {score}', inARow: '{n} in Folge', matchAgain: 'Schnell noch ein Paar!', chain: 'Combos bauen',
  modeEndless: 'ENDLOS', modeTime: 'ZEIT', modeDaily: 'TAG', modeLevel: 'LV {n}',
  speed: 'Tempo {n} · neues Paar alle {s} s', critterStats: 'gefressen {ate} · verscheucht {shooed}', playNamed: 'SPIELEN: {mode}',
  shared: [
    'Tippe zwei gleiche Früchte. Sie fliegen in den Korb.',
    'Finde innerhalb von 3 Sekunden ein weiteres Paar: ×1.2, ×1.5, ×2, dann ×3. Ein Fehlgriff setzt es zurück.',
    'Ein Tier läuft zu seiner Frucht. Antippen gibt +50. Frisst es, verlierst du 50.'
  ],
  rules: {
    classic: { aim: 'Schaffe {pairs} Paare, bevor die 60 Sekunden um sind.', points: ['Jedes Level verlangt mehr Paare und mehr Obstsorten.', 'Unter 30 Sekunden gibt 3 Sterne. Unter 45 Sekunden gibt 2.', 'Tiere kommen ab Level 3. Später sind es mehrere auf einmal.'] },
    endless: { aim: 'Halte so lange durch wie möglich. Die Runde endet, wenn das Feld voll ist.', points: ['Neue Paare fallen immer schneller. Gefundene Paare schaffen Platz.', 'Mit der Zeit kommen mehr Obstsorten und mehr Tiere.', 'Deine Überlebenszeit bleibt auf diesem Gerät.'] },
    time: { aim: 'Sammle in 60 Sekunden so viele Punkte wie möglich.', points: ['Wenn die Zeit um ist, zählt dieser Punktestand.', 'Ein volles Feld beendet die Runde früher. Räume Paare schneller ab, als sie kommen.', 'Tiere sind von Anfang an dabei.'] },
    daily: { aim: 'Schaffe 18 Paare in 90 Sekunden. Heute hat jeder dasselbe Feld.', points: ['Das Feld wechselt um Mitternacht UTC.', 'Ein Sieg heute verlängert die Serie auf diesem Gerät.', 'Eine Punktzahl im Link ist ein Ziel, kein öffentlicher Rang.'] }
  },
  recordsNote: 'Auf diesem Gerät gespeichert für {name}. Es gibt noch keine Weltrangliste — eine Punktzahl im Link ist ein Ziel, kein geprüfter Platz.',
  recordLabels: { best: 'Beste Punktzahl', endless: 'Überlebenszeit', time: 'Zeitangriff', daily: 'Tagesbestwert', week: 'Diese Woche', streak: 'Tagesserie', recent: 'Zuletzt gespielt' },
  day: day('{n} Tag', '{n} Tage'),
  themes: { jungle: 'DSCHUNGEL', forest: 'WALD', desert: 'WÜSTE', starfield: 'ALL', sunset: 'SONNENUNTERGANG' },
  introNew: 'NEU: {list} — tippe Tiere an, um sie zu verscheuchen!',
  introNewItem: '{emoji} {name} frisst {fruit}',
  introHungry: 'Hungrige Tiere: {list} — antippen und verscheuchen!',
  callouts: { 2: 'STARK!', 3: 'KRASS!', 5: 'UNGLAUBLICH!', 8: 'NICHT ZU STOPPEN!' },
  tied: 'Gleichstand bei {score}. Die höhere Zahl gewinnt.', youBeat: 'Du hast {score} geschlagen.', shortOf: 'Knapp an {score} vorbei.',
  streakLine: 'Serie: {n}', unlocked: 'Freigeschaltet: {list}', newBest: 'NEUER REKORD!', personalBest: 'Persönlicher Rekord {score}',
  nextLevel: 'NÄCHSTES LEVEL', rematch: 'REVANCHE', again: 'NOCHMAL', share: 'Teilen', challenge: 'Freund herausfordern',
  linkCopied: 'Link kopiert!', copied: 'Kopiert!',
  results: {
    endlessKicker: 'VORBEI · FELD VOLL', endlessTitle: 'Obstlawine!', endlessRecord: 'Neuer Überlebensrekord!',
    endlessNote: '{gap} unter deiner besten Zeit von {best}.', timeKicker: 'ZEITANGRIFF · 60 SEKUNDEN', timeTitle: 'Zeit um!',
    boardFullTitle: 'Feld voll!', timeRecord: 'Neuer Zeitangriff-Rekord!', timeNote: 'Zeitangriff-Bestwert: {best}.',
    dailyKicker: 'TÄGLICH · KIRSCHCHAOS', levelKicker: 'LEVEL {n}', cleared: 'Geschafft!',
    starNote: 'Schaffe es unter {time} für {star}.', thirdStar: 'den dritten Stern', anotherStar: 'einen weiteren Stern',
    perfect: 'Perfekt. Drei Sterne.', pairsShort: '{n} Paare fehlen. Baue Combos, um schneller zu werden.'
  },
  stats: { survived: 'überlebt', accuracy: 'Treffer', bestCombo: 'bestes Combo', score: 'Punkte', pairs: 'Paare', time: 'Zeit' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · täglich', shareScore: 'Punkte: {score}', shareStreak: 'Serie: {n}', shareBeat: 'Schaffst du mehr?',
  nom: 'HAM!', ate: '{emoji} fraß {fruit} −50', shoo: 'Weg! +50'
}, ach([
  ['first-match', { name: 'Erstes Paar', detail: 'Beende ein Spiel.' }],
  ['combo-master', { name: 'Combo-Meister', detail: 'Erreiche ein ×5-Combo.' }],
  ['rising-star', { name: 'Aufsteiger', detail: 'Schaffe 5.000 Punkte in einem Spiel.' }],
  ['fruit-legend', { name: 'Obstlegende', detail: 'Schaffe 50.000 Punkte in einem Spiel.' }],
  ['daily-player', { name: 'Tagesspieler', detail: 'Schaffe 3 Tagesherausforderungen.' }],
  ['champion', { name: 'Champion', detail: 'Schlag die Punktzahl eines Freundes.' }],
  ['perfectionist', { name: 'Perfektionist', detail: 'Schaffe eine Runde ohne Fehlgriff.' }]
]));

const es = ui({
  pages: page('Jugar', 'Reto diario', 'Logros', 'Idioma', 'Siguiente tablero en', 'UTC. Todos reciben el mismo tablero ese día.', 'Jugar el reto de hoy', 'Tu racha se guarda en este dispositivo. Una puntuación en un enlace es un objetivo, no un puesto público.'),
  play: 'JUGAR', back: 'Atrás', how: 'Cómo jugar', achievements: 'Logros', records: 'Récords', best: 'Récord',
  lede: 'Toca dos iguales. Encadena combos. No dejes que el tablero se llene.',
  resume: 'Seguir: {mode}', level: 'Nivel {n}',
  classic: 'Clásico', endless: 'Infinito', time: 'Contrarreloj', daily: 'Diario',
  classicHint: 'Nivel {n} · completa las parejas', endlessHint: 'Sobrevive · récord {best}', timeHint: '60 segundos · récord {best}',
  dailyHint: 'El mismo tablero para todos · {when}', nextIn: 'en {time}', nextSoon: 'pronto',
  yourRecords: 'Tus récords', everyMode: 'Cada modo', howRound: 'Cómo funciona una ronda',
  gotIt: 'ENTENDIDO', paused: 'Pausa', resumeBtn: 'SEGUIR', restart: 'Reiniciar', quit: 'Salir',
  score: 'Puntos', boardFull: 'Tablero lleno', matchPairs: 'Haz parejas', hungry: 'Animales hambrientos',
  hint: 'Esc para pausar · las parejas van a la cesta · toca a los animales para espantarlos',
  mute: 'Silenciar', sound: 'Sonido', muted: 'Silencio', pause: 'Pausa', menu: 'Menú',
  beat: 'Supera {score}', inARow: '{n} seguidos', matchAgain: '¡Otra pareja, rápido!', chain: 'Encadena',
  modeEndless: 'INFINITO', modeTime: 'TIEMPO', modeDaily: 'DIARIO', modeLevel: 'NV {n}',
  speed: 'Velocidad {n} · pareja nueva cada {s} s', critterStats: 'comieron {ate} · espantados {shooed}', playNamed: 'JUGAR: {mode}',
  shared: [
    'Toca dos frutas iguales. Vuelan a la cesta.',
    'Encuentra otra pareja en 3 segundos: ×1.2, ×1.5, ×2 y luego ×3. Un fallo lo reinicia.',
    'Un animal camina hacia su fruta. Tócalo para +50. Si come, pierdes 50.'
  ],
  rules: {
    classic: { aim: 'Completa {pairs} parejas antes de que acaben los 60 segundos.', points: ['Cada nivel pide más parejas y añade tipos de fruta.', 'Menos de 30 segundos son 3 estrellas. Menos de 45 son 2.', 'Los animales aparecen desde el nivel 3. Luego llegan varios a la vez.'] },
    endless: { aim: 'Aguanta todo lo que puedas. La ronda termina cuando el tablero está lleno.', points: ['Caen parejas nuevas cada vez más rápido. Emparejar deja espacio.', 'Con el tiempo llegan más frutas y más animales.', 'Tu tiempo de supervivencia se guarda en este dispositivo.'] },
    time: { aim: 'Consigue todos los puntos que puedas en 60 segundos.', points: ['Cuando se acaba el tiempo, esa puntuación es el resultado.', 'Un tablero lleno termina la ronda antes. Limpia parejas más rápido de lo que llegan.', 'Los animales están desde el principio.'] },
    daily: { aim: 'Completa 18 parejas en 90 segundos. Hoy todos tienen este mismo tablero.', points: ['El tablero cambia a medianoche UTC.', 'Ganar hoy alarga la racha guardada en este dispositivo.', 'Una puntuación en un enlace es un objetivo, no un puesto público.'] }
  },
  recordsNote: 'Guardado en este dispositivo para {name}. Aún no hay un ranking mundial: una puntuación en un enlace es un objetivo, no un puesto verificado.',
  recordLabels: { best: 'Mejor puntuación', endless: 'Supervivencia', time: 'Contrarreloj', daily: 'Mejor del día', week: 'Esta semana', streak: 'Racha diaria', recent: 'Jugado hace poco' },
  day: day('{n} día', '{n} días'),
  themes: { jungle: 'SELVA', forest: 'BOSQUE', desert: 'DESIERTO', starfield: 'ESPACIO', sunset: 'ATARDECER' },
  introNew: 'NUEVO: {list} — ¡tócalos para espantarlos!',
  introNewItem: '{emoji} {name} come {fruit}',
  introHungry: 'Animales hambrientos: {list} — ¡tócalos para espantarlos!',
  callouts: { 2: '¡GENIAL!', 3: '¡BRUTAL!', 5: '¡INCREÍBLE!', 8: '¡IMPARABLE!' },
  tied: 'Empate en {score}. Gana la puntuación más alta.', youBeat: 'Superaste {score}.', shortOf: 'Te faltó para {score}.',
  streakLine: 'Racha: {n}', unlocked: 'Desbloqueado: {list}', newBest: '¡NUEVO RÉCORD!', personalBest: 'Récord personal {score}',
  nextLevel: 'SIGUIENTE', rematch: 'REVANCHA', again: 'OTRA VEZ', share: 'Compartir', challenge: 'Retar a un amigo',
  linkCopied: '¡Enlace copiado!', copied: '¡Copiado!',
  results: {
    endlessKicker: 'FIN · TABLERO LLENO', endlessTitle: '¡Avalancha de fruta!', endlessRecord: '¡Nuevo récord de supervivencia!',
    endlessNote: 'A {gap} de tu mejor tiempo de {best}.', timeKicker: 'CONTRARRELOJ · 60 SEGUNDOS', timeTitle: '¡Se acabó el tiempo!',
    boardFullTitle: '¡Tablero lleno!', timeRecord: '¡Nuevo récord contrarreloj!', timeNote: 'Récord contrarreloj: {best}.',
    dailyKicker: 'DIARIO · CAOS DE CEREZAS', levelKicker: 'NIVEL {n}', cleared: '¡Completado!',
    starNote: 'Termina en menos de {time} para {star}.', thirdStar: 'la tercera estrella', anotherStar: 'otra estrella',
    perfect: 'Perfecto. Tres estrellas.', pairsShort: 'Faltan {n} parejas. Encadena combos para ir más rápido.'
  },
  stats: { survived: 'sobrevivido', accuracy: 'precisión', bestCombo: 'mejor combo', score: 'puntos', pairs: 'parejas', time: 'tiempo' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · diario', shareScore: 'Puntos: {score}', shareStreak: 'Racha: {n}', shareBeat: '¿Puedes superarme?',
  nom: '¡ÑAM!', ate: '{emoji} se comió {fruit} −50', shoo: '¡Fuera! +50'
}, ach([
  ['first-match', { name: 'Primera pareja', detail: 'Termina una partida.' }],
  ['combo-master', { name: 'Maestro del combo', detail: 'Llega a un combo ×5.' }],
  ['rising-star', { name: 'Estrella naciente', detail: 'Consigue 5.000 puntos en una partida.' }],
  ['fruit-legend', { name: 'Leyenda frutal', detail: 'Consigue 50.000 puntos en una partida.' }],
  ['daily-player', { name: 'Jugador diario', detail: 'Completa 3 retos diarios.' }],
  ['champion', { name: 'Campeón', detail: 'Supera la puntuación de un amigo.' }],
  ['perfectionist', { name: 'Perfeccionista', detail: 'Completa una ronda sin fallos.' }]
]));

const fr = ui({
  pages: page('Jouer', 'Défi du jour', 'Succès', 'Langue', 'Prochain plateau dans', 'UTC. Tout le monde a le même plateau pour la journée.', 'Jouer le défi du jour', 'Ta série reste sur cet appareil. Un score dans un lien est un objectif, pas un rang public.'),
  play: 'JOUER', back: 'Retour', how: 'Comment jouer', achievements: 'Succès', records: 'Records', best: 'Record',
  lede: 'Touche deux identiques. Enchaîne les combos. Ne laisse pas le plateau se remplir.',
  resume: 'Reprendre : {mode}', level: 'Niveau {n}',
  classic: 'Classique', endless: 'Infini', time: 'Contre-la-montre', daily: 'Quotidien',
  classicHint: 'Niveau {n} · finis les paires', endlessHint: 'Tiens bon · record {best}', timeHint: '60 secondes · record {best}',
  dailyHint: 'Le même plateau pour tous · {when}', nextIn: 'dans {time}', nextSoon: 'bientôt',
  yourRecords: 'Tes records', everyMode: 'Chaque mode', howRound: 'Comment se joue une manche',
  gotIt: 'COMPRIS', paused: 'Pause', resumeBtn: 'REPRENDRE', restart: 'Recommencer', quit: 'Quitter',
  score: 'Score', boardFull: 'Plateau plein', matchPairs: 'Faire des paires', hungry: 'Bestioles affamées',
  hint: 'Échap pour la pause · les paires vont au panier · touche une bestiole pour la chasser',
  mute: 'Couper le son', sound: 'Son', muted: 'Muet', pause: 'Pause', menu: 'Menu',
  beat: 'Bats {score}', inARow: '{n} d’affilée', matchAgain: 'Encore une paire, vite !', chain: 'Enchaîne',
  modeEndless: 'INFINI', modeTime: 'TEMPS', modeDaily: 'JOUR', modeLevel: 'NV {n}',
  speed: 'Vitesse {n} · nouvelle paire toutes les {s} s', critterStats: 'mangé {ate} · chassées {shooed}', playNamed: 'JOUER : {mode}',
  shared: [
    'Touche deux fruits identiques. Ils volent dans le panier.',
    'Retrouve une paire en 3 secondes : ×1.2, ×1.5, ×2, puis ×3. Un raté remet le combo à zéro.',
    'Une bestiole marche vers son fruit. Touche-la pour +50. Si elle mange, tu perds 50.'
  ],
  rules: {
    classic: { aim: 'Termine {pairs} paires avant la fin des 60 secondes.', points: ['Chaque niveau demande plus de paires et ajoute des fruits.', 'Moins de 30 secondes donne 3 étoiles. Moins de 45 en donne 2.', 'Les bestioles arrivent au niveau 3. Ensuite, elles viennent à plusieurs.'] },
    endless: { aim: 'Tiens le plus longtemps possible. La manche s’arrête quand le plateau est plein.', points: ['De nouvelles paires tombent de plus en plus vite. Les paires trouvées libèrent de la place.', 'Avec le temps, plus de fruits et plus de bestioles arrivent.', 'Ton temps de survie est enregistré sur cet appareil.'] },
    time: { aim: 'Marque le plus de points possible en 60 secondes.', points: ['Quand le temps est écoulé, ce score est le résultat.', 'Un plateau plein termine la manche plus tôt. Dégage les paires plus vite qu’elles n’arrivent.', 'Les bestioles sont là dès le début.'] },
    daily: { aim: 'Termine 18 paires en 90 secondes. Aujourd’hui, tout le monde a ce plateau.', points: ['Le plateau change à minuit UTC.', 'Gagner aujourd’hui prolonge la série enregistrée sur cet appareil.', 'Un score dans un lien est un objectif, pas un rang public.'] }
  },
  recordsNote: 'Enregistré sur cet appareil pour {name}. Il n’y a pas encore de classement mondial — un score dans un lien est un objectif, pas une place vérifiée.',
  recordLabels: { best: 'Meilleur score', endless: 'Survie', time: 'Contre-la-montre', daily: 'Record du jour', week: 'Cette semaine', streak: 'Série quotidienne', recent: 'Joué récemment' },
  day: day('{n} jour', '{n} jours'),
  themes: { jungle: 'JUNGLE', forest: 'FORÊT', desert: 'DÉSERT', starfield: 'ESPACE', sunset: 'COUCHER' },
  introNew: 'NOUVEAU : {list} — touche-les pour les chasser !',
  introNewItem: '{emoji} {name} mange {fruit}',
  introHungry: 'Bestioles affamées : {list} — touche pour chasser !',
  callouts: { 2: 'BRAVO !', 3: 'GÉNIAL !', 5: 'INCROYABLE !', 8: 'INARRÊTABLE !' },
  tied: 'Égalité à {score}. Le score le plus haut gagne.', youBeat: 'Tu as battu {score}.', shortOf: 'Il manquait pour {score}.',
  streakLine: 'Série : {n}', unlocked: 'Débloqué : {list}', newBest: 'NOUVEAU RECORD !', personalBest: 'Record personnel {score}',
  nextLevel: 'NIVEAU SUIVANT', rematch: 'REVANCHE', again: 'REJOUER', share: 'Partager', challenge: 'Défier un ami',
  linkCopied: 'Lien copié !', copied: 'Copié !',
  results: {
    endlessKicker: 'FIN · PLATEAU PLEIN', endlessTitle: 'Avalanche de fruits !', endlessRecord: 'Nouveau record de survie !',
    endlessNote: 'À {gap} de ton meilleur temps de {best}.', timeKicker: 'CONTRE-LA-MONTRE · 60 SECONDES', timeTitle: 'Temps écoulé !',
    boardFullTitle: 'Plateau plein !', timeRecord: 'Nouveau record contre-la-montre !', timeNote: 'Record contre-la-montre : {best}.',
    dailyKicker: 'QUOTIDIEN · CHAOS CERISE', levelKicker: 'NIVEAU {n}', cleared: 'Réussi !',
    starNote: 'Termine en moins de {time} pour {star}.', thirdStar: 'la troisième étoile', anotherStar: 'une étoile de plus',
    perfect: 'Parfait. Trois étoiles.', pairsShort: 'Il manque {n} paires. Enchaîne les combos pour aller plus vite.'
  },
  stats: { survived: 'survécu', accuracy: 'précision', bestCombo: 'meilleur combo', score: 'score', pairs: 'paires', time: 'temps' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · quotidien', shareScore: 'Score : {score}', shareStreak: 'Série : {n}', shareBeat: 'Tu peux me battre ?',
  nom: 'MIAM !', ate: '{emoji} a mangé {fruit} −50', shoo: 'Ouste ! +50'
}, ach([
  ['first-match', { name: 'Première paire', detail: 'Termine une partie.' }],
  ['combo-master', { name: 'Maître du combo', detail: 'Atteins un combo ×5.' }],
  ['rising-star', { name: 'Étoile montante', detail: 'Marque 5 000 points en une partie.' }],
  ['fruit-legend', { name: 'Légende des fruits', detail: 'Marque 50 000 points en une partie.' }],
  ['daily-player', { name: 'Joueur du jour', detail: 'Termine 3 défis du jour.' }],
  ['champion', { name: 'Champion', detail: 'Bats le score d’un ami.' }],
  ['perfectionist', { name: 'Perfectionniste', detail: 'Termine une manche sans raté.' }]
]));

const pt = ui({
  pages: page('Jogar', 'Desafio diário', 'Conquistas', 'Idioma', 'Próximo tabuleiro em', 'UTC. Todo mundo recebe o mesmo tabuleiro no dia.', 'Jogar o desafio de hoje', 'Sua sequência fica neste aparelho. Uma pontuação no link é um alvo, não uma posição pública.'),
  play: 'JOGAR', back: 'Voltar', how: 'Como jogar', achievements: 'Conquistas', records: 'Recordes', best: 'Recorde',
  lede: 'Toque em dois iguais. Faça combos. Não deixe o tabuleiro encher.',
  resume: 'Continuar: {mode}', level: 'Fase {n}',
  classic: 'Clássico', endless: 'Infinito', time: 'Contra o tempo', daily: 'Diário',
  classicHint: 'Fase {n} · complete os pares', endlessHint: 'Sobreviva · recorde {best}', timeHint: '60 segundos · recorde {best}',
  dailyHint: 'O mesmo tabuleiro para todos · {when}', nextIn: 'em {time}', nextSoon: 'em breve',
  yourRecords: 'Seus recordes', everyMode: 'Cada modo', howRound: 'Como funciona uma rodada',
  gotIt: 'ENTENDI', paused: 'Pausa', resumeBtn: 'CONTINUAR', restart: 'De novo', quit: 'Sair',
  score: 'Pontos', boardFull: 'Tabuleiro cheio', matchPairs: 'Forme pares', hungry: 'Bichos com fome',
  hint: 'Esc pausa · os pares vão para a cesta · toque no bicho para espantar',
  mute: 'Silenciar', sound: 'Som', muted: 'Mudo', pause: 'Pausa', menu: 'Menu',
  beat: 'Supere {score}', inARow: '{n} seguidos', matchAgain: 'Outro par, rápido!', chain: 'Faça combos',
  modeEndless: 'INFINITO', modeTime: 'TEMPO', modeDaily: 'DIÁRIO', modeLevel: 'FASE {n}',
  speed: 'Velocidade {n} · novo par a cada {s} s', critterStats: 'comeram {ate} · espantados {shooed}', playNamed: 'JOGAR: {mode}',
  shared: [
    'Toque em duas frutas iguais. Elas voam para a cesta.',
    'Ache outro par em 3 segundos: ×1.2, ×1.5, ×2 e depois ×3. Um erro zera o combo.',
    'Um bicho anda até a fruta dele. Toque para +50. Se ele comer, você perde 50.'
  ],
  rules: {
    classic: { aim: 'Complete {pairs} pares antes de acabarem os 60 segundos.', points: ['Cada fase pede mais pares e adiciona tipos de fruta.', 'Menos de 30 segundos vale 3 estrelas. Menos de 45 vale 2.', 'Os bichos aparecem a partir da fase 3. Depois vêm vários de uma vez.'] },
    endless: { aim: 'Aguente o máximo que puder. A rodada acaba quando o tabuleiro enche.', points: ['Novos pares caem cada vez mais rápido. Formar pares abre espaço.', 'Com o tempo entram mais frutas e mais bichos.', 'Seu tempo de sobrevivência fica salvo neste aparelho.'] },
    time: { aim: 'Faça o máximo de pontos em 60 segundos.', points: ['Quando o tempo acaba, essa pontuação é o resultado.', 'Um tabuleiro cheio encerra a rodada antes. Limpe os pares mais rápido do que eles chegam.', 'Os bichos entram desde o começo.'] },
    daily: { aim: 'Complete 18 pares em 90 segundos. Hoje todo mundo tem este tabuleiro.', points: ['O tabuleiro muda à meia-noite UTC.', 'Vencer hoje aumenta a sequência salva neste aparelho.', 'Uma pontuação no link é um alvo, não uma posição pública.'] }
  },
  recordsNote: 'Salvo neste aparelho para {name}. Ainda não há ranking mundial — uma pontuação no link é um alvo, não uma posição verificada.',
  recordLabels: { best: 'Melhor pontuação', endless: 'Sobrevivência', time: 'Contra o tempo', daily: 'Recorde diário', week: 'Esta semana', streak: 'Sequência diária', recent: 'Jogado há pouco' },
  day: day('{n} dia', '{n} dias'),
  themes: { jungle: 'SELVA', forest: 'FLORESTA', desert: 'DESERTO', starfield: 'ESPAÇO', sunset: 'PÔR DO SOL' },
  introNew: 'NOVO: {list} — toque para espantar!',
  introNewItem: '{emoji} {name} come {fruit}',
  introHungry: 'Bichos com fome: {list} — toque para espantar!',
  callouts: { 2: 'BOA!', 3: 'DEMAIS!', 5: 'INCRÍVEL!', 8: 'IMPARÁVEL!' },
  tied: 'Empate em {score}. A pontuação maior vence.', youBeat: 'Você superou {score}.', shortOf: 'Faltou para {score}.',
  streakLine: 'Sequência: {n}', unlocked: 'Desbloqueado: {list}', newBest: 'NOVO RECORDE!', personalBest: 'Recorde pessoal {score}',
  nextLevel: 'PRÓXIMA FASE', rematch: 'REVANCHE', again: 'JOGAR DE NOVO', share: 'Compartilhar', challenge: 'Desafiar um amigo',
  linkCopied: 'Link copiado!', copied: 'Copiado!',
  results: {
    endlessKicker: 'FIM · TABULEIRO CHEIO', endlessTitle: 'Avalanche de frutas!', endlessRecord: 'Novo recorde de sobrevivência!',
    endlessNote: '{gap} abaixo do seu melhor tempo de {best}.', timeKicker: 'CONTRA O TEMPO · 60 SEGUNDOS', timeTitle: 'O tempo acabou!',
    boardFullTitle: 'Tabuleiro cheio!', timeRecord: 'Novo recorde contra o tempo!', timeNote: 'Recorde contra o tempo: {best}.',
    dailyKicker: 'DIÁRIO · CAOS DE CEREJA', levelKicker: 'FASE {n}', cleared: 'Completo!',
    starNote: 'Termine em menos de {time} para {star}.', thirdStar: 'a terceira estrela', anotherStar: 'mais uma estrela',
    perfect: 'Perfeito. Três estrelas.', pairsShort: 'Faltaram {n} pares. Faça combos para ir mais rápido.'
  },
  stats: { survived: 'sobreviveu', accuracy: 'precisão', bestCombo: 'melhor combo', score: 'pontos', pairs: 'pares', time: 'tempo' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · diário', shareScore: 'Pontos: {score}', shareStreak: 'Sequência: {n}', shareBeat: 'Consegue me superar?',
  nom: 'NHAM!', ate: '{emoji} comeu {fruit} −50', shoo: 'Xô! +50'
}, ach([
  ['first-match', { name: 'Primeiro par', detail: 'Termine uma partida.' }],
  ['combo-master', { name: 'Mestre do combo', detail: 'Chegue a um combo ×5.' }],
  ['rising-star', { name: 'Estrela em alta', detail: 'Faça 5.000 pontos em uma partida.' }],
  ['fruit-legend', { name: 'Lenda das frutas', detail: 'Faça 50.000 pontos em uma partida.' }],
  ['daily-player', { name: 'Jogador diário', detail: 'Complete 3 desafios diários.' }],
  ['champion', { name: 'Campeão', detail: 'Supere a pontuação de um amigo.' }],
  ['perfectionist', { name: 'Perfeccionista', detail: 'Complete uma rodada sem erros.' }]
]));

const tr = ui({
  pages: page('Oyna', 'Günlük meydan okuma', 'Başarımlar', 'Dil', 'Sonraki tahta', 'UTC. Herkes o takvim gününde aynı tahtayı alır.', 'Bugünün meydan okumasını oyna', 'Serin bu cihazda kalır. Bağlantıdaki skor bir hedeftir, herkese açık bir sıra değildir.'),
  play: 'OYNA', back: 'Geri', how: 'Nasıl oynanır', achievements: 'Başarımlar', records: 'Rekorlar', best: 'Rekor',
  lede: 'Aynı iki tanesine dokun. Kombo yap. Tahtanın dolmasına izin verme.',
  resume: 'Devam: {mode}', level: 'Bölüm {n}',
  classic: 'Klasik', endless: 'Sonsuz', time: 'Zamana karşı', daily: 'Günlük',
  classicHint: 'Bölüm {n} · çiftleri topla', endlessHint: 'Dayan · rekor {best}', timeHint: '60 saniye · rekor {best}',
  dailyHint: 'Herkes için aynı tahta · {when}', nextIn: '{time} sonra', nextSoon: 'yakında',
  yourRecords: 'Rekorların', everyMode: 'Her mod', howRound: 'Tur nasıl işler',
  gotIt: 'TAMAM', paused: 'Duraklatıldı', resumeBtn: 'DEVAM', restart: 'Yeniden', quit: 'Çık',
  score: 'Skor', boardFull: 'Tahta dolu', matchPairs: 'Çiftleri bul', hungry: 'Aç hayvanlar',
  hint: 'Esc duraklatır · çiftler sepete gider · hayvanı kovmak için dokun',
  mute: 'Sesi kapat', sound: 'Ses', muted: 'Sessiz', pause: 'Duraklat', menu: 'Menü',
  beat: '{score} geç', inARow: '{n} üst üste', matchAgain: 'Hemen bir çift daha!', chain: 'Kombo yap',
  modeEndless: 'SONSUZ', modeTime: 'SÜRE', modeDaily: 'GÜN', modeLevel: 'BL {n}',
  speed: 'Hız {n} · her {s} sn yeni çift', critterStats: 'yedi {ate} · kovulan {shooed}', playNamed: 'OYNA: {mode}',
  shared: [
    'Aynı iki meyveye dokun. Sepete uçarlar.',
    '3 saniye içinde bir çift daha bul: ×1.2, ×1.5, ×2, sonra ×3. Iska komboyu sıfırlar.',
    'Hayvan kendi meyvesine yürür. Kovmak için dokun, +50. Yerse 50 kaybedersin.'
  ],
  rules: {
    classic: { aim: '60 saniye bitmeden {pairs} çift topla.', points: ['Her bölüm daha çok çift ister ve yeni meyve türleri ekler.', '30 saniyenin altı 3 yıldız. 45 saniyenin altı 2 yıldız.', 'Hayvanlar 3. bölümden itibaren gelir. Sonra birden fazlası çıkar.'] },
    endless: { aim: 'Olabildiğince dayan. Tur, tahta dolunca biter.', points: ['Yeni çiftler giderek hızlanır. Eşleştirmek yer açar.', 'Süre uzadıkça daha çok meyve ve hayvan katılır.', 'Dayanma süren bu cihazda kalır.'] },
    time: { aim: '60 saniyede olabildiğince çok skor yap.', points: ['Süre bitince bu skor sonucundur.', 'Dolu tahta turu erken bitirir. Çiftleri gelişlerinden hızlı temizle.', 'Hayvanlar baştan vardır.'] },
    daily: { aim: '90 saniyede 18 çift topla. Bugün herkes bu tahtayı oynar.', points: ['Tahta gece yarısı UTC’de değişir.', 'Bugün kazanmak bu cihazdaki seriyi uzatır.', 'Bağlantıdaki skor bir hedeftir, herkese açık bir sıra değildir.'] }
  },
  recordsNote: 'Bu cihazda {name} için kayıtlı. Henüz dünya sıralaması yok — bağlantıdaki skor bir hedeftir, doğrulanmış bir sıra değildir.',
  recordLabels: { best: 'En iyi skor', endless: 'Dayanma', time: 'Zamana karşı', daily: 'Günlük rekor', week: 'Bu hafta', streak: 'Günlük seri', recent: 'Son oynananlar' },
  day: day('{n} gün', '{n} gün'),
  themes: { jungle: 'ORMAN', forest: 'KORU', desert: 'ÇÖL', starfield: 'UZAY', sunset: 'GÜN BATIMI' },
  introNew: 'YENİ: {list} — kovmak için dokun!',
  introNewItem: '{emoji} {name} şunu yer: {fruit}',
  introHungry: 'Aç hayvanlar: {list} — kovmak için dokun!',
  callouts: { 2: 'HARİKA!', 3: 'MÜTHİŞ!', 5: 'İNANILMAZ!', 8: 'DURDURULAMAZ!' },
  tied: '{score} beraberlik. Yüksek skor kazanır.', youBeat: '{score} geçtin.', shortOf: '{score} için yetmedi.',
  streakLine: 'Seri: {n}', unlocked: 'Açıldı: {list}', newBest: 'YENİ REKOR!', personalBest: 'Kişisel rekor {score}',
  nextLevel: 'SONRAKİ BÖLÜM', rematch: 'RÖVANŞ', again: 'YENİDEN OYNA', share: 'Paylaş', challenge: 'Arkadaşa meydan oku',
  linkCopied: 'Bağlantı kopyalandı!', copied: 'Kopyalandı!',
  results: {
    endlessKicker: 'BİTTİ · TAHTA DOLU', endlessTitle: 'Meyve çığı!', endlessRecord: 'Yeni dayanma rekoru!',
    endlessNote: 'En iyi süren {best} değerinin {gap} gerisinde.', timeKicker: 'ZAMANA KARŞI · 60 SANİYE', timeTitle: 'Süre doldu!',
    boardFullTitle: 'Tahta dolu!', timeRecord: 'Yeni zamana karşı rekor!', timeNote: 'Zamana karşı rekor: {best}.',
    dailyKicker: 'GÜNLÜK · KİRAZ KAOSU', levelKicker: 'BÖLÜM {n}', cleared: 'Tamam!',
    starNote: '{star} için {time} altında bitir.', thirdStar: 'üçüncü yıldız', anotherStar: 'bir yıldız daha',
    perfect: 'Mükemmel. Üç yıldız.', pairsShort: '{n} çift eksik. Daha hızlı olmak için kombo yap.'
  },
  stats: { survived: 'dayandı', accuracy: 'isabet', bestCombo: 'en iyi kombo', score: 'skor', pairs: 'çift', time: 'süre' },
  shareTitle: 'Fruit Destroy', shareDaily: 'Fruit Destroy · günlük', shareScore: 'Skor: {score}', shareStreak: 'Seri: {n}', shareBeat: 'Beni geçebilir misin?',
  nom: 'HAM!', ate: '{emoji} {fruit} yedi −50', shoo: 'Hoşt! +50'
}, ach([
  ['first-match', { name: 'İlk çift', detail: 'Bir oyunu bitir.' }],
  ['combo-master', { name: 'Kombo ustası', detail: '×5 komboya ulaş.' }],
  ['rising-star', { name: 'Yükselen yıldız', detail: 'Tek oyunda 5.000 puan yap.' }],
  ['fruit-legend', { name: 'Meyve efsanesi', detail: 'Tek oyunda 50.000 puan yap.' }],
  ['daily-player', { name: 'Günlük oyuncu', detail: '3 günlük meydan okumayı tamamla.' }],
  ['champion', { name: 'Şampiyon', detail: 'Bir arkadaşının skorunu geç.' }],
  ['perfectionist', { name: 'Mükemmeliyetçi', detail: 'Iskasız bir tur bitir.' }]
]));

const mode = (title, body) => [undefined, undefined, undefined, { title, body }];

export const EXTRA = {
  en: {
    ui: en,
    language: 'Language'
  },
  uk: {
    ui: uk,
    language: 'Мова',
    faqTitle: 'Питання',
    modesTitle: 'Режими гри',
    progressTitle: 'Твій прогрес',
    progressNote: 'Зіграй — і рекорди з’являться тут. Вони лишаються на цьому пристрої.',
    dailyTitle: 'Щоденний фруктовий виклик — Fruit Destroy',
    dailyDescription: 'Одне поле на день, однакове для всіх. Зіграй сьогоднішній виклик безкоштовно в браузері.',
    achTitle: 'Досягнення — Fruit Destroy',
    achDescription: 'Досягнення Fruit Destroy на цьому пристрої: комбо, рекорди, щоденні виклики й ідеальні проходження.',
    modes: mode('На час', 'Шістдесят секунд. Набери якомога більше очок, поки не скінчиться час або не заповниться поле.')
  },
  pl: {
    ui: pl,
    language: 'Język',
    faqTitle: 'Pytania',
    modesTitle: 'Tryby gry',
    progressTitle: 'Twój postęp',
    progressNote: 'Zagraj, a rekordy pojawią się tutaj. Zostają na tym urządzeniu.',
    dailyTitle: 'Codzienne wyzwanie owocowe — Fruit Destroy',
    dailyDescription: 'Jedna plansza dziennie, taka sama dla wszystkich. Zagraj w dzisiejsze wyzwanie za darmo w przeglądarce.',
    achTitle: 'Osiągnięcia — Fruit Destroy',
    achDescription: 'Osiągnięcia Fruit Destroy na tym urządzeniu: combo, rekordy, wyzwania dnia i idealne przejścia.',
    modes: mode('Na czas', 'Sześćdziesiąt sekund. Zdobądź jak najwięcej punktów, zanim skończy się czas albo plansza.')
  },
  de: {
    ui: de,
    language: 'Sprache',
    faqTitle: 'Fragen',
    modesTitle: 'Spielmodi',
    progressTitle: 'Dein Fortschritt',
    progressNote: 'Spiel eine Runde, dann stehen deine Rekorde hier. Sie bleiben auf diesem Gerät.',
    dailyTitle: 'Tägliche Obst-Herausforderung — Fruit Destroy',
    dailyDescription: 'Jeden Tag ein Feld, für alle gleich. Spiel die heutige Herausforderung gratis im Browser.',
    achTitle: 'Erfolge — Fruit Destroy',
    achDescription: 'Erfolge in Fruit Destroy auf diesem Gerät: Combos, Bestwerte, Tagesherausforderungen und perfekte Runden.',
    modes: mode('Zeitangriff', 'Sechzig Sekunden. Sammle so viele Punkte wie möglich, bevor die Zeit oder das Feld ausgeht.')
  },
  es: {
    ui: es,
    language: 'Idioma',
    faqTitle: 'Preguntas',
    modesTitle: 'Formas de jugar',
    progressTitle: 'Tu progreso',
    progressNote: 'Juega una partida y tus récords aparecerán aquí. Se quedan en este dispositivo.',
    dailyTitle: 'Reto diario de frutas — Fruit Destroy',
    dailyDescription: 'Un tablero al día, el mismo para todos. Juega el reto de hoy gratis en el navegador.',
    achTitle: 'Logros — Fruit Destroy',
    achDescription: 'Logros de Fruit Destroy en este dispositivo: combos, récords, retos diarios y rondas perfectas.',
    modes: mode('Contrarreloj', 'Sesenta segundos. Consigue todos los puntos que puedas antes de que se acabe el tiempo o el tablero.')
  },
  fr: {
    ui: fr,
    language: 'Langue',
    faqTitle: 'Questions',
    modesTitle: 'Façons de jouer',
    progressTitle: 'Ta progression',
    progressNote: 'Joue une partie et tes records apparaissent ici. Ils restent sur cet appareil.',
    dailyTitle: 'Défi fruit du jour — Fruit Destroy',
    dailyDescription: 'Un plateau par jour, le même pour tout le monde. Joue le défi du jour gratuitement dans ton navigateur.',
    achTitle: 'Succès — Fruit Destroy',
    achDescription: 'Succès de Fruit Destroy sur cet appareil : combos, records, défis du jour et manches parfaites.',
    modes: mode('Contre-la-montre', 'Soixante secondes. Marque le plus de points possible avant la fin du temps ou du plateau.')
  },
  'pt-br': {
    ui: pt,
    language: 'Idioma',
    faqTitle: 'Perguntas',
    modesTitle: 'Jeitos de jogar',
    progressTitle: 'Seu progresso',
    progressNote: 'Jogue uma partida e seus recordes aparecem aqui. Eles ficam neste aparelho.',
    dailyTitle: 'Desafio diário de frutas — Fruit Destroy',
    dailyDescription: 'Um tabuleiro por dia, igual para todo mundo. Jogue o desafio de hoje grátis no navegador.',
    achTitle: 'Conquistas — Fruit Destroy',
    achDescription: 'Conquistas do Fruit Destroy neste aparelho: combos, recordes, desafios diários e rodadas perfeitas.',
    modes: mode('Contra o tempo', 'Sessenta segundos. Faça o máximo de pontos antes de acabar o tempo ou o tabuleiro.')
  },
  tr: {
    ui: tr,
    language: 'Dil',
    faqTitle: 'Sorular',
    modesTitle: 'Oyun modları',
    progressTitle: 'İlerlemen',
    progressNote: 'Bir oyun oyna, rekorların burada görünsün. Bu cihazda kalırlar.',
    dailyTitle: 'Günlük meyve meydan okuması — Fruit Destroy',
    dailyDescription: 'Günde bir tahta, herkes için aynı. Bugünün meydan okumasını tarayıcıda ücretsiz oyna.',
    achTitle: 'Başarımlar — Fruit Destroy',
    achDescription: 'Bu cihazdaki Fruit Destroy başarımları: kombolar, rekorlar, günlük meydan okumalar ve kusursuz turlar.',
    modes: mode('Zamana karşı', 'Altmış saniye. Süre ya da tahta bitmeden olabildiğince çok skor yap.')
  }
};
