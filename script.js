// --- script.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");

    function renderLibrary(data) {
        const library = document.getElementById('library');
        library.innerHTML = '';

        data.forEach(story => {
            const card = document.createElement('div');
            card.className = 'story-card';

            const title = document.createElement('h3');
            title.textContent = story.title;
            card.appendChild(title);

            const author = document.createElement('p');
            author.textContent = story.author;
            author.className = 'subtitle';
            card.appendChild(author);

            const moreInfoBtn = document.createElement('button');
            moreInfoBtn.textContent = 'More Info';
            moreInfoBtn.onclick = () => {
                window.location.href = 'library.html';
            };

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove Book';
            removeButton.className = 'remove-btn';
            removeButton.addEventListener('click', () => {
                fetch('http://localhost:5000/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: story.title })
                })
                    .then(response => response.json())
                    .then(result => {
                        alert(result.message);
                        loadLibrary();
                    });
            });

            card.appendChild(moreInfoBtn);
            card.appendChild(removeButton);
            library.appendChild(card);
        });
    }

    function loadLibrary() {
        fetch('http://localhost:5000/stories')
            .then(response => response.json())
            .then(data => {
                renderLibrary(data);
            });
    }

    function filterLibraryByTag(tag) {
        fetch('http://localhost:5000/stories')
            .then(response => response.json())
            .then(data => {
                const filtered = data.filter(story => (story.tags || []).includes(tag));

                const library = document.getElementById('library');
                library.innerHTML = `<button id="back-btn">⬅ Back to Library</button>`;

                document.getElementById('back-btn').addEventListener('click', () => {
                    loadLibrary();
                });

                renderLibrary(filtered);
            });
    }

    loadLibrary(); // load on page load

    function attachImportHandler() {
        const btn = document.getElementById('import-btn');
        if (btn && !btn.dataset.attached) {
            btn.addEventListener('click', () => {
                console.log("Import button clicked!");
                const urlInput = document.getElementById('import-url');
                const url = urlInput.value.trim();
                if (!url) return;

                document.getElementById('import-status').innerText = 'Fetching...';

                fetch(`http://localhost:5000/scrape?url=${encodeURIComponent(url)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            document.getElementById('import-status').innerText = 'Error: ' + data.error;
                            return;
                        }

                        document.getElementById('import-status').innerText = 'Story loaded!';
                        document.getElementById('import-preview').style.display = 'block';

                        document.getElementById('preview-title').innerText = data.title || '';
                        document.getElementById('preview-author').innerText = data.author || '';
                        document.getElementById('preview-fandom').innerText = data.fandom || '';
                        document.getElementById('preview-ships').innerText = (data.relationships || []).join(', ');
                        document.getElementById('preview-characters').innerText = (data.characters || []).join(', ');
                        document.getElementById('preview-words').innerText = data.words || '';
                        document.getElementById('preview-chapters').innerText = data.chapters || '';
                        document.getElementById('preview-tags').innerText = (data.tags || []).join(', ');

                        document.getElementById('confirm-import').onclick = () => {
                            data.url = url;
                            fetch('http://localhost:5000/add', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            })
                                .then(response => response.json())
                                .then(result => {
                                    alert(result.message);
                                    loadLibrary();

                                    // Clear import form and preview
                                    urlInput.value = '';
                                    document.getElementById('import-status').innerText = '';
                                    document.getElementById('import-preview').style.display = 'none';
                                });
                        };
                    })
                    .catch(err => {
                        document.getElementById('import-status').innerText = 'Failed to fetch story';
                        console.error(err);
                    });
            });
            btn.dataset.attached = 'true';
        }
    }

    window.openTab = function (tabId) {
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => tab.style.display = 'none');

        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => button.classList.remove('active'));

        document.getElementById(tabId).style.display = 'block';
        event.target.classList.add('active');

        if (tabId === 'import-tab') {
            attachImportHandler();
        }
    };
});
