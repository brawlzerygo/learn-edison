"""Build Learn Edison's data files from edisonformat.net and the mikaRulings repo.

Sources (downloaded into build/raw/ and build/rulings/ first, see README in this folder):
  raw/EdisonCards.json   https://edisonformat.net/data/json/EdisonCards.json  (cards, stats, banlist)
  raw/decks.json         https://edisonformat.net/data/json/decks.json        (starter deck names and tiers)
  raw/ydk/<name>.ydk     https://edisonformat.net/data/ydk/structure/<name>.ydk
  rulings/cards/<id>.json  git clone --depth 1 https://github.com/MikaMikaDE/mikaRulings
                           (Edison-accurate card text "PSCT.Edison", Edison rulings, general rulings)

Writes (loaded by index.html with <script> tags, so the page also works opened as a local file):
  ../data/cards.js   window.EDISON_CARDS = [...]
  ../data/decks.js   window.EDISON_DECKS = [...]
  ../data/meta.js    window.EDISON_META = {...}   (sources and build date)

With --images it also downloads card art for every card in a starter deck or a lesson into ../img/<id>.webp,
paced and skipping files already there. Other cards load their art from img.edisonformat.net when viewed.
"""
import re
import json, os, re, sys, time, glob, datetime, urllib.request, urllib.parse

# monster type labels in edisonformat.net's data -> our kind (see the check in main())
KIND_OF = {'Normal': 'normal', 'Normal Tuner': 'normal', 'Effect': 'effect', 'Flip Effect': 'effect', 'Effect Tuner': 'effect',
           'Effect Gemini': 'effect', 'Effect Union': 'effect', 'Effect Spirit': 'effect', 'Effect Toon': 'effect',
           'Synchro': 'synchro', 'Fusion': 'fusion', 'Ritual': 'ritual'}

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
UA = {'User-Agent': 'Mozilla/5.0 (personal study tool)'}
ALIAS = {83011277: 83011278}  # alt-art passcode in two starter decks -> Mystic Tomato

def clean(s, empty_prefixes):
    if not s:
        return ''
    s = s.replace('\\n', '\n').strip()
    if any(s.startswith(p) for p in empty_prefixes):
        return ''
    return s

def check_kinds(cards):
    """Every card's kind must agree with its own text, so an Extra Deck monster can never be filed as a Main Deck one (or the
    reverse) again (2026-11-27, Gaia Knight). A Synchro's first line names a Tuner and non-Tuners; a Fusion's names its materials."""
    bad = []
    for r in cards:
        if r.get('k') in ('spell', 'trap'):
            continue
        first = (r.get('tx') or '').split('\n')[0]
        syn = re.search(r'\+[^\n]*\bnon-Tuner', first) is not None or re.search(r'\bTuner\s*\+', first) is not None  # "1 Tuner + 1 or more EARTH monsters" (XX-Saber Gottoms)
        fus = re.match(r'\s*"[^"]+"\s*\+\s*"', first) is not None and not syn  # Majestic Red Dragon names its Synchros but is a Synchro
        if syn and r['k'] != 'synchro': bad.append(f"{r['n']}: Synchro materials in its text but filed as {r['k']}")
        if r['k'] == 'synchro' and not syn: bad.append(f"{r['n']}: filed as a Synchro but its text names no Tuner + non-Tuner materials")
        if fus and r['k'] not in ('fusion', 'ritual'): bad.append(f"{r['n']}: Fusion materials in its text but filed as {r['k']}")
    if bad:
        raise SystemExit('build_data: card kinds disagree with card text:\n  ' + '\n  '.join(bad))


