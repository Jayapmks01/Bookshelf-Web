// Elemen DOM
const bookForm = document.getElementById("bookForm");
const bookFormTitle = document.getElementById("bookFormTitle");
const bookFormAuthor = document.getElementById("bookFormAuthor");
const bookFormYear = document.getElementById("bookFormYear");
const bookFormIsComplete = document.getElementById("bookFormIsComplete");
const incompleteBookList = document.getElementById("incompleteBookList");
const completeBookList = document.getElementById("completeBookList");

let isEditMode = false;
let editBookElement = null; // Mengacu langsung ke elemen buku yang sedang diedit

const STORAGE_KEY = "bookLibrary";

// Fungsi untuk menyimpan data ke Local Storage
function saveToLocalStorage() {
  const incompleteBooks = [];
  const completeBooks = [];

  incompleteBookList.querySelectorAll("[data-testid='bookItem']").forEach((book) => {
    incompleteBooks.push(getBookData(book));
  });

  completeBookList.querySelectorAll("[data-testid='bookItem']").forEach((book) => {
    completeBooks.push(getBookData(book));
  });

  const data = { incompleteBooks, completeBooks };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Fungsi untuk memuat data dari Local Storage
function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!data) return;

  data.incompleteBooks.forEach((book) => {
    const bookElement = createBookElement(
      book.id,
      book.title,
      book.author,
      book.year,
      false
    );
    incompleteBookList.appendChild(bookElement);
  });

  data.completeBooks.forEach((book) => {
    const bookElement = createBookElement(
      book.id,
      book.title,
      book.author,
      book.year,
      true
    );
    completeBookList.appendChild(bookElement);
  });
}

// Fungsi untuk mendapatkan data buku dari elemen
function getBookData(bookElement) {
  return {
    id: bookElement.dataset.bookid,
    title: bookElement.querySelector("[data-testid='bookItemTitle']").textContent,
    author: bookElement.querySelector("[data-testid='bookItemAuthor']").textContent.split(": ")[1],
    year: bookElement.querySelector("[data-testid='bookItemYear']").textContent.split(": ")[1],
    isComplete: bookElement.parentNode === completeBookList,
  };
}

// Fungsi untuk membuat elemen buku
function createBookElement(id, title, author, year, isComplete) {
  const bookItem = document.createElement("div");
  bookItem.dataset.bookid = id;
  bookItem.dataset.testid = "bookItem";

  const titleElement = document.createElement("h3");
  titleElement.dataset.testid = "bookItemTitle";
  titleElement.textContent = title;

  const authorElement = document.createElement("p");
  authorElement.dataset.testid = "bookItemAuthor";
  authorElement.textContent = `Penulis: ${author}`;

  const yearElement = document.createElement("p");
  yearElement.dataset.testid = "bookItemYear";
  yearElement.textContent = `Tahun: ${year}`;

  const buttonsDiv = document.createElement("div");

  const completeButton = document.createElement("button");
  completeButton.dataset.testid = "bookItemIsCompleteButton";
  completeButton.textContent = isComplete ? "Belum selesai dibaca" : "Selesai dibaca";
  completeButton.addEventListener("click", () => {
    if (isComplete) {
      moveBookToIncomplete(bookItem);
    } else {
      moveBookToComplete(bookItem);
    }
    saveToLocalStorage();
  });

  const deleteButton = document.createElement("button");
  deleteButton.dataset.testid = "bookItemDeleteButton";
  deleteButton.textContent = "Hapus Buku";
  deleteButton.addEventListener("click", () => {
    deleteBook(bookItem);
    saveToLocalStorage();
  });

  const editButton = document.createElement("button");
  editButton.dataset.testid = "bookItemEditButton";
  editButton.textContent = "Edit Buku";
  editButton.addEventListener("click", () => {
    editBook(bookItem);
    saveToLocalStorage();
  });

  buttonsDiv.appendChild(completeButton);
  buttonsDiv.appendChild(deleteButton);
  buttonsDiv.appendChild(editButton);

  bookItem.appendChild(titleElement);
  bookItem.appendChild(authorElement);
  bookItem.appendChild(yearElement);
  bookItem.appendChild(buttonsDiv);

  return bookItem;
}

