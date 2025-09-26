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

// Function to fetch and parse CSV file
function loadInitiatorOptions(callback) {
  fetch('/initiators')
      .then(response => response.text())
      .then(data => {
          Papa.parse(data, {
              header: true,
              complete: (results) => {
                  const options = results.data.map(row => row.value.trim());
                  callback(options);
              }
          });
      })
      .catch(error => console.error('Error fetching CSV:', error));
}

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
    </div>
    <h3 class="ms-5 text-primary"><br>Select input parameters</h3>
    <div class="container mt-4">
      <h5 class="bg-dark text-white pe-5 d-inline">Initiators</h5>
      <p><br></p>
      <div class="row">
        <!-- Initiator and VCM input fields -->
        <div class="col-md-6">
          <div class="row">
            <div class="col-6"><label for="initiator1" class="form-label">Initiator 1</label></div>
            <div class="col-6">
              <select class="form-select" id="cat1" v-model="initiator1">
                <option v-for="option in initiatorOptions" :key="option" :value="option">{{ option }}</option>
              </select><br>
            </div>
            
            <div class="col-6"><label for="vcm1" class="form-label">Amount (phm)</label></div>
            <div class="col-6"><input type="number" class="form-control form-control-sm" id="vcm1" v-model="vcm1"><br></div>
            
            <div class="col-6"><label for="initiator2" class="form-label">Initiator 2</label></div>
            <div class="col-6">
              <select class="form-select" id="cat2" v-model="initiator2">
                <option v-for="option in initiatorOptions" :key="option" :value="option">{{ option }}</option>
              </select><br>
            </div>
            
            <div class="col-6"><label for="vcm2" class="form-label">Amount (phm)</label></div>
            <div class="col-6"><input type="number" class="form-control form-control-sm" id="vcm2" v-model="vcm2"><br></div>
            
            <div class="col-6"><label for="initiator3" class="form-label">Initiator 3</label></div>
            <div class="col-6">
              <select class="form-select" id="cat3" v-model="initiator3">
                <option v-for="option in initiatorOptions" :key="option" :value="option">{{ option }}</option>
              </select><br>
            </div>
            
            <div class="col-6"><label for="vcm3" class="form-label">Amount (phm)</label></div>
            <div class="col-6"><input type="number" class="form-control form-control-sm" id="vcm3" v-model="vcm3"><br></div>
            
            <div class="col-6"><label for="initiator4" class="form-label">Initiator 4</label></div>
            <div class="col-6">
              <select class="form-select" id="cat4" v-model="initiator4">
                <option v-for="option in initiatorOptions" :key="option" :value="option">{{ option }}</option>
              </select><br>
            </div>
            
            <div class="col-6"><label for="vcm4" class="form-label">Amount (phm)</label></div>
            <div class="col-6"><input type="number" class="form-control form-control-sm" id="vcm4" v-model="vcm4"></div>
          </div>
        </div>
        <div class="col-md-6"></div> <!-- Empty right half -->
      </div>
    </div>
  </div>
