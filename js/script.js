let books = [];

const sidebarBtn = document.getElementById("sidebar-btn");
const sidebar = document.querySelector(".sidebar");

const themeToggler = document.getElementById("theme-toggler");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");
const isiKonten1 = document.getElementById("isi-konten-1");

const sudahDibaca = document.getElementById("sudah-dibaca");
const belumDibaca = document.getElementById("belum-selesai");

// Form
const formAddBook = document.getElementById("addNewBook");
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");
const bookYear = document.getElementById("bookYear");
const bookIsComplete = document.getElementById("bookIsComplete");

const searchBook = document.getElementById("searchBook");
const searchTitle = document.getElementById("searchTitle");

// Event & Key names
const STORAGE_KEY = "BOOKS_DATA";
const RENDER_EVENT = "bookRender";
const SAVED_EVENT = "bookSaved";
const DELETE_EVENT = "bookDelete";
const CREATE_EVENT = "bookCreate";
const UPDATE_EVENT = "bookUpdate";

const isStorageExists = () => typeof(Storage) !== "undefined";

const displayAllBooks = () => {
  isiKonten1.innerHTML = "";

  if (books.length) {
    books.map((book) => {
      const row = document.createElement("tr");

      const listId = document.createElement("td");
      const listTitle = document.createElement("td");
      const listAuthor = document.createElement("td");
      const listYear = document.createElement("td");
      const listComplete = document.createElement("td");

      listId.innerText = book.id;
      listTitle.innerText = book.title;
      listAuthor.innerText = book.author;
      listYear.innerText = book.year;
      listComplete.innerText = book.isComplete ? "Sudah dibaca" : "Belum selesai dibaca";

      row.append(listId, listTitle, listAuthor, listYear, listComplete);

      isiKonten1.append(row);
    })
  } else {
    isiKonten1.append(createBlankRow());
  }
}

const loadAllBooksFromStorage = () => {  
  const data = localStorage.getItem(STORAGE_KEY);
  let res = JSON.parse(data);

  if (res !== null) {
    for (const book of res) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const addBook = (bookObj) => {
  books.push(bookObj);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
  document.dispatchEvent(new Event(CREATE_EVENT));
}

const createBlankRow = () => {
  const row = document.createElement("tr");
  const list = document.createElement("td");
  list.setAttribute("colspan", 5);
  list.style.color = "red";
  list.style.textAlign = "center";

  list.innerHTML = `<b>Tidak ada buku yang ditemukan.</b>`;

  row.append(list);

  return row;
}

const makeBook = (bookObj) => {
  const { id, title, author, year, isComplete } = bookObj;

  const row = document.createElement("tr");

  const listId = document.createElement("td");
  listId.innerText = id;
  const listTitle = document.createElement("td");
  listTitle.innerText = title;
  const listAuthor = document.createElement("td");
  listAuthor.innerText = author;
  const listYear = document.createElement("td");
  listYear.innerText = year;
  
  const listAction = document.createElement("td");
  listAction.classList.add("book-button");

  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("btn");
  toggleBtn.classList.add("btn-info");

  const iconModel = isComplete ? "fa-regular" : "fa-solid";
  toggleBtn.innerHTML = `
    <span class='icon'><i class='${iconModel} fa-bookmark'></i></span>
  `;

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("btn");
  removeBtn.classList.add("btn-danger");
  removeBtn.innerHTML = `
    <span class='icon'><i class='fa-solid fa-trash'></i></span>
  `;

  const editBtn = document.createElement("button");
  editBtn.classList.add("btn");
  editBtn.classList.add("btn-secondary");
  editBtn.innerHTML = `
    <span class='icon'><i class='fa-solid fa-pen-to-square'></i></span>
  `;

  listAction.append(toggleBtn, removeBtn, editBtn);
  row.append(listId, listTitle, listAuthor, listYear, listAction);
  row.setAttribute("id", `book-${id}`);

  toggleBtn.addEventListener("click", () => {
    toggleBookStatus(id);
  });

  removeBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Hapus Buku",
      text: "Apakah kamu yakin ingin menghapus buku ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Ga jadi"
    }).then((result) => {
      if (result.isConfirmed) {
        removeBook(id);
      }
    });
  });

  const formHtml = `
    <div style="display:flex;flex-direction:column;align-items:center;align-content:stretch;">
      <div class="form-group">
        <label for="editBookTitle">Judul Buku</label>
        <input id="editBookTitle" class="swal2-input" type="text" placeholder="Masukkan judul buku" value="${title}">
      </div>
      
      <div class="form-group">
        <label for="editBookAuthor">Penulis Buku</label>
        <input id="editBookAuthor" class="swal2-input" type="text" placeholder="Masukkan penulis buku" value="${author}">
      </div>
      
      <div class="form-group">
        <label for="editBookYear">Tahun Terbit</label>
        <input id="editBookYear" class="swal2-input" type="number" placeholder="Masukkan tahun terbit buku" value="${year}">
      </div>
      
      <div class="form-group" style="display:block">
        <input type="checkbox" id="editBookComplete" ${isComplete ? "checked" : ""}>
        <label for="editBookComplete">Selesai dibaca</label>
      </div>
    </div>
  `;

  editBtn.addEventListener("click", async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Buku',
      html: formHtml,
      focusConfirm: false,
      confirmButtonText: "Ganti",
      showCancelButton: true,
      cancelButtonText: "Ga jadi",
      preConfirm: () => {
        return [
          document.getElementById('editBookTitle').value,
          document.getElementById('editBookAuthor').value,
          document.getElementById('editBookYear').value,
          document.getElementById('editBookComplete').checked
        ]
      }
    });
    
    if (formValues) {
      for (const values of formValues) {
        if (values === "") {
          Swal.fire("Error", "Kamu harus memasukkan semua field yang diberikan.", "error");
  
          return;
        }
      }
  
      editBook({
        id,
        title: formValues[0],
        author: formValues[1],
        year: formValues[2],
        isComplete: formValues[3]
      });
    }
  });

  return row;
}