// Fungsi untuk menambah atau mengedit buku
bookForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = bookFormTitle.value;
  const author = bookFormAuthor.value;
  const year = bookFormYear.value;
  const isComplete = bookFormIsComplete.checked;

  if (isEditMode) {
    // Edit mode
    editBookElement.querySelector("[data-testid='bookItemTitle']").textContent = title;
    editBookElement.querySelector("[data-testid='bookItemAuthor']").textContent = `Penulis: ${author}`;
    editBookElement.querySelector("[data-testid='bookItemYear']").textContent = `Tahun: ${year}`;
    editBookElement.querySelector("[data-testid='bookItemIsCompleteButton']").textContent = isComplete
      ? "Belum selesai dibaca"
      : "Selesai dibaca";

    const currentList = isComplete ? completeBookList : incompleteBookList;

    if (editBookElement.parentNode !== currentList) {
      currentList.appendChild(editBookElement);
    }

    isEditMode = false;
    editBookElement = null;
  } else {
    // Tambah buku baru
    const id = Date.now().toString();
    const newBook = createBookElement(id, title, author, year, isComplete);

    if (isComplete) {
      completeBookList.appendChild(newBook);
    } else {
      incompleteBookList.appendChild(newBook);
    }
  }

  bookForm.reset();
  saveToLocalStorage();
});

// Fungsi untuk memindahkan buku ke rak "Selesai dibaca"
function moveBookToComplete(bookItem) {
  const bookData = getBookData(bookItem);
  const updatedBook = createBookElement(
    bookData.id,
    bookData.title,
    bookData.author,
    bookData.year,
    true
  );
  completeBookList.appendChild(updatedBook);
  bookItem.remove();
}

// Fungsi untuk memindahkan buku ke rak "Belum selesai dibaca"
function moveBookToIncomplete(bookItem) {
  const bookData = getBookData(bookItem);
  const updatedBook = createBookElement(
    bookData.id,
    bookData.title,
    bookData.author,
    bookData.year,
    false
  );
  incompleteBookList.appendChild(updatedBook);
  bookItem.remove();
}

// Fungsi untuk menghapus buku
function deleteBook(bookItem) {
  bookItem.remove();
  saveToLocalStorage();
}

// Fungsi untuk mengedit buku
function editBook(bookItem) {
  const currentTitle = bookItem.querySelector("[data-testid='bookItemTitle']").textContent;
  const currentAuthor = bookItem.querySelector("[data-testid='bookItemAuthor']").textContent.split(": ")[1];
  const currentYear = bookItem.querySelector("[data-testid='bookItemYear']").textContent.split(": ")[1];

  const newTitle = prompt("Edit Judul Buku:", currentTitle);
  if (newTitle === null) return;

  const newAuthor = prompt("Edit Penulis Buku:", currentAuthor);
  if (newAuthor === null) return;

  const newYear = prompt("Edit Tahun Buku:", currentYear);
  if (newYear === null) return;

  bookItem.querySelector("[data-testid='bookItemTitle']").textContent = newTitle;
  bookItem.querySelector("[data-testid='bookItemAuthor']").textContent = `Penulis: ${newAuthor}`;
  bookItem.querySelector("[data-testid='bookItemYear']").textContent = `Tahun: ${newYear}`;

  saveToLocalStorage();
}

// Memuat data dari Local Storage saat halaman di-refresh
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
});

// Elemen DOM untuk pencarian
const searchInput = document.getElementById("searchInput");

// Fungsi untuk mencari buku
function searchBooks() {
  const query = searchInput.value.toLowerCase();

  // Filter buku pada daftar "Belum selesai dibaca"
  incompleteBookList.querySelectorAll("[data-testid='bookItem']").forEach((book) => {
    const title = book.querySelector("[data-testid='bookItemTitle']").textContent.toLowerCase();
    book.style.display = title.includes(query) ? "" : "none";
  });

  // Filter buku pada daftar "Selesai dibaca"
  completeBookList.querySelectorAll("[data-testid='bookItem']").forEach((book) => {
    const title = book.querySelector("[data-testid='bookItemTitle']").textContent.toLowerCase();
    book.style.display = title.includes(query) ? "" : "none";
  });
}

// Event listener untuk pencarian
searchInput.addEventListener("input", searchBooks);