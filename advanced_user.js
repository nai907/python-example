// Vue instance for the header section
new Vue({
  el: "#header",
  template: `
    <header class="bg-light">
      <a href="/" class="text-decoration-none text-reset">
        <h1 class="ms-4 mt-4">SPVC Prediction Online Platform</h1>
      </a>
      <div class="d-inline-block ms-4 mt-4">
        <a type="button" class="btn btn-primary me-3" @click="clearLocalStorage">Restore Default Input</a>
      </div>
    </header>
  `,
  methods: {
    clearLocalStorage() {
      // Clear local storage and reload the page
      localStorage.clear();
      location.reload();
      console.log("Local Storage Cleared");
    }
  }
});

// Vue instance for the first form section
new Vue({
  el: "#first-form",
  template: `
    <div>
      <div class="container mt-4">
        <div class="row">
          <div class="col-4">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control form-control-sm" id="name" v-model="name">
          </div>
          <div class="col-4">
            <label for="description" class="form-label">Description</label>
            <input type="text" class="form-control form-control-sm" id="description" v-model="description">
          </div>
          <div class="col-4">
            <label for="dimensions" class="form-label">Choose Dimensions</label>
            <select class="form-select form-select-sm" v-model="dimensions" id="dimensions">
              <option value="Pilot">Pilot</option>
              <option value="Line5" disabled>Line-5</option>
              <option value="Line9" disabled>Line-9</option>
            </select>
          </div>
        </div>
        <br>
        <div class="row align-items-center">
          <div class="col-4">
            <label for="fileUpload" class="form-label">Upload Input File</label>
            <div class="input-group">
              <input type="file" class="form-control form-control-sm" @change="handleFileUpload" accept=".rin">
              <div class="input-group-append icon-button ms-3">
                <a class="fas fa-download fa-lg" href="/download" data-bs-toggle="tooltip" data-bs-placement="top" title="Download Sample Input File"></a>
              </div>
            </div>
          </div>
        </div>
        <br>
        <button type="button" class="btn btn-primary d-none" id="fileUpload" @click="submitForm">Submit</button>
      </div>
      <br>
    </div>
  `,
  data() {
    // Initialize data properties with local storage values or defaults
    return {
      dimensions: localStorage.getItem('dimensions') || "Pilot",
      name: localStorage.getItem('name') || "Pilot040",
      description: localStorage.getItem('description') || "For testing",
      file: null
    };
  },
  watch: {
    // Watchers to update local storage when data properties change
    dimensions(val) {
      localStorage.setItem('dimensions', val);
    },
    name(val) {
      localStorage.setItem('name', val);
    },
    description(val) {
      localStorage.setItem('description', val);
    },
    file(val) {
      localStorage.setItem('file', null);
    }
  },
  mounted() {
    // Initialize tooltips on mount
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  },
  methods: {
    handleFileUpload(event) {
      // Handle file upload and validate file type
      const file = event.target.files[0];
      const allowedExtension = ".rin";
      if (file && file.name.endsWith(allowedExtension)) {
        this.file = file;
        console.log('File selected:', this.file);
      } else {
        this.file = null;
        alert('Invalid file type. Only .rin files are allowed.');
        event.target.value = null; // Clear the file input
      }
    },
    submitForm() {
      // Submit form with file data
      if (this.file) {
        const formData = new FormData();
        formData.append('file', this.file);

        fetch('/start_simulation_advanced', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          console.log('File uploaded successfully:', data);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
      } else {
        console.error('No file selected.');
      }
    }
  }
});

// Vue instance for the footer section
new Vue({
  el: "#footer",
  template: `
    <footer class="bg-light py-5">
      <div class="container">
        <div class="d-flex justify-content-around">
          <form action="/save_run" method="post">
            <button type="submit" class="btn btn-primary" id="getValuesButton" @click="click">Start Simulation</button>
          </form>
        </div>
      </div>
    </footer>
  `,
  methods: {
    click() {
      // Handle click event to start simulation
      this.sentDesciption();
      document.getElementById("fileUpload").click();
    },
    sentDesciption() {
      // Send form data to server
      let values = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        dimensions: document.getElementById("dimensions").value
      };

      console.log('Data to be sent:', values);

      fetch('/process_name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      .then(response => {
        return response.text().then(text => {
          console.log('Full response text:', text);
          try {
            return JSON.parse(text);
          } catch (error) {
            throw new Error('Received non-JSON response from server');
          }
        });
      })
      .then(data => {
        console.log('Description processed:', data);
      })
      .catch(error => {
        console.error('There was an error processing the description:', error);
      });
    }
  }
});