def main():
    cards = json.load(open(os.path.join(HERE, 'raw/EdisonCards.json')))
    out = []
    for c in cards:
        if c.get('Banlist') == 'Illegal':
            continue
        rec = {'id': c['id'], 'n': c['Name'], 'tx': c.get('Text', '')}
        attr = c.get('Attribute')
        if attr in ('SPELL', 'TRAP'):
            rec['k'] = attr.lower()
            rec['sub'] = c.get('Type') or 'Normal'
        else:
            extra = c.get('Extra') or 'Normal'
            if extra == 'non-Synchro': extra = 'Synchro'   # the source's label for a Synchro with no effect (Gaia Knight); it is still a Synchro, from the Extra Deck
            # every label maps to its kind by name; a label we haven't seen stops the build instead of quietly becoming an Effect Monster
            # (2026-11-27 root cause of the Gaia Knight report: an unexpected label fell through to 'effect')
            if extra not in KIND_OF:
                raise SystemExit(f"build_data: unknown monster type label {extra!r} on {c['Name']} ({c['id']}). Add it to KIND_OF with its kind.")
            rec['k'] = KIND_OF[extra]
            rec['ab'] = extra            # e.g. "Effect Tuner", "Flip Effect", "Synchro"
            rec['a'] = attr
            rec['r'] = c.get('Type')     # race
            rec['lv'] = c.get('Level')
            rec['atk'] = c.get('Atk')
            rec['def'] = c.get('Def')
            if 'Tuner' in extra:
                rec['tu'] = 1
        b = {'Forbidden': 'F', 'Limited': 'L', 'Semi-Limited': 'S'}.get(c.get('Banlist'))
        if b:
            rec['b'] = b
        p = os.path.join(HERE, 'rulings/cards/%d.json' % c['id'])
        if os.path.exists(p):
            d = json.load(open(p))
            ps = clean(d.get('PSCT', {}).get('Edison'), ['No updated text'])
            ru = clean(d.get('Rulings', {}).get('Edison'), ['No rulings found'])
            rb = clean(d.get('Rulings', {}).get('Base'), ['No rulings found'])
            if ps: rec['ps'] = ps
            if ru: rec['ru'] = re.sub(r'(?<!\n)●', '\n●', ru).strip()
            if rb: rec['rb'] = rb
        out.append(rec)
    ids = {r['id'] for r in out}

    tiers = json.load(open(os.path.join(HERE, 'raw/decks.json')))
    decks = []
    for t in tiers:
        f = os.path.join(HERE, 'raw/ydk', t['Name'] + '.ydk')
        if not os.path.exists(f):
            print('missing deck file', t['Name'])
            continue
        sec = None
        dk = {'name': t['Name'], 'tier': t['Tags'], 'main': [], 'extra': [], 'side': []}
        for line in open(f, encoding='utf-8', errors='replace'):
            line = line.strip()
            if line == '#main': sec = 'main'
            elif line == '#extra': sec = 'extra'
            elif line == '!side': sec = 'side'
            elif line.isdigit() and sec:
                i = ALIAS.get(int(line), int(line))
                if i in ids:
                    dk[sec].append(i)
                else:
                    print('unknown card', i, 'in', t['Name'])
        decks.append(dk)

    check_kinds(out.values() if isinstance(out, dict) else out)
    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    with open(os.path.join(ROOT, 'data/cards.js'), 'w') as fh:
        fh.write('window.EDISON_CARDS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(os.path.join(ROOT, 'data/decks.js'), 'w') as fh:
        fh.write('window.EDISON_DECKS=' + json.dumps(decks, ensure_ascii=False, separators=(',', ':')) + ';\n')
    # Errata list (raw/errata.json from https://edisonformat.net/rules/errata.json): cards that work
    # differently in Edison, each with the change (Desc) and the Edison text (Text).
    ep = os.path.join(HERE, 'raw/errata.json')
    if os.path.exists(ep):
        byname = {r['n']: r['id'] for r in out}
        errata = [{'n': e['Name'], 'id': byname.get(e['Name']), 'what': e.get('Desc', '').replace('\\n', '\n'),
                   'text': e.get('Text', '').replace('\\n', '\n')} for e in json.load(open(ep))]
        with open(os.path.join(ROOT, 'data/errata.js'), 'w') as fh:
            fh.write('window.EDISON_ERRATA=' + json.dumps(errata, ensure_ascii=False, separators=(',', ':')) + ';\n')
        print('errata', len(errata), 'unmatched', [e['n'] for e in errata if not e['id']])

    meta = {'built': datetime.date.today().isoformat(), 'cards': len(out), 'decks': len(decks),
            'sources': ['https://edisonformat.net', 'https://github.com/MikaMikaDE/mikaRulings']}
    with open(os.path.join(ROOT, 'data/meta.js'), 'w') as fh:
        fh.write('window.EDISON_META=' + json.dumps(meta) + ';\n')
    print('cards', len(out), 'decks', len(decks))

    if '--images' in sys.argv or '--all-images' in sys.argv:
        want = set(r['id'] for r in out) if '--all-images' in sys.argv else set()
        for d in decks:
            want.update(d['main'] + d['extra'] + d['side'])
        lesson = os.path.join(HERE, 'lesson_cards.txt')   # card names the lessons use, one per line
        byname = {r['n']: r['id'] for r in out}
        if os.path.exists(lesson):
            for n in open(lesson):
                n = n.strip()
                if n in byname: want.add(byname[n])
                elif n: print('lesson card not found:', n)
        name = {r['id']: r['n'] for r in out}
        os.makedirs(os.path.join(ROOT, 'img'), exist_ok=True)
        todo = [i for i in sorted(want) if not os.path.exists(os.path.join(ROOT, 'img/%d.webp' % i))]
        print('images wanted', len(want), 'to download', len(todo))
        fails = []
        for n, i in enumerate(todo, 1):
            url = 'https://img.edisonformat.net/large/' + urllib.parse.quote(name[i]) + '.webp'
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
                if data[:4] != b'RIFF':
                    raise ValueError('not a webp')
                open(os.path.join(ROOT, 'img/%d.webp' % i), 'wb').write(data)
            except Exception as e:
                fails.append((name[i], str(e)))
            if n % 50 == 0:
                print('images', n, 'of', len(todo), flush=True)
            time.sleep(0.35)
        print('image failures', fails)

    # Cards edisonformat.net has no art for: take YGOPRODeck's image (by passcode, cached once, paced well
    # under its 20 requests a second) and convert it to WebP with cwebp so every card is img/<id>.webp.
    if '--fill-missing' in sys.argv:
        import subprocess, tempfile
        name = {r['id']: r['n'] for r in out}
        missing = [i for i in sorted(name) if not os.path.exists(os.path.join(ROOT, 'img/%d.webp' % i))]
        print('missing art', len(missing))
        fails = []
        for i in missing:
            url = 'https://images.ygoprodeck.com/images/cards/%d.jpg' % i
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
                if data[:2] != b'\xff\xd8':
                    raise ValueError('not a jpg')
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tf:
                    tf.write(data)
                subprocess.run(['cwebp', '-quiet', '-q', '88', '-resize', '421', '614', tf.name, '-o', os.path.join(ROOT, 'img/%d.webp' % i)], check=True)
                os.unlink(tf.name)
            except Exception as e:
                fails.append((name[i], str(e)))
            time.sleep(0.25)
        print('YGOPRODeck art failures', fails)

    # Which cards have local art: the page uses img/<id>.webp for these and img.edisonformat.net for the rest.
    local = sorted(int(os.path.basename(f)[:-5]) for f in glob.glob(os.path.join(ROOT, 'img/*.webp')) if os.path.basename(f)[:-5].isdigit())  # skip back.webp and other non-card art
    with open(os.path.join(ROOT, 'data/localimg.js'), 'w') as fh:
        fh.write('window.EDISON_LOCALIMG=' + json.dumps(local, separators=(',', ':')) + ';\n')
    print('local images', len(local))

if __name__ == '__main__':
    main()