`,
data() {
  // Initialize data properties with local storage values or defaults
  return {
    initiatorOptions: [], // To hold options from CSV
    initiator1: localStorage.getItem('initiator1') || "CAT-2E (75%)",
    vcm1: localStorage.getItem('vcm1') || "0.013725",
    initiator2: localStorage.getItem('initiator2') || "CAT-MC (50%)",
    vcm2: localStorage.getItem('vcm2') || "0.00915",
    initiator3: localStorage.getItem('initiator3') || "CAT-CI (70%)",
    vcm3: localStorage.getItem('vcm3') || "0.00476",
    initiator4: localStorage.getItem('initiator4') || "-",
    vcm4: localStorage.getItem('vcm4') || "0.0000",
    dimensions: localStorage.getItem('dimensions') || "Pilot",
    name: localStorage.getItem('name') || "Pilot040",
    description: localStorage.getItem('description') || "For testing"
  };
},
watch: {
  // Watchers to update local storage when data properties change
  initiator1(val) {
    localStorage.setItem('initiator1', val);
  },
  vcm1(val) {
    localStorage.setItem('vcm1', val);
  },
  initiator2(val) {
    localStorage.setItem('initiator2', val);
  },
  vcm2(val) {
    localStorage.setItem('vcm2', val);
  },
  initiator3(val) {
    localStorage.setItem('initiator3', val);
  },
  vcm3(val) {
    localStorage.setItem('vcm3', val);
  },
  initiator4(val) {
    localStorage.setItem('initiator4', val);
  },
  vcm4(val) {
    localStorage.setItem('vcm4', val);
  },
  dimensions(val) {
    localStorage.setItem('dimensions', val);
  },
  name(val) {
    localStorage.setItem('name', val);
  },
  description(val) {
    localStorage.setItem('description', val);
  },
},
mounted() {
  // Load initiator options from CSV
  loadInitiatorOptions((options) => {
    this.initiatorOptions = options;
  });
}
});

// Vue instance for the second form section
new Vue({
  el: "#second-form",
  template: `
  <div class="container mt-3 form-section">
    <div class="form-wrapper">
      <h5 class="bg-dark text-white pe-5 d-inline">Recipe</h5>
      <p><br></p>
      <div class="container mt-3">
        <div class="row">
          <div class="col-6"><label for="initiator1" class="form-label">Volume reactor (m^3)</label></div>
          <div class="col-6"><input type="number" class="form-control form-control-sm" id="volume-reactor" v-model="volumeReactor"><br></div>
          
          <div class="col-6"><label for="vcm1" class="form-label">Water (l)</label></div>
          <div class="col-6"><input type="number" class="form-control form-control-sm" id="mass-vcm" v-model="massVcm"><br></div>
          
          <div class="col-6"><label for="initiator2" class="form-label">Mass water (m^3)</label></div>
          <div class="col-6"><input type="number" class="form-control form-control-sm" id="mass-water" v-model="massWater"><br></div>
          
          <div class="col-6"><label for="vcm2" class="form-label">Start temp. (°C)</label></div>
          <div class="col-6"><input type="number" class="form-control form-control-sm" id="start-temp" v-model="startTemp"><br></div>
          <p><br></p>
        </div>
      </div>
    </div>
    
    <div class="form-wrapper">
      <h5 class="bg-dark text-white pe-5 d-inline">Simulation Process</h5>
      <p><br></p>
      <div class="container mt-3">
        <div class="row">
          <div class="col-6"><label for="initiator1-2" class="form-label">Batch time (min)</label></div>
          <div class="col-6"><input type="number" class="form-control form-control-sm" id="batch-time" v-model="batchTime"><br></div>
          
          <div class="col-6 d-none"><label for="vcm1-2" class="form-label">Step size</label></div>
          <div class="col-6 d-none"><input type="number" class="form-control form-control-sm" id="step-size" v-model="stepSize"><br></div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    // Initialize data properties with local storage values or defaults
    return {
      volumeReactor: localStorage.getItem('volumeReactor') || "0.847",
      massVcm: localStorage.getItem('massVcm') || "229.59",
      massWater: localStorage.getItem('massWater') || "236.00",
      startTemp: localStorage.getItem('startTemp') || "55.0",
      batchTime: localStorage.getItem('batchTime') || "350.00",
      stepSize: localStorage.getItem('stepSize') || "0.1"
    };
  },
  watch: {
    // Watchers to update local storage when data properties change
    volumeReactor(val) {
      localStorage.setItem('volumeReactor', val);
    },
    massVcm(val) {
      localStorage.setItem('massVcm', val);
    },
    massWater(val) {
      localStorage.setItem('massWater', val);
    },
    startTemp(val) {
      localStorage.setItem('startTemp', val);
    },
    batchTime(val) {
      localStorage.setItem('batchTime', val);
    },
    stepSize(val) {
      localStorage.setItem('stepSize', val);
    }
  }
});

