<template>
<div>
    <div id="app" class="container">
        <h1 class="mb-4">Container Management App</h1>
         <!-- Create New Container Form -->
        <div class="card">
            <div class="card-body">
                <h2 class="card-title">Create New Container</h2>
                <div class="form-group">
                    <label for="containerName">Name:</label>
                    <input type="text" id="containerName" class="form-control" v-model="newContainer.name">
                </div>
                <div class="form-group">
                    <label for="maxMemory">Max Memory (MB):</label>
                    <input type="number" id="maxMemory" class="form-control" v-model.number="newContainer.maxMemory">
                </div>
                <div class="form-group">
                    <label for="diskSize">Disk Size (GB):</label>
                    <input type="number" id="diskSize" class="form-control" v-model.number="newContainer.diskSize">
                </div>
                <div class="form-group form-check">
                    <input type="checkbox" id="startImmediately" class="form-check-input" v-model="newContainer.startImmediately">
                    <label class="form-check-label" for="startImmediately">Start Immediately</label>
                </div>
                <button class="btn btn-primary" @click="createContainer">Create</button>
            </div>
        </div>
<!-- Show All Containers -->
<div class="card">
    <div class="card-body">
        <h2 class="card-title">All Containers</h2>
        <div class="form-group">
            <label for="runningFilter">Filter by Running:</label>
            <select id="runningFilter" class="form-control" v-model="filter.running">
                <option value="">All</option>
                <option value="true">Running</option>
                <option value="false">Not Running</option>
            </select>
        </div>
        <div class="form-group">
            <label for="nameFilter">Filter by Name:</label>
            <input type="text" id="nameFilter" class="form-control" v-model="filter.name">
        </div>
        <div class="row justify-content-center">
            <div class="col-md-4" v-for="container in filteredContainers" :key="container.name" :id="containerId(container)">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">{{ container.name }}</h5>
                        <button class="btn btn-secondary btn-sm" @click="showContainer(container)">Show</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

        <!-- Show Individual Container  -->
        <div class="card" v-if="selectedContainer">
            <div class="card-body">
                <h2 class="card-title">Container Details</h2>
                <p><strong>Name:</strong> {{ selectedContainer.name }}</p>
                <p><strong>Max Memory (MB)</strong> <input type="number" class="form-control" v-model.number="selectedContainer.maxMemory" :disabled="selectedContainer.running"> </p>
                <p><strong>Disk Size (GB)</strong> <input type="number" class="form-control" v-model.number="selectedContainer.diskSize" :disabled="selectedContainer.running"> </p>
                <button v-if="selectedContainer.running" class="btn btn-danger" @click="stopContainer(selectedContainer)">Stop</button>
                <template v-else>
                    <button class="btn btn-success mr-2" @click="startContainer(selectedContainer)">Start</button>
                    <button class="btn btn-danger" @click="deleteContainer(selectedContainer)">Delete</button>
                </template>
                <button v-if="!selectedContainer.running" class="btn btn-primary" @click="editContainer(selectedContainer)">Edit</button>
            </div>
        </div>
    </div>

</div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
export default {
  name: "ContainerApp",

  data() {
    return {
      newContainer: {
        name: "",
        maxMemory: 512,
        diskSize: 10,
        startImmediately: false
      },
      containers: [],
      filter: {
        running: "",
        name: ""
      },
      selectedContainer: null
    };
  },
  created() {
    // Load containers from local storage
    const storedContainers = localStorage.getItem("containers");
    if (storedContainers) {
      this.containers = JSON.parse(storedContainers);
    }
  },
  watch: {
    // Save containers to localStorage
    containers: {
      handler(newContainers) {
        localStorage.setItem("containers", JSON.stringify(newContainers));
      },
      deep: true
    }
  },
  computed: {
    filteredContainers() {
      let filtered = this.containers;

      // Filter by running state
      if (this.filter.running !== "") {
        filtered = filtered.filter(
          container =>
            container.running !== undefined &&
            container.running.toString() === this.filter.running
        );
      }

      // Filter by name
      if (this.filter.name !== "") {
        const nameFilter = this.filter.name.toLowerCase();
        filtered = filtered.filter(container =>
          container.name.toLowerCase().includes(nameFilter)
        );
      }

      return filtered;
    }
  },
  methods: {
    async loadContainers() {
      try {
        const response = await axios.get("/src/containers.json");
        this.containers = response.data;
      } catch (error) {
        console.error("Error loading containers:", error);
      }
    },

    async createContainer() {
      try {
        // Check if the container name already exists
        const existingContainer = this.containers.find(
          container => container.name === this.newContainer.name
        );
        if (existingContainer) {
          alert(
            "Container with the same name already exists: " +
              existingContainer.name
          );
          return;
        }
        const response = await axios.post(
          "http://localhost:3000/api/containers",
          this.newContainer
        );
        const newContainer = response.data;
        if (this.newContainer.startImmediately) {
          newContainer.running = true;
        }

        this.containers.push(newContainer);
        localStorage.setItem("containers", JSON.stringify(this.containers));
        this.newContainer = {
          name: "",
          maxMemory: 512,
          diskSize: 10,
          startImmediately: false
        };
      } catch (error) {
        console.error("Error creating container:", error);
      }
    },
    containerId(container) {
      if (container && container.name) {
        return container.name.replace(/\s+/g, "");
      }
      // Return a default ID if container or container.name is undefined
      return "defaultId";
    },
    showContainer(container) {
      this.selectedContainer = container;
      // Scroll to the selected container
      const containerElement = document.getElementById(
        container.name.replace(/\s+/g, "")
      );
      if (containerElement) {
        containerElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },

    startContainer(container) {
      // Logic to start container
      container.running = true;
    },
    stopContainer(container) {
      // Logic to stop container
      container.running = false;
    },
    deleteContainer(container) {
      const index = this.containers.indexOf(container);
      if (index !== -1) {
        this.containers.splice(index, 1);
        if (this.selectedContainer === container) {
          this.selectedContainer = null; // Clear selectedContainer if deleted container is selected
        }
      }
    },

    editContainer(container) {
      // Logic for editing the container
      console.log("Edited Container:", container);
    }
  }
};
</script>

<style>
.container {
  max-width: 50em; /* Converted from 800px to em */
  margin: 0 auto;
}

.card {
  margin-bottom: 1.25em; /* Converted from 20px to em */
  border: 0.0625em solid #ccc; /* Converted from 1px to em */
  border-radius: 0.625em; /* Converted from 10px to em */
  transition: box-shadow 0.3s;
}

.card:hover {
  box-shadow: 0px 0px 1.25em 0px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.25em; /* Converted from 20px to em */
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 1.25em; /* Converted from 20px to em */
  color: #333;
}

.form-group {
  margin-bottom: 1.25em; /* Converted from 20px to em */
}

.btn {
  padding: 0.625em 1.25em; /* Converted from 10px and 20px to em */
  font-size: 1rem;
  margin: 0.5em 0.5em;
  border-radius: 0.3125em; /* Converted from 5px to em */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  border: none;
  color: #fff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  border: none;
  color: #fff;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  border: none;
  color: #fff;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-success {
  background-color: #28a745;
  border: none;
  color: #fff;
}

.btn-success:hover {
  background-color: #218838;
}

.form-control {
  padding: 0.625em; /* Converted from 10px to em */
  border-radius: 0.3125em; /* Converted from 5px to em */
  border: 0.0625em solid #ccc; /* Converted from 1px to em */
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
}

.btn-group {
  margin-bottom: 1.25em; /* Converted from 20px to em */
}
</style>
