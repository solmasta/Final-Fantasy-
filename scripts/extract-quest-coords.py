#!/usr/bin/env python3
"""Extract Main Scenario Quest start-NPC map coordinates from the public game-data tables
(github.com/xivapi/ffxiv-datamining, csv/en).  Usage: extract-quest-coords.py <dir-with-csvs> <out.json>
Needs: Quest, Level, Map, PlaceName, ENpcResident, EObjName, JournalGenre, JournalCategory .csv"""
import csv, json, sys
d, out = sys.argv[1], sys.argv[2]
def rows(n):
    with open(f'{d}/{n}.csv', encoding='utf8', newline='') as f:
        r = csv.reader(f); h = next(r); return h, list(r)
place = {}
_, r = rows('PlaceName'); 
for x in r: place[x[0]] = x[1].replace('*', '')
maps = {}
h, r = rows('Map'); ix = {c: i for i, c in enumerate(h)}
for x in r: maps[x[0]] = dict(size=int(x[ix['SizeFactor']] or 100), ox=int(x[ix['OffsetX']] or 0), oy=int(x[ix['OffsetY']] or 0), place=place.get(x[ix['PlaceName']], ''))
levels = {}
h, r = rows('Level'); ix = {c: i for i, c in enumerate(h)}
for x in r: levels[x[0]] = (float(x[ix['X']]), float(x[ix['Z']]), x[ix['Map']], x[ix['Object']], x[ix['Type']])
npcs = {}
_, r = rows('ENpcResident')
for x in r: npcs[x[0]] = x[1]
eobj = {}
_, r = rows('EObjName')
for x in r: eobj[x[0]] = x[1]
cat = {}
_, r = rows('JournalCategory')
for x in r: cat[x[0]] = x[1]
msq_genre = set()
_, r = rows('JournalGenre')
for x in r:
    if 'Main Scenario' in cat.get(x[3], ''): msq_genre.add(x[0])
def conv(v, off, size):
    c = size / 100
    return round(41.0 / c * (((v + off) * c + 1024) / 2048) + 1, 1)
h, r = rows('Quest'); ix = {c: i for i, c in enumerate(h)}
def where(lv):
    m = maps.get(lv[2])
    if not m or not m['place']: return None
    return m['place'], conv(lv[0], m['ox'], m['size']), conv(lv[1], m['oy'], m['size'])
def objectives(x):
    out, last = [], None
    for t in range(24):
        seq = x[ix[f'TodoParams[{t}].ToDoCompleteSeq']]
        ids = [x[ix[f'TodoParams[{t}].ToDoLocation[{m}]']] for m in range(8)]
        ids = [a for a in ids if a not in ('', '0') and a in levels]
        if not ids: continue
        lv = levels[ids[0]]; w = where(lv)
        if not w: continue
        kind, obj = lv[4], lv[3]
        if kind == '8' and npcs.get(obj): label = 'Talk to ' + npcs[obj]
        elif kind == '9' and eobj.get(obj): label = 'Interact with ' + eobj[obj]
        elif kind == '51': label = 'Go to this area'
        else: label = 'Objective area'
        key = (w, label)
        if key == last: continue
        last = key
        out.append(dict(label=label, zone=w[0], x=w[1], y=w[2]))
    return out
res = {}
for x in r:
    name = x[ix['Name']]
    if not name or x[ix['JournalGenre']] not in msq_genre: continue
    loc = levels.get(x[ix['IssuerLocation']])
    if not loc: continue
    m = maps.get(loc[2])
    if not m or not m['place']: continue
    res.setdefault(name, []).append(dict(level=int(x[ix['ClassJobLevel[0]']] or 0), zone=m['place'], x=conv(loc[0], m['ox'], m['size']), y=conv(loc[1], m['oy'], m['size']), npc=npcs.get(x[ix['IssuerStart']], ''), obj=objectives(x)))
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=0)
print(len(res), 'MSQ quests with start coordinates')
