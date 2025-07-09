# --- server.py ---
from flask import Flask, request, jsonify
from scraper import scrape_story_data
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

stories = []


@app.route('/add', methods=['POST'])
def add_story():
    data = request.json
    stories.append(data)
    return jsonify({'message': 'Story added successfully'})


@app.route('/import', methods=['POST'])
def import_story():
    url = request.json.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    data = scrape_story_data(url)
    if 'error' in data:
        return jsonify({'error': data['error']}), 400

    data['url'] = url  # ✅ Add URL to data so it can be used in UI
    return jsonify(data)


@app.route('/scrape', methods=['GET'])
def scrape_get():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    data = scrape_story_data(url)
    return jsonify(data)


@app.route('/stories', methods=['GET'])
def get_stories():
    return jsonify(stories)


@app.route('/remove', methods=['POST'])
def remove_story():
    title = request.json.get('title')
    global stories
    stories = [s for s in stories if s['title'] != title]
    return jsonify({'message': 'Story removed successfully'})


if __name__ == '__main__':
    app.run(debug=True)