const saveBooks = () => {
  const data = JSON.stringify(books);

  localStorage.setItem(STORAGE_KEY, data);
}

const findBookById = (bookId) => {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }

  return null;
}

const toggleBookStatus = (bookId) => {
  const book = findBookById(bookId);

  if (book === null)
    return;
  
  book.isComplete = book.isComplete ? false : true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveBooks();
  document.dispatchEvent(new Event(SAVED_EVENT));
}

const removeBook = (bookId) => {
  const book = findBookById(bookId);

  if (book === null)
    return;
  
  books.splice(book, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(DELETE_EVENT));

  saveBooks();
}

const editBook = (bookObj) => {
  const { id, title, author, year, isComplete } = bookObj;

  const book = findBookById(id);

  if (book === null)
    return;
  
  book.title = title;
  book.author = author;
  book.year = year;
  book.isComplete = isComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(UPDATE_EVENT));

  saveBooks();
}

const findBook = (query) => {
  const checkBook = (book) => {
    return book.title.toLowerCase().includes(query.toLowerCase());
  }

  const result = books.filter(checkBook);

  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  // Sidebar Toggler
  sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("opened");
  });

  // Theme Toggler
  themeToggler.addEventListener("click", () => {
    if (themeIcon.classList.contains("fa-sun")) {
      document.documentElement.setAttribute("data-theme", "light");
      themeText.innerText = "Dark Mode";
      themeIcon.classList.replace("fa-sun", "fa-moon");
      localStorage.theme = "light";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      themeText.innerText = "Light Mode";
      themeIcon.classList.replace("fa-moon", "fa-sun");
      localStorage.theme = "dark";
    }
  })

  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
      themeText.innerText = "Light Mode";
      themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    themeText.innerText = "Dark Mode";
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }

  // Render Event
  document.addEventListener(RENDER_EVENT, () => {
    sudahDibaca.innerHTML = "";
    belumDibaca.innerHTML = "";
    displayAllBooks();

    if (books.length === 0) {
      const row = createBlankRow();
      const row2 = createBlankRow();

      belumDibaca.append(row);
      sudahDibaca.append(row2);
    } else {
      for (const book of books) {
        const bookElement = makeBook(book);
  
        if (!book.isComplete)
          belumDibaca.append(bookElement);
        else
          sudahDibaca.append(bookElement);
      }
    }
  });

  // Submit Event
  formAddBook.addEventListener("submit", (event) => {
    event.preventDefault();

    addBook({
      id: +new Date(),
      title: bookTitle.value,
      author: bookAuthor.value,
      year: bookYear.value,
      isComplete: bookIsComplete.checked
    });
  });

  searchBook.addEventListener("submit", (event) => {
    event.preventDefault();
    
    location.hash = "";

    const query = searchTitle.value;

    const result = findBook(query);

    belumDibaca.innerHTML = "";
    sudahDibaca.innerHTML = "";

    if (result.length === 0) {
      const row = createBlankRow();
      const row2 = createBlankRow();

      belumDibaca.append(row);
      sudahDibaca.append(row2);
    } else {
      for (const book of result) {
        const bookElement = makeBook(book);
  
        if (!book.isComplete)
          belumDibaca.append(bookElement);
        else
          sudahDibaca.append(bookElement);
      }
    }

    location.hash = "#sudahDibaca";
  });

  // Saved Event
  document.addEventListener(SAVED_EVENT, () => {
    Swal.fire("Berhasil", "Buku berhasil disimpan", "success");
  });

  // Delete Event
  document.addEventListener(DELETE_EVENT, () => {
    Swal.fire("Berhasil", "Buku berhasil dihapus", "success");
  })

  // Create Event
  document.addEventListener(CREATE_EVENT, () => {
    Swal.fire("Berhasil", "Buku baru berhasil dibuat", "success");
  });

  // Update Event
  document.addEventListener(UPDATE_EVENT, () => {
    Swal.fire("Berhasil", "Buku berhasil diperbarui", "success");
  });

  // Load Data
  if (isStorageExists()) {
    loadAllBooksFromStorage();
  }
});
