        // Initial librarian credentials
        const initialLibrarian = { username: "librarian", password: "admin123" };

        //Fallback book data
        const fallbackBooks = [
            { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", genre: "Fiction", status: "Available", coverImage: "/image-folder/thingsFall.jpeg", borrowCount: 0 },
            { id: 2, title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", genre: "Historical Fiction", status: "Available", coverImage: "/image-folder/halfOfaYellow.jpeg", borrowCount: 0 },
            { id: 3, title: "Americanah", author: "Chimamanda Ngozi Adichie", genre: "Fiction", status: "Available", coverImage: "/image-folder/americanah.jpeg", borrowCount: 0 },
            { id: 4, title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", genre: "Fiction", status: "Available", coverImage: "/image-folder/purpleHibiscus.jpeg", borrowCount: 0 },
            { id: 5, title: "So Long a Letter", author: "Mariama Bâ", genre: "Epistolary Novel", status: "Available", coverImage: "/image-folder/soLong.jpeg", borrowCount: 0 },
            { id: 6, title: "A Long Way Gone: Memoirs of a Boy Soldier", author: "Ishmael Beah", genre: "Autobiography", status: "Available", coverImage: "/image-folder/aLongWay.jpeg", borrowCount: 0 },
            { id: 7, title: "The Secret Lives of Baba Segi's Wives", author: "Lola Shoneyin", genre: "Fiction", status: "Available", coverImage: "/image-folder/secretlife.jpeg", borrowCount: 0 },
            { id: 8, title: "Nervous Conditions", author: "Tsitsi Dangarembga", genre: "Fiction", status: "Available", coverImage: "/image-folder/nervouscondition.jpeg", borrowCount: 0 },
            { id: 9, title: "Disgrace", author: "J.M. Coetzee", genre: "Fiction", status: "Available", coverImage: "/image-folder/disgrace.jpeg", borrowCount: 0 },
            { id: 10, title: "No Longer at Ease", author: "Chinua Achebe", genre: "Fiction", status: "Available", coverImage: "/image-folder/noLong.jpeg", borrowCount: 0 },
            { id: 11, title: "Homegoing", author: "Yaa Gyasi", genre: "Historical Fiction", status: "Available", coverImage: "/image-folder/homegoing.jpeg", borrowCount: 0 },
            { id: 12, title: "Season of Migration to the North", author: "Tayeb Salih", genre: "Fiction", status: "Available", coverImage: "/image-folder/seasonmigration.jpeg", borrowCount: 0 },
            { id: 13, title: "The Famished Road", author: "Ben Okri", genre: "Magical Realism", status: "Available", coverImage: "/image-folder/theroad.jpeg", borrowCount: 0 },
            { id: 14, title: "Cry, the Beloved Country", author: "Alan Paton", genre: "Fiction", status: "Available", coverImage: "/image-folder/crycountry.jpeg", borrowCount: 0 },
            { id: 15, title: "Kintu", author: "Jennifer Nansubuga Makumbi", genre: "Historical Fiction", status: "Available", coverImage: "/image-folder/kintu.jpeg", borrowCount: 0 }
        ];

        // State variables
        let books = null;
        let borrowingHistory = [];
        let wishlist = [];
        let users = [];
        let librarian = initialLibrarian;
        let currentUser = null;
        let genreChart = null;

        // Load data from localStorage with error handling
        function loadStorage() {
            try {
                books = JSON.parse(localStorage.getItem('books')) || null;
                borrowingHistory = JSON.parse(localStorage.getItem('borrowingHistory')) || [];
                wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                users = JSON.parse(localStorage.getItem('users')) || [];
                librarian = JSON.parse(localStorage.getItem('librarian')) || initialLibrarian;
            } catch (error) {
                console.error('Error loading localStorage:', error);
                books = null;
                borrowingHistory = [];
                wishlist = [];
                users = [];
                librarian = initialLibrarian;
            }
        }

        // Fetch books from data.json using async/await
        async function fetchBooks() {
            try {
                const response = await fetch('/data.json');
                console.log(response);
                
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log(data)
                return data.books.map(book => ({
                    ...book,
                    borrowCount: 0,
                    coverImage: book.coverImage,
                }));
            } catch (error) {
                console.error('Error fetching books:', error);
                alert('Failed to load books from server. Using fallback data.');
                return fallbackBooks;
            }
        }

        // Initialize books
        async function initializeBooks() {
            document.getElementById('loading-message').classList.remove('d-none');
            if (!books || books.length === 0) {
                books = await fetchBooks();
                saveData();
            }
            document.getElementById('loading-message').classList.add('d-none');
            populateGenreFilter();
        }

        // Save data to localStorage
        function saveData() {
            try {
                localStorage.setItem('books', JSON.stringify(books));
                localStorage.setItem('borrowingHistory', JSON.stringify(borrowingHistory));
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('librarian', JSON.stringify(librarian));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                alert('Failed to save data. Some changes may not persist.');
            }
        }

        // Populate genre filter dynamically
        function populateGenreFilter() {
            const genreFilter = document.getElementById('genre-filter');
            const genres = books && books.length > 0 ? [...new Set(books.map(book => book.genre))].sort() : ['Fiction', 'Historical Fiction', 'Epistolary Novel', 'Autobiography', 'Magical Realism'];
            genreFilter.innerHTML = '<option value="">All Genres</option>';
            genres.forEach(genre => {
                genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        }

        // Authentication
        function loginUser(username, password) {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                currentUser = user;
                showUserDashboard();
                bootstrap.Modal.getInstance(document.getElementById('user-login-modal')).hide();
                document.getElementById('user-login-message').innerHTML = '';
            } else {
                document.getElementById('user-login-message').innerHTML = '<div class="alert alert-danger">Invalid username or password!</div>';
            }
        }

        function loginLibrarian(username, password) {
            if (librarian.username === username && librarian.password === password) {
                currentUser = { username: 'librarian', role: 'librarian' };
                showLibrarianDashboard();
                bootstrap.Modal.getInstance(document.getElementById('librarian-login-modal')).hide();
                document.getElementById('librarian-login-message').innerHTML = '';
            } else {
                document.getElementById('librarian-login-message').innerHTML = '<div class="alert alert-danger">Invalid username or password!</div>';
            }
        }

        function registerUser(username, password) {
            if (!username || !password) {
                document.getElementById('user-login-message').innerHTML = '<div class="alert alert-danger">Please fill in both fields!</div>';
                return;
            }
            if (users.find(u => u.username === username)) {
                document.getElementById('user-login-message').innerHTML = '<div class="alert alert-danger">Username already exists!</div>';
            } else {
                users.push({ username, password });
                saveData();
                document.getElementById('user-login-message').innerHTML = '<div class="alert alert-success">Registered successfully! Please login.</div>';
                document.getElementById('user-login-form').reset();
            }
        }

        // Show appropriate dashboard
        function showUserDashboard() {
            document.getElementById('landing-page').classList.add('d-none');
            document.getElementById('main-app').classList.remove('d-none');
            document.getElementById('catalog').classList.remove('d-none');
            document.getElementById('borrow').classList.remove('d-none');
            document.getElementById('history').classList.remove('d-none');
            document.getElementById('wishlist').classList.remove('d-none');
            document.getElementById('dashboard').classList.add('d-none');
            document.getElementById('nav-dashboard').classList.add('d-none');
            displayBooks();
            populateBookSelect();
            displayHistory();
            displayWishlist();
        }

        function showLibrarianDashboard() {
            document.getElementById('landing-page').classList.add('d-none');
            document.getElementById('main-app').classList.remove('d-none');
            document.getElementById('catalog').classList.add('d-none');
            document.getElementById('borrow').classList.add('d-none');
            document.getElementById('history').classList.add('d-none');
            document.getElementById('wishlist').classList.add('d-none');
            document.getElementById('dashboard').classList.remove('d-none');
            document.getElementById('nav-catalog').classList.add('d-none');
            document.getElementById('nav-borrow').classList.add('d-none');
            document.getElementById('nav-history').classList.add('d-none');
            document.getElementById('nav-wishlist').classList.add('d-none');
            updateDashboard();
            displayActivities();
        }

        // User Login Form
        document.getElementById('user-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('user-username').value.trim();
            const password = document.getElementById('user-password').value;
            loginUser(username, password);
        });

        // User Register
        document.getElementById('user-register-btn').addEventListener('click', () => {
            const username = document.getElementById('user-username').value.trim();
            const password = document.getElementById('user-password').value;
            registerUser(username, password);
        });

        // Librarian Login Form
        document.getElementById('librarian-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('librarian-username').value.trim();
            const password = document.getElementById('librarian-password').value;
            loginLibrarian(username, password);
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            currentUser = null;
            document.getElementById('main-app').classList.add('d-none');
            document.getElementById('landing-page').classList.remove('d-none');
            document.getElementById('user-login-form').reset();
            document.getElementById('librarian-login-form').reset();
            document.getElementById('user-login-message').innerHTML = '';
            document.getElementById('librarian-login-message').innerHTML = '';
        });

        // Display books in catalog with event delegation
        function displayBooks() {
            const catalog = document.getElementById('book-catalog');
            catalog.innerHTML = books.length === 0 ? '<p class="text-center">No books available.</p>' : '';
            const search = document.getElementById('search-input').value.toLowerCase();
            const genre = document.getElementById('genre-filter').value;
            const availability = document.getElementById('availability-filter').value;

            books.forEach(book => {
                if (
                    (book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)) &&
                    (!genre || book.genre === genre) &&
                    (!availability || book.status === availability)
                ) {
                    const card = `
                        <div class="col">
                            <div class="card book-card">
                                <img src="${book.coverImage}" class="card-img-top cover-img" alt="${book.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${book.title}</h5>
                                    <p class="card-text">Author: ${book.author}</p>
                                    <p class="card-text">Genre: ${book.genre}</p>
                                    <p class="card-text">Status: ${book.status}</p>
                                    <button class="btn btn-sm btn-outline-primary wishlist-btn" data-id="${book.id}">
                                        <i class="fas fa-heart"></i> Add to Wishlist
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    catalog.innerHTML += card;
                }
            });

            // Event delegation for wishlist buttons
            catalog.addEventListener('click', (e) => {
                if (e.target.closest('.wishlist-btn')) {
                    const btn = e.target.closest('.wishlist-btn');
                    const bookId = parseInt(btn.dataset.id);
                    const book = books.find(b => b.id === bookId);
                    if (!wishlist.find(w => w.id === bookId && w.username === currentUser.username)) {
                        wishlist.push({ ...book, username: currentUser.username });
                        saveData();
                        displayWishlist();
                        alert(`${book.title} added to wishlist!`);
                    } else {
                        alert(`${book.title} is already in your wishlist!`);
                    }
                }
            }, { once: true });
        }

        // Display wishlist with event delegation
        function displayWishlist() {
            const wishlistCatalog = document.getElementById('wishlist-catalog');
            const userWishlist = wishlist.filter(w => w.username === currentUser.username);
            wishlistCatalog.innerHTML = userWishlist.length === 0 ? '<p class="text-center">Your wishlist is empty.</p>' : '';
            userWishlist.forEach(book => {
                const card = `
                    <div class="col">
                        <div class="card book-card">
                            <img src="${book.coverImage}" class="card-img-top cover-img" alt="${book.title}">
                            <div class="card-body">
                                <h5 class="card-title">${book.title}</h5>
                                <p class="card-text">Author: ${book.author}</p>
                                <p class="card-text">Genre: ${book.genre}</p>
                                <button class="btn btn-sm btn-outline-danger remove-wishlist-btn" data-id="${book.id}">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                wishlistCatalog.innerHTML += card;
            });

            // Event delegation for remove wishlist buttons
            wishlistCatalog.addEventListener('click', (e) => {
                if (e.target.closest('.remove-wishlist-btn')) {
                    const btn = e.target.closest('.remove-wishlist-btn');
                    const bookId = parseInt(btn.dataset.id);
                    wishlist = wishlist.filter(w => !(w.id === bookId && w.username === currentUser.username));
                    saveData();
                    displayWishlist();
                    alert('Book removed from wishlist!');
                }
            }, { once: true });
        }

        // Populate book select dropdown
        function populateBookSelect() {
            const select = document.getElementById('book-select');
            select.innerHTML = '<option value="">Select a book</option>';
            const availableBooks = books.filter(b => b.status === 'Available');
            if (availableBooks.length === 0) {
                select.innerHTML += '<option value="" disabled>No available books</option>';
            } else {
                availableBooks.forEach(book => {
                    select.innerHTML += `<option value="${book.id}">${book.title}</option>`;
                });
            }
        }

        // Handle borrowing form submission
        document.getElementById('borrow-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const bookId = parseInt(document.getElementById('book-select').value);
            const messageDiv = document.getElementById('borrow-message');

            if (!bookId) {
                messageDiv.innerHTML = '<div class="alert alert-danger">Please select a book!</div>';
                return;
            }

            const book = books.find(b => b.id === bookId);
            if (book.status !== 'Available') {
                messageDiv.innerHTML = '<div class="alert alert-danger">This book is not available!</div>';
                return;
            }

            book.status = 'Borrowed';
            book.borrowCount += 1;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            borrowingHistory.push({
                bookId: book.id,
                title: book.title,
                username: currentUser.username,
                dueDate: dueDate.toLocaleDateString(),
                borrowTimestamp: Date.now()
            });
            saveData();
            populateBookSelect();
            displayBooks();
            displayHistory();
            messageDiv.innerHTML = `<div class="alert alert-success">Successfully borrowed ${book.title}! Due: ${dueDate.toLocaleDateString()}</div>`;
            e.target.reset();
        });

        // Display borrowing history with event delegation
        function displayHistory() {
            const table = document.getElementById('history-table');
            const userHistory = borrowingHistory.filter(h => h.username === currentUser.username);
            table.innerHTML = userHistory.length === 0 ? '<tr><td colspan="3" class="text-center">No borrowing history.</td></tr>' : '';
            userHistory.forEach(record => {
                const row = `
                    <tr>
                        <td>${record.title}</td>
                        <td>${record.dueDate}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-success return-btn" data-id="${record.bookId}" data-timestamp="${record.borrowTimestamp}">
                                <i class="fas fa-undo"></i> Return
                            </button>
                        </td>
                    </tr>
                `;
                table.innerHTML += row;
            });

            // Event delegation for return buttons
            table.addEventListener('click', (e) => {
                if (e.target.closest('.return-btn')) {
                    const btn = e.target.closest('.return-btn');
                    const bookId = parseInt(btn.dataset.id);
                    const timestamp = parseInt(btn.dataset.timestamp);
                    const book = books.find(b => b.id === bookId);
                    book.status = 'Available';
                    borrowingHistory = borrowingHistory.filter(r => !(r.bookId === bookId && r.username === currentUser.username && r.borrowTimestamp === timestamp));
                    saveData();
                    populateBookSelect();
                    displayBooks();
                    displayHistory();
                    alert(`${book.title} returned successfully!`);
                }
            }, { once: true });
        }

        // Display user activities (Librarian)
        function displayActivities() {
            const table = document.getElementById('activity-table');
            table.innerHTML = borrowingHistory.length === 0 ? '<tr><td colspan="3" class="text-center">No user activities.</td></tr>' : '';
            borrowingHistory.forEach(record => {
                const row = `
                    <tr>
                        <td>${record.title}</td>
                        <td>${record.username}</td>
                        <td>${record.dueDate}</td>
                    </tr>
                `;
                table.innerHTML += row;
            });
        }

        // Update librarian dashboard
        function updateDashboard() {
            const totalBooks = books.length;
            const totalBorrowed = books.filter(b => b.status === 'Borrowed').length;
            const totalAvailable = totalBooks - totalBorrowed;
            const mostBorrowed = books.reduce((prev, current) => (prev.borrowCount > current.borrowCount) ? prev : current, { title: 'None', borrowCount: 0 });

            document.getElementById('total-books').textContent = totalBooks;
            document.getElementById('total-borrowed').textContent = totalBorrowed;
            document.getElementById('total-available').textContent = totalAvailable;
            document.getElementById('most-borrowed').textContent = mostBorrowed.title;

            const genres = {};
            books.forEach(b => {
                genres[b.genre] = (genres[b.genre] || 0) + 1;
            });

            const ctx = document.getElementById('genre-chart').getContext('2d');
            if (genreChart) genreChart.destroy();
            genreChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(genres),
                    datasets: [{
                        data: Object.values(genres),
                        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Genre Distribution' }
                    }
                }
            });
        }

        // Export borrowing history as CSV
        document.getElementById('export-csv').addEventListener('click', () => {
            const userHistory = borrowingHistory.filter(h => h.username === currentUser.username);
            if (userHistory.length === 0) {
                alert('No borrowing history to export!');
                return;
            }
            let csv = 'Title,Due Date\n';
            userHistory.forEach(record => {
                csv += `"${record.title.replace(/"/g, '""')}","${record.dueDate}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'borrowing_history.csv';
            a.click();
            URL.revokeObjectURL(url);
        });

        // Reset local storage
        document.getElementById('reset-storage').addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all data?')) {
                localStorage.clear();
                books = await fetchBooks();
                borrowingHistory = [];
                wishlist = [];
                users = [];
                librarian = initialLibrarian;
                saveData();
                populateGenreFilter();
                updateDashboard();
                displayActivities();
                if (currentUser && currentUser.role === 'librarian') {
                    showLibrarianDashboard();
                } else {
                    showUserDashboard();
                }
                alert('Local storage reset successfully!');
            }
        });

        // Light/Dark mode toggle with persistence
        function initializeTheme() {
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                document.querySelector('#theme-toggle i').classList.replace('fa-moon', 'fa-sun');
            }
        }

        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = document.querySelector('#theme-toggle i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        // Event listeners for search and filters
        document.getElementById('search-input').addEventListener('input', displayBooks);
        document.getElementById('genre-filter').addEventListener('change', displayBooks);
        document.getElementById('availability-filter').addEventListener('change', displayBooks);

        // Initialize the app
        async function init() {
            loadStorage();
            await initializeBooks();
            initializeTheme();
            document.getElementById('landing-page').classList.remove('d-none');
        }
        init();
  