# Learn Retro: Edison

A free, open-source site for learning **Edison format**: Yu-Gi-Oh! as it was in April 2010, with the March 2010 banlist and the first Synchro era.

**Live site:** https://edison.learnretro.com (part of https://learnretro.com)

## What's in it

- **Learn:** a course in plain language, from the basics of the game (Step 0) to Edison 101, with quizzes, flashcards, a glossary and a library of guides by Edison creators.
- **Cards:** every Edison-legal card with its Edison text, Edison rulings and art; staples, the banlist, rulings and errata.
- **Decks:** 55 deck lists by tier and a deck builder that checks legality and exports `.ydk` files.
- **Play:** a practice board and a duel against the computer.

## Running it

It's a static site with no build step. Open `index.html` in a browser, or serve the folder with any web server:

```
python3 -m http.server 8000
```

To rebuild the card data and art from the sources below:

```
python3 build/build_data.py --all-images --fill-missing
```

## Credits

- **Card data, Edison card text, starter decks, errata and card images:** [edisonformat.net](https://edisonformat.net), the Edison community's format site.
- **Edison-accurate card text and rulings:** the [mikaRulings](https://github.com/MikaMikaDE/mikaRulings) project by MikaMikaDE.
- **Card images missing from edisonformat.net, and token images:** [YGOPRODeck](https://ygoprodeck.com).
- **Card back image:** [Yugipedia](https://yugipedia.com).
- **Library videos:** made by and credited to their creators, including [IMNerd (Frazier Smith)](https://www.youtube.com/@imnerdpodcast) and [E3 Yu-Gi-Oh](https://www.youtube.com/@E3YuGiOh). The site only links to them on YouTube.

## Disclaimer

The literal and graphical information presented on this site about Yu-Gi-Oh!, including Card images, Attribute, Level, Rank, Type Symbols, is copyright 4K Media Inc, a subsidiary of Konami Digital Entertainment (KDE), Inc.
This website is not produced by, endorsed by, supported by, or affiliated with 4k Media, Studio Dice, or KDE.

## License

The site's own code is released under the MIT License (see `LICENSE`). Card text, card images and other Yu-Gi-Oh! content belong to Konami; data, rulings and videos belong to the sources credited above. The license does not cover them.
