document.addEventListener("alpine:init", () => {
  Alpine.data("spreadsheetData", () => ({
    rows: [],
    rowData: { Name: "", Email: "", Job: "", Location: "", id: null },
    isEditing: false,
    currentId: null,
    currentPage: 1,
    rowsPerPage: 1,
    showModal: false,
    notification: false,
    dataAvailable: false,
    notificationMessage: "",

    get paginatedRows() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      const end = start + this.rowsPerPage;
      return this.rows.slice(start, end);
    },

    get totalPages() {
      return Math.ceil(this.rows.length / this.rowsPerPage);
    },

    // Fetch data from Google Sheets via the API
    fetchData() {
      this.loading = true;

      axios
        .get("https://sheetdb.io/api/v1/9us4ij9gt9vki")
        .then((response) => {
          if (Array.isArray(response.data) && response.data.length === 0) {
            this.dataAvailable = true;
            console.log(this.dataAvailable);
            this.loading = false;
            return;
          }
          this.dataAvailable = false;

          this.rows = response.data.map((item, index) => ({
            id: item.id || index + 1, // Ensure each row has a unique ID
            ...item,
          }));
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.error("Error fetching data:", error);
        });
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    openAddModal() {
      this.isEditing = false;
      this.rowData = {
        Name: "",
        Email: "",
        Job: "",
        Location: "",
        id: null,
      };
      this.showModal = true;
    },

    openEditModal(row) {
      this.isEditing = true;
      this.currentId = row.id;
      this.rowData = { ...row };
      this.showModal = true;
    },

    generateNewId() {
      const maxId = this.rows.reduce(
        (max, row) => (row.id > max ? row.id : max),
        0
      );
      let maximum = parseInt(maxId);

      return maximum + 1; // Increment by 1 to get the next unique ID
    },

    submitForm() {
      this.notificationMessage = null;
      if (!this.isEditing) {
        this.rowData.id = this.generateNewId();
      }

      if (!this.rowData.Name) {
        this.notificationMessage = "";
        this.notificationMessage = "Name field is required!";
        this.notification = true;
        this.loading = false;
        return;
      }
      if (!this.rowData.Email) {
        this.notificationMessage = "";
        this.notificationMessage = "Email field is required!";
        this.notification = true;
        this.loading = false;
        return;
      }
      if (!this.rowData.Job) {
        this.notificationMessage = "";
        this.notificationMessage = "Job field is required!";
        this.notification = true;
        this.loading = false;
        return;
      }
      if (!this.rowData.Location) {
        this.notificationMessage = "";
        this.notificationMessage = "Location field is required!";
        this.notification = true;
        this.loading = false;
        return;
      }

      this.loading = true;
      this.showModal = false;

      axios
        .post("https://sheetdb.io/api/v1/9us4ij9gt9vki", {
          data: [this.rowData],
        })
        .then(() => {
          this.notificationMessage = "Data added successfully!";
          this.notification = true;
          this.fetchData();
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.error("Error adding data:", error);
        });
    },

    // API for updating data
    updateForm() {
      this.loading = true;
      this.showModal = false;
      axios
        .put(`https://sheetdb.io/api/v1/9us4ij9gt9vki/id/${this.currentId}`, {
          data: this.rowData,
        })
        .then(() => {
          this.notificationMessage = "Data updated successfully!";
          this.notification = true;
          this.fetchData();
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.error("Error updating data:", error);
        });
    },

    // API for deleting data
    deleteRow(id) {
      this.loading = true;
      axios
        .delete(`https://sheetdb.io/api/v1/9us4ij9gt9vki/id/${id}`)
        .then(() => {
          this.notificationMessage = "Data deleted successfully!";
          this.notification = true;
          this.fetchData();

          let lastRowid = this.generateNewId();
          console.log(id, lastRowid - 1);
          if (lastRowid - 1 == id) {
            // Reload the current page
            location.reload();
          }

          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.error("Error deleting data:", error);
        });
    },
  }));
});