// Initialize number of rows and selected option from local storage
var numRow = localStorage.getItem('numberOfRows') || 4;
var select = localStorage.getItem('selectedOption') || 'Option2';

// Vue instance for the third form section
new Vue({
  el: "#third-form",
  template: `
    <div class="container mt-3 form-section">
      <div class="form-wrapper">
        <h5 class="bg-dark text-white pe-5 d-inline">Time-varying Operating Policies</h5>
        <!-- First Row -->
        <div class="container mt-5">
          <form id="radiobutton" @change="update">
            <label>
              <input type="radio" value="Option1" v-model="selectedOption" />
              Isothermal
            </label>
            <label>
              <input type="radio" value="Option2" v-model="selectedOption" />
              Non-Isothermal
            </label>
          </form>
          <div v-if="selectedOption === 'Option1'">
            <div class="col-6"><label for="constant-temperature" class="form-label"><br>Constant Temperature Set Point (°C)</label></div>
            <div class="col-6"><input type="number" class="form-control form-control-sm" id="constant-temperature" v-model="constantTemperature"></div>
          </div>
          <div v-if="selectedOption === 'Option2'">
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="p-3 border bg-light">#</div>
              </div>
              <div class="col-md-4">
                <div class="p-3 border bg-light">Time (min)</div>
              </div>
              <div class="col-md-4">
                <div class="p-3 border bg-light">Temperature (°C)</div>
              </div>
            </div>
            <!-- Select Number of Rows -->
            <div class="row mt-3">
              <div class="col-md-4">
                <select class="form-select" v-model.number="numberOfRows" @change="update">
                  <option v-for="n in 20" :value="n" v-if="n !== 1">{{ n }}</option>
                </select>
              </div>
            </div>
            <br>
            <!-- Dynamic Rows -->
            <div class="row" v-for="(row, index) in tableData" :key="index">
              <div class="col-md-4">
                  <div class="p-3 border bg-light">{{ index + 1 }}</div>
              </div>
              <div class="col-md-4">
                  <div class="p-3 border bg-light">
                      <input :id="'time-' + index" type="number" class="form-control" v-model="row.time" @input="handleInputChange(index, 'time')"/>
                  </div>
              </div>
              <div class="col-md-4">
                  <div class="p-3 border bg-light">
                      <input :id="'temperature-' + index" type="number" class="form-control" v-model="row.temperature" @input="handleInputChange(index, 'temperature')"/>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="form-wrapper" v-if="selectedOption === 'Option2'">
        <div id="plot"></div>
      </div>
    </div>
  `,
  data() {
    // Initialize data properties with local storage values or defaults
    return {
      selectedOption: localStorage.getItem('selectedOption') || 'Option2',
      numberOfRows: localStorage.getItem('numberOfRows') || 4,
      constantTemperature: localStorage.getItem('constantTemperature') || "57.9",
      tableData: JSON.parse(localStorage.getItem('tableData')) || [
        { time: "0.0", temperature: "58.0" },
        { time: "300.0", temperature: "58.0" },
        { time: "306.0", temperature: "61.0" },
        { time: "320.0", temperature: "72.0" }
      ]
    };
  },
  watch: {
    // Watchers to update local storage when data properties change
    selectedOption(val) {
      localStorage.setItem('selectedOption', val);
      if (val === 'Option2') {
        this.updatePlot();
      } else if (val === 'Option1') {
        this.hidePlot();
      }
    },
    numberOfRows(val) {
      localStorage.setItem('numberOfRows', val);
      this.adjustRows(val);
    },
    constantTemperature(val) {
      localStorage.setItem('constantTemperature', val);
    },
    tableData: {
      handler(val) {
        localStorage.setItem('tableData', JSON.stringify(val));
      },
      deep: true
    }
  },
  methods: {
    update() {
      this.adjustRows(this.numberOfRows);
      if (this.selectedOption === 'Option2') {
        this.updatePlot();
      }
      select = this.selectedOption;
      numRow = this.numberOfRows;
    },
    adjustRows(numberOfRows) {
      // Adjust the number of rows in tableData based on numberOfRows
      while (this.tableData.length < numberOfRows) {
        this.tableData.push({ time: '', temperature: '' });
      }
      while (this.tableData.length > numberOfRows) {
        this.tableData.pop();
      }
      if (this.selectedOption === 'Option2') {
        this.updatePlot();
      }
    },
    handleInputChange(index, field) {
      this.updatePlot();
    },
    updatePlot() {
      // Fetch and update the plot based on tableData
      fetch('/temp_plot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.tableData),
      })
        .then(response => response.json())
        .then(data => {
          let plotData = JSON.parse(data);
          Plotly.react('plot', plotData.data, plotData.layout);
        })
        .catch(error => console.error("Error updating plot:", error));
    },
    hidePlot() {
      // Hide the plot
      Plotly.purge('plot');
    },
  },
  mounted() {
    // Update the plot if selectedOption is 'Option2'
    if (this.selectedOption === 'Option2') {
      this.updatePlot();
    }
  }
});

