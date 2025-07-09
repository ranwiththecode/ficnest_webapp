# --- scraper.py ---
import requests
from bs4 import BeautifulSoup


def scrape_story_data(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://archiveofourown.org/',
    }
    response = requests.get(url, headers=headers)

    soup = BeautifulSoup(response.content, 'html.parser')

    if 'archiveofourown.org' in url:
        # AO3-specific selectors
        title_elem = soup.find('h2', class_='title')
        author_elem = soup.find('a', rel='author')

        fandom_elem = soup.select_one('dd.fandom.tags')
        ship_elems = soup.select('dd.relationship.tags a.tag')
        char_elems = soup.select('dd.character.tags a.tag')
        tag_elems = soup.select('dd.freeform.tags a.tag')
        word_elem = soup.select_one('dd.words')
        chapters_elem = soup.select_one('dd.chapters')

        return {
            'title': title_elem.text.strip() if title_elem else '',
            'author': author_elem.text.strip() if author_elem else '',
            'fandom': fandom_elem.text.strip() if fandom_elem else '',
            'relationships': [e.text.strip() for e in ship_elems],
            'characters': [e.text.strip() for e in char_elems],
            'words': word_elem.text.strip() if word_elem else '',
            'chapters': chapters_elem.text.strip() if chapters_elem else '',
            'tags': [e.text.strip() for e in tag_elems]
        }

    elif 'fanfiction.net' in url:
        # FF.net specific parsing
        title_elem = soup.find('b')
        author_elem = soup.find('a', href=lambda x: x and x.startswith('/u/'))
        details_elem = soup.find('div', {'id': 'profile_top'})

        if details_elem:
            details_text = details_elem.text
            word_count = ''
            chapters = ''

            if 'Words:' in details_text:
                try:
                    word_count = details_text.split('Words:')[1].split()[
                        0].replace(',', '')
                except IndexError:
                    pass
            if 'Chapters:' in details_text:
                try:
                    chapters = details_text.split('Chapters:')[1].split()[0]
                except IndexError:
                    pass
        else:
            word_count = ''
            chapters = ''

        return {
            'title': title_elem.text.strip() if title_elem else '',
            'author': author_elem.text.strip() if author_elem else '',
            'fandom': '',  # Not clearly available on FF.net
            'relationships': [],
            'characters': [],
            'words': word_count,
            'chapters': chapters,
            'tags': []
        }

    else:
        return {'error': 'Unsupported site'}