// Function to fetch and parse CSV file
function loadInitiators(callback) {
  fetch('/initiators')
      .then(response => response.text())
      .then(data => {
          Papa.parse(data, {
              header: true,
              complete: (results) => {
                  const initiatorMap = {};
                  results.data.forEach(row => {
                      if (row.value) {  // Ensure row.value is defined
                          initiatorMap[row.value.trim()] = {
                              formattedValue: row.formatted_value ? row.formatted_value.trim() : '',  // Handle undefined formatted_value
                              percentage: row.percentage ? parseFloat(row.percentage) : NaN,  // Handle undefined percentage
                              prop1: row.prop1,
                              prop2: row.prop2
                          };
                      }
                  });
                  callback(initiatorMap);
              }
          });
      })
      .catch(error => console.error('Error fetching CSV:', error));
}

// Function to calculate VCM based on initiator value
function calculateVCM(value, initiatorMap) {
  const initiator = initiatorMap[value.trim()];
  if (initiator && !isNaN(initiator.percentage)) {
      return 1000 / initiator.percentage;
  } else {
      console.error(`No valid percentage found for value: "${value}"`);
      return 1000 / 75; // Default percentage
  }
}

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
  data: {
      values: [],
      initiatorMap: {}
  },
  created() {
      loadInitiators((initiatorMap) => {
          this.initiatorMap = initiatorMap;
      });
  },
  methods: {
      updateList(list) {
          // Update list of initiator values for formatting
          return list.map(item => {
              if (typeof item === 'string') {
                  const initiator = this.initiatorMap[item.trim()];
                  return initiator ? initiator.formattedValue.padEnd(18, ' ') : item;
              } else {
                  return item;
              }
          });
      },
      moveElement(array, fromIndex, toIndex) {
          // Move an element within the array from one index to another
          const element = array.splice(fromIndex, 1)[0];
          array.splice(toIndex, 0, element);
      },
      click() {
          // Handle click event to start simulation
          this.sentDesciption();
          let vcm1Value = calculateVCM(document.getElementById("cat1").value, this.initiatorMap);
          let vcm2Value = calculateVCM(document.getElementById("cat2").value, this.initiatorMap);
          let vcm3Value = calculateVCM(document.getElementById("cat3").value, this.initiatorMap);
          let vcm4Value = calculateVCM(document.getElementById("cat4").value, this.initiatorMap);
          let values = [];

          if (select === "Option2") {
              values = [
                  (+document.getElementById("volume-reactor").value).toFixed(3),
                  (+document.getElementById("mass-vcm").value).toFixed(2),
                  (+document.getElementById("mass-water").value).toFixed(2),
                  document.getElementById("cat1").value.padEnd(18, ' '),
                  (vcm1Value * (+document.getElementById("vcm1").value)).toFixed(4),
                  document.getElementById("cat2").value.padEnd(18, ' '),
                  (vcm2Value * (+document.getElementById("vcm2").value)).toFixed(4),
                  document.getElementById("cat3").value.padEnd(18, ' '),
                  (vcm3Value * (+document.getElementById("vcm3").value)).toFixed(4),
                  document.getElementById("cat4").value.padEnd(18, ' '),
                  (vcm4Value * (+document.getElementById("vcm4").value)).toFixed(4),
                  (+document.getElementById("start-temp").value).toFixed(1),
                  "1",
                  "57.9",
                  (+document.getElementById("batch-time").value).toFixed(2),
                  (+document.getElementById("step-size").value).toFixed(1)
              ];
              let timevarying = [];
              for (let i = 0; i < numRow; i++) {
                  const timeKey = `time-${i}`;
                  const tempKey = `temperature-${i}`;
                  const timeValue = (+document.getElementById(timeKey).value).toFixed(1).padStart(5, " ");
                  const tempValue = (+document.getElementById(tempKey).value).toFixed(1);
                  timevarying.push(`     ${i + 1}    ${timeValue.padStart(5, " ")}            ${tempValue}`);
              }
              const resultTime = timevarying.join('\n');
              values.push(resultTime);
              this.moveElement(values, 15, 13);
              values.push(numRow);
          } else if (select === "Option1") {
              values = [
                  (+document.getElementById("volume-reactor").value).toFixed(3),
                  (+document.getElementById("mass-vcm").value).toFixed(2),
                  (+document.getElementById("mass-water").value).toFixed(2),
                  document.getElementById("cat1").value.padEnd(18, ' '),
                  (vcm1Value * (+document.getElementById("vcm1").value)).toFixed(4),
                  document.getElementById("cat2").value.padEnd(18, ' '),
                  (vcm2Value * (+document.getElementById("vcm2").value)).toFixed(4),
                  document.getElementById("cat3").value.padEnd(18, ' '),
                  (vcm3Value * (+document.getElementById("vcm3").value)).toFixed(4),
                  document.getElementById("cat4").value.padEnd(18, ' '),
                  (vcm4Value * (+document.getElementById("vcm4").value)).toFixed(4),
                  (+document.getElementById("start-temp").value).toFixed(1),
                  "0",
                  (+document.getElementById("constant-temperature").value).toFixed(1),
                  (+document.getElementById("batch-time").value).toFixed(2),
                  (+document.getElementById("step-size").value).toFixed(1)
              ];
              let timevarying = [];
              for (let i = 0; i < numRow; i++) {
                  timevarying.push(`     ${i + 1}    ${"0".padStart(5, " ")}            ${0}`);
              }
              const resultTime = timevarying.join('\n');
              values.push(resultTime);
              this.moveElement(values, 15, 13);
              values.push("4");
          }

          let prop = [];
          let prop2 = [];
          // Format initiator properties using CSV data
          for (let i = 1; i <= 4; i++) {
              const catKey = `cat${i}`;
              const catValue = document.getElementById(catKey).value.trim();
              const initiator = this.initiatorMap[catValue];

              if (initiator) {
                  prop.push(initiator.prop1);
                  prop2.push(initiator.prop2);
              } else {
                  prop.push('');
                  prop2.push('');
              }
          }

          const result = prop.join('\n');
          values.push(result);
          const result2 = prop2.join('\n');
          values.push(result2);
          this.moveElement(values, 16, 14);
          this.moveElement(values, 15, 13);
          this.moveElement(values, 14, 16);
          this.moveElement(values, 17, 15);
          this.moveElement(values, 15, 14);
          this.moveElement(values, 18, 16);
          this.moveElement(values, 19, 17);

          this.values = this.updateList(values);

          console.log('Data to be sent:', this.values);

          // Fetch request to start the simulation
          fetch('/start_simulation', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(this.values)
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
                  console.log('Simulation started:', data);
              })
              .catch(error => {
                  console.error('There was an error starting the simulation:', error);
              });
      },
      sentDesciption() {
          // Send form data to server for processing
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
              body: JSON.stringify(values) // Use the local 'values' variable here
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
